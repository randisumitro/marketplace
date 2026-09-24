import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'

const PASSWORD_RULES = [
  { label: 'Minimal 8 karakter', test: (v: string) => v.length >= 8 },
  { label: 'Ada huruf besar & kecil', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'Ada angka', test: (v: string) => /[0-9]/.test(v) },
]

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(password))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 3) {
      setError('Nama minimal 3 karakter')
      return
    }
    if (!allRulesPass) {
      setError('Password belum memenuhi semua ketentuan di bawah')
      return
    }

    setIsSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mendaftar. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Gabung sekarang"
      title="Buat akun OneShop"
      subtitle="Gratis untuk pembeli. Ingin jualan? Kamu bisa buka toko kapan saja dari menu akun setelah masuk."
      footer={
        <p>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-emerald hover:underline dark:text-gold">
            Masuk di sini
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          label="Nama lengkap"
          name="name"
          autoComplete="name"
          placeholder="Nama kamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onFocus={() => setPasswordTouched(true)}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordTouched && (
            <ul className="mt-2 space-y-1">
              {PASSWORD_RULES.map((rule) => {
                const pass = rule.test(password)
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${
                      pass ? 'text-emerald dark:text-gold' : 'text-ink/45 dark:text-paper-surface/45'
                    }`}
                  >
                    {pass ? <Check size={13} /> : <X size={13} />}
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Memproses...' : 'Buat Akun'}
        </Button>
      </form>

      <GoogleSignInButton />
    </AuthLayout>
  )
}
