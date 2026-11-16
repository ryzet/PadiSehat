# TASKS — PADISEHAT

**Rencana Kerja Implementasi Berbasis Milestone**

| Item | Keterangan |
|---|---|
| Versi | 1.0 |
| Tanggal | 16 November 2026 |
| Dokumen acuan | `SPEC.md` v1.0 · `UI-SPEC.md` v1.0 |
| Stack | Vite 5+ · JavaScript vanilla (ES modules) · CSS biasa · Vitest |
| Backend | Tidak ada |
| Total estimasi | ± 515 menit (8,6 jam) — lihat 0.4 |
| Status | Belum ada kode yang ditulis |

---

## 0. Cara Memakai Dokumen Ini

### 0.1 Aturan Umum
1. Kerjakan milestone **berurutan**; jangan mulai M(n+1) sebelum gerbang M(n) lolos.
2. Setiap milestone punya tiga hal wajib: **acceptance criteria** (manual, dapat diperiksa), **file yang disentuh**, dan **perintah uji** yang harus dijalankan serta dicatat hasilnya.
3. Semua perintah dijalankan dari root proyek dengan bash (Git Bash di Windows).
4. Perintah uji ditulis apa adanya; jangan mengarang hasil. Bila gagal, perbaiki penyebabnya — jangan melemahkan kriteria.
5. Commit per milestone (pesan: `feat(m2): katalog 8 produk`), kecuali pengguna meminta lain.

### 0.2 Peta Ketergantungan

```
M1 Scaffold
 └─> M2 Landing + 8 produk
      ├─> M3 Pencarian/filter/sorting
      ├─> M4 WhatsApp
      └─> M5 Dashboard CRUD
           └─> M6 localStorage + import/export
                ├─> M7 Vitest
                └─> M8 Security review
                     └─> M9 Deployment (butuh persetujuan pengguna)
```

M3 dan M4 boleh dikerjakan paralel setelah M2. M5 membutuhkan M1–M2 (bukan M3/M4).

### 0.3 Yang **Tidak** Termasuk di TASKS.md
Milestone yang diminta berhenti pada dashboard + penyimpanan. Fitur **Lapis B** di `UI-SPEC.md` §2.2 — halaman detail produk, keranjang, checkout demo, ringkasan penjualan, tombol "+ Tambah ke keranjang" — **tidak dijadwalkan di sini**. Tombol WhatsApp tetap wajib (F-07), dan kartu produk tetap menampilkan detail secukupnya. Bila Lapis B dikerjakan, buat `TASKS-LAPIS-B.md` terpisah setelah M6.

### 0.4 Estimasi & Realitas Waktu

| M | Nama | Estimasi | Kumulatif |
|---|---|---|---|
| M1 | Scaffold Vite | 45 mnt | 0:45 |
| M2 | Landing & 8 produk | 90 mnt | 2:15 |
| M3 | Pencarian/filter/sorting | 45 mnt | 3:00 |
| M4 | Integrasi WhatsApp | 20 mnt | 3:20 |
| M5 | Dashboard CRUD | 120 mnt | 5:20 |
| M6 | localStorage + import/export | 60 mnt | 6:20 |
| M7 | Vitest | 60 mnt | 7:20 |
| M8 | Security review | 45 mnt | 8:05 |
| M9 | Deployment | 30 mnt | 8:35 |

**Catatan jujur:** `SPEC.md` merencanakan 8 jam untuk MVP tanpa test otomatis dan tanpa import/export. Dengan tambahan M6–M9, total ± 8,6 jam **belum termasuk** debugging. Bila latihan tetap 1 hari (8 jam), potong dengan urutan: (a) M7 hanya 3 file uji inti, (b) M9 diganti `npm run preview` lokal, (c) M6 ekspor saja tanpa impor. Jangan memotong M1–M5.

### 0.5 Struktur File Target

```
padisehat/
├─ index.html
├─ package.json
├─ vite.config.js
├─ vitest.config.js
├─ README.md
├─ public/
│  └─ img/                    # 8 SVG placeholder buatan sendiri
│     ├─ pupuk-npk.svg
│     ├─ pupuk-kompos.svg
│     ├─ pupuk-kandang.svg
│     ├─ benih-padi.svg
│     ├─ benih-jagung.svg
│     ├─ bibit-cabai.svg
│     ├─ bibit-tomat.svg
│     └─ media-sekam.svg
├─ src/
│  ├─ main.js                 # bootstrap + render aktif
│  ├─ config.js               # nomor WhatsApp, konstanta app
│  ├─ state.js                # state { view, q, kategori, sort, products }
│  ├─ data/sampleProducts.js  # 8 produk contoh
│  ├─ storage.js              # load/save/validate, ekspor/impor
│  ├─ format.js               # formatRupiah, formatAngka
│  ├─ filters.js              # getVisibleProducts, daftar kategori
│  ├─ wa.js                   # buildWhatsAppLink
│  ├─ validation.js           # validateProduct
│  ├─ views/
│  │  ├─ catalog.js
│  │  └─ dashboard.js
│  ├─ ui/
│  │  ├─ productCard.js
│  │  ├─ modal.js
│  │  ├─ toast.js
│  │  └─ emptyState.js
│  └─ styles/
│     ├─ tokens.css
│     ├─ base.css
│     └─ components.css
└─ tests/
   ├─ setup.js
   ├─ format.test.js
   ├─ filters.test.js
   ├─ wa.test.js
   ├─ validation.test.js
   └─ storage.test.js
```

