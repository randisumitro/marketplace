import { useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '@/lib/gsap'
import { CATEGORIES } from '@/lib/categories'

// Digandakan supaya loop-nya tersambung mulus tanpa jeda/lompatan
const LOOPED = [...CATEGORIES, ...CATEGORIES]

export function CategoryShowcase() {
  const trackRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const loopWidth = track.scrollWidth / 2
    const tween = gsap.to(track, {
      x: -loopWidth,
      duration: Math.max(loopWidth / 42, 16),
      ease: 'none',
      repeat: -1,
    })

    const pause = () => tween.pause()
    const resume = () => tween.play()
    track.addEventListener('mouseenter', pause)
    track.addEventListener('mouseleave', resume)
    track.addEventListener('touchstart', pause, { passive: true })
    track.addEventListener('touchend', resume)

    return () => {
      tween.kill()
      track.removeEventListener('mouseenter', pause)
      track.removeEventListener('mouseleave', resume)
      track.removeEventListener('touchstart', pause)
      track.removeEventListener('touchend', resume)
    }
  }, [])

  return (
    <section id="kategori" className="py-20 sm:py-28">
      <div className="container-content flex items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-emerald dark:text-gold">Jelajahi</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-light leading-tight sm:text-4xl">
            Kategori Produk
          </h2>
        </div>
        <p className="hidden max-w-xs text-sm text-ink/60 sm:block dark:text-paper-surface/60">
          Setiap toko sudah melalui proses verifikasi sebelum bisa berjualan.
        </p>
      </div>

      <div className="edge-fade mt-10 overflow-hidden">
        <div ref={trackRef} className="flex w-max gap-4 px-6 sm:px-8 lg:px-10">
          {LOOPED.map((cat, i) => (
            <Link
              to={`/produk?kategori=${encodeURIComponent(cat)}`}
              key={`${cat}-${i}`}
              className="flex h-52 w-48 shrink-0 flex-col justify-between rounded-2xl border border-ink/10 bg-paper-surface p-6 transition-colors hover:border-emerald sm:h-56 sm:w-56 dark:border-paper-surface/10 dark:bg-paper-dark-surface dark:hover:border-gold"
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald to-emerald-deep" />
              <p className="font-display text-lg leading-snug">{cat}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
