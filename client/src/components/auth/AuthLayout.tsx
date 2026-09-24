import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  const formPanelRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-reveal', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
      })
    }, formPanelRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Panel bermerek — selalu gelap, terlepas dari tema, untuk kontras visual yang konsisten */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex">
        <Link to="/" className="font-display text-2xl font-medium">
          OneShop
        </Link>

        <div className="max-w-sm">
          <p className="text-sm font-medium text-gold">{eyebrow}</p>
          <p className="mt-4 font-display text-3xl font-light leading-snug">{title}</p>
          <p className="mt-4 text-sm leading-relaxed text-paper/60">{subtitle}</p>
        </div>

        <p className="text-xs text-paper/40">© {new Date().getFullYear()} OneShop</p>

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      </div>

      {/* Panel form */}
      <div ref={formPanelRef} className="flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="auth-reveal flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface"
          >
            <ArrowLeft size={15} />
            Kembali
          </Link>
          <div className="auth-reveal">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="auth-reveal lg:hidden">
            <p className="font-display text-xl font-medium">OneShop</p>
          </div>
          <h1 className="auth-reveal mt-8 font-display text-3xl font-light lg:mt-0">{title}</h1>
          <p className="auth-reveal mt-2 text-sm text-ink/60 dark:text-paper-surface/60">{subtitle}</p>

          <div className="auth-reveal mt-8">{children}</div>
        </div>

        <div className="auth-reveal space-y-1.5 text-center text-xs text-ink/50 dark:text-paper-surface/50">
          {footer}
        </div>
      </div>
    </div>
  )
}
