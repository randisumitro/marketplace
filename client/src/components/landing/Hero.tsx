import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { buttonClasses } from '@/components/ui/Button'
import { BukaTokoCTA } from '@/components/ui/BukaTokoCTA'
import { ArrowUpRight } from 'lucide-react'

const FLOATING_CARDS = [
  { label: 'Fashion Lokal', value: '2.4k toko', rotate: -6, top: '4%', left: '2%' },
  { label: 'Elektronik', value: '890 toko', rotate: 4, top: '30%', left: '46%' },
  { label: 'Kecantikan', value: '1.1k toko', rotate: -3, top: '60%', left: '12%' },
  { label: 'Rumah & Hidup', value: '760 toko', rotate: 5, top: '2%', left: '54%' },
]

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.from('.hero-eyebrow', { opacity: 0, y: 12, duration: 0.6 })
        .from('.hero-line', { opacity: 0, y: '100%', duration: 0.9, stagger: 0.1 }, '-=0.3')
        .from('.hero-sub', { opacity: 0, y: 16, duration: 0.7 }, '-=0.5')
        .from('.hero-cta', { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, '-=0.45')
        .from(
          '.hero-card',
          { opacity: 0, y: 28, scale: 0.94, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)' },
          '-=0.7',
        )

      // Subtle perpetual float on the composition — the one continuous motion we allow
      gsap.to('.hero-card', {
        y: '+=10',
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: { each: 0.4, from: 'random' },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={rootRef} className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="container-content grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div>
          <p className="hero-eyebrow text-sm font-medium text-emerald dark:text-gold">
            Marketplace multi-toko Indonesia
          </p>

          <h1 className="mt-5 font-display text-[2.75rem] font-light leading-[1.02] tracking-tight xs:text-5xl sm:text-6xl lg:text-[4.4rem] lg:leading-[0.98]">
            <span className="block overflow-hidden">
              <span className="hero-line block">Satu tempat.</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block italic text-emerald dark:text-gold">Ribuan toko,</span>
            </span>
            <span className="block overflow-hidden">
              <span className="hero-line block">nyata milikmu.</span>
            </span>
          </h1>

          <p className="hero-sub mt-7 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg dark:text-paper-surface/70">
            OneShop menghubungkan kamu langsung dengan toko independen terverifikasi —
            atau buka tokomu sendiri dalam hitungan menit, tanpa biaya tersembunyi.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#kategori" className={buttonClasses('primary', 'hero-cta')}>
              Mulai Belanja
              <ArrowUpRight size={16} />
            </a>
            <BukaTokoCTA className={buttonClasses('ghost', 'hero-cta')}>Buka Toko Gratis</BukaTokoCTA>
          </div>
        </div>

        <div className="relative h-[380px] sm:h-[440px] lg:h-[520px]">
          {FLOATING_CARDS.map((card) => (
            <div
              key={card.label}
              className="hero-card absolute w-32 rounded-2xl border border-ink/10 bg-paper-surface/90 p-3.5 shadow-[0_20px_45px_-15px_rgba(20,22,26,0.25)] backdrop-blur-sm dark:border-paper-surface/10 dark:bg-paper-dark-surface/90 xs:w-36 sm:w-48 sm:p-4"
              style={{ top: card.top, left: card.left, transform: `rotate(${card.rotate}deg)` }}
            >
              <div className="mb-3 h-16 w-full rounded-lg bg-gradient-to-br from-emerald/25 via-emerald/10 to-gold/20" />
              <p className="text-xs font-semibold">{card.label}</p>
              <p className="mt-0.5 text-xs text-ink/50 dark:text-paper-surface/50">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
