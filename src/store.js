import { SAMPLE_PRODUCTS } from './products.js';

/** Satu-satunya kunci penyimpanan produk (SPEC F-11). */
export const STORAGE_KEY = 'padisehat.products.v1';

const isIntegerAtLeastZero = (value) => Number.isInteger(value) && value >= 0;

/**
 * Memvalidasi satu objek produk. Mengembalikan objek bersih atau null bila tidak valid.
 * Hanya delapan field model yang dipertahankan; field lain dibuang.
 */
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const nama = typeof raw.nama === 'string' ? raw.nama.trim() : '';
  const kategori = typeof raw.kategori === 'string' ? raw.kategori.trim() : '';
  const deskripsi = typeof raw.deskripsi === 'string' ? raw.deskripsi.trim() : '';
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const imageUrl = typeof raw.imageUrl === 'string' ? raw.imageUrl.trim() : '';

  if (id.length === 0) return null;
  if (nama.length < 3 || nama.length > 60) return null;
  if (kategori.length < 2 || kategori.length > 30) return null;
  if (!isIntegerAtLeastZero(raw.harga)) return null;
  if (!isIntegerAtLeastZero(raw.stok)) return null;
  if (deskripsi.length < 10 || deskripsi.length > 300) return null;

  return {
    id,
    nama,
    kategori,
    harga: raw.harga,
    stok: raw.stok,
    deskripsi,
    imageUrl,
    unggulan: raw.unggulan === true,
  };
}

export function createSeedProducts() {
  return SAMPLE_PRODUCTS.map((product) => ({ ...product }));
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch {
    return false;
  }
}

/**
 * Memuat produk dari localStorage. Data kosong, rusak, atau tidak valid
 * diganti dengan 8 produk contoh agar aplikasi tidak pernah blank.
 */
export function loadProducts() {
  let raw = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return createSeedProducts();
  }

  if (raw === null) {
    const seed = createSeedProducts();
    saveProducts(seed);
    return seed;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const seed = createSeedProducts();
    saveProducts(seed);
    return seed;
  }

  if (!Array.isArray(parsed)) {
    const seed = createSeedProducts();
    saveProducts(seed);
    return seed;
  }

  const valid = parsed.map(normalizeProduct).filter(Boolean);
  if (valid.length === 0) {
    const seed = createSeedProducts();
    saveProducts(seed);
    return seed;
  }

  if (valid.length !== parsed.length) saveProducts(valid);
  return valid;
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