---

## M1 — Scaffold Vite

**Tujuan:** proyek dapat dijalankan dan dibangun, token desain serta font lokal sudah terpasang.

### Deliverables
- Proyek Vite (`vanilla`) dengan `package.json`, `vite.config.js`, `index.html`.
- `src/styles/tokens.css` berisi seluruh token `UI-SPEC.md` §3 (warna, tipe, spasi, radius, shadow, breakpoint sebagai komentar).
- `src/styles/base.css`: reset ringan, latar `--krem`, tipografi dasar, `:focus-visible`, skip link.
- Font **self-host** via `@fontsource-variable/bricolage-grotesque` dan `@fontsource-variable/plus-jakarta-sans` (bukan Google Fonts).
- `src/config.js` dengan konstanta aplikasi (tanpa nomor WhatsApp asli — itu di M4).
- `README.md` kerangka: cara menjalankan, catatan localStorage.

### File yang Disentuh
| File | Aksi |
|---|---|
| `package.json` | buat |
| `vite.config.js` | buat |
| `index.html` | buat |
| `src/main.js` | buat (render placeholder "PADISEHAT") |
| `src/config.js` | buat |
| `src/styles/tokens.css`, `base.css` | buat |
| `README.md` | buat |
| `.gitignore` | buat (`node_modules`, `dist`, `.env*`) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T1-01 | `npm ci` (atau `npm install`) | Selesai tanpa error; `node_modules` terbentuk |
| T1-02 | `npm run dev` lalu buka `http://localhost:5173` | Halaman tampil, latar krem, judul "PADISEHAT", tanpa error konsol |
| T1-03 | Tab Network saat memuat | Tidak ada permintaan ke domain selain `localhost` (font & aset lokal) |
| T1-04 | DevTools → Computed pada `<body>` | `font-family` Plus Jakarta Sans; judul memakai Bricolage Grotesque |
| T1-05 | Ubah lebar ke 360 px | Tidak ada scroll horizontal |
| T1-06 | Tab dari awal halaman | Muncul skip link "Lewati ke konten utama" sebagai fokus pertama |
| T1-07 | `npm run build` | Selesai tanpa error; folder `dist/` berisi `index.html` + aset |
| T1-08 | `git status` | `node_modules`, `dist`, `.env*` tidak ikut ter-*track* |

### Perintah Uji
```bash
npm ci
npm run dev
# cek manual di http://localhost:5173, lalu hentikan server
npm run build
ls dist
find dist -type f | wc -l
```

### Gerbang
Semua AC T1 lolos **dan** tidak ada `console.error` sebelum lanjut ke M2.

---

## M2 — Landing & 8 Produk

**Tujuan:** tampilan katalog lengkap dengan hero, grid 8 produk contoh, dan state dasar.

> **Klarifikasi cakupan:** `UI-SPEC.md` tidak mendefinisikan rute landing terpisah. "Landing" di sini = **seksi hero di atas katalog** (V1), sesuai §4.1 dan wireframe §6.1/6.2. Tidak ada halaman `/` terpisah dan tidak ada router.

### Deliverables
- `src/data/sampleProducts.js`: tepat 8 produk sesuai `SPEC.md` §4.3 (harga & stok persis).
- 8 placeholder SVG 4:3 buatan sendiri di `public/img/`.
- Deskripsi produk ditulis agar kata **"pupuk"** hanya muncul pada 3 produk berkategori Pupuk (menjaga AC-07/SPEC tetap 3 hasil), dan kata **"benih"** hanya pada 2 produk Benih.
- Navbar sticky (logo, menu Katalog/Dashboard, tombol keranjang **belum aktif**), hero emoji `aria-hidden`, footer.
- `ui/productCard.js`: gambar, kategori, nama (line-clamp 2), harga Rupiah, stok/"Stok habis"/"stok tersisa N", badge Unggulan, fallback inisial bila gambar gagal.
- Grid responsif 1/2/3/4 kolom sesuai `UI-SPEC.md` §3.4.
- `format.js`: `formatRupiah()` (titik ribuan, tanpa desimal).
- Empty state katalog kosong (belum perlu state filter).

