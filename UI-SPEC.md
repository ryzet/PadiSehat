# UI-SPEC — PADISEHAT

**Spesifikasi Antarmuka Aplikasi E-Commerce Kebutuhan Pertanian**

| Item | Keterangan |
|---|---|
| Versi dokumen | 1.0 |
| Tanggal | 16 November 2026 |
| Dokumen induk | `SPEC.md` v1.0 |
| Platform | Web (mobile-first, responsif) |
| Tech stack | Vite + JavaScript vanilla + CSS biasa |
| Bahasa UI | Bahasa Indonesia |
| Status | Siap dipakai untuk implementasi (dokumen desain, bukan kode) |

**Cara membaca dokumen ini:** Bagian 3–7 adalah kontrak visual (token, komponen, wireframe). Bagian 8–10 adalah kontrak perilaku. Bagian 12 adalah daftar periksa yang harus lolos sebelum UI dianggap selesai. Angka kontras dihitung dari nilai hex pada tabel dan bersifat perkiraan ±0,1.

---

## 1. Ringkasan & Prinsip Desain

PADISEHAT adalah etalase digital sekaligus alat kerja toko pertanian. Desain harus terasa seperti **papan nama toko yang rapi**: hangat, membumi, dan dapat dipercaya — bukan seperti dashboard SaaS.

### 1.1 Karakter Visual
| Kata kunci | Wujud konkret |
|---|---|
| **Natural** | Palet hijau daun + krem, sudut membulat, bayangan lembut, ruang napas lega |
| **Modern** | Tipografi grotesque tebal untuk judul, kartu bersih, grid teratur, tanpa ornamen berlebih |
| **Profesional** | Hierarki jelas, harga mudah dipindai, status stok eksplisit, tidak ada elemen main-main di area transaksi |

### 1.2 Prinsip yang Mengikat Keputusan
1. **Mobile-first, bukan mobile-only.** Tata letak dirancang untuk 360 px lebih dulu; desktop adalah penambahan kolom, bukan desain terpisah.
2. **Harga dan stok adalah raja.** Keduanya selalu terlihat tanpa perlu membuka detail, ukurannya cukup besar untuk dipindai sekali lirik.
3. **Satu aksi utama per layar.** Katalog → "Tambah ke keranjang". Detail → "Tambah ke keranjang". Keranjang → "Checkout". Dashboard → "Tambah Produk".
4. **Jujur soal status demo.** Semua hal yang tidak nyata (checkout, nomor WhatsApp, ringkasan penjualan) diberi label "demo" atau catatan kecil, tanpa menipu pengguna.
5. **Kontras dulu, estetika kemudian.** Tidak ada teks abu-abu pucat di atas krem, tidak ada tombol putih di atas hijau terang.
6. **Emoji hanya sebagai dekorasi.** Tidak pernah menjadi satu-satunya pembawa makna, selalu `aria-hidden`.

### 1.3 Proporsi Warna (aturan 60-30-10)
- **60%** krem / putih → latar halaman dan permukaan kartu.
- **30%** hijau tua / hijau daun → navbar, footer, judul, tombol utama, badge.
- **10%** aksen (hijau muda, kuning peringatan, merah galat) → penanda status.

---

## 2. Rekonsiliasi dengan SPEC.md

Permintaan UI ini memuat empat hal yang pada `SPEC.md` v1.0 masih tercatat **out-of-scope**: halaman detail produk, keranjang, checkout, dan ringkasan penjualan. Agar tidak terjadi kontradiksi, dokumen ini membaginya menjadi dua lapis.

### 2.1 Lapis A — MVP SPEC (wajib untuk latihan 1 hari)
| Fitur UI | Rujukan SPEC |
|---|---|
| Navbar sticky + hero | tidak ada di SPEC (tambahan presentasi, non-fungsional) |
| Grid katalog + kartu produk | F-01, F-02, F-12 |
| Pencarian, filter kategori, sorting | F-04, F-05, F-06 |
| Tombol WhatsApp | F-07 |
| Ringkasan produk/stok/kategori | F-08 |
| Dashboard CRUD + formulir + konfirmasi | F-09, F-10, F-11 |
| Empty state | F-01, F-05 |

### 2.2 Lapis B — Ekstensi E-Commerce (butuh amendemen SPEC v1.1)
| Fitur UI | Dampak teknis | Status |
|---|---|---|
| Halaman detail produk | Tampilan baru (bukan rute terpisah), tidak mengubah model produk | Disarankan masuk SPEC |
| Keranjang belanja demo | State baru + kunci `padisehat.cart.v1` | Butuh amendemen |
| Checkout demo | Kunci baru `padisehat.orders.v1`, pengurangan stok | Butuh amendemen |
| Ringkasan penjualan | Turunan dari `orders` | Butuh amendemen |
| Tombol "Tambah ke keranjang" di kartu | Tombol WhatsApp tetap ada (ikon sekunder) | Butuh amendemen |

**Aturan pelaksanaan:** Lapis A dikerjakan lebih dulu dan harus lolos AC-01…AC-36 di `SPEC.md`. Lapis B dikerjakan setelahnya; bila waktu latihan habis, Lapis B boleh ditinggalkan tanpa merusak Lapis A. UI Lapis B tidak boleh menyembunyikan tombol WhatsApp (F-07 tetap wajib).

**Batasan yang tetap berlaku untuk Lapis B:** tanpa backend, tanpa login, tanpa pembayaran nyata, tanpa data pribadi (checkout demo tidak meminta nama/telepon/alamat), tanpa API key, tanpa aset berhak cipta.

---

## 3. Design Tokens

### 3.1 Palet Warna

| Token | Hex | Peran | Rasio kontras |
|---|---|---|---|
| `--hijau-daun` | `#2F6B3A` | Aksi utama, tautan, ikon aktif | 6,4:1 vs putih · 5,8:1 vs krem |
| `--hijau-daun-hover` | `#275A31` | Hover/pressed tombol utama | 7,9:1 vs putih |
| `--hijau-tua` | `#1B3B24` | Navbar, judul, teks utama, footer | 12,4:1 vs putih · 11,2:1 vs krem |
| `--hijau-lembut` | `#E4EFD9` | Latar badge, chip aktif, blok sorotan | teks `--hijau-tua` di atasnya 10,6:1 |
| `--krem` | `#F7F3E8` | Latar halaman | — |
| `--krem-tua` | `#EDE6D2` | Latar sekunder, garis pemisah lembut, skeleton | — |
| `--putih` | `#FFFFFF` | Permukaan kartu, modal | — |
| `--teks-sekunder` | `#4A5B4F` | Deskripsi, meta, label | 7,2:1 vs putih · 6,5:1 vs krem |
| `--garis` | `#DDD4BE` | Garis dekoratif, divider | non-teks |
| `--garis-input` | `#7D8B7F` | Border input/select (batas komponen) | 3,6:1 vs putih (memenuhi 3:1) |
| `--galat` | `#B3261E` | Pesan galat, "Stok habis" | 6,5:1 vs putih · 5,9:1 vs krem |
| `--galat-lembut` | `#FBE9E7` | Latar pesan galat | teks `--galat` di atasnya 5,8:1 |
| `--peringatan` | `#8A5A00` | Stok menipis | 5,7:1 vs putih |
| `--peringatan-lembut` | `#FFF4D6` | Latar peringatan stok | teks `--peringatan` di atasnya 5,1:1 |
| `--fokus` | `#2F6B3A` | Cincin fokus 2 px, offset 2 px | 6,4:1 vs putih |

