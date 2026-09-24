import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutGrid, Package, ClipboardList, Settings2, Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserMenu } from '@/components/layout/UserMenu'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { to: '/toko', label: 'Beranda', icon: LayoutGrid, exact: true },
  { to: '/toko/produk', label: 'Produk', icon: Package },
  { to: '/toko/pesanan', label: 'Pesanan', icon: ClipboardList },
  { to: '/toko/gudang', label: 'Gudang', icon: Package },
  { to: '/toko/pengaturan', label: 'Pengaturan', icon: Settings2 },
]

export function SellerLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (!user?.storeName) {
      navigate('/', { replace: true })
    }
  }, [isLoading, isLoggedIn, user, navigate, location.pathname])

  if (isLoading || !user?.storeName) {
    return null
  }

  return (
    <div className="min-h-screen bg-paper-surface dark:bg-paper-dark">
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-md dark:border-paper-surface/10 dark:bg-paper-dark-surface/90">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink/70 hover:bg-paper-surface lg:hidden dark:text-paper-surface/70 dark:hover:bg-paper-dark"
              aria-label="Buka menu dashboard"
            >
              <Menu size={19} />
            </button>
            <Link to="/" className="font-display text-lg font-medium tracking-tight">
              OneShop
            </Link>
            <span className="hidden text-ink/30 sm:inline dark:text-paper-surface/30">/</span>
            <span className="hidden text-sm text-ink/55 sm:inline dark:text-paper-surface/55">Dashboard Toko</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <UserMenu minimal />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 border-r border-ink/10 p-4 lg:block dark:border-paper-surface/10">
          <SidebarNav pathname={location.pathname} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setMobileNavOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm dark:bg-black/60"
            />
            <aside className="absolute left-0 top-0 h-full w-64 bg-paper p-4 pt-20 shadow-2xl dark:bg-paper-dark-surface">
              <SidebarNav pathname={location.pathname} onNavigate={() => setMobileNavOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  )
}

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              active
                ? 'bg-emerald/10 font-medium text-emerald dark:bg-gold/10 dark:text-gold'
                : 'text-ink/65 hover:bg-paper-surface dark:text-paper-surface/65 dark:hover:bg-paper-dark'
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