### File yang Disentuh
| File | Aksi |
|---|---|
| `src/data/sampleProducts.js` | buat |
| `src/format.js` | buat |
| `src/ui/productCard.js` | buat |
| `src/views/catalog.js` | buat (hero + grid + footer) |
| `src/main.js` | ubah (render katalog) |
| `src/styles/components.css` | buat |
| `public/img/*.svg` (8 file) | buat |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T2-01 | Buka aplikasi dengan localStorage kosong | Tepat **8 kartu** produk tampil |
| T2-02 | Amati kartu "Pupuk NPK Padi 1 kg" | Gambar, kategori "Pupuk", harga `Rp 45.000`, stok 24 |
| T2-03 | Amati "Pupuk Kandang Fermentasi 3 kg" | "Stok habis" warna `--galat`, gambar 55% opasitas |
| T2-04 | Ubah sementara `stok` satu produk di `src/data/sampleProducts.js` menjadi `2`, muat ulang | Tampil "stok tersisa 2" berwarna `--peringatan`; tombol tambah tetap aktif; kembalikan nilai setelah uji |
| T2-05 | Amati badge | "Unggulan" hanya pada Pupuk NPK dan Benih Padi |
| T2-06 | Rusak salah satu `src` gambar di DevTools | Muncul kotak `--krem-tua` dengan inisial produk, bukan ikon gambar rusak |
| T2-07 | Lebar 360 / 768 / 1280 px | Grid 1 / 3 / 4 kolom, tanpa scroll horizontal, tidak ada teks terpotong |
| T2-08 | Gulir 400 px | Navbar tetap di atas, ada bayangan |
| T2-09 | Tab ke kartu produk | Cincin fokus hijau terlihat; `aria-label` "Lihat detail …" terbaca |
| T2-10 | Periksa Network | Semua gambar dari `/img/…`, 8 berkas SVG ada |
| T2-11 | Periksa `public/img` | Tidak ada aset dari internet; semua SVG buatan sendiri, tanpa merek pihak ketiga |

**Rujukan:** SPEC AC-01…AC-06, AC-31, AC-35 · UI-01…UI-04, UI-24.

### Perintah Uji
```bash
npm run dev
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/img/pupuk-npk.svg   # 200
ls public/img | wc -l                                                             # 8
grep -c "id:" src/data/sampleProducts.js                                          # 8
npm run build
```

### Gerbang
T2-01…T2-11 lolos. Bila ada angka produk/harga berbeda dari `SPEC.md` §4.3, **perbaiki data**, jangan ubah kriteria.

---

## M3 — Pencarian, Filter, Sorting

**Tujuan:** satu sumber kebenaran untuk daftar yang tampil.

### Deliverables
- `src/state.js`: state `{ q, kategori, sort }` + `setState()`.
- `src/filters.js`: `getVisibleProducts(products, state)` (pencarian → filter → sort, urutan tetap), `getKategoriList(products)`.
- Pencarian multi-field (nama, kategori, deskripsi), `trim`, tidak peka huruf besar/kecil, *debounce* tidak wajib.
- Chip kategori dari data, "Semua Kategori" selalu ada, urut A–Z.
- `<select>` 5 opsi sorting persis `SPEC.md` F-06.
- Baris "Menampilkan N dari M produk" + tombol "Reset filter" (muncul hanya saat filter aktif).
- Empty state "Produk tidak ditemukan".
- `aria-live="polite"` untuk jumlah hasil.

### File yang Disentuh
| File | Aksi |
|---|---|
| `src/state.js` | buat |
| `src/filters.js` | buat |
| `src/views/catalog.js` | ubah (toolbar + render dari hasil filter) |
| `src/ui/emptyState.js` | buat |
| `src/styles/components.css` | ubah (toolbar, chip, select) |
| `index.html` | ubah bila perlu (struktur toolbar) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T3-01 | Ketik `pupuk` | 3 produk (NPK, Kompos, Kandang) |
| T3-02 | Ketik `PUPUK` | Hasil identik T3-01 |
| T3-03 | Ketik `  benih  ` (berspasi) | Hasil **identik** dengan mengetik `benih` tanpa spasi |
| T3-04 | Ketik `xyz123` | Empty state + "Reset filter"; klik → 8 produk, kolom kosong, chip "Semua" aktif |
| T3-05 | Pilih kategori "Benih" | 2 produk |
| T3-06 | Kategori "Benih" + ketik `jagung` | 1 produk |
| T3-07 | Buka dropdown kategori | "Semua Kategori", Benih, Bibit, Media Tanam, Pupuk (A–Z) |
| T3-08 | Sort "Harga termurah" | Pertama `Rp 12.000` (Bibit Tomat), terakhir `Rp 62.000` |
| T3-09 | Sort "Harga termahal" | Kebalikan T3-08 |
| T3-10 | Sort "Stok tersedikit" | Pertama stok 0 (Pupuk Kandang) |
| T3-11 | Sort "Nama A–Z" | Urut abjad; muat ulang → kembali "Unggulan & Nama A–Z" |
| T3-12 | Filter aktif lalu refresh | Filter boleh kembali kosong, tetapi daftar lengkap tampil (tidak error) |
| T3-13 | Ubah pencarian saat kategori aktif | Hasil tetap terakumulasi (bukan saling menimpa) |
| T3-14 | Tab melalui toolbar | Pencarian → chip (panah kiri/kanan) → select → reset; fokus terlihat |