**Aturan pemakaian warna**
- Teks normal hanya boleh memakai `--hijau-tua`, `--teks-sekunder`, `--galat`, `--peringatan`, atau putih di atas `--hijau-daun`/`--hijau-tua`.
- **Dilarang** menaruh teks putih di atas hijau terang (mis. `#25D366` WhatsApp) — kontrasnya di bawah 2:1. Tombol WhatsApp memakai `--hijau-daun` dengan ikon putih, bukan warna merek.
- Hijau hanya untuk aksi, bukan untuk seluruh permukaan; latar utama tetap krem/putih.

### 3.2 Tipografi

**Keluarga font**
- Judul: **Bricolage Grotesque** (variable, bobot 400–800) — H1, H2, H3, harga, angka ringkasan, nama produk.
- Teks: **Plus Jakarta Sans** (variable, bobot 400–700) — paragraf, label, tombol, input, tabel.
- Fallback: `ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`.

**Catatan implementasi (penting):** font **di-*self-host*** lewat paket npm (`@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/plus-jakarta-sans`) — **bukan** `<link>` ke Google Fonts. Alasannya: SPEC NFR-02/AC-06 melarang permintaan ke domain eksternal dan aplikasi harus tetap berjalan tanpa jaringan (NFR-03). `<link>` eksternal akan menggagalkan AC-06.

**Skala tipe (mobile → desktop)**

| Token | Font | Bobot | Mobile | Desktop | Line-height | Pemakaian |
|---|---|---|---|---|---|---|
| `display` | Bricolage | 700 | 32 px | 52 px | 1,1 | Judul hero |
| `h1` | Bricolage | 700 | 26 px | 34 px | 1,2 | Judul halaman (Katalog, Keranjang, Dashboard) |
| `h2` | Bricolage | 700 | 20 px | 26 px | 1,25 | Judul seksi ("Semua Produk", "Ringkasan") |
| `h3` | Bricolage | 600 | 16 px | 18 px | 1,35 | Nama produk di kartu, judul kartu ringkasan |
| `body` | Jakarta | 400 | 15 px | 16 px | 1,6 | Paragraf, deskripsi produk |
| `body-strong` | Jakarta | 600 | 15 px | 16 px | 1,6 | Label field, teks penting |
| `small` | Jakarta | 400 | 13 px | 14 px | 1,5 | Meta, kategori, catatan |
| `harga` | Bricolage | 700 | 18 px | 20 px | 1,2 | Harga di kartu (tabular-nums) |
| `harga-besar` | Bricolage | 700 | 26 px | 32 px | 1,1 | Harga di detail & total keranjang |
| `angka` | Bricolage | 700 | 28 px | 36 px | 1 | Angka kartu ringkasan (tabular-nums) |
| `tombol` | Jakarta | 700 | 14 px | 15 px | 1 | Semua tombol, letter-spacing 0.01em |

Aturan: maksimal 72 karakter per baris teks paragraf; `text-wrap: balance` untuk judul; `font-variant-numeric: tabular-nums` untuk semua harga dan angka ringkasan agar kolom tidak bergoyang.

### 3.3 Spasi, Radius, Elevasi

| Token | Nilai | Pemakaian |
|---|---|---|
| `space-1` … `space-12` | 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120 px | Skala tunggal, tanpa nilai di luar daftar |
| `radius-sm` | 8 px | Input, chip, badge |
| `radius-md` | 12 px | Tombol, kartu kecil |
| `radius-lg` | 16 px | Kartu produk, panel |
| `radius-xl` | 24 px | Hero, modal, bottom sheet |
| `radius-pill` | 999 px | Badge, chip filter, avatar huruf |
| `border` | 1 px `--garis` | Kartu, divider |
| `shadow-sm` | `0 1px 2px rgba(27,59,36,.06)` | Kartu diam |
| `shadow-md` | `0 6px 18px rgba(27,59,36,.08)` | Kartu hover, dropdown |
| `shadow-lg` | `0 18px 48px rgba(27,59,36,.16)` | Modal, bottom sheet, navbar saat scroll |

Jarak vertikal antar seksi: 40 px mobile, 64 px desktop. Padding dalam kartu: 16 px mobile, 20 px desktop.

### 3.4 Grid, Container, Breakpoint

| Breakpoint | Lebar | Container padding | Kolom grid produk | Navbar |
|---|---|---|---|---|
| `xs` (dasar) | 0–479 px | 16 px | 1 kolom | 64 px, menu ikon |
| `sm` | 480–767 px | 20 px | 2 kolom | 64 px |
| `md` | 768–1023 px | 24 px | 3 kolom | 72 px, menu teks |
| `lg` | 1024–1279 px | 32 px | 4 kolom | 72 px |
| `xl` | ≥1280 px | auto, max 1200 px | 4 kolom | 72 px |

- Lebar maksimum konten: **1200 px**, dipusatkan.
- `gap` grid produk: 12 px (xs–sm), 20 px (md), 24 px (lg+).
- Rasio gambar kartu: **4:3**, `object-fit: cover`, radius atas mengikuti kartu.
- Tidak boleh ada scroll horizontal pada lebar 320–1440 px.

### 3.5 Ikon, Ilustrasi, Placeholder

- **Ikon:** SVG inline, gaya *outline*, tebal 1,75 px, ukuran 20 px (dalam tombol) / 24 px (navbar). Set ikon minimal: cari, filter, keranjang, tambah, ubah, hapus, panah kiri, tutup, centang, WhatsApp, panah naik/turun.
- **Hero:** kolase emoji pertanian 🌾 🌱 🧑‍🌾 🚜 🌻 🍅 di dalam blok `--hijau-lembut` beradius `radius-xl`, selalu `aria-hidden="true"`, disertai satu kalimat nyata sebagai teks. Emoji tidak boleh menjadi satu-satunya isi tombol.
- **Placeholder produk:** SVG lokal 4:3 di `public/img/`, dibuat sendiri, berisi blok warna hijau/krem + siluet sederhana + label kategori. Tidak memakai foto stok atau hotlink. Bila gambar gagal dimuat → kotak `--krem-tua` dengan inisial nama produk (maks 2 huruf) di tengah.
- Semua `alt` gambar produk = nama produk; gambar dekoratif `alt=""`.

---

## 4. Navigasi & Peta Layar

### 4.1 Struktur
Aplikasi satu halaman dengan **lima tampilan** yang dipertukarkan (tanpa router, tanpa URL berbeda):

| ID | Tampilan | Pengguna | Titik masuk | Keluar |
|---|---|---|---|---|
| V1 | **Katalog** (default) | Pembeli | Aplikasi dibuka | Kartu → V2, ikon keranjang → V3, "Dashboard" → V5 |
| V2 | **Detail Produk** | Pembeli | Klik kartu produk | "Kembali" → V1, "Tambah" → V3 |
| V3 | **Keranjang** | Pembeli | Ikon keranjang di navbar | "Lanjut belanja" → V1, "Checkout" → V4 |
| V4 | **Checkout demo** (sheet/modal) | Pembeli | Tombol checkout di V3 | "Selesai" → konfirmasi → V1 |
| V5 | **Dashboard** | Pengelola | Menu navbar | Form tambah/ubah (modal), "Lihat toko" → V1 |

### 4.2 Navbar (sticky, semua tampilan)

```
DESKTOP (72 px)                                        MOBILE (64 px)
┌──────────────────────────────────────────────┐      ┌────────────────────────┐
│ 🌾 PADISEHAT   Katalog  Dashboard    🛒(3)   │      │ 🌾 PADISEHAT    🛒³  ☰ │
└──────────────────────────────────────────────┘      └────────────────────────┘
```

