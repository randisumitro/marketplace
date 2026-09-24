import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export function PrivacyPage() {
  return (
    <StaticPageLayout title="Kebijakan Privasi" updated="September 2026">
      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Data yang kami simpan</h2>
      <p>
        Saat kamu mendaftar: nama, email, dan password (dalam bentuk hash, bukan teks biasa — kami sendiri
        tidak bisa melihat password aslimu). Kalau kamu membuka toko: nama toko, deskripsi toko, dan nomor HP.
        Saat checkout: alamat pengiriman yang kamu masukkan.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Sesi login</h2>
      <p>
        Setiap kali kamu masuk, kami mencatat perangkat (jenis browser & sistem operasi, bukan lokasi presisi)
        dan alamat IP, supaya kamu bisa melihat dan mengelola sesi aktif lewat halaman Akun Saya.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Bagaimana data dipakai</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Menjalankan fitur inti: login, keranjang, checkout, pesanan</li>
        <li>Mengirim notifikasi terkait pesanan (di aplikasi dan lewat email)</li>
        <li>Menampilkan nama toko & produkmu ke pembeli lain (kalau kamu penjual)</li>
      </ul>
      <p>Kami tidak menjual data pengguna ke pihak ketiga mana pun.</p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Pihak ketiga yang terlibat</h2>
      <p>
        Foto produk disimpan lewat Cloudinary, database lewat MongoDB Atlas, dan email transaksional lewat
        Resend. Masing-masing hanya menerima data yang perlu untuk menjalankan fungsinya (foto untuk Cloudinary,
        data akun untuk Atlas, alamat email untuk Resend).
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Hak kamu</h2>
      <p>
        Kamu bisa mengubah data profil kapan saja lewat halaman Akun Saya, dan mengakhiri sesi login dari
        perangkat mana pun yang tidak kamu kenali.
      </p>

      <p className="pt-2 text-xs text-ink/50 dark:text-paper-surface/50">
        Catatan: OneShop adalah proyek portofolio. Halaman ini ditulis untuk mencerminkan data yang benar-benar
        dikumpulkan sistem ini, bukan teks generik.
      </p>
    </StaticPageLayout>
  )
}