**Rujukan:** SPEC AC-07…AC-16 · UI-05, UI-07.

### Perintah Uji
```bash
npm run dev
# manual: jalankan T3-01..T3-14
npm run build
```

### Gerbang
T3-01…T3-14 lolos. Sorting harus **stabil** untuk harga/stok yang sama (gunakan pembanding kedua nama A–Z).

---

## M4 — Integrasi WhatsApp

**Tujuan:** setiap kartu dapat membuka percakapan berisi produk yang benar.

### Deliverables
- `src/config.js`: `WHATSAPP_NUMBER = '62812xxxxxxx'` (dummy) + komentar `// GANTI dengan nomor toko sebelum dipakai produksi`.
- `src/wa.js`: `buildWhatsAppLink(product, nomor)` → `https://wa.me/<nomor>?text=<encodeURIComponent(pesan)>`.
- Pesan sesuai `UI-SPEC.md` §9 (nama produk + harga Rupiah).
- Tombol ikon WhatsApp di kartu (label aksesibel), teks penuh "Pesan via WhatsApp" di tempat yang tersedia, `target="_blank"`, `rel="noopener noreferrer"`.
- Catatan kecil di footer: nomor masih contoh.

### File yang Disentuh
| File | Aksi |
|---|---|
| `src/config.js` | ubah (nomor + komentar) |
| `src/wa.js` | buat |
| `src/ui/productCard.js` | ubah (tombol WA) |
| `src/views/catalog.js` | ubah (footer catatan) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T4-01 | Klik tombol WA pada "Pupuk NPK Padi 1 kg" | Tab baru ke `wa.me`, teks memuat nama & `Rp 45.000` |
| T4-02 | Klik WA pada "Bibit Cabai Rawit (polybag)" | `text=` ter-*encode*: spasi `%20`, kurung aman, tidak ada karakter rusak |
| T4-03 | Periksa `href` di DOM | Nomor sama untuk semua kartu; hanya satu definisi nomor di `src/config.js` |
| T4-04 | Cek tautan | `target="_blank"` dan `rel` memuat `noopener` |
| T4-05 | Periksa elemen tombol | Mempunyai `aria-label` yang menyebut nama produk |
| T4-06 | Klik tombol WA dengan keyboard (Enter) | Berperilaku sama seperti klik mouse |
| T4-07 | Cari nomor asli/rekayasa di repo | Tidak ada nomor nyata, tidak ada API key |

**Rujukan:** SPEC AC-17…AC-19 · UI-10 (label aksesibel).

### Perintah Uji
```bash
grep -rn "wa.me" src/
grep -rn "WHATSAPP_NUMBER" src/
node -e "const p=require('fs').readFileSync('src/wa.js','utf8'); console.log(p.includes('encodeURIComponent'))"
npm run dev   # klik manual T4-01..T4-06
```

### Gerbang
Semua tautan `wa.me` valid dan tidak ada nomor duplikat di file lain.

---

## M5 — Dashboard CRUD

**Tujuan:** pengelola dapat menambah, mengubah, menghapus, dan mereset produk; ringkasan selalu akurat.

### Deliverables
- Navigasi V1 ⇄ V5 tanpa router; judul dokumen & fokus `<h1>` berubah.
- `views/dashboard.js`: 3 kartu ringkasan (total produk, total stok, jumlah kategori) + tabel desktop / kartu mobile.
- Form tambah/ubah (modal desktop, sheet mobile) dengan validasi per field.
- `validation.js`: `validateProduct(input)` → `{ valid, errors }`, aturan `SPEC.md` F-10 (`Number.isInteger`, ≥ 0, panjang teks).
- Konfirmasi hapus & reset data contoh (`modal.js`, fokus awal "Batal").
- Hapus/kosongkan: data di memori + render ulang; persistensi menyusul di M6 (sementara memakai `saveProducts` sederhana agar tidak regresi setelah refresh).
- `toast.js` untuk "Produk berhasil disimpan" / "Produk dihapus" / "Data contoh dipulihkan".

