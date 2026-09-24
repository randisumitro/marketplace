import { useLayoutEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

const REASONS = [
  {
    index: 'Pembayaran ditahan',
    title: 'Uangmu aman sampai barang diterima',
    body: 'Dana pembeli kami tahan dulu di sistem OneShop dan baru diteruskan ke penjual setelah barang dikonfirmasi diterima — bukan janji, tapi mekanisme.',
  },
  {
    index: 'Satu akun, semua toko',
    title: 'Tidak perlu daftar ulang di setiap toko',
    body: 'Satu akun OneShop untuk belanja di ribuan toko independen. Riwayat pesanan, wishlist, dan alamat tersimpan rapi di satu tempat.',
  },
  {
    index: 'Untuk penjual',
    title: 'Buka toko dalam 5 menit, tanpa biaya di muka',
    body: 'Cukup verifikasi nomor HP, unggah produk pertamamu, dan toko langsung tayang. Kami hanya ambil komisi saat kamu benar-benar terjual.',
  },
]

export function WhyOneShop() {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.reason-row')
      rows.forEach((row) => {
        gsap.from(row, {
          scrollTrigger: { trigger: row, start: 'top 82%', once: true },
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: 'power2.out',
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="kenapa-oneshop" ref={rootRef} className="py-20 sm:py-28">
      <div className="container-content">
        <h2 className="max-w-xl font-display text-3xl font-light leading-tight sm:text-4xl">
          Kenapa jutaan orang memilih berbelanja lewat OneShop
        </h2>

        <div className="mt-14 divide-y divide-ink/10 dark:divide-paper-surface/10">
          {REASONS.map((reason) => (
            <div key={reason.title} className="reason-row grid grid-cols-1 gap-4 py-10 lg:grid-cols-[200px_1fr_1fr] lg:gap-10">
              <p className="text-sm font-medium text-emerald dark:text-gold">{reason.index}</p>
              <h3 className="font-display text-2xl font-light leading-snug sm:text-[1.7rem]">{reason.title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-ink/65 sm:text-base dark:text-paper-surface/65">
                {reason.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
