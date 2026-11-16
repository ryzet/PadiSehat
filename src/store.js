import { SAMPLE_PRODUCTS } from './products.js';

/** Kategori resmi yang boleh digunakan pada katalog PadiSehat. */
export const VALID_CATEGORIES = Object.freeze(['Pupuk', 'Benih', 'Bibit', 'Media Tanam']);

/** Kunci penyimpanan versi 1 sesuai kontrak aplikasi. */
export const STORAGE_KEY = 'padisehat:products:v1';

const isIntegerAtLeastZero = (value) => Number.isInteger(value) && value >= 0;
let storageNotice = '';

export function getStorageNotice() {
  return storageNotice;
}

/** Validasi ketat satu objek produk; data tidak valid tidak pernah disimpan. */
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const nama = typeof raw.nama === 'string' ? raw.nama.trim() : '';
  const kategori = typeof raw.kategori === 'string' ? raw.kategori.trim() : '';
  const deskripsi = typeof raw.deskripsi === 'string' ? raw.deskripsi.trim() : '';
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const imageUrl = typeof raw.imageUrl === 'string' ? raw.imageUrl.trim() : '';

  if (!id || nama.length < 3 || nama.length > 60) return null;
  if (!VALID_CATEGORIES.includes(kategori)) return null;
  if (!isIntegerAtLeastZero(raw.harga) || !isIntegerAtLeastZero(raw.stok)) return null;
  if (deskripsi.length < 10 || deskripsi.length > 300) return null;
  if (raw.imageUrl !== undefined && typeof raw.imageUrl !== 'string') return null;
  if (raw.unggulan !== undefined && typeof raw.unggulan !== 'boolean') return null;

  return { id, nama, kategori, harga: raw.harga, stok: raw.stok, deskripsi, imageUrl, unggulan: raw.unggulan === true };
}

export function validateProducts(value) {
  if (!Array.isArray(value) || value.length === 0) throw new Error('File harus berisi array produk yang tidak kosong.');
  const products = value.map(normalizeProduct);
  if (products.some((product) => product === null)) {
    throw new Error('Data produk tidak valid. Periksa nama, kategori, harga, stok, dan field lainnya.');
  }
  const ids = products.map((product) => product.id);
  if (new Set(ids).size !== ids.length) throw new Error('Setiap produk harus memiliki ID yang unik.');
  return products;
}

export function createSeedProducts() {
  return SAMPLE_PRODUCTS.map((product) => ({ ...product }));
}

export function saveProducts(products) {
  try {
    const valid = validateProducts(products);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return true;
  } catch {
    return false;
  }
}

/** Memuat data secara aman; JSON rusak atau struktur tidak valid dipulihkan ke data contoh. */
export function loadProducts() {
  storageNotice = '';
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    storageNotice = 'Penyimpanan browser tidak dapat diakses. Data contoh ditampilkan sementara.';
    return createSeedProducts();
  }

  if (raw === null) {
    const seed = createSeedProducts();
    saveProducts(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw);
    const valid = validateProducts(parsed);
    return valid;
  } catch {
    const seed = createSeedProducts();
    storageNotice = 'Data produk tersimpan rusak atau tidak valid. Data contoh telah dipulihkan.';
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch { /* fallback tetap ditampilkan */ }
    return seed;
  }
}

/** Mengurai JSON impor dan memvalidasi seluruh data sebelum penyimpanan. */
export function importProductsJson(jsonText) {
  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('File bukan JSON yang valid. Data lama tetap aman.');
  }
  try {
    return validateProducts(parsed);
  } catch (error) {
    throw new Error(`${error.message} Data lama tetap aman.`);
  }
}

export function exportProductsJson(products) {
  return JSON.stringify(validateProducts(products), null, 2);
}

/** Ringkasan dashboard: total produk, total stok, jumlah kategori unik. */
export function summarize(products) {
  const totalStok = products.reduce((sum, product) => sum + product.stok, 0);
  const kategori = new Set(products.map((product) => product.kategori));
  return {
    totalProduk: products.length,
    totalStok,
    jumlahKategori: kategori.size,
  };
}


/**
 * Menghasilkan daftar produk sesuai pencarian, kategori, dan urutan.
 * Fungsi murni: tidak mengubah array/objek sumber maupun state aplikasi.
 */
export function filterProducts(products, { query = '', kategori = 'Semua Kategori', sort = 'unggulan' } = {}) {
  const keyword = String(query).trim().toLocaleLowerCase('id-ID');
  const selectedCategory = String(kategori).trim().toLocaleLowerCase('id-ID');

  const filtered = products.filter((product) => {
    const matchesQuery = !keyword || [product.nama, product.kategori, product.deskripsi]
      .some((value) => String(value ?? '').toLocaleLowerCase('id-ID').includes(keyword));
    const matchesCategory = !selectedCategory || selectedCategory === 'semua kategori'
      || String(product.kategori).trim().toLocaleLowerCase('id-ID') === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const collator = new Intl.Collator('id-ID', { sensitivity: 'base', numeric: true });
  const comparators = {
    unggulan: (a, b) => Number(b.unggulan === true) - Number(a.unggulan === true) || collator.compare(a.nama, b.nama),
    nama: (a, b) => collator.compare(a.nama, b.nama),
    'nama-desc': (a, b) => collator.compare(b.nama, a.nama),
    'harga-asc': (a, b) => a.harga - b.harga || collator.compare(a.nama, b.nama),
    'harga-desc': (a, b) => b.harga - a.harga || collator.compare(a.nama, b.nama),
    'stok-asc': (a, b) => a.stok - b.stok || collator.compare(a.nama, b.nama),
  };
  const compare = comparators[sort] || comparators.unggulan;
  return filtered.slice().sort(compare);
}


/**
 * Membuat tautan WhatsApp untuk pemesanan produk.
 * Nomor wajib memakai format internasional E.164, contoh: +6281234567890.
 * Mengembalikan URL WhatsApp atau null jika nomor/produk tidak valid.
 */
export function buildWhatsAppUrl(nomor, produk) {
  const phone = typeof nomor === 'string' ? nomor.trim() : '';
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    throw new Error('Nomor WhatsApp harus memakai format internasional E.164, contoh +6281234567890.');
  }
  if (!produk || typeof produk.nama !== 'string' || !produk.nama.trim()) {
    throw new Error('Data produk tidak valid untuk membuat pesan WhatsApp.');
  }

  const harga = Number.isFinite(produk.harga)
    ? ` (Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(produk.harga)})`
    : '';
  const message = `Halo PadiSehat, saya ingin memesan ${produk.nama.trim()}${harga}. Apakah produk ini tersedia?`;
  return `https://wa.me/${phone.slice(1)}?text=${encodeURIComponent(message)}`;
}
