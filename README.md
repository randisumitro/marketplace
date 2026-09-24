# OneShop Marketplace

OneShop adalah platform *e-commerce* (marketplace) modern dengan antarmuka yang dinamis dan fitur yang komprehensif, mendukung peran ganda sebagai pembeli dan penjual. Proyek ini dibangun dari awal menggunakan arsitektur modern untuk memastikan performa yang cepat, aman, dan dapat diskalakan.

## 🚀 Teknologi Utama

Proyek ini dipisahkan menjadi dua bagian utama (Frontend dan Backend):

**Frontend (Client)**
- React.js & Vite
- TypeScript
- Tailwind CSS untuk *styling*
- GSAP untuk animasi antarmuka yang premium

**Backend (Server)**
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose (Basis Data)
- JWT untuk autentikasi

## ✨ Fitur Utama

- **Sistem Autentikasi Kuat**: Register, login, reset password via email, dan integrasi Google OAuth. Tersedia juga verifikasi nomor HP menggunakan Twilio OTP.
- **Multi-Role (Pembeli & Penjual)**: Pengguna dapat berbelanja maupun membuka toko. Registrasi toko dilakukan terpisah dengan pengecekan nama toko secara *real-time*.
- **Dashboard Penjual (Seller Center)**: Panel khusus untuk mengelola toko, produk (CRUD), pesanan, dan pengaturan toko.
- **Manajemen Produk & Media**: Katalog produk, pencarian tingkat lanjut, dan unggah gambar yang terintegrasi dengan Cloudinary.
- **Alur Belanja Lengkap**: Mulai dari keranjang belanja (*cart*), *wishlist*, *checkout*, perhitungan ongkos kirim, hingga manajemen pesanan (termasuk pembatalan oleh pembeli).
- **Pembayaran Terintegrasi**: Mendukung *payment gateway* menggunakan Midtrans Snap.
- **Sistem Ulasan & Rating**: Fitur ulasan produk yang hanya bisa dilakukan setelah pembelian berhasil diverifikasi.
- **Notifikasi & Otomatisasi**: Notifikasi *in-app* dan email, serta *cron job* terjadwal untuk menyelesaikan pesanan secara otomatis setelah batas waktu tertentu.
- **UI/UX Premium**: Dukungan *Light/Dark/System Theme* dengan animasi transisi halaman menggunakan GSAP.

## 📁 Struktur Proyek

```text
oneshop-v2/
├── client/     # Kode sumber Frontend (React + Vite) -> Siap di-deploy ke Vercel/Netlify
└── server/     # Kode sumber Backend (Express API)   -> Siap di-deploy ke Railway/Render
```
*Catatan: Setiap folder bersifat independen dengan `package.json` dan konfigurasinya masing-masing.*

## 🛠️ Instalasi & Menjalankan Secara Lokal

Pastikan Anda sudah menginstal **Node.js** dan memiliki akses ke **MongoDB**.

### 1. Menjalankan Backend (Server)

```bash
cd server
npm install
```
- Buat file `.env` di dalam folder `server` (lihat `.env.example` jika tersedia).
- Konfigurasikan variabel lingkungan seperti `MONGO_URI`, rahasia JWT, API keys untuk Cloudinary, Twilio, Midtrans, dll.
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5000` (atau port sesuai `.env`).

### 2. Menjalankan Frontend (Client)

Buka terminal baru:
```bash
cd client
npm install
```
- Buat file `.env` di dalam folder `client`.
- Konfigurasikan `VITE_API_URL` agar mengarah ke backend lokal Anda (misal: `http://localhost:5000`).
```bash
npm run dev
```
Buka `http://localhost:5173` di peramban Anda untuk melihat aplikasi.

## 🛡️ Pengujian (Testing)
Aplikasi ini dilengkapi dengan pengujian otomatis (*automated testing*) menggunakan **Vitest** untuk alur kritikal seperti autentikasi, *checkout*, dan perubahan status pesanan.
