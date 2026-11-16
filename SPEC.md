# SPEC — PadiSehat

**Katalog & Dashboard Produk Pupuk dan Tanaman (Web, Latihan 1 Hari)**

| Item | Keterangan |
|---|---|
| Versi dokumen | 1.0 |
| Tanggal | 16 November 2026 |
| Status | Final untuk pelaksanaan latihan |
| Tech stack | Vite + JavaScript vanilla (ES modules), CSS biasa |
| Backend | Tidak ada |
| Autentikasi | Tidak ada (tanpa login, tanpa login palsu) |
| Target penyelesaian | 1 hari kerja (± 8 jam efektif) |

---

## 1. Tujuan

### 1.1 Tujuan Produk
Menyediakan aplikasi web sederhana yang memungkinkan **calon pembeli** melihat katalog produk pupuk dan tanaman dengan cepat, lalu menghubungi toko lewat WhatsApp; sekaligus memberi **pengelola toko** dashboard demo untuk menambah, mengubah, dan menghapus produk pada perangkat yang sama.

### 1.2 Tujuan Latihan
Menjadi bahan latihan 1 hari yang melatih alur kerja nyata secara utuh dan berurutan:

1. Membaca spesifikasi → menerjemahkannya menjadi struktur data dan UI.
2. Membangun CRUD tanpa backend (state di memori + `localStorage`).
3. Menerapkan pencarian, filter, dan sorting pada satu sumber data.
4. Menghasilkan tautan eksternal (WhatsApp) dari data produk.
5. Menulis dan menjalankan kriteria penerimaan secara manual.

### 1.3 Indikator Keberhasilan
- Semua **Acceptance Criteria** di Bagian 9 lolos saat diperiksa manual.
- Aplikasi berjalan dengan `npm run dev` tanpa error di konsol browser.
- Data hasil CRUD tetap ada setelah halaman di-*refresh*.

---

## 2. Pengguna dan Peran

Kedua peran memakai **satu perangkat dan satu aplikasi yang sama**; tidak ada pemisahan hak akses, tidak ada sesi, tidak ada kata sandi.

| Peran | Kebutuhan utama | Cara memakai |
|---|---|---|
| **Calon pembeli** | Menemukan produk yang cocok, tahu harga & ketersediaan, cepat bertanya | Membuka halaman katalog (tampilan utama), memakai pencarian/filter/sorting, menekan tombol pesan WhatsApp |
| **Pengelola toko** (demo) | Memperbarui isi katalog dan melihat kondisi stok secara ringkas | Berpindah ke tampilan *Dashboard* melalui navigasi, melakukan tambah/ubah/hapus, membaca ringkasan angka |

**Asumsi konteks pemakaian:** pengunjung pameran/stand toko, ponsel atau laptop, koneksi terbatas, Bahasa Indonesia.

---

## 3. Ruang Lingkup MVP

### 3.1 Daftar Fitur

#### F-01 Katalog Produk
- Menampilkan **8 produk contoh** dalam bentuk kartu (grid).
- Setiap kartu menampilkan: gambar, nama, kategori, harga Rupiah, stok, dan penanda **Unggulan** bila berlaku.
- Katalog adalah tampilan awal saat aplikasi dibuka.
- Bila hasil penyaringan kosong, tampilkan *empty state* dengan tombol "Reset filter".

#### F-02 Gambar Placeholder Lokal
- Setiap produk memakai gambar placeholder **lokal** di dalam proyek (`/public/img/...`), bukan URL eksternal.
- Placeholder bersifat generik (blok warna/ikon sederhana) dan **dibuat sendiri**; tidak memakai foto atau aset berhak cipta.
- Bila gambar gagal dimuat, tampilkan kotak abu-abu dengan inisial nama produk (tidak ada ikon rusak).

#### F-03 Data Produk Contoh
- 8 produk terisi otomatis saat `localStorage` masih kosong.
- Data contoh bersifat **nonpribadi**: tidak memuat nama orang, nomor telepon pribadi, alamat, atau email nyata.
- Komposisi: pupuk dan tanaman/benih/bibit, tersebar di minimal 3 kategori.