### File yang Disentuh
| File | Aksi |
|---|---|
| `src/views/dashboard.js` | buat |
| `src/validation.js` | buat |
| `src/ui/modal.js`, `src/ui/toast.js` | buat |
| `src/state.js` | ubah (mutasi produk) |
| `src/main.js` | ubah (navigasi tampilan) |
| `src/styles/components.css` | ubah (tabel, form, modal, toast) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T5-01 | Buka Dashboard | Ringkasan **8 / 179 / 4** |
| T5-02 | Tambah "Pupuk Uji Coba", Pupuk, 30000, stok 5, deskripsi 15+ | Muncul di dashboard **dan** katalog; ringkasan 9 / 184 / 4 |
| T5-03 | Refresh | Produk masih ada |
| T5-04 | Ubah harga 35000, stok 7 | Tampil `Rp 35.000`; ringkasan stok 186 |
| T5-05 | Hapus → Batal | Produk tetap ada |
| T5-06 | Hapus → setujui | Hilang dari keduanya; ringkasan 8 / 179 / 4 |
| T5-07 | Submit nama kosong, harga `-5`, stok `1.5` | Tidak tersimpan; 3 pesan galat inline Bahasa Indonesia; fokus ke field pertama |
| T5-08 | Tambah kategori "Alat Kebun" | Kategori jadi 5 dan muncul di chip filter katalog |
| T5-09 | Reset data contoh → setujui | Kembali 8 produk, ringkasan 8 / 179 / 4 |
| T5-10 | Tambah produk tanpa `imageUrl` | Placeholder bawaan tampil rapi |
| T5-11 | Buka form di 360 px | Sheet 92vh, footer aksi lengket, semua field dapat dijangkau |
| T5-12 | Tab/Shift+Tab di modal | Fokus terperangkap; Esc = Batal; fokus kembali ke pemicu |
| T5-13 | Hapus produk yang sedang difilter | Empty state tampil wajar, tanpa error |
| T5-14 | Harga `45000` lalu ubah ke `45.000` | Input menolak/menormalisasi; tidak tersimpan sebagai `NaN` |

**Rujukan:** SPEC AC-20…AC-29 · UI-05, UI-17…UI-20.

### Perintah Uji
```bash
npm run dev
# manual: T5-01..T5-14
grep -rn "innerHTML" src/views src/ui     # target: 0 hasil untuk data pengguna
npm run build
```

### Gerbang
T5-01…T5-14 lolos; ringkasan tidak pernah menyimpang dari data (uji dengan menambah 3 produk berturut-turut).

---

## M6 — localStorage & Import/Export JSON

**Tujuan:** data bertahan antar sesi, tahan terhadap data rusak, dan dapat dipindahkan antar perangkat.

> **Catatan lingkup:** import/export JSON **tidak ada** di `SPEC.md` (bahkan "sinkronisasi" out-of-scope). Milestone ini menambahkannya sebagai fitur lokal (tanpa backend). Perlu amendemen `SPEC.md` v1.1 agar kriteria penerimaan resmi mencakupnya. Format file adalah kontrak data, bukan API.

### Deliverables
- `storage.js`:
  - `loadProducts()` — `try/catch` parse, validasi tiap objek, fallback 8 produk contoh, tulis ulang bila rusak/kosong.
  - `saveProducts(products)` — satu kunci `padisehat.products.v1`.
  - `exportProducts()` — unduh `padisehat-produk-YYYYMMDD.json`.
  - `importProducts(file)` — baca `File.text()`, batas **1 MB**, `JSON.parse` dalam `try/catch`, validasi & normalisasi whitelist field, buang entri tidak valid (hitung jumlah), buat `id` baru bila duplikat/absen, tolak array kosong.
  - Format ekspor: `{ app: "padisehat", version: 1, exportedAt: ISO, products: Product[] }`.
- Tombol dashboard: "Ekspor JSON", "Impor JSON" (input `type="file" accept="application/json"`), konfirmasi sebelum menimpa data.
- Pesan hasil impor via toast: "12 produk diimpor, 2 entri dilewati".
- Catatan privasi di dashboard: "Data disimpan di perangkat ini".

