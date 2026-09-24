import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { Button } from '@/components/ui/Button'
import { api, ApiError } from '@/lib/api'

const PASSWORD_RULES = [
  { label: 'Minimal 8 karakter', test: (v: string) => v.length >= 8 },
  { label: 'Ada huruf besar & kecil', test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'Ada angka', test: (v: string) => /[0-9]/.test(v) },
]

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allRulesPass = PASSWORD_RULES.every((rule) => rule.test(newPassword))
  const linkValid = Boolean(token && email)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!allRulesPass) return setError('Password belum memenuhi semua ketentuan di bawah')

    setIsSubmitting(true)
    try {
      await api.post('/api/auth/reset-password', { email, token, newPassword })
      navigate('/login', { replace: true, state: { justReset: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mereset password. Coba minta link baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Buat password baru"
      title="Reset password"
      subtitle={email ? `Untuk akun ${email}` : 'Link reset password'}
      footer={
        <p>
          <Link to="/login" className="font-medium text-emerald hover:underline dark:text-gold">
            Kembali ke halaman masuk
          </Link>
        </p>
      }
    >
      {!linkValid ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
          Link reset password tidak valid. Minta link baru lewat halaman{' '}
          <Link to="/lupa-password" className="font-medium underline">
            Lupa Password
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <FormField
              label="Password baru"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onFocus={() => setTouched(true)}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {touched && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const pass = rule.test(newPassword)
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
            {isSubmitting ? 'Menyimpan...' : 'Reset Password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
