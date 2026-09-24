import { Button } from '@/components/ui/Button'
import { ArrowUpRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-content flex flex-col items-start justify-between gap-8 rounded-3xl border border-ink/10 bg-paper-surface p-10 sm:flex-row sm:items-center sm:p-14 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
        <div>
          <h2 className="max-w-md font-display text-3xl font-light leading-tight sm:text-4xl">
            Mulai belanja atau buka toko hari ini
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink/65 sm:text-base dark:text-paper-surface/65">
            Gratis untuk pembeli, tanpa biaya pendaftaran untuk penjual. Tidak perlu kartu kredit.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <a href="#kategori">
            <Button variant="primary">
              Mulai Belanja
              <ArrowUpRight size={16} />
            </Button>
          </a>
          <a href="#jual">
            <Button variant="ghost">Pelajari untuk Penjual</Button>
          </a>
        </div>
      </div>
    </section>
  )
}