- Posisi `position: sticky; top: 0`; latar `rgba(247,243,232,.92)` + `backdrop-filter: blur(12px)`; border bawah 1 px `--garis`; saat halaman digulir > 8 px tambahkan `shadow-md`.
- Logo: emoji 🌾 + wordmark "PADISEHAT" (Bricolage 700, `--hijau-tua`), dapat diklik → V1.
- Menu desktop: "Katalog", "Dashboard" (teks 15 px, item aktif bergaris bawah 2 px `--hijau-daun`).
- Mobile: menu utama masuk panel geser dari kanan; item minimal 48 px tinggi.
- Tombol keranjang: ikon + badge jumlah (pill `--hijau-daun`, teks putih, `min-width: 20px`). Badge disembunyikan bila jumlah 0. `aria-label="Keranjang, 3 item"`.
- Tinggi navbar ikut `scroll-padding-top` agar judul seksi tidak tertutup.

### 4.3 Footer
Tiga baris di mobile, tiga kolom di desktop: (1) logo + satu kalimat deskripsi; (2) tautan cepat Katalog/Dashboard; (3) catatan "Data produk disimpan di perangkat ini (localStorage)" + "Nomor WhatsApp contoh — ganti sebelum dipakai". Latar `--hijau-tua`, teks putih, padding 32/48 px.

---

## 5. Spesifikasi Komponen

### 5.1 Hero (V1)
- Grid 1 kolom (mobile) / 2 kolom 55:45 (≥768 px).
- Isi: label kecil "KATALOG PERTANIAN" (small, `--hijau-daun`, letter-spacing .12em), `display` "Pupuk & bibit untuk panen yang lebih sehat", paragraf 1–2 baris, dua tombol: **"Lihat Produk"** (primary, menggulir ke grid) dan **"Tanya via WhatsApp"** (sekunder, tautan toko).
- Kolase emoji di kanan; pada mobile tampil di atas teks dengan tinggi maksimum 160 px agar judul tetap terlihat di layar pertama.
- Latar seksi: `--hijau-lembut` dengan lengkung bawah `radius-xl`; tanpa gambar stok.

### 5.2 Toolbar Pencarian, Filter, Sorting
Susunan mobile: pencarian satu baris penuh → baris chip kategori (horizontal scroll, `-webkit-overflow-scrolling: touch`, tanpa scrollbar terlihat) → dropdown "Urutkan" selebar 50%. Desktop: satu baris — pencarian (grow, maks 420 px), chip kategori, dropdown urutkan (rata kanan).

| Elemen | Spesifikasi |
|---|---|
| Input pencarian | Tinggi 48 px, ikon cari di kiri, placeholder "Cari pupuk, benih, atau bibit…"; tombol ✕ muncul bila ada isi (`aria-label="Hapus pencarian"`); hasil berubah saat mengetik, tanpa tombol submit |
| Chip kategori | Pill 36 px, "Semua Kategori" selalu pertama; chip aktif: latar `--hijau-daun`, teks putih; non-aktif: latar putih, border `--garis-input`, teks `--hijau-tua` |
| Dropdown sort | `<select>` native dengan label tersembunyi "Urutkan"; 5 opsi sesuai SPEC F-06; ikon chevron kustom |
| Baris hasil | "Menampilkan **N** dari **M** produk" (small, `--teks-sekunder`), di atas grid |
| Tombol reset | Muncul hanya saat pencarian/filter aktif; teks "Reset filter" |

### 5.3 Kartu Produk

```
┌─────────────────────────────┐
│ [ gambar 4:3 ]     [Unggulan]│  badge menempel pojok kiri-atas gambar
│                             │
├─────────────────────────────┤
│ Pupuk · stok 24             │  meta 13 px
│ Pupuk NPK Padi 1 kg         │  h3, maks 2 baris (line-clamp)
│ Rp 45.000                   │  harga 18–20 px
│ [   + Tambah   ] [💬]       │  primary 40 px + ikon WhatsApp 40x40
└─────────────────────────────┘
```

- Wadah: latar putih, border 1 px `--garis`, radius 16 px, `overflow: hidden`.
- Hover (desktop): `translateY(-2px)` + `shadow-md`, transisi 150 ms; fokus keyboard: cincin `--fokus`.
- Seluruh area nama/gambar dapat diklik → V2, tetapi tombol di dalamnya **tidak** ikut memicu navigasi (`stopPropagation`) dan kartu memakai satu tautan bernama (`aria-label="Lihat detail Pupuk NPK Padi 1 kg"`), bukan beberapa tautan bersarang.
- **Stok:** `> 3` → teks "stok 24"; `1–3` → "stok tersisa 2" warna `--peringatan`; `0` → "Stok habis" warna `--galat`, gambar `opacity .55`, tombol tambah nonaktif dengan label "Stok habis".
- **Badge Unggulan:** pill `--hijau-lembut`, teks `--hijau-tua` 12 px bobot 700, ikon ★.
- Tombol WhatsApp: ikon saja di kartu (label tersembunyi untuk pembaca layar), teks penuh di V2. Selalu `target="_blank"` + `rel="noopener noreferrer"`.
- Nama produk memakai `line-clamp: 2` agar tinggi kartu seragam; harga tidak boleh terpotong.

### 5.4 Tombol

| Varian | Latar | Teks | Border | Pemakaian |
|---|---|---|---|---|
| Primary | `--hijau-daun` | putih | — | Tambah ke keranjang, Checkout, Simpan, Lihat Produk |
| Primary hover | `--hijau-daun-hover` | putih | — | + `shadow-sm` |
| Secondary | putih | `--hijau-tua` | 1 px `--garis-input` | Kembali, Lanjut belanja, Reset filter |
| Ghost | transparan | `--hijau-daun` | — | Tautan dalam teks, "Lihat semua" |
| Danger | `--galat-lembut` | `--galat` | 1 px `--galat` | Hapus produk |
| Icon | putih | `--hijau-tua` | 1 px `--garis` | WhatsApp di kartu, tutup modal |

- Tinggi minimum: **44 px** (mobile) / 40 px (desktop, tetap area klik 44 px).
- Radius `radius-md`; padding horizontal 16–20 px; `tombol` 14–15 px bobot 700.
- Nonaktif: `opacity .5`, `cursor: not-allowed`, tanpa bayangan.
- Loading: label diganti "Menyimpan…" + spinner 16 px, tombol nonaktif, lebar tidak berubah.
- Fokus: `outline: 2px solid var(--fokus); outline-offset: 2px` — **tidak boleh** dihapus tanpa pengganti.

### 5.5 Formulir (Dashboard)

| Elemen | Spesifikasi |
|---|---|
| Label | Selalu tampil di atas field, 15 px bobot 600, tidak memakai placeholder sebagai label |
| Input/textarea/select | Tinggi 48 px, radius 8 px, border 1 px `--garis-input`, latar putih, padding 12 px 14 px |
| Fokus | Border `--hijau-daun` + cincin 3 px `rgba(47,107,58,.18)` |
| Galat | Border `--galat`, ikon ⚠ + pesan 13 px `--galat` tepat di bawah field, `aria-describedby` menunjuk pesan |
| Bantuan | Teks 13 px `--teks-sekunder` (mis. "Angka saja, tanpa titik. Contoh: 45000") |
| Harga | `type="number"`, `inputmode="numeric"`, `min="0"`, `step="1"`, awalan "Rp" di dalam field |
| Stok | `type="number"`, `min="0"`, `step="1"` |
| Unggulan | Checkbox 20 px + label "Tampilkan sebagai produk unggulan" + teks bantu 13 px |
| Tata letak | 1 kolom mobile; 2 kolom desktop untuk Harga/Stok, field lain selebar form |
| Aksi | Footer melekat: "Batal" (secondary) + "Simpan Produk" (primary); di mobile menempel di bawah sheet |

Validasi mengikuti tabel F-10 SPEC; pesan kesalahan muncul setelah field ditinggalkan (blur) dan setelah submit, tidak saat mengetik karakter pertama. Saat submit gagal, fokus berpindah ke field bermasalah pertama dan sheet menggulir ke sana.

### 5.6 Panel Ringkasan Dashboard