### File yang Disentuh
| File | Aksi |
|---|---|
| `src/storage.js` | buat / ubah |
| `src/views/dashboard.js` | ubah (tombol ekspor/impor + handler) |
| `src/validation.js` | ubah (`sanitizeProduct` untuk impor) |
| `src/ui/modal.js` | ubah (dialog konfirmasi impor) |
| `src/styles/components.css` | ubah (grup aksi data) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T6-01 | Tambah 1 produk → refresh | Produk tetap ada; kunci `padisehat.products.v1` berisi 9 objek |
| T6-02 | Set kunci menjadi `bukan-json` → refresh | 8 produk contoh dimuat, aplikasi tidak blank, tidak ada error fatal |
| T6-03 | Set kunci menjadi `[]` → refresh | 8 produk contoh dimuat (dianggap kosong) |
| T6-04 | Set satu objek tanpa `harga` → refresh | Entri itu dibuang; produk lain tetap; tidak ada `NaN` di UI |
| T6-05 | Klik "Ekspor JSON" | File `padisehat-produk-YYYYMMDD.json` terunduh; isi punya `app`, `version`, `exportedAt`, `products`; jumlah = jumlah produk |
| T6-06 | Buka file ekspor di editor | Tidak ada field di luar 8 field model; tidak ada data pribadi |
| T6-07 | Impor file hasil T6-05 | Konfirmasi muncul; setelah setuju data sama, ringkasan sama |
| T6-08 | Impor file `{ "foo": 1 }` | Ditolak dengan pesan jelas; data lama utuh |
| T6-09 | Impor file berisi `products: []` | Ditolak: "File tidak berisi produk" |
| T6-10 | Impor file dengan 2 entri rusak dari 10 | 8 diimpor, 2 dilewati, toast menyebut jumlah; ringkasan sesuai |
| T6-11 | Impor file > 1 MB | Ditolak sebelum parse, pesan ukuran; tidak ada freeze |
| T6-12 | Impor produk dengan `__proto__` / `constructor` di objek | Field diabaikan; tidak ada polusi prototipe; produk lain normal |
| T6-13 | Impor 2 produk ber-`id` sama | `id` baru dibuat; tidak ada duplikat di katalog |
| T6-14 | Batal pada konfirmasi impor | Tidak ada perubahan data |
| T6-15 | Matikan jaringan → tambah/ubah/hapus → refresh | Semua berfungsi |
| T6-16 | Periksa Application → Local Storage | Hanya kunci `padisehat.products.v1` (belum ada kunci lain) |

**Rujukan:** SPEC AC-22, AC-30, AC-33 · NFR-06, R-01, R-02.

### Perintah Uji
```bash
npm run dev
# manual: T6-01..T6-16
node -e "JSON.parse(require('fs').readFileSync('padisehat-produk-20261116.json','utf8'))"   # bila ada file ekspor
npm run build
```

### Gerbang
T6-01…T6-16 lolos; tidak ada jalur yang membuat aplikasi blank akibat data tersimpan.

---

## M7 — Vitest

**Tujuan:** logika murni terlindungi regresi tanpa menguji DOM secara berlebihan.

### Deliverables
- `vitest.config.js` (environment `jsdom` atau `happy-dom` untuk `localStorage`).
- `tests/setup.js`: pembersihan `localStorage` dan `vi.restoreAllMocks()` per test.
- Uji minimal (target **≥ 25 test case**):
  | File | Cakupan |
  |---|---|
  | `format.test.js` | `0 → "Rp 0"`, `45000 → "Rp 45.000"`, `1250000 → "Rp 1.250.000"`, nilai bukan angka |
  | `filters.test.js` | pencarian case-insensitive, trim, multi-field; filter kategori; 5 sorting; akumulasi; stabilitas urutan; daftar kategori unik A–Z |
  | `validation.test.js` | batas nama 3/60, harga `-1`/`1.5`/`"abc"`/`0`, stok `-1`/`1.5`, deskripsi 9/10/300/301, field wajib |
  | `wa.test.js` | nomor benar, `%20` pada spasi, nama berkurung aman, harga ikut, nomor kosong → galat/fallback |
  | `storage.test.js` | fallback saat kosong/rusak, buang entri invalid, `save` menulis 1 kunci, `import` menolak non-array/kosong/>1MB, sanitasi `__proto__`, regenerasi `id` duplikat, round-trip ekspor→impor |
- `package.json`: skrip `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`.

### File yang Disentuh
| File | Aksi |
|---|---|
| `vitest.config.js` | buat |
| `tests/setup.js` + 5 file uji | buat |
| `package.json` | ubah (skrip + devDependency) |
| `src/*` | ubah hanya bila menemukan bug nyata (bukan menyesuaikan test) |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T7-01 | `npm test` | Semua test lulus; exit code 0 |
| T7-02 | Jumlah test | ≥ 25 kasus, tersebar di 5 file |
| T7-03 | Hapus sementara satu aturan validasi (mis. cek `Number.isInteger`) | Minimal 1 test **gagal** (bukti test tidak kosong); kembalikan kode |
| T7-04 | Jalankan test tanpa jaringan | Tetap lulus (tidak ada permintaan jaringan) |
| T7-05 | Periksa output test | Tidak ada `console.log`/warning tak tertangani |
| T7-06 | `npx vitest run --coverage` | `src/format.js`, `filters.js`, `wa.js`, `validation.js`, `storage.js` tercakup; catat persentase sebagai informasi (bukan target lulus/gagal) |
| T7-07 | `npm run build` setelah M7 | Tetap sukses; test tidak masuk bundle produksi |

**Rujukan:** NFR-10 · `SPEC.md` §8 (unit test sebelumnya out-of-scope → perlu amendemen).

### Perintah Uji
```bash
npm test
npx vitest run --coverage
npm run build
```