#### F-04 Pencarian
- Satu kolom pencarian di atas katalog.
- Mencocokkan **nama**, **kategori**, dan **deskripsi**, tidak peka huruf besar/kecil, mengabaikan spasi di awal/akhir.
- Hasil diperbarui saat mengetik (tanpa tombol submit).
- Pencarian, filter, dan sorting **saling terakumulasi** (AND).

#### F-05 Filter Kategori
- Daftar kategori dibangun **dinamis** dari data produk yang ada.
- Pilihan "Semua Kategori" sebagai nilai awal.
- Hanya satu kategori aktif pada satu waktu (bukan multi-pilih).

#### F-06 Sorting
Pilihan urutan minimal:
1. **Unggulan & Nama A–Z** (nilai awal; unggulan tampil lebih dulu)
2. Nama Z–A
3. Harga termurah → termahal
4. Harga termahal → termurah
5. Stok tersedikit → terbanyak

- Sorting diterapkan setelah pencarian dan filter.
- Produk tanpa hasil filter tidak ikut dihitung.

#### F-07 Tombol Pesan WhatsApp
- Setiap kartu punya tombol **"Pesan via WhatsApp"**.
- Tautan: `https://wa.me/<nomor>?text=<pesan>` dengan `<pesan>` berisi nama produk, harga, dan permintaan singkat — di-*encode* dengan benar (`encodeURIComponent`).
- Nomor toko disimpan pada **satu konstanta konfigurasi** di kode (nomor contoh/dummy), bukan di `localStorage` dan bukan dari input pengguna.
- Tautan dibuka di tab baru (`target="_blank"` + `rel="noopener noreferrer"`).
- Nomor bersifat dummy dan diberi catatan agar pengelola menggantinya saat dipakai nyata.

#### F-08 Dashboard Demo — Ringkasan
Tiga kartu ringkasan, dihitung ulang setiap kali data berubah:
- **Total produk** = jumlah baris produk.
- **Total stok** = jumlah seluruh nilai `stok`.
- **Jumlah kategori** = jumlah kategori unik.

#### F-09 Dashboard Demo — CRUD
- **Tambah:** formulir dengan semua field wajib; produk baru muncul di katalog dan ringkasan ikut berubah.
- **Ubah:** formulir terisi data lama; perubahan tercermin di katalog.
- **Hapus:** meminta konfirmasi sebelum menghapus; setelah dihapus, produk hilang dari katalog dan ringkasan.
- **Reset data contoh:** tombol untuk mengembalikan 8 produk awal (dengan konfirmasi).
- Daftar produk pada dashboard menampilkan minimal nama, kategori, harga, stok, dan aksi Ubah/Hapus.

#### F-10 Validasi Formulir
Pesan kesalahan ditampilkan **per field**, di bawah input, dalam Bahasa Indonesia. Formulir tidak tersimpan selama masih ada kesalahan.

| Field | Aturan |
|---|---|
| Nama | wajib, 3–60 karakter, tidak boleh hanya spasi |
| Kategori | wajib, 2–30 karakter |
| Harga | wajib, angka, bilangan bulat ≥ 0, tidak boleh negatif/desimal/teks |
| Stok | wajib, bilangan bulat ≥ 0 |
| Deskripsi | wajib, 10–300 karakter |
| Image URL | opsional; bila kosong dipakai placeholder bawaan |
| Unggulan | boolean (checkbox), nilai awal tidak dicentang |

#### F-11 Penyimpanan localStorage
- Seluruh data produk disimpan pada satu kunci: **`padisehat.products.v1`**.
- Ditulis setiap kali tambah/ubah/hapus/reset berhasil.
- Saat aplikasi dibuka: bila kunci tidak ada, kosong, atau JSON tidak valid → muat 8 produk contoh (dan tulis ulang ke `localStorage`).
- Tidak ada data lain yang disimpan (tanpa data pribadi, tanpa riwayat pencarian).