Empat kartu (3 wajib SPEC + 1 ekstensi):

| Kartu | Nilai | Ikon | Warna angka |
|---|---|---|---|
| Total Produk | jumlah baris | 📦 | `--hijau-tua` |
| Total Stok | Σ stok | 🌱 | `--hijau-tua` |
| Kategori | jumlah unik | 🏷️ | `--hijau-tua` |
| Stok Menipis *(ekstensi)* | jumlah produk stok 1–3 + habis | ⚠️ | `--peringatan` bila > 0 |

Kartu: putih, radius 16 px, padding 16–20 px, label `small` di atas, angka `angka` di bawah, ikon dalam lingkaran `--hijau-lembut` 40 px. Mobile: grid 2×2, gap 12 px. Desktop: 4 kolom.

**Ringkasan Penjualan (Lapis B):** kartu terpisah "Penjualan Demo" berisi Total Pesanan, Total Pendapatan, Produk Terjual — dengan badge kecil "demo" dan catatan "Dihitung dari checkout demo di perangkat ini". Bila belum ada pesanan: tampilkan 0 dan teks "Belum ada pesanan demo".

### 5.7 Tabel/Daftar Produk (Dashboard)
- Desktop (≥768 px): tabel dengan kolom Produk (gambar kecil 40×30 + nama), Kategori, Harga, Stok, Unggulan, Aksi. Header `small` bobot 700, baris 56 px, garis pemisah `--garis`, hover baris `--krem`.
- Mobile: daftar kartu — baris 1 nama + badge unggulan, baris 2 "Pupuk · Rp 45.000 · stok 24", baris 3 dua tombol teks "Ubah" / "Hapus".
- Aksi memakai tombol ikon + label (bukan ikon telanjang), `aria-label` menyebut nama produk.
- Urutan default: sama dengan katalog (Unggulan & Nama A–Z).

### 5.8 Keranjang & Item
- Baris item: gambar 64×48, nama (maks 2 baris), kategori, harga satuan, stepper jumlah, subtotal, tombol hapus (ikon tempat sampah + `aria-label`).
- Stepper: `− [2] +`, tombol 36 px (area klik 44 px), angka `tabular-nums`, `aria-live="polite"` pada subtotal. Batas: minimum 1 (tombol − nonaktif), maksimum = stok produk; bila mencapai stok, tombol + nonaktif dan tampil "Maks. stok".
- Bila stok produk berubah menjadi 0 saat di keranjang: tandai baris "Stok habis — hapus untuk lanjut" dan nonaktifkan checkout sampai dihapus.
- Desktop: 2 kolom — daftar item (2fr) + panel ringkasan lengket (1fr, `position: sticky; top: 88px`). Mobile: daftar item, lalu panel ringkasan, lalu bilah aksi lengket di bawah (`position: sticky; bottom: 0`) berisi total + tombol "Checkout".

### 5.9 Panel Ringkasan Belanja
Baris: Subtotal (N item) · Total. Total `harga-besar`. Catatan kecil: "Checkout demo — tidak ada pembayaran atau pengiriman nyata." Tombol "Checkout" primary selebar panel; nonaktif bila keranjang kosong.

### 5.10 Checkout Demo (Bottom sheet / Modal)
- Mobile: bottom sheet dari bawah, `radius-xl` atas, maks 90vh, dapat ditutup (✕ / Esc / klik latar).
- Isi: judul "Checkout Demo", daftar 3–5 baris ringkas (nama × qty), Total, kotak info "Mode demo: tidak ada data pribadi yang diminta, tidak ada pembayaran", tombol "Selesaikan Pesanan Demo" + "Batal".
- Sukses: ganti isi sheet dengan ikon centang besar, "Pesanan demo dibuat", nomor pesanan pendek (mis. `DEMO-0007`), catatan "Stok telah dikurangi dan tercatat di ringkasan penjualan", tombol "Kembali ke katalog" (primary) dan "Lihat dashboard" (secondary).
- Tidak ada field nama, telepon, alamat, atau email. Fokus terkunci di dalam sheet (`focus trap`), dikembalikan ke pemicu saat ditutup.

### 5.11 Modal Konfirmasi
Dipakai untuk Hapus produk, Reset data contoh, dan Kosongkan keranjang. Judul pertanyaan konkret ("Hapus "Pupuk NPK Padi 1 kg"?"), satu kalimat konsekuensi yang tidak bisa dibatalkan, tombol Batal (secondary) + aksi (danger). Maks 400 px, `role="alertdialog"`, fokus awal pada **Batal**.

### 5.12 Empty State

| Konteks | Ikon | Judul | Teks | Aksi |
|---|---|---|---|---|
| Hasil filter/pencarian kosong | 🔍 | "Produk tidak ditemukan" | "Coba kata kunci lain atau ubah kategori." | "Reset filter" (primary) |
| Katalog benar-benar kosong | 🌱 | "Belum ada produk" | "Tambahkan produk pertama lewat dashboard." | "Buka Dashboard" |
| Keranjang kosong | 🧺 | "Keranjang masih kosong" | "Tambahkan pupuk atau bibit favoritmu dari katalog." | "Lihat produk" |
| Penjualan belum ada | 📊 | "Belum ada pesanan demo" | "Selesaikan checkout demo untuk melihat ringkasan." | — |
| Dashboard tanpa produk | 📦 | "Daftar produk kosong" | "Mulai dengan menambahkan produk baru." | "Tambah Produk" |

Kartu empty state: latar putih, border putus-putus 1 px `--garis`, radius 16 px, padding 32 px, konten di tengah, lebar maks 480 px.

### 5.13 Toast
Pojok kanan bawah (mobile: di atas bilah lengket), latar `--hijau-tua`, teks putih, ikon centang, radius 12 px, durasi 3 detik, maksimal 3 baris. Contoh: "Produk ditambahkan ke keranjang", "Produk berhasil disimpan", "Produk dihapus", "Data contoh dipulihkan". `role="status"` + `aria-live="polite"`. Tidak dipakai untuk galat formulir (galat tampil inline).

### 5.14 Loading
Untuk data lokal tidak diperlukan spinner halaman penuh. Skeleton hanya bila render terasa > 100 ms: blok `--krem-tua` berdenyut pada grid gambar dan baris teks. Tombol submit memakai status loading (5.4).

---

## 6. Wireframe Teks

### 6.1 V1 Katalog — Mobile (360 px)

```
┌──────────────────────────────────┐
│ 🌾 PADISEHAT          🛒³    ☰   │ ← sticky, 64 px, blur
├──────────────────────────────────┤
│ ╭──────────────────────────────╮ │
│ │ KATALOG PERTANIAN            │ │
│ │ Pupuk & bibit untuk          │ │
│ │ panen yang lebih sehat       │ │ hero, latar hijau lembut
│ │ [ Lihat Produk ]             │ │ radius 24, emoji di atas
│ │        🌱 🚜 🌾 🧑‍🌾          │ │ (dekoratif)
│ ╰──────────────────────────────╯ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🔍 Cari pupuk, benih…      ✕ │ │ 48 px
│ └──────────────────────────────┘ │
│ (Semua) (Pupuk) (Benih) (Bibit) →│ chip, geser horizontal
│ ┌───────────────┐ ┌────────────┐ │
│ │ Urutkan     ▾ │ │ Reset      │ │ reset hanya bila aktif
│ └───────────────┘ └────────────┘ │
│ Menampilkan 8 dari 8 produk      │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ ╭──────────────────────────╮ │ │
│ │ │      [gambar 4:3]  ★Unggulan│ │
│ │ ╰──────────────────────────╯ │ │
│ │ Pupuk · stok 24              │ │
│ │ Pupuk NPK Padi 1 kg          │ │
│ │ Rp 45.000                    │ │
│ │ [   + Tambah   ]  [ 💬 ]     │ │ 44 px
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │      [gambar 4:3]            │ │
│ │ Benih · stok tersisa 2       │ │ ← warna peringatan
│ │ Benih Padi Unggul 1 kg       │ │
│ │ Rp 62.000                    │ │
│ │ [   + Tambah   ]  [ 💬 ]     │ │
│ └──────────────────────────────┘ │
│              ⋮                   │
│   (8 kartu, 1 kolom, gap 12)     │
├──────────────────────────────────┤
│ Footer hijau tua (3 baris)       │
└──────────────────────────────────┘
```