### Gerbang
T7-01…T7-07 lolos. Test yang gagal **tidak boleh** dihapus/dilonggarkan; perbaiki kode.

---

## M8 — Security Review

**Tujuan:** tidak ada rahasia, tidak ada jalur XSS, tidak ada dependensi berisiko, batasan lisensi & privasi terjaga.

### Deliverables
- Catatan hasil review di `SECURITY.md` (temuan, tingkat, tindakan, status).
- Perbaikan kode untuk setiap temuan **Tinggi/Sedang**.
- `README.md`: bagian "Keamanan & Batasan" (tanpa backend, tanpa rahasia, data lokal, nomor WA dummy).

### File yang Disentuh
| File | Aksi |
|---|---|
| `SECURITY.md` | buat |
| `README.md` | ubah |
| `src/**` | ubah sesuai temuan |
| `package.json` | ubah bila perlu pembaruan dependensi |

### Daftar Periksa Review
| # | Area | Cara memeriksa | Kriteria lolos |
|---|---|---|---|
| S-01 | Rahasia | `grep -rniE "api[_-]?key|secret|password|token|bearer"` di luar `node_modules` | Tidak ada nilai rahasia; hanya nama variabel/kata biasa |
| S-02 | File env | `ls -a`, `cat .gitignore` | Tidak ada `.env` berisi kredensial; `.env*` di-*ignore* |
| S-03 | Riwayat git | `git log --all -p \| grep -niE "api[_-]?key\|secret"` (opsional, bisa berat) | Tidak ada rahasia ter-*commit* |
| S-04 | XSS | `grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML" src/` | 0 penggunaan untuk data pengguna; semua nilai via `textContent` |
| S-05 | Injeksi kode | `grep -rn "eval(\|new Function\|document.write" src/` | 0 hasil |
| S-06 | Tautan eksternal | `grep -rn "wa.me" src/` | `target="_blank"` + `rel="noopener noreferrer"` |
| S-07 | Dependensi | `npm audit --audit-level=moderate` | 0 kerentanan tinggi/kritis; bila ada, catat & perbarui |
| S-08 | Impor JSON | Uji file > 1 MB, non-array, `__proto__`, 10.000 entri | Ditolak/dibatasi; UI tidak freeze; tidak ada polusi prototipe |
| S-09 | Penyimpanan | Baca isi `localStorage` | Hanya produk; tanpa data pribadi; ukuran wajar |
| S-10 | Lisensi aset | Tinjau `public/img` | Semua buatan sendiri; tidak ada hotlink atau merek pihak ketiga |
| S-11 | Data contoh | Baca `sampleProducts.js` | Tanpa nama orang, telepon, alamat, email nyata |
| S-12 | Nomor WA | `grep -rn "WHATSAPP" src/` | Dummy, satu konstanta, berkomentar "GANTI" |
| S-13 | Build bersih | `npm run build`, cek `dist/` | Tidak ada file rahasia/test masuk `dist/` |
| S-14 | Konsol | Jalankan seluruh alur | Tidak ada error; tidak ada log berisi data sensitif |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T8-01 | Semua S-01…S-14 dijalankan | Setiap baris punya status di `SECURITY.md` |
| T8-02 | Temuan Tinggi/Sedang | 0 tersisa; yang tersisa hanya Rendah/Info dengan alasan |
| T8-03 | Uji XSS manual: produk bernama `<img src=x onerror=alert(1)>` | Tampil sebagai teks biasa, tidak ada `alert` |
| T8-04 | `npm audit` | Tidak ada high/critical |
| T8-05 | `SECURITY.md` | Memuat tanggal, versi commit, dan daftar periksa |
| T8-06 | `README` | Menjelaskan tidak ada backend, tidak ada rahasia, data lokal |

**Rujukan:** SPEC AC-34, AC-35 · NFR-02, NFR-07, NFR-08, NFR-09 · R-09.

### Perintah Uji
```bash
grep -rniE "api[_-]?key|secret|password|token|bearer" --exclude-dir=node_modules --exclude=package-lock.json .
grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML" src/
grep -rn "eval(\|new Function\|document.write" src/
grep -rn "target=\"_blank\"" src/
npm audit --audit-level=moderate
npm run build && ls dist
```

### Gerbang
T8-01…T8-06 lolos. **Jangan** menambahkan `eslint-disable`, `@ts-ignore`, atau penghapusan test untuk meloloskan review.

---

## M9 — Deployment

**Tujuan:** build produksi dapat diakses lewat HTTPS, berfungsi identik dengan lokal, tanpa rahasia.

> **Gerbang persetujuan:** pemilihan penyedia hosting dan publikasi ke internet adalah tindakan eksternal. Jangan memilih penyedia, membuat akun, atau mem-*publish* tanpa persetujuan eksplisit pengguna. Milestone ini boleh berhenti di tahap "siap deploy" (`dist/` + verifikasi `preview`).
> **Kriteria penyedia (netral):** hosting statis, dukungan SPA fallback ke `index.html`, HTTPS otomatis, deploy dari `dist/` (atau build `npm run build`), tanpa variabel lingkungan/rahasia, tanpa fungsi server.

