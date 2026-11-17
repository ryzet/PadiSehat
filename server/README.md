# PadiSehat API — Fondasi Backend Tahap 1

Folder ini menambahkan API Node.js terpisah dari frontend Vite. Frontend yang ada tetap berjalan memakai localStorage sampai integrasi API dan migrasi data diuji secara terpisah.

## Ruang lingkup tahap ini

- Express 5 API dan koneksi PostgreSQL melalui pg.
- Migrasi tabel pengguna, produk, sesi, dan audit log.
- Registrasi dengan password + konfirmasi password; konfirmasi tidak disimpan.
- Login/logout dengan password hash Argon2id dan sesi server-side PostgreSQL.
- Cookie sesi HttpOnly, SameSite=Lax, Secure saat production.
- Token CSRF berbasis sesi dan pemeriksaan Origin untuk request yang mengubah data.
- API katalog publik hanya-baca.
- CRUD produk khusus pemilik toko, validasi Zod di server, filter berdasarkan owner_id yang berasal dari sesi, serta audit log.
- RLS PostgreSQL sebagai lapisan tambahan. Query CRUD tetap membatasi owner_id secara eksplisit.

Belum termasuk: integrasi frontend, migrasi data localStorage, halaman login/registrasi, keranjang, pesanan, pembayaran transfer, verifikasi bukti transfer, dan upload gambar Supabase Storage. Tidak ada login palsu atau pembayaran palsu yang ditambahkan ke frontend.

## Persyaratan

- Node.js 20.19+.
- PostgreSQL 13+ atau project Supabase PostgreSQL.
- Dua koneksi database yang disarankan pada production:
  - DATABASE_URL: role aplikasi khusus non-superuser dan NOBYPASSRLS.
  - MIGRATION_DATABASE_URL: koneksi admin untuk menjalankan migrasi saja.
- Frontend origin yang tepat, misalnya http://localhost:5173.

Pada production, cookie SameSite=Lax mengharuskan frontend dan API berada pada site yang sama (misalnya app.example.com dan api.example.com), atau API diproxy melalui domain frontend. Jika frontend dan API berada pada domain berbeda-site, jangan langsung mengubah cookie ke SameSite=None; rancang ulang CORS, CSRF, dan cookie Secure secara sengaja.

Jangan memakai Supabase service_role key sebagai koneksi runtime. Jangan menaruh kredensial database, session secret, atau service-role key di kode frontend.

## Menjalankan di Windows PowerShell

Dari folder root repository:

~~~powershell
cd server
Copy-Item .env.example .env
npm install
~~~

Edit .env:
- Isi DATABASE_URL dengan koneksi role runtime aplikasi.
- Isi MIGRATION_DATABASE_URL dengan koneksi admin PostgreSQL untuk migrasi.
- Untuk Supabase, set DATABASE_SSL=true.
- Buat SESSION_SECRET acak minimal 32 karakter.
- Pastikan FRONTEND_ORIGIN cocok persis dengan alamat frontend.

Jalankan migrasi terlebih dahulu menggunakan MIGRATION_DATABASE_URL:

~~~powershell
npm run migrate
~~~

Setelah role runtime dibuat dan DATABASE_URL diarahkan ke role tersebut (lihat bagian berikut), jalankan API:

~~~powershell
npm run dev
~~~

API berjalan di http://localhost:3000. Health check: GET /api/health.

## Role PostgreSQL runtime (Supabase)

Setelah migrasi dijalankan dengan koneksi admin, buat role aplikasi dari SQL Editor Supabase menggunakan password kuat yang hanya disimpan di secret/environment:

~~~sql
CREATE ROLE padisehat_app LOGIN PASSWORD 'GANTI_DENGAN_PASSWORD_UNIK' NOBYPASSRLS;

GRANT CONNECT ON DATABASE postgres TO padisehat_app;
GRANT USAGE ON SCHEMA public TO padisehat_app;
GRANT SELECT, INSERT ON users TO padisehat_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO padisehat_app;
GRANT SELECT, INSERT ON audit_logs TO padisehat_app;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO padisehat_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO padisehat_app;
~~~

Gunakan user padisehat_app pada DATABASE_URL. Pertahankan MIGRATION_DATABASE_URL sebagai koneksi admin. Jangan berikan koneksi admin kepada proses API.

Untuk PostgreSQL lokal, lakukan pemberian role/grant setara. Bila menjalankan API dengan role pemilik tabel atau superuser, RLS tidak menjadi batas keamanan efektif; gunakan role runtime terpisah.

