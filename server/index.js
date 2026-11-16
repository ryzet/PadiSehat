import { createServer } from 'node:http';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const scrypt = promisify(scryptCallback);
const PORT = Number(process.env.API_PORT || 3001);
const DATA_DIR = join(process.cwd(), 'server-data');
const UPLOAD_DIR = join(DATA_DIR, 'payment-proofs');
const DB_FILE = join(DATA_DIR, 'store.json');
const SESSION_COOKIE = 'padisehat_session';
const SESSION_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_PROOF_BYTES = 3 * 1024 * 1024;
const sessions = new Map();
const attempts = new Map();
const BANK = {
  name: process.env.BANK_NAME || 'Bank BCA (contoh, ganti sebelum dipakai)',
  account: process.env.BANK_ACCOUNT || '1234567890',
  holder: process.env.BANK_HOLDER || 'PadiSehat',
};
const PRODUCTS = new Map([
  ['p-001', { name: 'Pupuk NPK Padi 1 kg', price: 45000 }],
  ['p-002', { name: 'Pupuk Organik Kompos 5 kg', price: 38000 }],
  ['p-003', { name: 'Pupuk Kandang Fermentasi 3 kg', price: 27000 }],
  ['p-004', { name: 'Benih Padi Unggul 1 kg', price: 62000 }],
  ['p-005', { name: 'Benih Jagung Manis 250 g', price: 21000 }],
  ['p-006', { name: 'Bibit Cabai Rawit (polybag)', price: 15000 }],
  ['p-007', { name: 'Bibit Tomat (polybag)', price: 12000 }],
  ['p-008', { name: 'Media Tanam Sekam Bakar 5 L', price: 18000 }],
]);

await mkdir(UPLOAD_DIR, { recursive: true });
let db = { users: [], orders: [] };
try { db = JSON.parse(await readFile(DB_FILE, 'utf8')); } catch { await persist(); }