### 6.2 V1 Katalog — Desktop (1280 px)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🌾 PADISEHAT      Katalog   Dashboard                      🛒 3          │ 72 px
├──────────────────────────────────────────────────────────────────────────┤
│  ╭────────────────────────────────────────────────────────────────────╮  │
│  │  KATALOG PERTANIAN              │   🌾  🌱  🚜  🌻                  │  │
│  │  Pupuk & bibit untuk panen      │   🧑‍🌾  🍅  🌽  🌿                  │  │ hero 2 kolom
│  │  yang lebih sehat.              │   (kolase emoji, dekoratif)        │  │
│  │  [ Lihat Produk ] [ Tanya WA ]  │                                    │  │
│  ╰────────────────────────────────────────────────────────────────────╯  │
│                                                                          │
│  ┌──────────────────────┐ (Semua) (Pupuk) (Benih) (Bibit)   ┌──────────┐  │
│  │ 🔍 Cari produk…    ✕ │ (Media Tanam)                     │ Urutkan ▾│  │
│  └──────────────────────┘                                   └──────────┘  │
│  Menampilkan 8 dari 8 produk                            Reset filter      │
│                                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │ [gambar]   │ │ [gambar]   │ │ [gambar]   │ │ [gambar]   │             │
│  │ ★Unggulan  │ │            │ │            │ │ ★Unggulan  │             │
│  ├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤             │
│  │Pupuk·stok24│ │Pupuk·stok12│ │ Pupuk·habis│ │Benih·stok18│             │
│  │NPK Padi 1kg│ │Kompos 5 kg │ │Kandang 3kg │ │Padi Unggul │             │
│  │Rp 45.000   │ │Rp 38.000   │ │Rp 27.000   │ │Rp 62.000   │             │
│  │[+Tambah][💬]│ │[+Tambah][💬]│ │[Stok habis]│ │[+Tambah][💬]│            │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │   Benih    │ │   Bibit    │ │   Bibit    │ │Media Tanam │             │
│  │ Jagung 250g│ │Cabai Rawit │ │ Tomat      │ │Sekam 5 L   │             │
│  │ Rp 21.000  │ │ Rp 15.000  │ │ Rp 12.000  │ │ Rp 18.000  │             │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘             │
├──────────────────────────────────────────────────────────────────────────┤
│ Footer: logo+deskripsi │ tautan │ catatan localStorage & nomor WA        │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.3 V2 Detail Produk — Mobile

```
┌──────────────────────────────────┐
│ ←  Detail Produk      🛒³        │
├──────────────────────────────────┤
│ Katalog / Pupuk / NPK Padi       │ breadcrumb 13 px, 1 baris
│ ╭──────────────────────────────╮ │
│ │        [gambar 4:3]          │ │
│ │                  ★ Unggulan  │ │
│ ╰──────────────────────────────╯ │
│ PUPUK                            │ small, hijau daun
│ Pupuk NPK Padi 1 kg              │ h1 (26 px)
│ Rp 45.000                        │ harga-besar
│ ● Tersedia · stok 24             │ hijau daun
│                                  │
│ Deskripsi                        │ h3
│ Pupuk majemuk untuk fase         │ body
│ vegetatif padi sawah. …          │
│                                  │
│ Jumlah                           │
│ ┌────┐                           │
│ │ − 1 +│                         │ stepper
│ └────┘                           │
├──────────────────────────────────┤
│  [  + Tambah ke Keranjang  ]     │ bilah lengket bawah,
│  [ 💬 Pesan via WhatsApp   ]     │ 2 tombol bertumpuk
└──────────────────────────────────┘
```

### 6.4 V2 Detail Produk — Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🌾 PADISEHAT      Katalog   Dashboard                      🛒 3          │
├──────────────────────────────────────────────────────────────────────────┤
│ ← Kembali ke katalog                                                     │
│  ┌───────────────────────────┐   PUPUK                                  │
│  │                           │   Pupuk NPK Padi 1 kg                    │
│  │      [gambar 4:3]         │   Rp 45.000                              │
│  │                 ★Unggulan │   ● Tersedia · stok 24                   │
│  └───────────────────────────┘   ────────────────────────────────         │
│                                  Deskripsi                               │
│                                  Pupuk majemuk untuk fase vegetatif      │
│                                  padi sawah. …                           │
│                                                                          │
│                                  Jumlah  [ − 1 + ]                       │
│                                  [ + Tambah ke Keranjang ]               │
│                                  [ 💬 Pesan via WhatsApp ]               │
│                                  ℹ️ Pesanan diproses lewat WhatsApp toko. │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.5 V3 Keranjang — Mobile

```
┌──────────────────────────────────┐
│ ←  Keranjang (3)                 │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ [img] Pupuk NPK Padi 1 kg    │ │
│ │       Pupuk · Rp 45.000      │ │
│ │       [− 2 +]        Rp 90.000 🗑│
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ [img] Benih Jagung Manis 250g│ │
│ │       Benih · Rp 21.000      │ │
│ │       [− 1 +]        Rp 21.000 🗑│
│ └──────────────────────────────┘ │
│ (baris lanjutan …)               │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Subtotal (3 item)  Rp 111.000│ │
│ │ Total              Rp 111.000│ │
│ │ Checkout demo — tanpa        │ │
│ │ pembayaran atau pengiriman.  │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ Total Rp 111.000  [ Checkout → ] │ sticky bottom
└──────────────────────────────────┘
```

### 6.6 V3 Keranjang — Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🌾 PADISEHAT      Katalog   Dashboard                      🛒 3          │
├──────────────────────────────────────────────────────────────────────────┤
│ Keranjang                                                                │
│  ┌──────────────────────────────────────┐  ┌──────────────────────────┐ │
│  │ [img] Pupuk NPK Padi 1 kg            │  │ Ringkasan Belanja        │ │
│  │       Pupuk · Rp 45.000              │  │ ──────────────────────── │ │
│  │       [− 2 +]   Rp 90.000        🗑   │  │ Subtotal (3 item)        │ │
│  ├──────────────────────────────────────┤  │            Rp 111.000    │ │
│  │ [img] Benih Jagung Manis 250 g       │  │ Total                    │ │
│  │       Benih · Rp 21.000              │  │            Rp 111.000    │ │
│  │       [− 1 +]   Rp 21.000        🗑   │  │                          │ │
│  ├──────────────────────────────────────┤  │ Checkout demo — tanpa    │ │
│  │ [img] Bibit Cabai Rawit (polybag)    │  │ pembayaran/pengiriman.   │ │
│  │       Bibit · Rp 15.000              │  │ [     Checkout →     ]   │ │
│  │       [− 0 +]    Rp 15.000       🗑   │  └──────────────────────────┘ │
│  └──────────────────────────────────────┘   (panel sticky)              │
│  [ ← Lanjut belanja ]                                                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.7 V4 Checkout Demo — Mobile (bottom sheet)

