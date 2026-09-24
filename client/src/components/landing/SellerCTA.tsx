import { buttonClasses } from '@/components/ui/Button'
import { BukaTokoCTA } from '@/components/ui/BukaTokoCTA'
import { ArrowUpRight } from 'lucide-react'

const POINTS = [
  'Verifikasi toko rata-rata selesai dalam 10 menit',
  'Tanpa biaya pendaftaran atau biaya bulanan',
  'Dashboard penjualan, stok, dan pesanan dalam satu layar',
]

export function SellerCTA() {
  return (
    <section id="jual" className="bg-ink py-20 text-paper sm:py-28 dark:bg-paper-dark-surface">
      <div className="container-content grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div>
          <p className="text-sm font-medium text-gold">Untuk penjual</p>
          <h2 className="mt-4 max-w-md font-display text-3xl font-light leading-tight sm:text-4xl">
            Toko fisikmu sudah bagus. Saatnya toko digitalmu sama bagusnya.
          </h2>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-paper/65 sm:text-base">
            Kami urus infrastruktur, pembayaran, dan kepercayaan pembeli — kamu fokus ke produk.
          </p>
          <BukaTokoCTA className={buttonClasses('inverse', 'mt-8')}>
            Buka Toko Sekarang
            <ArrowUpRight size={16} />
          </BukaTokoCTA>
        </div>

        <ul className="space-y-0 divide-y divide-paper/10">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-4 py-6 first:pt-0">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="text-sm leading-relaxed text-paper/80 sm:text-base">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
