import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Store, ChevronDown, Home, ClipboardList, Heart, UserCircle, Repeat } from 'lucide-react'
import { StoreSetupModal } from '@/components/ui/StoreSetupModal'
import { useAuth } from '@/context/AuthContext'

export function UserMenu({ minimal = false }: { minimal?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  async function handleSwitchAccount() {
    setOpen(false)
    await logout()
    navigate('/login')
  }

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null
  const initial = user.name.trim().charAt(0).toUpperCase()

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-paper-surface dark:hover:bg-paper-dark-surface"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald text-xs font-semibold text-white dark:bg-gold dark:text-ink">
            {initial}
          </span>
          <span className="text-sm text-ink/80 dark:text-paper-surface/80">{user.name.split(' ')[0]}</span>
          <ChevronDown size={14} className={`text-ink/40 transition-transform dark:text-paper-surface/40 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-ink/10 bg-paper py-1.5 shadow-xl dark:border-paper-surface/10 dark:bg-paper-dark-surface"
          >
            <div className="px-3.5 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-ink/50 dark:text-paper-surface/50">{user.email}</p>
            </div>
            <div className="my-1 border-t border-ink/10 dark:border-paper-surface/10" />

            {minimal ? (
              <button
                type="button"
                role="menuitem"
                onClick={handleSwitchAccount}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
              >
                <Repeat size={15} />
                Ganti Akun
              </button>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <Home size={15} />
                  Beranda
                </Link>
                <Link
                  to="/pesanan"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <ClipboardList size={15} />
                  Pesanan Saya
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <Heart size={15} />
                  Wishlist
                </Link>

                {user.storeName ? (
                  <Link
                    to="/toko"
                    onClick={() => setOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                  >
                    <Store size={15} />
                    Toko Saya
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setOpen(false)
                      setSetupOpen(true)
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                  >
                    <Store size={15} />
                    Buka Toko
                  </button>
                )}

                <div className="my-1 border-t border-ink/10 dark:border-paper-surface/10" />

                <Link
                  to="/akun"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <UserCircle size={15} />
                  Akun Saya
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSwitchAccount}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <Repeat size={15} />
                  Ganti Akun
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark"
                >
                  <LogOut size={15} />
                  Keluar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {setupOpen && <StoreSetupModal onClose={() => setSetupOpen(false)} />}
    </>
  )
}

export function MobileUserMenu({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [setupOpen, setSetupOpen] = useState(false)
  if (!user) return null

  async function handleSwitchAccount() {
    onNavigate()
    await logout()
    navigate('/login')
  }

  return (
    <>
      <div className="flex items-center gap-2.5 px-2 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald text-xs font-semibold text-white dark:bg-gold dark:text-ink">
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-ink/50 dark:text-paper-surface/50">{user.email}</p>
        </div>
      </div>

      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <Home size={16} />
        Beranda
      </Link>
      <Link
        to="/pesanan"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <ClipboardList size={16} />
        Pesanan Saya
      </Link>
      <Link
        to="/wishlist"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <Heart size={16} />
        Wishlist
      </Link>

      {user.storeName ? (
        <Link
          to="/toko"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
        >
          <Store size={16} />
          Toko Saya
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setSetupOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-3 text-left text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
        >
          <Store size={16} />
          Buka Toko
        </button>
      )}

      <Link
        to="/akun"
        onClick={onNavigate}
        className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <UserCircle size={16} />
        Akun Saya
      </Link>

      <button
        type="button"
        onClick={handleSwitchAccount}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-3 text-left text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <Repeat size={16} />
        Ganti Akun
      </button>

      <button
        type="button"
        onClick={() => {
          logout()
          onNavigate()
        }}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-3 text-left text-base text-ink/80 hover:bg-paper-surface dark:text-paper-surface/80 dark:hover:bg-paper-dark-surface"
      >
        <LogOut size={16} />
        Keluar
      </button>

      {setupOpen && <StoreSetupModal onClose={() => setSetupOpen(false)} />}
    </>
  )
}