#### F-12 Format & Tampilan
- Harga ditampilkan sebagai Rupiah tanpa desimal, contoh: `Rp 45.000`.
- Stok `0` ditampilkan sebagai **"Stok habis"**; tombol WhatsApp tetap ada, namun kartu diberi penanda redup.
- Badge **"Unggulan"** hanya muncul bila `unggulan === true`.
- Antarmuka sepenuhnya Bahasa Indonesia.

### 3.2 Alur Utama

```
Buka aplikasi
  └─ localStorage ada & valid? ── ya ──> muat data tersimpan
                               └ tidak ─> muat 8 produk contoh → tulis ke localStorage
Katalog tampil (grid kartu + ringkasan kecil)
  └─ pengguna mengetik pencarian / memilih kategori / memilih sorting
       └─ daftar kartu dihitung ulang
            └─ klik "Pesan via WhatsApp" → WhatsApp terbuka di tab baru
Navigasi → Dashboard
  └─ Tambah / Ubah / Hapus / Reset → validasi → simpan → render ulang + localStorage
```

---

## 4. Data Model

### 4.1 Entitas: `Product`

| Field | Tipe | Wajib | Aturan validasi | Contoh |
|---|---|---|---|---|
| `id` | string | ya | unik, dibuat sistem (`crypto.randomUUID()` atau `Date.now()` + suffix) | `"p-001"` |
| `nama` | string | ya | 3–60 karakter setelah trim | `"Pupuk NPK Padi 1 kg"` |
| `kategori` | string | ya | 2–30 karakter; disimpan apa adanya, perbandingan filter tidak peka huruf | `"Pupuk"` |
| `harga` | number | ya | bilangan bulat ≥ 0 (Rupiah, tanpa desimal) | `45000` |
| `stok` | number | ya | bilangan bulat ≥ 0 | `24` |
| `deskripsi` | string | ya | 10–300 karakter | `"Pupuk majemuk untuk fase vegetatif padi sawah."` |
| `imageUrl` | string | tidak | jalur lokal `/img/...` atau kosong → placeholder bawaan | `"/img/pupuk-npk.svg"` |
| `unggulan` | boolean | ya | `true` / `false`, bawaan `false` | `true` |

**Catatan tipe:** `id`, `harga`, dan `stok` **bukan** string. `harga` dan `stok` dikonversi dengan `Number()` saat submit, lalu diperiksa `Number.isInteger()`.

### 4.2 Bentuk Data Tersimpan (localStorage)

Kunci `padisehat.products.v1` berisi array objek `Product`:

```
[
  { id, nama, kategori, harga, stok, deskripsi, imageUrl, unggulan },
  ...
]
```

Aturan tambahan:
- Nilai bukan array, atau JSON gagal di-*parse* → dianggap rusak, diganti data contoh.
- Produk dengan field wajib hilang/bertipe salah saat dimuat → dilewati (dibuang) agar UI tidak rusak.
- Struktur data tidak menyimpan apa pun di luar delapan field di atas.

### 4.3 Data Contoh (8 Produk)

Harga dan stok adalah angka contoh yang wajar; bukan klaim harga pasar.

| No | Nama | Kategori | Harga | Stok | Unggulan | Placeholder |
|---|---|---|---|---|---|---|
| 1 | Pupuk NPK Padi 1 kg | Pupuk | 45000 | 24 | ya | `pupuk-npk.svg` |
| 2 | Pupuk Organik Kompos 5 kg | Pupuk | 38000 | 12 | tidak | `pupuk-kompos.svg` |
| 3 | Pupuk Kandang Fermentasi 3 kg | Pupuk | 27000 | 0 | tidak | `pupuk-kandang.svg` |
| 4 | Benih Padi Unggul 1 kg | Benih | 62000 | 18 | ya | `benih-padi.svg` |
| 5 | Benih Jagung Manis 250 g | Benih | 21000 | 30 | tidak | `benih-jagung.svg` |
| 6 | Bibit Cabai Rawit (polybag) | Bibit | 15000 | 40 | tidak | `bibit-cabai.svg` |
| 7 | Bibit Tomat (polybag) | Bibit | 12000 | 35 | tidak | `bibit-tomat.svg` |
| 8 | Media Tanam Sekam Bakar 5 L | Media Tanam | 18000 | 20 | tidak | `media-sekam.svg` |

