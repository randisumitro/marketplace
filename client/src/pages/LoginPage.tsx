import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locationState = location.state as { from?: string; justReset?: boolean } | null
  const redirectTo = locationState?.from ?? '/'
  const justReset = Boolean(locationState?.justReset)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Email dan password wajib diisi')
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal masuk. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Selamat datang kembali"
      title="Masuk ke akun kamu"
      subtitle="Satu akun untuk belanja di ribuan toko independen terverifikasi di OneShop."
      footer={
        <p>
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-emerald hover:underline dark:text-gold">
            Daftar di sini
          </Link>
        </p>
      }
    >
      {justReset && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald/10 px-3 py-2.5 text-sm text-emerald dark:bg-gold/10 dark:text-gold">
          <CheckCircle2 size={15} />
          Password berhasil direset. Silakan masuk dengan password baru.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div>
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link
            to="/lupa-password"
            className="mt-1.5 inline-block text-xs font-medium text-ink/55 hover:text-emerald dark:text-paper-surface/55 dark:hover:text-gold"
          >
            Lupa password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>

      <GoogleSignInButton />
    </AuthLayout>
  )
}