## Membuat akun pemilik toko pertama

Registrasi publik selalu membuat role customer. Tidak ada endpoint publik untuk menaikkan hak akses. Setelah akun pemilik toko dibuat melalui registrasi, jalankan perintah berikut dari koneksi admin:

~~~sql
UPDATE users
SET role = 'store_owner', updated_at = now()
WHERE email = lower('EMAIL_OWNER_YANG_SUDAH_DIDAFTARKAN');
~~~

Ganti email dengan email akun yang benar. Jangan mengirim role melalui payload registrasi.

## Endpoint tahap 1

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | /api/health | Publik | Memeriksa API dan koneksi DB |
| GET | /api/auth/csrf | Publik | Membuat token CSRF dan sesi anonim |
| POST | /api/auth/register | Publik + CSRF | Registrasi customer |
| POST | /api/auth/login | Publik + CSRF | Login email/password |
| GET | /api/auth/me | Login | Profil dari sesi aktif |
| POST | /api/auth/logout | CSRF | Menghapus sesi |
| GET | /api/products | Publik | Katalog aktif, pencarian, filter, sorting, pagination |
| GET | /api/products/:id | Publik | Detail produk aktif |
| GET | /api/admin/products | Owner/admin | Produk milik pengguna aktif |
| POST | /api/admin/products | Owner/admin | Tambah produk |
| PATCH | /api/admin/products/:id | Owner/admin | Ubah produk milik sendiri |
| DELETE | /api/admin/products/:id | Owner/admin | Arsipkan produk milik sendiri (soft delete) |

### Contoh alur request browser

1. GET /api/auth/csrf dengan credentials: 'include'; simpan csrfToken di memori aplikasi.
2. POST /api/auth/register atau POST /api/auth/login dengan cookie sesi dan header X-CSRF-Token.
3. Login/registrasi mengembalikan token CSRF baru karena sesi diregenerasi; ganti token lama.
4. Semua request POST, PATCH, dan DELETE harus menyertakan cookie, Origin frontend yang tepat, dan X-CSRF-Token.
5. Panggil GET /api/auth/me untuk memulihkan status login setelah refresh.

Jangan simpan session ID atau token CSRF di localStorage. Cookie sesi dikelola browser dengan atribut HttpOnly.

## Tes

~~~powershell
npm test
~~~

Tes yang tersedia memeriksa validasi registrasi, kecocokan password-konfirmasi, login, dan validasi payload produk. Tes ini tidak menggantikan tes integrasi dengan PostgreSQL dan browser.

## Catatan keamanan dan batasan saat ini

- Password di-hash dengan Argon2id; password asli dan konfirmasi password tidak dicatat.
- Session ID dibuat ulang setelah login/registrasi untuk mengurangi session fixation.
- Cookie tidak dapat dibaca JavaScript (HttpOnly); Secure aktif saat production.
- Request mutasi wajib melewati Origin check dan token CSRF.
- Login/registrasi dibatasi 10 percobaan per 15 menit per proses. Untuk multi-instance, ganti memory store rate limit dengan shared store.
- Semua query CRUD produk menggunakan owner_id dari sesi dan mengembalikan 404 untuk ID milik pengguna lain.
- Registrasi tidak dapat menentukan role. Promosi owner dilakukan manual oleh admin database.
- imageUrl pada tahap ini hanya menerima placeholder SVG lokal. Data URL/Base64 dari localStorage sengaja ditolak API.
- Supabase Storage belum diaktifkan karena URL project, bucket, dan kredensial server-side belum tersedia. Jangan menambahkan service-role key ke frontend.
- API belum dipakai frontend; dashboard lama tetap menggunakan localStorage. Jangan menghapus data lokal sampai proses ekspor, import, rekonsiliasi, dan verifikasi migrasi diselesaikan.
- Belum ada tabel pesanan/pembayaran. Jangan tampilkan status pembayaran atau instruksi transfer seolah-olah transaksi nyata sudah berjalan.

## Langkah berikutnya

1. Isi environment dan siapkan role runtime PostgreSQL.
2. Jalankan migrasi, tes, lalu uji endpoint dengan database staging.
3. Buat akun owner dan uji isolasi dua akun owner berbeda.
4. Integrasikan frontend secara bertahap dengan fallback/read-only yang aman; ekspor data localStorage sebelum migrasi.
5. Implementasikan upload Supabase Storage setelah konfigurasi bucket tersedia.
6. Tambahkan tabel pesanan, item pesanan, bukti transfer, dan alur verifikasi owner sebelum mengaktifkan pembayaran transfer.