Deskripsi tiap produk ditulis 1–2 kalimat, faktual, tanpa klaim medis/hasil panen yang menjamin, dan tanpa merek dagang pihak ketiga.

### 4.4 Turunan Data (dihitung, tidak disimpan)
- `totalProduk` = panjang array.
- `totalStok` = Σ `stok`.
- `jumlahKategori` = ukuran himpunan `kategori`.
- `kategoriTersedia` = daftar kategori unik, terurut A–Z.
- `hasilTampil` = `filterKategori(pencarian(semuaProduk))` lalu diurutkan.

---

## 5. Nonfunctional Requirements

| Kode | Kategori | Requirement | Cara memeriksa |
|---|---|---|---|
| NFR-01 | Performa | Halaman katalog tampil < 2 detik pada `npm run dev` lokal; interaksi pencarian/filter terasa < 100 ms untuk 8 produk | Amati DevTools Performance/Network saat muat & mengetik |
| NFR-02 | Ketergantungan | Tanpa backend, tanpa API key, tanpa layanan pihak ketiga selain tautan `wa.me` | Cari `http`/token di kode; periksa tab Network |
| NFR-03 | Offline-first | Setelah aset termuat, seluruh fitur (katalog, filter, CRUD) berjalan tanpa jaringan; hanya WhatsApp butuh jaringan | Matikan jaringan, ulangi alur CRUD |
| NFR-04 | Responsif | Dapat dipakai pada lebar 360 px, 768 px, dan 1280 px tanpa scroll horizontal | DevTools device toolbar pada tiga lebar |
| NFR-05 | Aksesibilitas dasar | Semua kontrol formulir punya `<label>`; navigasi keyboard bisa mencapai pencarian, filter, sorting, tombol aksi; fokus terlihat; kontras teks ≥ 4.5:1 | Tab melalui halaman, periksa kontras |
| NFR-06 | Ketahanan data | Data tidak hilang setelah refresh; data rusak di `localStorage` tidak membuat aplikasi blank | Edit nilai kunci menjadi teks acak, refresh |
| NFR-07 | Keamanan | Tanpa API key/rahasia di repo; tanpa `innerHTML` untuk data yang diketik pengguna (pakai `textContent`); tautan eksternal `rel="noopener noreferrer"` | Telusuri kode untuk `innerHTML`, `key`, `secret`, `token` |
| NFR-08 | Privasi | Tidak ada data pribadi (nama orang, telepon, alamat, email); nomor WhatsApp toko adalah dummy | Baca seluruh data contoh & kunci `localStorage` |
| NFR-09 | Lisensi aset | Semua gambar/ikon dibuat sendiri (SVG/blok warna); tidak ada aset berhak cipta atau hotlink | Periksa folder `public/img` dan atribusi |
| NFR-10 | Keterbacaan kode | Modul dipisah per tanggung jawab (data, render, filter, form, storage); nama fungsi deskriptif; tanpa `console.log` sisa | Baca struktur folder & telusuri `console.log` |
| NFR-11 | Bahasa | Seluruh teks UI dan pesan kesalahan dalam Bahasa Indonesia | Tinjau UI |
| NFR-12 | Kompatibilitas | Berjalan di Chrome, Edge, dan Firefox versi terbaru (dukungan ES2020+) | Buka di dua browser berbeda |

**Target di luar performa:** tidak ada target skalabilitas besar — 8 produk adalah ukuran yang disengaja untuk latihan; 200 produk hanya perlu tidak *crash*.

---

## 6. Batasan (Constraints)

1. **Tanpa backend, tanpa database, tanpa autentikasi.** Tidak ada login, termasuk login palsu/placeholder.
2. **Jangan menyimpan API key atau rahasia apa pun** di kode, `.env`, maupun `localStorage`.
3. **Jangan menjalankan perintah berbahaya** (format disk, `rm -rf`, instalasi global, perubahan konfigurasi sistem) selama latihan.
4. **Data contoh nonpribadi** — tidak memakai identitas nyata.
5. **Jangan memakai aset berhak cipta** — gambar placeholder dibuat sendiri.
6. Satu perangkat, satu pengguna aktif; tidak ada sinkronisasi antar perangkat.
7. Tidak ada proses build kustom di luar bawaan Vite.

