# OneShop v2

Rewrite OneShop dari HTML/CSS/JS vanilla ke **React + TypeScript + Tailwind + GSAP** (frontend)
dan **Express + TypeScript + MongoDB** (backend). Proyek ini dikerjakan bertahap — lihat
[Roadmap](#roadmap) di bagian bawah untuk tahu kita sudah sampai mana dan apa selanjutnya.

## Struktur proyek

```
oneshop-v2/
├── client/     React + TypeScript + Vite + Tailwind CSS + GSAP → deploy ke Vercel
└── server/     Express + TypeScript + Mongoose            → deploy ke Railway
```

Kedua folder ini independen — masing-masing punya `package.json`, `node_modules`, dan proses
deploy sendiri. Frontend memanggil backend lewat URL yang diatur di environment variable.

## Status saat ini

✅ Struktur proyek & tooling (Vite, Tailwind, TypeScript, GSAP) — selesai
✅ Landing page premium (tema Light/Dark/System, animasi GSAP) — selesai
✅ Backend scaffold (Express + Mongoose, health check, siap konek Atlas) — selesai
✅ Auth (register, login, JWT, ganti password) + halaman Login/Register React — selesai
✅ Dua peran: Pembeli & Penjual Toko (registrasi toko terpisah, cek nama toko real-time) — selesai
✅ Dashboard toko (sidebar, Beranda/Produk/Pesanan/Pengaturan) — selesai
✅ Produk sungguhan: model, CRUD, upload gambar (Cloudinary), katalog, halaman detail — selesai
✅ Keranjang, wishlist, checkout, pesanan (pembeli & penjual) — selesai
✅ Notifikasi (in-app + email), Akun Saya, manajemen sesi login — selesai
✅ Ulasan produk (rating + komentar, hanya dari pembelian sungguhan) — selesai
✅ Pencarian produk, halaman toko publik, ongkos kirim, pembatalan pesanan oleh pembeli — selesai
✅ Reset password lewat email, halaman Ketentuan Layanan/Kebijakan Privasi/Tentang — selesai
✅ Automated tests (Vitest) untuk alur auth, checkout, dan aturan status pesanan — selesai
✅ Google OAuth login — selesai (opsional, jalan otomatis kalau `GOOGLE_CLIENT_ID` diisi)
✅ Payment gateway sungguhan (Midtrans Snap) — selesai, lihat catatan penting di bawah
✅ Verifikasi nomor HP dengan OTP sungguhan (Twilio Verify) — selesai
✅ Auto-selesai pesanan lewat cron job terjadwal (bukan cuma dicek saat halaman dibuka) — selesai
