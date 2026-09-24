import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export function AboutPage() {
  return (
    <StaticPageLayout title="Tentang OneShop">
      <p>
        OneShop adalah marketplace multi-toko yang menghubungkan pembeli dengan toko-toko independen dalam satu
        platform — belanja dari banyak toko dengan satu akun, dan buka toko sendiri tanpa biaya pendaftaran.
      </p>

      <p>
        Situs ini dibangun sebagai proyek portofolio pengembangan web full-stack oleh{' '}
        <span className="font-medium text-ink dark:text-paper-surface">Fransco Immanuel G. Siahaan</span>, memakai
        React, TypeScript, Tailwind CSS, dan GSAP di sisi frontend, serta Express, MongoDB, dan Cloudinary di sisi
        backend.
      </p>

      <p>
        Karena ini proyek portofolio, kami memilih untuk jujur soal statusnya: OneShop baru saja diluncurkan,
        belum punya riwayat transaksi atau ribuan pengguna. Yang kamu lihat di sini adalah fitur yang benar-benar
        berfungsi — bukan angka atau testimoni rekaan.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">Yang sudah berjalan</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Registrasi, login, dan satu akun untuk peran pembeli maupun penjual</li>
        <li>Katalog produk sungguhan dengan pencarian dan filter kategori</li>
        <li>Keranjang, checkout, dan pesanan yang tersimpan di database</li>
        <li>Dashboard toko untuk kelola produk dan pesanan</li>
        <li>Notifikasi, ulasan produk, dan manajemen sesi login</li>
      </ul>
    </StaticPageLayout>
  )
}
