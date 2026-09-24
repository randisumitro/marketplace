import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShoppingBag, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { UserMenu, MobileUserMenu } from '@/components/layout/UserMenu'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

function CartLink() {
  const { itemCount } = useCart()
  return (
    <Link to="/keranjang" className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:bg-paper-surface dark:text-paper-surface/70 dark:hover:bg-paper-dark-surface">
      <ShoppingBag size={18} />
      {itemCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald px-1 text-[10px] font-semibold text-white dark:bg-gold dark:text-ink">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}

const NAV_LINKS = [
  { href: '#kategori', label: 'Kategori' },
  { href: '#kenapa-oneshop', label: 'Kenapa OneShop' },
  { href: '#jual', label: 'Untuk Penjual' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-md dark:border-paper-surface/10 dark:bg-paper-dark/85'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-content flex h-16 items-center justify-between sm:h-20">
        <Link to="/" className="font-display text-xl font-medium tracking-tight sm:text-2xl">
          OneShop
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-ink/70 transition-colors hover:text-ink dark:text-paper-surface/70 dark:hover:text-paper-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/produk"
            aria-label="Cari produk"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/70 hover:bg-paper-surface dark:text-paper-surface/70 dark:hover:bg-paper-dark-surface"
          >
            <Search size={17} />
          </Link>
          <ThemeToggle />
          {isLoggedIn && <NotificationBell />}
          {isLoggedIn && <CartLink />}
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link to="/login">
              <Button variant="primary" className="!py-2.5">
                Masuk
              </Button>
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden dark:text-paper-surface"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink/10 bg-paper px-6 pb-6 pt-2 lg:hidden dark:border-paper-surface/10 dark:bg-paper-dark">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-ink/10 pt-4 dark:border-paper-surface/10">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {isLoggedIn && <NotificationBell />}
              {isLoggedIn && <CartLink />}
            </div>
            {!isLoggedIn && (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" className="!py-2.5">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
          {isLoggedIn && (
            <div className="mt-4 border-t border-ink/10 pt-4 dark:border-paper-surface/10">
              <MobileUserMenu onNavigate={() => setMobileOpen(false)} />
            </div>
          )}
        </div>
      )}
    </header>
  )
}
