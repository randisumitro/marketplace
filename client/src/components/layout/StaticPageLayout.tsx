import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export function StaticPageLayout({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-content max-w-2xl pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">{title}</h1>
        {updated && <p className="mt-1 text-xs text-ink/45 dark:text-paper-surface/45">Terakhir diperbarui: {updated}</p>}
        <div className="prose-content mt-8 space-y-5 text-sm leading-relaxed text-ink/75 dark:text-paper-surface/75">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
