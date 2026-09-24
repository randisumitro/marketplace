import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Laptop, LogOut, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Session } from '@/types/notification'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AccountPage() {
  const { user, isLoggedIn, isLoading: authLoading, token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/akun' } })
    }
  }, [authLoading, isLoggedIn, navigate])

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-content max-w-2xl pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">Akun Saya</h1>
        <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">{user?.email}</p>

        <ProfileSection />
        <PhoneVerificationSection />
        <PasswordSection />
        <SessionsSection currentToken={token} logout={logout} />
      </main>
      <Footer />
    </div>
  )
}

function ProfileSection() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (name.trim().length < 3) return setError('Nama minimal 3 karakter')

    setIsSubmitting(true)
    try {
      await updateProfile({ name, phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan perubahan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
      <p className="text-sm font-semibold">Profil</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="account-name" className="mb-1.5 block text-sm font-medium">Nama</label>
          <input
            id="account-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="account-phone" className="mb-1.5 block text-sm font-medium">Nomor HP</label>
          <input
            id="account-phone"
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
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald dark:text-gold">
              <Check size={15} />
              Tersimpan
            </span>
          )}
        </div>
      </form>
    </section>
  )
}

function PhoneVerificationSection() {
  const { user, token, refreshUser } = useAuth()
  const [step, setStep] = useState<'idle' | 'sent'>('idle')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSendOtp() {
    setError(null)
    setInfo(null)
    setIsSubmitting(true)
    try {
      const res = await api.post<{ message: string }>('/api/auth/phone/send-otp', undefined, token)
      setInfo(res.message)
      setStep('sent')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim OTP.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!code) return setError('Masukkan kode OTP yang kamu terima')

    setIsSubmitting(true)
    try {
      await api.post('/api/auth/phone/verify-otp', { code }, token)
      await refreshUser()
      setStep('idle')
      setCode('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kode OTP salah atau sudah kedaluwarsa.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user?.phone) return null

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Verifikasi Nomor HP</p>
        {user.isPhoneVerified ? (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-medium text-emerald dark:bg-gold/10 dark:text-gold">
            <ShieldCheck size={13} />
            Terverifikasi
          </span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <ShieldAlert size={13} />
            Belum terverifikasi
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-ink/60 dark:text-paper-surface/60">{user.phone}</p>

      {!user.isPhoneVerified && (
        <div className="mt-4">
          {step === 'idle' ? (
            <Button type="button" variant="primary" onClick={handleSendOtp} disabled={isSubmitting} className="!py-2.5 text-sm">
              {isSubmitting ? 'Mengirim...' : 'Kirim Kode OTP'}
            </Button>
          ) : (
            <form onSubmit={handleVerify} className="space-y-3">
              {info && <p className="text-sm text-ink/60 dark:text-paper-surface/60">{info}</p>}
              <div className="flex gap-2">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Masukkan kode OTP"
                  className="w-full max-w-[200px] rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
                />
                <Button type="submit" variant="primary" disabled={isSubmitting} className="!py-2.5 text-sm">
                  {isSubmitting ? 'Memeriksa...' : 'Verifikasi'}
                </Button>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="text-xs font-medium text-ink/50 hover:text-ink dark:text-paper-surface/50"
              >
                Kirim ulang kode
              </button>
            </form>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </section>
  )
}

function PasswordSection() {
  const { token } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (!oldPassword || !newPassword) return setError('Password lama dan baru wajib diisi')

    setIsSubmitting(true)
    try {
      await api.put('/api/auth/change-password', { oldPassword, newPassword }, token)
      setOldPassword('')
      setNewPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengubah password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
      <p className="text-sm font-semibold">Ganti Password</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="old-password" className="mb-1.5 block text-sm font-medium">Password lama</label>
          <input
            id="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium">Password baru</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimal 8 karakter, ada huruf besar, kecil & angka"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald dark:text-gold">
              <Check size={15} />
              Password diubah
            </span>
          )}
        </div>
      </form>
    </section>
  )
}

function SessionsSection({
  currentToken,
  logout,
}: {
  currentToken: string | null
  logout: () => Promise<void>
}) {
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    api
      .get<{ data: Session[] }>('/api/auth/sessions', currentToken)
      .then((res) => setSessions(res.data))
      .catch(() => setSessions([]))
  }

  useEffect(load, [currentToken])

  async function revoke(id: string) {
    setBusyId(id)
    try {
      await api.del(`/api/auth/sessions/${id}`, currentToken)
      setSessions((prev) => prev?.filter((s) => s.id !== id) ?? null)
    } catch {
      alert('Gagal mengakhiri sesi. Coba lagi.')
    } finally {
      setBusyId(null)
    }
  }

  async function revokeOthers() {
    if (!confirm('Akhiri semua sesi lain? Perangkat lain yang sedang login akan otomatis keluar.')) return
    try {
      await api.del('/api/auth/sessions/others', currentToken)
      load()
    } catch {
      alert('Gagal mengakhiri sesi lain. Coba lagi.')
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Sesi Aktif</p>
        {sessions && sessions.length > 1 && (
          <button
            type="button"
            onClick={revokeOthers}
            className="text-xs font-medium text-red-500 hover:underline dark:text-red-400"
          >
            Keluar dari perangkat lain
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-ink/50 dark:text-paper-surface/50">
        Perangkat yang sedang login ke akun ini. Deteksi perangkat berdasarkan browser, bukan lokasi presisi.
      </p>

      <div className="mt-4 divide-y divide-ink/10 dark:divide-paper-surface/10">
        {sessions === null ? (
          <p className="py-4 text-sm text-ink/50 dark:text-paper-surface/50">Memuat...</p>
        ) : (
          sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-surface text-ink/50 dark:bg-paper-dark-surface dark:text-paper-surface/50">
                  <Laptop size={16} />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    {s.device}
                    {s.isCurrent && (
                      <span className="ml-2 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-medium text-emerald dark:bg-gold/10 dark:text-gold">
                        Perangkat ini
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink/50 dark:text-paper-surface/50">Aktif {formatDateTime(s.lastActiveAt)}</p>
                </div>
              </div>
              {s.isCurrent ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 text-xs font-medium text-ink/60 hover:text-ink dark:text-paper-surface/60"
                >
                  <LogOut size={13} />
                  Keluar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => revoke(s.id)}
                  disabled={busyId === s.id}
                  className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50 dark:text-red-400"
                >
                  {busyId === s.id ? 'Memproses...' : 'Akhiri'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
