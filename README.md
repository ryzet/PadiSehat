# PadiSehat

Katalog produk pertanian dengan akun pelanggan, checkout transfer bank, dan pengunggahan bukti pembayaran.

## Menjalankan secara lokal

Gunakan dua terminal dari direktori proyek:

```sh
npm install
npm run api
```

```sh
npm run dev
```

Vite meneruskan permintaan `/api` ke server lokal pada port 3001. Data akun, pesanan, dan gambar bukti transfer disimpan server di `server-data/`; berkas tersebut diabaikan Git. Sesi login memakai cookie HttpOnly dan berakhir ketika server dimulai ulang.

## Konfigurasi sebelum digunakan

Nilai rekening yang tersedia adalah contoh. Atur environment server berikut dengan rekening toko yang benar:

- `BANK_NAME`
- `BANK_ACCOUNT`
- `BANK_HOLDER`
- `ADMIN_VERIFY_TOKEN` (nilai rahasia acak panjang untuk endpoint tinjauan pembayaran)
- `NODE_ENV=production` agar cookie memakai atribut Secure saat API disajikan melalui HTTPS

Produk dan harga untuk perhitungan pesanan ditentukan di `server/index.js` dan perlu disamakan dengan katalog sebelum dipakai. WhatsApp pemilik menggunakan nomor contoh yang sudah ada di `src/products.js`; ganti dengan nomor toko.

## Pembayaran

Checkout membuat pesanan di server. Pembeli mentransfer manual ke rekening yang dikonfigurasi dan mengunggah bukti PNG/JPG/WebP (maksimal 3 MB). Pesanan berubah ke status menunggu verifikasi. Owner dapat memakai endpoint admin `GET /api/admin/orders`, `GET /api/admin/orders/:id/proof`, dan `POST /api/admin/orders/verify` dengan header `Authorization: Bearer <ADMIN_VERIFY_TOKEN>`. Verifikasi transfer dilakukan manusia; aplikasi tidak terhubung langsung ke bank.

## Batas penerapan

Server bawaan memakai file JSON lokal dan sesi dalam memori, sehingga cocok untuk pengembangan dan demonstrasi satu proses. Untuk produksi multi-pengguna, gunakan basis data transaksional, penyimpanan berkas privat, TLS, perlindungan operasional, dan layanan pembayaran/rekonsiliasi yang sesuai. Backend belum dipublikasikan atau dipasang pada hosting.