---

## 7. Risiko dan Mitigasi

| Kode | Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|---|
| R-01 | `localStorage` terhapus (mode privat, bersihkan data) | Data hilang | Sedang | Muat ulang data contoh otomatis + tombol "Reset data contoh"; cantumkan catatan di dashboard |
| R-02 | JSON `localStorage` rusak/versi lama | Aplikasi blank | Sedang | `try/catch` saat parse + validasi per objek + fallback data contoh |
| R-03 | Harga/stok tersimpan sebagai string | Sorting & total salah | Sedang | Konversi `Number()` + `Number.isInteger()` di satu fungsi validasi |
| R-04 | Tautan WhatsApp tidak ter-*encode* | Pesan berantakan/tautan rusak | Rendah | `encodeURIComponent` untuk isi pesan; uji dengan nama produk berspasi |
| R-05 | Nomor WhatsApp dummy terpakai di produksi | Pesan salah tujuan | Rendah | Konstanta tunggal + komentar "GANTI nomor toko" + catatan di README |
| R-06 | Waktu 1 hari tidak cukup untuk CRUD + polish | Fitur setengah jadi | Sedang | Iterasi berprioritas (Bagian 10); polish dan aksesibilitas dikerjakan terakhir, boleh dipotong |
| R-07 | Filter/pencarian/sorting saling menimpa state | Hasil tidak konsisten | Sedang | Satu objek state `{ q, kategori, sort }`, satu fungsi `getVisibleProducts()` sebagai sumber tunggal |
| R-08 | Gambar placeholder hilang | Kartu terlihat rusak | Rendah | `onerror` → fallback inisial; cek semua berkas ada sebelum demo |
| R-09 | Data pengguna dirender dengan `innerHTML` | Risiko XSS (walau lokal) | Rendah | Selalu `textContent` untuk nilai dari input |
| R-10 | Dua tab terbuka bersamaan | Perubahan saling menimpa | Rendah | Diterima sebagai batasan MVP; catat di out-of-scope |

---

## 8. Out of Scope

Hal berikut **tidak** dikerjakan pada MVP ini:

- Backend, API, database, dan sinkronisasi antar perangkat.
- Login, registrasi, peran/hak akses, atau autentikasi apa pun (termasuk tiruan).
- Keranjang belanja, checkout, pembayaran, ongkos kirim, invoice.
- Integrasi WhatsApp Business API, notifikasi, atau pengiriman pesan otomatis.
- Upload gambar dari perangkat (hanya jalur gambar/lokal dan field `imageUrl`).
- Multi-bahasa, dark mode, PWA/offline service worker, unit test otomatis, CI.
- Optimasi untuk ratusan/ribuan produk, pagination, infinite scroll.
- Analitik, pelacakan, cookie, atau penyimpanan data pribadi.
- Halaman detail produk terpisah (detail ditampilkan di kartu).
- Pengelolaan kategori sebagai entitas tersendiri (kategori hanya string pada produk).

---

## 9. Acceptance Criteria

Semua kriteria diperiksa **manual** di browser. Prasyarat tiap pemeriksaan: `npm run dev` berjalan dan halaman dibuka di `http://localhost:5173`.

### 9.1 Katalog & Data Awal

| ID | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| AC-01 | Hapus kunci `padisehat.products.v1` di DevTools → Application → Local Storage, lalu refresh | Tampil tepat **8 kartu produk** contoh; kunci `padisehat.products.v1` terisi kembali |
| AC-02 | Amati satu kartu produk | Kartu menampilkan gambar, nama, kategori, harga berformat `Rp xx.xxx`, dan stok |
| AC-03 | Cari produk "Pupuk NPK Padi 1 kg" di katalog | Harga tampil `Rp 45.000` (ada titik ribuan, tanpa desimal) |
| AC-04 | Amati produk "Pupuk Kandang Fermentasi 3 kg" (stok 0) | Stok tampil sebagai "Stok habis"; kartu tampak redup |
| AC-05 | Amati produk unggulan (Pupuk NPK, Benih Padi) | Badge "Unggulan" hanya muncul pada produk dengan `unggulan = true` |
| AC-06 | Periksa tab Network saat memuat halaman | Tidak ada permintaan ke domain selain `localhost`; gambar dimuat dari `/img/...` |

