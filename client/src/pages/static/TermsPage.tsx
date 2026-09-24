import { StaticPageLayout } from '@/components/layout/StaticPageLayout'

export function TermsPage() {
  return (
    <StaticPageLayout title="Ketentuan Layanan" updated="September 2026">
      <p>
        Dengan mendaftar dan menggunakan OneShop, kamu setuju dengan ketentuan berikut. Kalau ada bagian yang
        tidak kamu setujui, sebaiknya jangan gunakan layanan ini.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">1. Akun</h2>
      <p>
        Satu akun mewakili satu orang atau satu toko. Kamu bertanggung jawab menjaga kerahasiaan password dan
        semua aktivitas yang terjadi lewat akunmu. Informasi yang kamu daftarkan (nama, email, nomor HP) harus
        akurat.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">2. Untuk Penjual</h2>
      <p>
        Penjual bertanggung jawab penuh atas keakuratan informasi produk (foto, harga, stok, deskripsi) dan atas
        pengiriman barang sesuai pesanan. OneShop adalah platform yang mempertemukan penjual dan pembeli — bukan
        pihak yang menjual barang secara langsung.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">3. Pembayaran & Pesanan</h2>
      <p>
        Saat ini pembayaran dilakukan lewat transfer manual di luar sistem, dikonfirmasi oleh penjual masing-masing.
        Pesanan dianggap selesai setelah pembeli mengonfirmasi penerimaan barang, atau otomatis setelah 24 jam
        sejak status "Dikirim" tanpa konfirmasi.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">4. Pembatalan</h2>
      <p>
        Pembeli bisa membatalkan pesanan selama masih berstatus "Menunggu Konfirmasi". Setelah penjual memproses
        pesanan, pembatalan hanya bisa dilakukan lewat kesepakatan langsung dengan penjual.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">5. Konten & Ulasan</h2>
      <p>
        Ulasan produk hanya bisa ditulis oleh pembeli yang pesanannya sudah berstatus selesai. Konten yang
        mengandung kebohongan, pelecehan, atau spam dapat dihapus.
      </p>

      <h2 className="font-display text-lg font-medium text-ink dark:text-paper-surface">6. Perubahan Ketentuan</h2>
      <p>
        Ketentuan ini bisa berubah seiring bertambahnya fitur. Perubahan signifikan akan diinformasikan lewat
        platform.
      </p>

      <p className="pt-2 text-xs text-ink/50 dark:text-paper-surface/50">
        Catatan: OneShop adalah proyek portofolio pengembangan web. Halaman ini ditulis agar mencerminkan fitur
        yang sungguhan berjalan di platform ini, bukan teks generik yang disalin.
      </p>
    </StaticPageLayout>
  )
}
