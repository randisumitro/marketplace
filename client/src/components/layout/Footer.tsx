import { Link } from 'react-router-dom'
import { BukaTokoCTA } from '@/components/ui/BukaTokoCTA'

// Cuma link ke halaman yang benar-benar ada — jangan janjikan fitur yang belum dibangun.
const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Belanja',
    links: [
      { label: 'Semua Produk', to: '/produk' },
      { label: 'Kategori', to: '/#kategori' },
      { label: 'Pesanan Saya', to: '/pesanan' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'Ketentuan Layanan', to: '/ketentuan-layanan' },
      { label: 'Kebijakan Privasi', to: '/kebijakan-privasi' },
      { label: 'Akun & Keamanan', to: '/akun' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [{ label: 'Tentang OneShop', to: '/tentang' }],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-ink/10 dark:border-paper-surface/10">
      <div className="container-content grid grid-cols-2 gap-10 py-16 sm:grid-cols-4 lg:py-20">
        <div className="col-span-2">
          <p className="font-display text-xl font-medium">OneShop</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60 dark:text-paper-surface/60">
            Satu marketplace untuk toko-toko independen di Indonesia — belanja aman, jualan tanpa ribet.
          </p>
          <div className="mt-4">
            <BukaTokoCTA className="text-sm font-semibold text-emerald hover:underline dark:text-gold">
              Buka toko →
            </BukaTokoCTA>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink/60 transition-colors hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container-content flex flex-col gap-4 border-t border-ink/10 py-6 text-xs text-ink/50 sm:flex-row sm:items-center sm:justify-between dark:border-paper-surface/10 dark:text-paper-surface/50">
        <p>© {new Date().getFullYear()} OneShop. Seluruh hak cipta dilindungi.</p>
        <p>Copyright © Fransco Immanuel G. Siahaan — dibangun dengan React, TypeScript &amp; GSAP.</p>
      </div>
    </footer>
  )
}