```
┌──────────────────────────────────┐
│ ░░░░░ latar gelap 40% ░░░░░░░░░░ │
│ ╭──────────────────────────────╮ │
│ │ Checkout Demo            ✕   │ │
│ │ ──────────────────────────── │ │
│ │ Pupuk NPK Padi 1 kg   ×2     │ │
│ │ Benih Jagung Manis    ×1     │ │
│ │ ──────────────────────────── │ │
│ │ Total           Rp 111.000   │ │
│ │ ℹ️ Mode demo: tidak ada data │ │
│ │ pribadi, pembayaran, atau    │ │
│ │ pengiriman nyata.            │ │
│ │ [ Selesaikan Pesanan Demo ]  │ │
│ │ [        Batal           ]   │ │
│ ╰──────────────────────────────╯ │
└──────────────────────────────────┘

Setelah sukses:
│ │ ✅  Pesanan demo dibuat      │ │
│ │ DEMO-0007                    │ │
│ │ Stok dikurangi & tercatat    │ │
│ │ di ringkasan penjualan.      │ │
│ │ [ Kembali ke katalog ]       │ │
│ │ [ Lihat dashboard ]          │ │
```

### 6.8 V5 Dashboard — Mobile

```
┌──────────────────────────────────┐
│ 🌾 PADISEHAT          🛒³    ☰   │
├──────────────────────────────────┤
│ Dashboard                        │ h1
│ Kelola produk & pantau stok      │
│ ┌─────────┐ ┌─────────┐          │
│ │📦 8     │ │🌱 179   │          │ 2×2 kartu
│ │Produk   │ │Total stok│         │
│ └─────────┘ └─────────┘          │
│ ┌─────────┐ ┌─────────┐          │
│ │🏷️ 4     │ │⚠️ 2     │          │
│ │Kategori │ │Menipis  │          │
│ └─────────┘ └─────────┘          │
│ ┌──────────────────────────────┐ │
│ │ Penjualan Demo         demo  │ │
│ │ 2 pesanan · Rp 156.000       │ │
│ └──────────────────────────────┘ │
│ Daftar Produk          [+ Tambah]│
│ ┌──────────────────────────────┐ │
│ │ Pupuk NPK Padi 1 kg ★Unggulan│ │
│ │ Pupuk · Rp 45.000 · stok 24  │ │
│ │ Ubah            Hapus        │ │
│ ├──────────────────────────────┤ │
│ │ Benih Jagung Manis 250 g     │ │
│ │ Benih · Rp 21.000 · stok 30  │ │
│ │ Ubah            Hapus        │ │
│ └──────────────────────────────┘ │
│ (lanjutan …)                     │
│ [ Reset data contoh ]            │ dataset danger/ghost
└──────────────────────────────────┘
```