### 9.2 Pencarian, Filter, Sorting

| ID | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| AC-07 | Ketik `pupuk` pada kolom pencarian | Hanya produk yang nama/kategori/deskripsinya memuat "pupuk" yang tampil (3 produk) |
| AC-08 | Ketik `PUPUK` (huruf besar) | Hasil sama dengan AC-07 |
| AC-09 | Ketik `xyz123` | Tampil *empty state* dengan tombol "Reset filter"; klik tombol → seluruh 8 produk kembali tampil dan kolom pencarian kosong |
| AC-10 | Pilih kategori "Benih" | Hanya 2 produk kategori Benih tampil |
| AC-11 | Dengan kategori "Benih" aktif, ketik `jagung` | Hanya "Benih Jagung Manis 250 g" tampil (pencarian + filter terakumulasi) |
| AC-12 | Daftar kategori pada filter | Berisi "Semua Kategori", Pupuk, Benih, Bibit, Media Tanam (dibangun dari data, terurut A–Z) |
| AC-13 | Pilih sorting "Harga termurah → termahal" | Kartu pertama "Bibit Tomat (polybag)" (Rp 12.000), terakhir "Benih Padi Unggul 1 kg" (Rp 62.000) |
| AC-14 | Pilih sorting "Harga termahal → termurah" | Urutan terbalik dari AC-13 |
| AC-15 | Pilih sorting "Stok tersedikit → terbanyak" | Kartu pertama "Pupuk Kandang Fermentasi 3 kg" (stok 0) |
| AC-16 | Pilih sorting "Nama A–Z", lalu muat ulang halaman | Urutan abjad benar; sorting kembali ke nilai awal "Unggulan & Nama A–Z" (state filter tidak wajib bertahan) |

### 9.3 WhatsApp

| ID | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| AC-17 | Klik "Pesan via WhatsApp" pada "Pupuk NPK Padi 1 kg" | Tab baru terbuka ke `https://wa.me/...` dengan teks pesan memuat nama produk dan `Rp 45.000` |
| AC-18 | Periksa tautan pada produk dengan spasi/tanda kurung, mis. "Bibit Cabai Rawit (polybag)" | Isi pesan ter-*encode* benar (spasi menjadi `%20`), tanpa karakter rusak |
| AC-19 | Periksa kode sumber untuk nomor WhatsApp | Nomor hanya ada di satu konstanta konfigurasi, berupa dummy, disertai komentar untuk menggantinya |

### 9.4 Dashboard & CRUD

| ID | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| AC-20 | Buka Dashboard | Ringkasan menampilkan total produk **8**, total stok **179**, jumlah kategori **4** |
| AC-21 | Tambah produk: nama "Pupuk Uji Coba", kategori "Pupuk", harga `30000`, stok `5`, deskripsi 15+ karakter → simpan | Produk muncul di daftar dashboard **dan** katalog (total 9 kartu); ringkasan berubah menjadi produk 9, stok 184, kategori 4 |
| AC-22 | Refresh halaman | Produk "Pupuk Uji Coba" masih ada |
| AC-23 | Ubah produk tersebut: harga `35000`, stok `7` → simpan | Nilai baru tampil di dashboard dan katalog (`Rp 35.000`), ringkasan menyesuaikan |
| AC-24 | Hapus produk tersebut → muncul konfirmasi → batalkan | Produk **tidak** terhapus |
| AC-25 | Ulangi hapus → setujui konfirmasi | Produk hilang dari dashboard dan katalog; ringkasan kembali ke 8 / 179 / 4 |
| AC-26 | Isi formulir tambah dengan nama kosong, harga `-5`, stok `1.5` → simpan | Tersimpan **tidak** terjadi; muncul pesan kesalahan per field dalam Bahasa Indonesia; data lama tidak berubah |
| AC-27 | Tambah produk dengan kategori baru "Alat Kebun" | Jumlah kategori menjadi 5, dan "Alat Kebun" otomatis muncul di filter kategori katalog |
| AC-28 | Klik "Reset data contoh" → konfirmasi | Kembali tepat 8 produk contoh; ringkasan 8 / 179 / 4; perubahan sebelumnya hilang |
| AC-29 | Tambah produk baru tanpa mengisi `imageUrl` | Kartu memakai placeholder bawaan dan tetap tampil rapi |

