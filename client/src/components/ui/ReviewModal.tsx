import { useState, type FormEvent } from 'react'
import { X, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useScrollLock } from '@/hooks/useScrollLock'
import { useAuth, ApiError } from '@/context/AuthContext'
import { api } from '@/lib/api'

interface ReviewModalProps {
  productId: string
  productName: string
  orderId: string
  onClose: () => void
  onSubmitted: () => void
}

export function ReviewModal({ productId, productName, orderId, onClose, onSubmitted }: ReviewModalProps) {
  const { token } = useAuth()
  useScrollLock()

  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (rating === 0) return setError('Pilih rating bintang dulu')

    setIsSubmitting(true)
    try {
      await api.post('/api/reviews', { productId, orderId, rating, comment }, token)
      onSubmitted()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal mengirim ulasan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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

        <h3 className="font-display text-xl font-medium">Beri Ulasan</h3>
        <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">{productName}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} bintang`}
                className="p-0.5"
              >
                <Star
                  size={28}
                  className={
                    star <= (hoverRating || rating)
                      ? 'fill-gold text-gold'
                      : 'text-ink/20 dark:text-paper-surface/20'
                  }
                />
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium">
              Komentar (opsional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ceritakan pengalamanmu dengan produk ini..."
              className="w-full resize-none rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
          </Button>
        </form>
      </div>
    </div>
  )
}
