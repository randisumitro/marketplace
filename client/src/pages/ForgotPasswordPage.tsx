import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { FormField } from '@/components/auth/FormField'
import { Button } from '@/components/ui/Button'
import { api, ApiError } from '@/lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email) return setError('Email wajib diisi')

    setIsSubmitting(true)
    try {
      await api.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim link reset. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="Lupa password"
      title="Reset password kamu"
      subtitle="Masukkan email akunmu — kami kirimkan link untuk membuat password baru."
      footer={
        <p>
          Ingat password kamu?{' '}
          <Link to="/login" className="font-medium text-emerald hover:underline dark:text-gold">
            Masuk di sini
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="rounded-xl bg-emerald/10 p-5 text-sm leading-relaxed text-ink dark:bg-gold/10 dark:text-paper-surface">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/15 text-emerald dark:bg-gold/15 dark:text-gold">
            <Mail size={16} />
          </div>
          <p className="mt-3">
            Kalau <span className="font-medium">{email}</span> terdaftar di OneShop, link reset password sudah
            dikirim ke sana. Cek juga folder spam kalau belum muncul dalam beberapa menit.
          </p>
        </div>
      ) : (
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

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