### Deliverables
- Konfigurasi build produksi (base path jika di-*host* di subpath).
- Berkas `dist/` siap unggah; konfigurasi SPA fallback bila penyedia meminta.
- `README.md`: bagian "Menjalankan & Build" + "Deploy" (langkah generik, tanpa kredensial).
- Catatan rilis: versi, tanggal, hasil uji produksi.

### File yang Disentuh
| File | Aksi |
|---|---|
| `vite.config.js` | ubah bila perlu (`base`) |
| `README.md` | ubah |
| `public/` | cek aset ikut ter-*bundle* |
| `SECURITY.md` | tambah catatan review pra-rilis |

### Acceptance Criteria
| ID | Langkah | Hasil |
|---|---|---|
| T9-01 | `npm run build` | Sukses; `dist/index.html` + aset ada |
| T9-02 | `npm run preview -- --port 4173` | Aplikasi berfungsi penuh di `http://localhost:4173` |
| T9-03 | Cek Network di preview | Tidak ada permintaan eksternal; font & gambar dari aset build |
| T9-04 | Jalankan AC inti di preview | AC-01, AC-07, AC-13, AC-17, AC-21, AC-30 lolos di build produksi |
| T9-05 | Cek `dist/` | Tidak ada `*.test.js`, `tests/`, `.env`, `source map` berisi kode sumber (bila tidak diinginkan) |
| T9-06 | Buka URL produksi (bila disetujui) | Halaman utama 200, HTTPS aktif, tidak ada error konsol |
| T9-07 | Refresh pada URL dalam (setelah navigasi tampilan) | Tetap memuat aplikasi (SPA fallback berfungsi) |
| T9-08 | Cek header/aset | Semua aset 200; tidak ada 404 font/SVG |
| T9-09 | `git status` | `dist/` tidak ter-*commit*; tidak ada kredensial di repo |
| T9-10 | Catatan rilis | Memuat URL, commit hash, tanggal, dan hasil T9-04 |

**Rujukan:** NFR-01, NFR-02, NFR-12 · `SPEC.md` §8 (deployment tidak termasuk MVP lokal).

### Perintah Uji
```bash
npm run build
npm run preview -- --port 4173
# buka http://localhost:4173, jalankan T9-03, T9-04
ls -R dist | head -40
grep -rn "localhost" dist/assets/*.js | head
```

### Gerbang
T9-01…T9-10 lolos (T9-06 hanya bila publikasi disetujui). Bila pengguna belum menyetujui hosting, selesaikan milestone dengan status **"siap deploy, belum dipublikasikan"**.

---

## Ringkasan Pelacakan

| M | Milestone | AC ID | Uji utama | Status |
|---|---|---|---|---|
| M1 | Scaffold Vite | T1-01…T1-08 | `npm ci`, `npm run dev`, `npm run build` | ☐ |
| M2 | Landing & 8 produk | T2-01…T2-11 | `npm run dev`, `ls public/img` | ☐ |
| M3 | Pencarian/filter/sorting | T3-01…T3-14 | `npm run dev` (manual) | ☐ |
| M4 | WhatsApp | T4-01…T4-07 | `grep`, klik manual | ☐ |
| M5 | Dashboard CRUD | T5-01…T5-14 | `npm run dev`, `grep innerHTML` | ☐ |
| M6 | localStorage + import/export | T6-01…T6-16 | `npm run dev`, cek Application | ☐ |
| M7 | Vitest | T7-01…T7-07 | `npm test`, `--coverage` | ☐ |
| M8 | Security review | T8-01…T8-06 | `grep`, `npm audit` | ☐ |
| M9 | Deployment | T9-01…T9-10 | `npm run build`, `npm run preview` | ☐ |

### Definition of Done Keseluruhan
- [ ] M1–M8 selesai dan semua AC-nya lolos (M9 selesai sebagai "siap deploy" bila publikasi belum disetujui).
- [ ] `npm test` lulus dengan ≥ 25 kasus; `npm run build` sukses.
- [ ] Seluruh AC-01…AC-36 `SPEC.md` diperiksa manual dan dicatat hasilnya.
- [ ] `SECURITY.md` tidak menyisakan temuan Tinggi/Sedang.
- [ ] `README.md` memuat cara jalan, cara ganti nomor WhatsApp, catatan localStorage, dan langkah deploy.
- [ ] Tidak ada rahasia, aset berhak cipta, atau data pribadi di repo.
- [ ] `SPEC.md` diamendemen ke v1.1 bila M6 (import/export), M7 (Vitest), dan M9 (deployment) diterima sebagai bagian lingkup.
