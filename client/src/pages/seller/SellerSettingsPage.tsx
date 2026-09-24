import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'

export function SellerSettingsPage() {
  const { user, updateStoreProfile } = useAuth()

  const [storeName, setStoreName] = useState(user?.storeName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [storeDescription, setStoreDescription] = useState(user?.storeDescription ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (storeName.trim().length < 3) return setError('Nama toko minimal 3 karakter')
    if (phone.trim().length < 10) return setError('Nomor HP minimal 10 digit')

    setIsSubmitting(true)
    try {
      await updateStoreProfile({ storeName, phone, storeDescription })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan perubahan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SellerLayout>
      <h1 className="font-display text-2xl font-medium">Pengaturan Toko</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">Ubah profil publik toko kamu.</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-5 rounded-2xl border border-ink/10 bg-paper p-6 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
        <div>
          <label htmlFor="settings-store-name" className="mb-1.5 block text-sm font-medium">
            Nama toko
          </label>
          <input
            id="settings-store-name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="settings-phone" className="mb-1.5 block text-sm font-medium">
            Nomor HP
          </label>
          <input
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
        </div>

        <div>
          <label htmlFor="settings-description" className="mb-1.5 block text-sm font-medium">
            Deskripsi toko
          </label>
          <textarea
            id="settings-description"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Ceritakan tentang toko kamu — apa yang dijual, sejak kapan berjualan, atau keunikan produknya."
            className="w-full resize-none rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
          />
          <p className="mt-1 text-right text-xs text-ink/40 dark:text-paper-surface/40">{storeDescription.length}/500</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/50 dark:text-paper-surface/50">
            Email akun
          </label>
          <p className="text-sm text-ink/60 dark:text-paper-surface/60">{user?.email}</p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald dark:text-gold">
              <Check size={15} />
              Tersimpan
            </span>
          )}
        </div>
      </form>
    </SellerLayout>
  )
}