async function persist() {
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), { mode: 0o600 });
}
function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(value));
}
function cookie(res, value, maxAge) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}
function readCookie(req, name) {
  const value = (req.headers.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(name + '='));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : '';
}
async function body(req, limit = 64 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Ukuran data terlalu besar.'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Format data tidak valid.'), { status: 400 }); }
}
function safeUser(user) { return { id: user.id, name: user.name, email: user.email }; }
function currentUser(req) {
  const token = readCookie(req, SESSION_COOKIE);
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) { sessions.delete(token); return null; }
  return db.users.find((user) => user.id === session.userId) || null;
}
function rateLimit(req) {
  const key = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, until: now + 60_000 };
  if (now > entry.until) { entry.count = 0; entry.until = now + 60_000; }
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count <= 12;
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString('hex') };
}
async function passwordMatches(password, user) {
  const derived = await scrypt(password, user.salt, 64);
  const expected = Buffer.from(user.passwordHash, 'hex');
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
function issueSession(res, user) {
  const token = randomBytes(32).toString('base64url');
  sessions.set(token, { userId: user.id, expires: Date.now() + SESSION_MS });
  cookie(res, token, SESSION_MS / 1000);
}
function fail(res, error) { json(res, error.status || 400, { error: error.message || 'Permintaan gagal.' }); }

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  if (req.method === 'GET' && path === '/api/health') return json(res, 200, { ok: true });
  if (!path.startsWith('/api/')) return json(res, 404, { error: 'Tidak ditemukan.' });
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && !sameOrigin(req)) return json(res, 403, { error: 'Asal permintaan tidak diizinkan.' });

  try {
    if (req.method === 'POST' && (path === '/api/auth/register' || path === '/api/auth/login')) {
      if (!rateLimit(req)) return json(res, 429, { error: 'Terlalu banyak percobaan. Coba lagi satu menit lagi.' });
      const input = await body(req);
      const email = String(input.email || '').trim().toLowerCase();
      const password = String(input.password || '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Alamat email belum valid.' });
      if (password.length < 8 || password.length > 128) return json(res, 400, { error: 'Kata sandi harus berisi 8–128 karakter.' });

      if (path.endsWith('register')) {
        const name = String(input.name || '').trim();
        if (name.length < 2 || name.length > 80) return json(res, 400, { error: 'Nama harus berisi 2–80 karakter.' });
        if (input.confirmPassword !== password) return json(res, 400, { error: 'Konfirmasi kata sandi belum cocok.' });
        if (db.users.some((user) => user.email === email)) return json(res, 409, { error: 'Email sudah terdaftar. Silakan masuk.' });
        const credentials = await passwordHash(password);
        const user = { id: randomBytes(16).toString('hex'), name, email, ...credentials, passwordHash: credentials.hash, createdAt: new Date().toISOString() };
        delete user.hash;
        db.users.push(user);
        await persist();
        issueSession(res, user);
        return json(res, 201, { user: safeUser(user) });
      }
      const user = db.users.find((item) => item.email === email);
      if (!user || !(await passwordMatches(password, user))) return json(res, 401, { error: 'Email atau kata sandi tidak sesuai.' });
      issueSession(res, user);
      return json(res, 200, { user: safeUser(user) });
    }

    if (req.method === 'GET' && path === '/api/auth/me') {
      const user = currentUser(req);
      return user ? json(res, 200, { user: safeUser(user) }) : json(res, 401, { error: 'Silakan masuk terlebih dahulu.' });
    }
    if (req.method === 'POST' && path === '/api/auth/logout') {
      sessions.delete(readCookie(req, SESSION_COOKIE));
      cookie(res, '', 0);
      return json(res, 200, { ok: true });
    }
    if (req.method === 'GET' && path === '/api/payments/bank') return json(res, 200, { bank: BANK });

    if (req.method === 'POST' && path === '/api/orders') {
      const user = currentUser(req);
      if (!user) return json(res, 401, { error: 'Silakan masuk sebelum checkout.' });
      const input = await body(req);
      if (!Array.isArray(input.items) || !input.items.length || input.items.length > 30) return json(res, 400, { error: 'Keranjang tidak valid.' });
      const items = [];
      for (const line of input.items) {
        const product = PRODUCTS.get(String(line.productId));
        const quantity = Number(line.quantity);
        if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return json(res, 400, { error: 'Produk atau jumlah tidak valid.' });
        items.push({ productId: String(line.productId), name: product.name, price: product.price, quantity });
      }
      const address = String(input.address || '').trim();
      if (address.length < 8 || address.length > 500) return json(res, 400, { error: 'Alamat pengiriman harus berisi 8–500 karakter.' });
      const order = {
        id: 'PS-' + randomBytes(5).toString('hex').toUpperCase(),
        userId: user.id, items, address,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        status: 'menunggu_pembayaran', proof: null, createdAt: new Date().toISOString(),
      };
      db.orders.push(order);
      await persist();
      return json(res, 201, { order: publicOrder(order), bank: BANK });
    }

    const proofMatch = path.match(/^\/api\/orders\/([A-Z0-9-]+)\/proof$/);
    if (req.method === 'POST' && proofMatch) {
      const user = currentUser(req);
      if (!user) return json(res, 401, { error: 'Silakan masuk sebelum mengunggah bukti.' });
      const order = db.orders.find((item) => item.id === proofMatch[1] && item.userId === user.id);
      if (!order) return json(res, 404, { error: 'Pesanan tidak ditemukan.' });
      const input = await body(req, MAX_PROOF_BYTES * 1.5);
      const match = String(input.image || '').match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return json(res, 400, { error: 'Bukti harus berupa PNG, JPG, atau WebP.' });
      const bytes = Buffer.from(match[2], 'base64');
      if (bytes.length > MAX_PROOF_BYTES) return json(res, 413, { error: 'Ukuran bukti maksimal 3 MB.' });
      const signatures = { 'image/png': '89504e470d0a1a0a', 'image/jpeg': 'ffd8ff', 'image/webp': '52494646' };
      if (!bytes.subarray(0, signatures[match[1]].length).equals(Buffer.from(signatures[match[1]], 'hex'))) return json(res, 400, { error: 'Isi berkas tidak cocok dengan format gambar.' });
      const filename = randomBytes(20).toString('hex') + ({ 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' })[match[1]];
      await writeFile(join(UPLOAD_DIR, filename), bytes, { flag: 'wx', mode: 0o600 });
      order.proof = { filename, sha256: createHash('sha256').update(bytes).digest('hex'), uploadedAt: new Date().toISOString() };
      order.status = 'menunggu_verifikasi';
      await persist();
      return json(res, 200, { order: publicOrder(order) });
    }

    if (req.method === 'GET' && path === '/api/orders') {
      const user = currentUser(req);
      if (!user) return json(res, 401, { error: 'Silakan masuk untuk melihat pesanan.' });
      return json(res, 200, { orders: db.orders.filter((item) => item.userId === user.id).map(publicOrder) });
    }

    if (req.method === 'POST' && path === '/api/admin/orders/verify') {
      const token = process.env.ADMIN_VERIFY_TOKEN;
      if (!token || req.headers.authorization !== 'Bearer ' + token) return json(res, 403, { error: 'Verifikasi admin belum dikonfigurasi.' });
      const input = await body(req);
      const order = db.orders.find((item) => item.id === input.orderId);
      if (!order || !order.proof) return json(res, 404, { error: 'Pesanan atau bukti transfer tidak ditemukan.' });
      order.status = input.approved === true ? 'terverifikasi' : 'pembayaran_ditolak';
      order.verifiedAt = new Date().toISOString();
      await persist();
      return json(res, 200, { order: publicOrder(order) });
    }

    return json(res, 404, { error: 'Tidak ditemukan.' });
  } catch (error) { return fail(res, error); }
});

function publicOrder(order) {
  const { userId, proof, ...safe } = order;
  return { ...safe, proofUploaded: Boolean(proof) };
}
server.listen(PORT, '0.0.0.0', () => console.log(`PadiSehat API listening on :${PORT}`));