### 9.5 Ketahanan & Nonfunctional

| ID | Langkah pemeriksaan | Hasil yang diharapkan |
|---|---|---|
| AC-30 | Ubah nilai `padisehat.products.v1` menjadi `bukan-json` → refresh | Aplikasi tetap tampil dengan 8 produk contoh, tanpa halaman kosong, tanpa error fatal di konsol |
| AC-31 | Set lebar viewport 360 px, 768 px, 1280 px | Tidak ada scroll horizontal; kartu dan formulir tetap terbaca |
| AC-32 | Navigasi hanya dengan Tab + Enter/Space | Semua kontrol utama (pencarian, kategori, sorting, tombol pesan, navigasi, form) dapat difokuskan dan diaktifkan |
| AC-33 | Matikan jaringan, ulangi tambah/ubah/hapus lalu refresh | Semua fitur selain WhatsApp tetap berfungsi |
| AC-34 | Cari `key`, `secret`, `token`, `api_key` di seluruh repo; cek `.env` | Tidak ditemukan rahasia; tidak ada `.env` berisi kredensial |
| AC-35 | Buka folder `public/img` | Semua gambar placeholder ada, berformat SVG/PNG buatan sendiri, tanpa berkas dari internet |
| AC-36 | Periksa konsol browser sepanjang pemeriksaan | Tidak ada `error` (peringatan non-kritis boleh dicatat) |

**Ringkasan kelulusan:** MVP dinyatakan selesai bila AC-01 s.d. AC-36 berstatus lolos; AC yang gagal dicatat sebagai *known issue* beserta alasannya.

---

## 10. Rencana Implementasi per Iterasi (1 Hari)

Asumsi 8 jam efektif: 7 jam kerja + 1 jam buffer/demo. Setiap iterasi berakhir dengan kondisi aplikasi **dapat dijalankan**.

### Iterasi 0 — Persiapan (30 menit)
- Buat proyek Vite (`vanilla`), rapikan `index.html`, siapkan struktur folder.
- Tentukan struktur: `index.html`, `src/main.js`, `src/state.js`, `src/data.js`, `src/storage.js`, `src/render.js`, `src/filters.js`, `src/format.js`, `src/styles.css`, `public/img/`.
- Buat 8 placeholder SVG sendiri.
- **Selesai bila:** `npm run dev` menyala menampilkan halaman kosong bertema PadiSehat.
- Terkait: NFR-01, NFR-10.

### Iterasi 1 — Model Data & Penyimpanan (60 menit)
- Tulis 8 data contoh sesuai tabel Bagian 4.3.
- Implementasikan `loadProducts()` / `saveProducts()` (kunci `padisehat.products.v1`, `try/catch`, validasi objek, fallback data contoh).
- Implementasikan `formatRupiah()`.
- **Selesai bila:** data terbaca, tersimpan, dan AC-01, AC-30 lolos.
- Terkait: F-03, F-11, R-01, R-02.

### Iterasi 2 — Katalog & Tampilan Kartu (75 menit)
- Render grid kartu: gambar, nama, kategori, harga, stok/"Stok habis", badge Unggulan.
- Fallback gambar + *empty state* dasar.
- Tata letak responsif (grid 1/2/3–4 kolom).
- **Selesai bila:** AC-02, AC-03, AC-04, AC-05, AC-06, AC-31 lolos.
- Terkait: F-01, F-02, F-12, NFR-04.

