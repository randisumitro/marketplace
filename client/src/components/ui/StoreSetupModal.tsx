import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Store, Check, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { useScrollLock } from '@/hooks/useScrollLock'

interface StoreSetupModalProps {
  onClose: () => void
}

type Mode = 'register' | 'existing'
type NameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'too-short'

export function StoreSetupModal({ onClose }: StoreSetupModalProps) {
  const [mode, setMode] = useState<Mode>('register')
  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="store-setup-title" className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm dark:bg-black/60" />

      <div className="relative w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-7 shadow-2xl dark:border-paper-surface/10 dark:bg-paper-dark-surface">
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-paper-surface hover:text-ink dark:text-paper-surface/50 dark:hover:bg-paper-dark"
        >
          <X size={16} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald/10 text-emerald dark:bg-gold/10 dark:text-gold">
          <Store size={20} />
        </div>

        {/* Tab switcher */}
        <div className="mt-4 flex gap-5 border-b border-ink/10 dark:border-paper-surface/10">
          <button
            type="button"
            onClick={() => setMode('register')}
            id="store-setup-title"
            className={clsx(
              'relative pb-3 text-sm font-medium transition-colors',
              mode === 'register' ? 'text-ink dark:text-paper-surface' : 'text-ink/40 dark:text-paper-surface/40',
            )}
          >
            Daftar Toko
            {mode === 'register' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald dark:bg-gold" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={clsx(
              'relative pb-3 text-sm font-medium transition-colors',
              mode === 'existing' ? 'text-ink dark:text-paper-surface' : 'text-ink/40 dark:text-paper-surface/40',
            )}
          >
            Sudah Punya Toko
            {mode === 'existing' && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald dark:bg-gold" />
            )}
          </button>
        </div>

        {mode === 'register' ? <RegisterStoreForm onClose={onClose} /> : <ExistingStoreForm onClose={onClose} />}
      </div>
    </div>
  )
}

function RegisterStoreForm({ onClose }: { onClose: () => void }) {
  const { setupStore } = useAuth()
  const navigate = useNavigate()

  const [storeName, setStoreName] = useState('')
  const [phone, setPhone] = useState('')
  const [nameStatus, setNameStatus] = useState<NameStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (storeName.trim().length < 3) {
      setNameStatus(storeName.trim().length === 0 ? 'idle' : 'too-short')
      return
    }
    setNameStatus('checking')
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get<{ data: { available: boolean } }>(
          `/api/store/check-name?name=${encodeURIComponent(storeName.trim())}`,
        )
        setNameStatus(res.data.available ? 'available' : 'taken')
      } catch {
        setNameStatus('idle')
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [storeName])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (nameStatus !== 'available') return setError('Isi nama toko yang valid dan tersedia dulu')
    if (phone.trim().length < 10) return setError('Nomor HP minimal 10 digit')

    setIsSubmitting(true)
    try {
      await setupStore(storeName, phone)
      onClose()
      navigate('/toko')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal membuka toko. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <p className="mt-4 text-sm leading-relaxed text-ink/65 dark:text-paper-surface/65">
        Tidak perlu akun baru — nama dan email kamu sudah tersimpan. Lengkapi dua hal ini saja.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="setup-store-name" className="mb-1.5 block text-sm font-medium">
            Nama toko
          </label>
          <input
            id="setup-store-name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Toko Batik Lestari"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
          {nameStatus !== 'idle' && (
            <p
              className={clsx(
                'mt-1.5 flex items-center gap-1.5 text-xs',
                nameStatus === 'available' && 'text-emerald dark:text-gold',
                nameStatus === 'taken' && 'text-red-500 dark:text-red-400',
                (nameStatus === 'checking' || nameStatus === 'too-short') && 'text-ink/45 dark:text-paper-surface/45',
              )}
            >
              {nameStatus === 'checking' && <Loader2 size={12} className="animate-spin" />}
              {nameStatus === 'available' && <Check size={12} />}
              {nameStatus === 'taken' && <X size={12} />}
              {nameStatus === 'checking' && 'Mengecek ketersediaan...'}
              {nameStatus === 'available' && 'Nama toko tersedia'}
              {nameStatus === 'taken' && 'Nama toko sudah digunakan'}
              {nameStatus === 'too-short' && 'Minimal 3 karakter'}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="setup-phone" className="mb-1.5 block text-sm font-medium">
            Nomor HP
          </label>
          <input
            id="setup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08123456789"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Memproses...' : 'Buka Toko'}
        </Button>
      </form>
    </>
  )
}

function ExistingStoreForm({ onClose }: { onClose: () => void }) {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) return setError('Email dan password wajib diisi')

    setIsSubmitting(true)
    try {
      const account = await login(email, password)
      onClose()
      navigate(account.storeName ? '/toko' : '/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <p className="mt-4 text-sm leading-relaxed text-ink/65 dark:text-paper-surface/65">
        Punya toko yang terdaftar di akun lain? Masuk dengan email &amp; password toko itu — kamu akan
        berpindah ke akun tersebut.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        <div>
          <label htmlFor="existing-email" className="mb-1.5 block text-sm font-medium">
            Email toko
          </label>
          <input
            id="existing-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toko@email.com"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="existing-password" className="mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="existing-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Memproses...' : 'Masuk ke Toko Itu'}
        </Button>
      </form>
    </>
  )
}