### 6.9 V5 Dashboard — Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🌾 PADISEHAT      Katalog   Dashboard                      🛒 3          │
├──────────────┬───────────────────────────────────────────────────────────┤
│  MENU        │  Dashboard                                     [+ Tambah] │
│  • Katalog   │  Kelola produk & pantau stok                              │
│  • Dashboard │  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐        │
│  • Lihat toko│  │📦 8      ││🌱 179    ││🏷️ 4      ││⚠️ 2      │        │
│              │  │Produk    ││Total stok││Kategori  ││Menipis   │        │
│  ──────────  │  └──────────┘└──────────┘└──────────┘└──────────┘        │
│  Reset data  │  ┌────────────────────────────────────────────────────┐   │
│  contoh      │  │ Penjualan Demo                             demo    │   │
│              │  │ 2 pesanan · Rp 156.000 · 3 produk terjual          │   │
│              │  └────────────────────────────────────────────────────┘   │
│              │  ┌────────────────────────────────────────────────────┐   │
│              │  │ Produk        │Kategori │Harga    │Stok│★│Aksi     │   │
│              │  ├───────────────┼─────────┼─────────┼────┼─┼─────────┤   │
│              │  │[img] NPK Padi │Pupuk    │Rp45.000 │ 24 │✓│✎ Ubah   │   │
│              │  │     1 kg      │         │         │    │ │🗑 Hapus  │   │
│              │  ├───────────────┼─────────┼─────────┼────┼─┼─────────┤   │
│              │  │[img] Kompos   │Pupuk    │Rp38.000 │ 12 │ │✎ 🗑     │   │
│              │  │[img] Kandang  │Pupuk    │Rp27.000 │  0 │ │✎ 🗑     │   │
│              │  │[img] Benih…   │Benih    │Rp62.000 │ 18 │✓│✎ 🗑     │   │
│              │  └────────────────────────────────────────────────────┘   │
│              │  Catatan: data tersimpan di localStorage perangkat ini.    │
└──────────────┴───────────────────────────────────────────────────────────┘
```

Sidebar 240 px hanya tampil ≥1024 px; di bawah itu menu pindah ke navbar/panel geser.

### 6.10 Form Tambah/Ubah — Desktop (modal) & Mobile (sheet)

```
DESKTOP (modal 560 px)                    MOBILE (sheet 92vh)
┌───────────────────────────────┐         ┌──────────────────────────┐
│ Tambah Produk             ✕   │         │ ═══ (grip)          ✕    │
│ ───────────────────────────── │         │ Tambah Produk            │
│ Nama produk *                 │         │ Nama produk *            │
│ [____________________________]│         │ [______________________] │
│ Kategori *                    │         │ Kategori *               │
│ [____________________________]│         │ [______________________] │
│ ┌──────────────┐┌───────────┐ │         │ Harga (Rp) *             │
│ │ Harga (Rp) * ││ Stok *    │ │         │ [ 45000              ]   │
│ │ [ 45000    ] ││ [ 24    ] │ │         │ ⚠ Harga harus angka ≥ 0  │
│ └──────────────┘└───────────┘ │         │ Stok *                   │
│ Deskripsi *                   │         │ [ 24                 ]   │
│ [____________________________]│         │ Deskripsi *              │
│ [____________________________]│         │ [______________________] │
│ [____________________________]│         │ [______________________] │
│ Gambar (opsional)             │         │ Gambar (opsional)        │
│ [/img/pupuk-npk.svg_________] │         │ [/img/pupuk-npk.svg__]   │
│ ☐ Tampilkan sebagai unggulan  │         │ ☐ Produk unggulan        │
│ ───────────────────────────── │         │ ──────────────────────── │
│ [ Batal ]  [ Simpan Produk ]  │         │ [ Batal ] [ Simpan ] ←── │
└───────────────────────────────┘         └──────────────────────────┘
```

---

## 7. Perilaku Responsif

| Elemen | <480 px | 480–767 px | 768–1023 px | ≥1024 px |
|---|---|---|---|---|
| Navbar | logo + 🛒 + ☰ | sama | logo + menu teks | logo + menu + 🛒 |
| Hero | 1 kolom, emoji di atas, tinggi ≤160 px | 1 kolom | 2 kolom | 2 kolom, emoji besar |
| Grid produk | 1 kolom | 2 kolom | 3 kolom | 4 kolom |
| Chip kategori | geser horizontal | geser | semua tampil | semua tampil |
| Kartu produk | vertikal penuh | vertikal | vertikal | vertikal, gap 24 |
| Detail produk | 1 kolom, bilah aksi lengket | 1 kolom | 2 kolom | 2 kolom |
| Keranjang | daftar → ringkasan → bilah lengket | sama | 2 kolom | 2 kolom, ringkasan sticky |
| Checkout | bottom sheet | sheet | modal | modal |
| Dashboard nav | ☰ / segmen atas | ☰ | ☰ | sidebar 240 px |
| Ringkasan | 2×2 | 2×2 | 4 kolom | 4 kolom |
| Daftar produk | kartu | kartu | tabel | tabel |
| Form | sheet 92vh, footer lengket | sheet | modal 560 px | modal 560 px |
| Font hero | 32 px | 32 px | 44 px | 52 px |

Aturan tambahan: target sentuh ≥44×44 px; padding aman bawah 16 px + `env(safe-area-inset-bottom)` pada bilah lengket; input minimal 16 px agar iOS tidak memperbesar halaman.

---

## 8. State & Interaksi

### 8.1 Matriks State Kartu Produk
| State | Visual | Perilaku |
|---|---|---|
| Default | putih, border, shadow-sm | klik → V2 |
| Hover (desktop) | naik 2 px, shadow-md | — |
| Fokus keyboard | cincin 2 px `--fokus` offset 2 px | Enter → V2 |
| Unggulan | badge ★ di atas gambar | — |
| Stok menipis (1–3) | "stok tersisa N" `--peringatan` | tambah aktif |
| Stok habis (0) | "Stok habis" `--galat`, gambar 55% | tombol "+ Tambah" nonaktif, label "Stok habis" |
| Gambar gagal | kotak krem-tua + inisial | fallback tidak berkedip |
| Baru ditambahkan | toast, tombol berubah "Ditambahkan ✓" 1,2 dtk | kembali normal |

### 8.2 Aturan Keranjang (Lapis B)
1. Klik "Tambah" menambah 1 unit; bila produk sudah ada, jumlah bertambah 1.
2. Jumlah per item dibatasi 1…stok produk; percobaan melebihi stok → toast "Jumlah melebihi stok tersedia".
3. Produk stok 0 tidak dapat ditambahkan.
4. Keranjang disimpan di `padisehat.cart.v1` (hanya `productId` + `qty`, tanpa data pribadi).
5. Saat aplikasi dibuka, item yang produknya sudah dihapus dari katalog dibuang diam-diam; item dengan stok berkurang dipotong ke stok tersedia.
6. Badge navbar = total kuantitas, bukan jumlah baris.
7. Checkout demo mengurangi `stok` produk, membuat entri pesanan (`padisehat.orders.v1`: id, timestamp, items[{productId, nama, harga, qty}], total), lalu mengosongkan keranjang.
8. Bila checkout membuat stok 0, kartu di katalog langsung menampilkan "Stok habis".

### 8.3 State Tampilan
| State | Perilaku |
|---|---|
| Pindah tampilan V1↔V2↔V3↔V5 | Render ulang konten, `window.scrollTo({top:0})`, fokus ke `<h1>` baru, judul dokumen berubah |
| Pencarian/filter/sorting | State di memori `{ q, kategori, sort }`; tidak disimpan di localStorage |
| Filter tanpa hasil | Empty state + "Reset filter"; chip aktif tetap terlihat |
| Form terbuka | Latar dikunci (tanpa scroll), fokus terperangkap, Esc = Batal dengan konfirmasi bila ada perubahan |
| Simpan gagal validasi | Pesan inline, fokus ke field pertama, sheet tidak menutup |
| Hapus | Modal konfirmasi → hapus → toast → ringkasan & katalog diperbarui |
| Data localStorage rusak | Muat data contoh, tampilkan toast netral "Data contoh dimuat ulang" |

### 8.4 Format Angka & Teks
- Harga: `Rp 45.000` (spasi setelah Rp, titik ribuan, tanpa desimal). Nol: `Rp 0`.
- Angka ringkasan: titik ribuan (`179`, `1.250`).
- Jumlah item: "3 item".
- Tanggal pesanan demo (bila ditampilkan): `16 Nov 2026, 14.05`.
- Nama produk panjang dipotong 2 baris di kartu, penuh di detail.
- Tidak ada teks bahasa Inggris di UI, kecuali istilah teknis yang lazim ("localStorage", "WhatsApp", "demo").
- Tidak ada emoji di dalam harga, tombol aksi utama, atau pesan galat.

---

## 9. Microcopy

| Konteks | Teks |
|---|---|
| Hero judul | "Pupuk & bibit untuk panen yang lebih sehat" |
| Hero subteks | "Pilih kebutuhan kebunmu, lalu pesan langsung ke toko lewat WhatsApp." |
| CTA hero | "Lihat Produk" / "Tanya via WhatsApp" |
| Placeholder cari | "Cari pupuk, benih, atau bibit…" |
| Label sort | "Urutkan" |
| Opsi sort | "Unggulan & Nama A–Z", "Nama Z–A", "Harga termurah", "Harga termahal", "Stok tersedikit" |
| Baris hasil | "Menampilkan 8 dari 8 produk" |
| Tombol kartu | "+ Tambah" · label aksesibel "Tambah Pupuk NPK Padi 1 kg ke keranjang" |
| Tombol WA kartu | label aksesibel "Pesan Pupuk NPK Padi 1 kg via WhatsApp" |
| Pesan WA | "Halo PadiSehat, saya ingin bertanya tentang *Pupuk NPK Padi 1 kg* (Rp 45.000). Apakah stoknya tersedia?" |
| Stok habis | "Stok habis" |
| Stok menipis | "stok tersisa 2" |
| Detail CTA | "+ Tambah ke Keranjang" / "Pesan via WhatsApp" |
| Catatan detail | "Pesanan diproses lewat WhatsApp toko." |
| Keranjang kosong | "Keranjang masih kosong" / "Tambahkan pupuk atau bibit favoritmu dari katalog." / "Lihat produk" |
| Checkout catatan | "Checkout demo — tidak ada pembayaran, pengiriman, atau data pribadi." |
| Checkout sukses | "Pesanan demo dibuat" / "Stok telah dikurangi dan tercatat di ringkasan penjualan." |
| Dashboard subjudul | "Kelola produk & pantau stok" |
| Tombol tambah | "+ Tambah Produk" |
| Konfirmasi hapus | "Hapus "Pupuk NPK Padi 1 kg"?" / "Produk akan hilang dari katalog. Tindakan ini tidak dapat dibatalkan." |
| Konfirmasi reset | "Pulihkan data contoh?" / "Semua perubahan produk di perangkat ini akan diganti dengan 8 produk contoh." |
| Galat nama | "Nama produk wajib diisi (3–60 karakter)." |
| Galat harga | "Harga harus berupa angka bulat 0 atau lebih." |
| Galat stok | "Stok harus berupa angka bulat 0 atau lebih." |
| Galat deskripsi | "Deskripsi wajib diisi (10–300 karakter)." |
| Toast simpan | "Produk berhasil disimpan" |
| Toast hapus | "Produk dihapus" |
| Toast keranjang | "Ditambahkan ke keranjang" |
| Toast reset | "Data contoh dipulihkan" |
| Catatan footer | "Nomor WhatsApp pada demo ini adalah contoh. Ganti sebelum dipakai." |

Nada bahasa: sapaan akrab tapi sopan ("kamu" untuk pembeli, kalimat netral untuk pengelola), tanpa tanda seru berlebihan, tanpa kata "gratis" atau klaim hasil panen.

---

## 10. Aksesibilitas

| Aspek | Ketentuan |
|---|---|
| Kontras | Semua pasangan teks/latar di 3.1 ≥ 4,5:1 (teks normal) dan ≥ 3:1 (teks ≥24 px / border komponen). Teks putih hanya di atas `--hijau-daun`/`--hijau-tua` |
| Fokus | `:focus-visible` wajib terlihat: outline 2 px `--fokus`, offset 2 px; jangan pakai `outline: none` tanpa pengganti |
| Struktur | Satu `<h1>` per tampilan, heading tidak melompat level, landmark `header`/`main`/`footer`/`nav` |
| Skip link | "Lewati ke konten utama" muncul saat fokus pertama |
| Formulir | Setiap kontrol punya `<label for>`; wajib ditandai `required` + tanda * visual; galat via `aria-describedby` + `aria-invalid` |
| Gambar | `alt` = nama produk; dekoratif `alt=""`; emoji hero `aria-hidden` |
| Dinamis | Jumlah hasil filter diumumkan lewat `aria-live="polite"`; toast `role="status"`; modal `role="dialog"` + `aria-modal="true"` + focus trap |
| Target sentuh | ≥44×44 px, jarak antar target ≥8 px |
| Keyboard | Semua fungsi dapat dicapai Tab; Esc menutup modal/sheet; panah kiri/kanan pada kelompok chip (roving tabindex) |
| Zoom | Layout tetap utuh pada zoom 200% dan lebar 320 px |
| Gerak | Hormati `prefers-reduced-motion`: transisi dan animasi < 200 ms dimatikan |
| Status stok | Jangan hanya warna — selalu ada teks ("Stok habis", "stok tersisa 2") |
| Badge keranjang | `aria-label` menyebut jumlah ("Keranjang, 3 item"), bukan hanya angka |

---

## 11. Gerak (Motion)

| Interaksi | Durasi | Easing |
|---|---|---|
| Hover kartu/tombol | 150 ms | `ease-out` |
| Buka/tutup modal & sheet | 220 ms | `cubic-bezier(.2,.8,.2,1)` |
| Toast masuk/keluar | 180 ms | `ease-out` |
| Perubahan jumlah (stepper) | 120 ms | `ease-out` |
| Skeleton pulsa | 1,2 s | `ease-in-out`, loop |

Tidak ada animasi masuk beruntun pada grid produk (menghambat pemindaian), tidak ada parallax, tidak ada autoplay.

---

## 12. Kriteria Penerimaan UI (Manual)

Dijalankan di browser setelah implementasi; melengkapi AC-01…AC-36 `SPEC.md`.

| ID | Langkah | Hasil diharapkan |
|---|---|---|
| UI-01 | Buka aplikasi pada lebar 360 px | Navbar sticky 64 px, hero terbaca, grid 1 kolom, tanpa scroll horizontal |
| UI-02 | Gulir 400 px ke bawah | Navbar tetap di atas, latar semi-transparan + bayangan |
| UI-03 | Perlebar ke 1280 px | Grid menjadi 4 kolom, menu teks tampil, hero 2 kolom |
| UI-04 | Arahkan kursor ke kartu produk | Kartu terangkat 2 px + bayangan; tidak ada teks yang bergeser |
| UI-05 | Tab melalui navbar → pencarian → chip → sort → kartu | Setiap elemen menampilkan cincin fokus hijau; urutan logis; tidak ada jebakan fokus |
| UI-06 | Periksa semua teks pada krem dan hijau | Tidak ada teks abu pucat; rasio sesuai tabel 3.1 |
| UI-07 | Cari kata tanpa hasil | Empty state "Produk tidak ditemukan" + tombol "Reset filter" berfungsi |
| UI-08 | Klik kartu produk | Masuk V2, judul dokumen & `<h1>` berubah, halaman mulai dari atas |
| UI-09 | Di V2, tekan "Kembali" | Kembali ke V1 dengan filter/pencarian sebelumnya tetap |
| UI-10 | Klik "+ Tambah" pada produk stok 0 | Tombol nonaktif berlabel "Stok habis"; tidak ada item masuk keranjang |
| UI-11 | Klik "+ Tambah" 3× pada produk stok 24 | Badge keranjang = 3; toast muncul; stepper keranjang = 3 |
| UI-12 | Di keranjang, tekan + sampai melebihi stok | Tombol + nonaktif, muncul teks "Maks. stok" |
| UI-13 | Refresh halaman | Isi keranjang tetap ada; badge sesuai |
| UI-14 | Kosongkan keranjang | Empty state "Keranjang masih kosong" + tombol "Lihat produk" |
| UI-15 | Buka checkout demo | Sheet/modal dengan fokus terperangkap; Esc menutup; tidak ada field data pribadi |
| UI-16 | Selesaikan pesanan demo | Layar sukses + nomor demo; stok produk berkurang; ringkasan penjualan bertambah; keranjang kosong |
| UI-17 | Buka dashboard di 360 px | 4 kartu ringkasan 2×2, daftar produk berbentuk kartu, tombol Tambah mudah dijangkau |
| UI-18 | Buka form tambah, submit kosong | Pesan galat inline di bawah tiap field bermasalah, fokus pindah ke field pertama, sheet tidak menutup |
| UI-19 | Isi harga `45000` | Tersimpan sebagai angka; kartu menampilkan `Rp 45.000` |
| UI-20 | Klik Hapus | Modal konfirmasi dengan fokus awal pada "Batal"; setelah konfirmasi muncul toast dan produk hilang dari katalog |
| UI-21 | Periksa tampilan dengan `prefers-reduced-motion` aktif | Tidak ada transisi/animasi yang tersisa |
| UI-22 | Zoom 200% pada 1280 px | Konten tidak terpotong, tidak ada scroll horizontal, tombol tetap dapat diklik |
| UI-23 | Periksa tab Network | Tidak ada permintaan ke Google Fonts atau domain lain; font dimuat dari aset lokal |
| UI-24 | Periksa setiap gambar produk | Semua gambar termuat dari `/img/...`; satu gambar yang dirusak menampilkan fallback inisial, bukan ikon rusak |

---

## 13. Catatan Implementasi (untuk tahap coding berikutnya)

1. **Font lokal:** instal `@fontsource-variable/bricolage-grotesque` dan `@fontsource-variable/plus-jakarta-sans`, impor di entry JS/CSS. Jangan memakai `<link>` Google Fonts (melanggar AC-06 & NFR-03).
2. **Token sebagai CSS custom property** di `:root` (`--hijau-daun`, `--space-4`, dst.) agar konsisten dan mudah diubah.
3. **Satu sumber render:** `renderApp()` membaca state `{ view, q, kategori, sort, cart, products }`, lalu merender tampilan aktif. Tidak ada manipulasi DOM tersebar.
4. **Nama kunci penyimpanan:** `padisehat.products.v1` (wajib), `padisehat.cart.v1` dan `padisehat.orders.v1` (hanya bila Lapis B dikerjakan).
5. **Tanpa `innerHTML` untuk data pengguna:** gunakan `textContent`/`createElement` (NFR-07).
6. **Gambar:** SVG 4:3 di `public/img/`, buatan sendiri; sertakan `onerror` fallback inisial.
7. **Emoji hero:** bungkus dengan `aria-hidden="true"` dan sediakan teks nyata sebagai isi utama.
8. **Urutan pengerjaan yang disarankan:** token → navbar/hero → kartu & grid → toolbar filter → detail → keranjang → dashboard CRUD → checkout demo → ringkasan penjualan → audit aksesibilitas.
9. **Yang boleh dipotong bila waktu habis:** ringkasan penjualan, animasi, breadcrumb, sidebar dashboard (ganti menu navbar), kolase emoji kompleks. **Yang tidak boleh dipotong:** tombol WhatsApp, empty state, validasi inline, kontras, target sentuh.

---

## 14. Definition of Done — UI

- [ ] Semua token di Bagian 3 dipakai konsisten; tidak ada warna/font di luar daftar.
- [ ] Wireframe 6.1–6.10 terwujud tanpa elemen tambahan yang tidak berdasar.
- [ ] Layout benar pada 360, 768, dan 1280 px tanpa scroll horizontal.
- [ ] Navbar sticky berperilaku sesuai 4.2 di semua tampilan.
- [ ] Setiap komponen memiliki state default/hover/fokus/nonaktif/loading sesuai Bagian 5 dan 8.
- [ ] Semua empty state tersedia dan aksinya berfungsi.
- [ ] Kontras dan fokus memenuhi Bagian 10; UI-05, UI-06, UI-21, UI-22 lolos.
- [ ] Microcopy Bagian 9 dipakai apa adanya (tanpa teks Inggris liar).
- [ ] UI-01 s.d. UI-24 diperiksa manual dan hasilnya dicatat.
- [ ] Tidak ada kode aplikasi yang ditulis pada tahap dokumen ini.