### Iterasi 3 — Pencarian, Filter, Sorting (60 menit)
- Satu objek state `{ q, kategori, sort }`; satu fungsi `getVisibleProducts()`.
- Pencarian multi-field tidak peka huruf; filter kategori dinamis; lima opsi sorting.
- Tombol "Reset filter" pada *empty state*.
- **Selesai bila:** AC-07 s.d. AC-16 lolos.
- Terkait: F-04, F-05, F-06, R-07.

### Iterasi 4 — Tombol WhatsApp (30 menit)
- Konstanta nomor toko (dummy) + komentar penggantian.
- Bangun tautan `wa.me` dengan pesan ter-*encode*, buka tab baru dengan `noopener noreferrer`.
- **Selesai bila:** AC-17, AC-18, AC-19 lolos.
- Terkait: F-07, R-04, R-05, NFR-07.

### Iterasi 5 — Dashboard, Ringkasan & CRUD (120 menit)
- Navigasi katalog ⇄ dashboard (tanpa router, cukup tampil/sembunyi).
- Kartu ringkasan total produk/stok/kategori.
- Tabel/daftar produk + tombol Ubah/Hapus.
- Formulir tambah/ubah dengan validasi per field (Bagian 3.1 F-10).
- Konfirmasi hapus & reset data contoh.
- Simpan ke `localStorage` setiap mutasi, lalu render ulang katalog + ringkasan.
- **Selesai bila:** AC-20 s.d. AC-29 lolos.
- Terkait: F-08, F-09, F-10, F-11, R-03.

### Iterasi 6 — Penyempurnaan & Verifikasi (60 menit)
- Aksesibilitas: `<label>`, fokus terlihat, kontras, urutan Tab.
- Rapikan pesan kesalahan, *empty state*, dan teks Bahasa Indonesia.
- Ganti semua `innerHTML` berisi data pengguna dengan `textContent`; hapus `console.log`.
- Tulis README singkat: cara menjalankan, cara mengganti nomor WhatsApp, catatan `localStorage`.
- **Selesai bila:** AC-32 s.d. AC-36 lolos.
- Terkait: NFR-05, NFR-07, NFR-11.

### Iterasi 7 — Demo & Buffer (45 menit)
- Jalankan seluruh AC-01 s.d. AC-36, catat hasil di tabel checklist (Lolos/Gagal/Catatan).
- Siapkan alur demo 3 menit: katalog → cari & filter → pesan WhatsApp → dashboard → tambah → refresh → reset.
- **Selesai bila:** semua AC lolos atau *known issue* terdokumentasi.

**Total:** 30+60+75+60+30+120+60+45 = **480 menit (8 jam)**.

### Prioritas bila waktu mepet
1. Wajib: Iterasi 0–2 + CRUD inti (tanpa sorting lengkap) → katalog & data tersimpan.
2. Penting: Iterasi 3–4 → pencarian/filter/sorting + WhatsApp.
3. Boleh dipotong: penyempurnaan aksesibilitas, sorting "Nama Z–A", animasi, dan hiasan visual.

---

## 11. Definisi Selesai (Definition of Done)

- [ ] Aplikasi berjalan dengan `npm run dev` tanpa error konsol.
- [ ] 8 produk contoh tampil dan seluruh field sesuai model data.
- [ ] Pencarian, filter kategori, dan sorting bekerja bersama.
- [ ] Tombol WhatsApp membuka tautan `wa.me` dengan pesan ter-*encode*.
- [ ] CRUD + validasi + konfirmasi hapus + reset data contoh berfungsi.
- [ ] Ringkasan total produk/stok/kategori akurat setelah setiap mutasi.
- [ ] Data bertahan setelah refresh; data rusak tidak mematikan aplikasi.
- [ ] Tidak ada rahasia/API key, tidak ada aset berhak cipta, tidak ada data pribadi.
- [ ] AC-01 s.d. AC-36 diperiksa manual dan hasilnya dicatat.
- [ ] README singkat tersedia.
