/**
 * Nomor WhatsApp pemilik dalam format internasional E.164.
 * Ganti nomor contoh ini dengan nomor WhatsApp resmi sebelum website dipublikasikan.
 */
export const WHATSAPP_NUMBER = '+6281234567890';

/**
 * Data 8 produk contoh PADISEHAT.
 * Semua data bersifat nonpribadi: tanpa nama orang, nomor telepon, alamat, atau email.
 * Harga dalam Rupiah (bilangan bulat) dan bukan klaim harga pasar.
 */

export const SAMPLE_PRODUCTS = [
  {
    id: 'p-001',
    nama: 'Pupuk NPK Padi 1 kg',
    kategori: 'Pupuk',
    harga: 45000,
    stok: 24,
    deskripsi:
      'Pupuk majemuk butiran untuk fase vegetatif padi sawah. Membantu pertumbuhan daun dan anakan.',
    imageUrl: '/img/pupuk-npk.svg',
    unggulan: true,
  },
  {
    id: 'p-002',
    nama: 'Pupuk Organik Kompos 5 kg',
    kategori: 'Pupuk',
    harga: 38000,
    stok: 12,
    deskripsi:
      'Pupuk organik matang dari bahan tanaman. Memperbaiki struktur tanah dan daya simpan air.',
    imageUrl: '/img/pupuk-kompos.svg',
    unggulan: false,
  },
  {
    id: 'p-003',
    nama: 'Pupuk Kandang Fermentasi 3 kg',
    kategori: 'Pupuk',
    harga: 27000,
    stok: 0,
    deskripsi:
      'Pupuk kandang yang telah difermentasi. Cocok untuk media tanam sayuran di polybag.',
    imageUrl: '/img/pupuk-kandang.svg',
    unggulan: false,
  },
  {
    id: 'p-004',
    nama: 'Benih Padi Unggul 1 kg',
    kategori: 'Benih',
    harga: 62000,
    stok: 18,
    deskripsi:
      'Benih padi untuk lahan sawah irigasi. Butir seragam dan siap semai pada musim tanam berikutnya.',
    imageUrl: '/img/benih-padi.svg',
    unggulan: true,
  },
  {
    id: 'p-005',
    nama: 'Benih Jagung Manis 250 g',
    kategori: 'Benih',
    harga: 21000,
    stok: 30,
    deskripsi:
      'Benih jagung manis untuk dataran rendah hingga menengah. Dikemas dalam kantong 250 gram.',
    imageUrl: '/img/benih-jagung.svg',
    unggulan: false,
  },
  {
    id: 'p-006',
    nama: 'Bibit Cabai Rawit (polybag)',
    kategori: 'Bibit',
    harga: 15000,
    stok: 40,
    deskripsi:
      'Bibit cabai rawit dalam polybag, siap tanam di pekarangan atau pot. Tinggi sekitar 15 cm.',
    imageUrl: '/img/bibit-cabai.svg',
    unggulan: false,
  },
  {
    id: 'p-007',
    nama: 'Bibit Tomat (polybag)',
    kategori: 'Bibit',
    harga: 12000,
    stok: 35,
    deskripsi:
      'Bibit tomat muda dalam polybag untuk kebun rumah dan lahan kecil. Sudah berdaun 4–5 helai.',
    imageUrl: '/img/bibit-tomat.svg',
    unggulan: false,
  },
  {
    id: 'p-008',
    nama: 'Media Tanam Sekam Bakar 5 L',
    kategori: 'Media Tanam',
    harga: 18000,
    stok: 20,
    deskripsi:
      'Media tanam sekam bakar yang ringan dan porous untuk campuran pot dan persemaian.',
    imageUrl: '/img/media-sekam.svg',
    unggulan: false,
  },
];
