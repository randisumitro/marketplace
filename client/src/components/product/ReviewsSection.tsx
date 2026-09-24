import { useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api'
import type { Review } from '@/types/review'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null)

  useEffect(() => {
    setReviews(null)
    api
      .get<{ data: Review[] }>(`/api/reviews/product/${productId}`)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]))
  }, [productId])

  return (
    <div className="mt-16 border-t border-ink/10 pt-10 dark:border-paper-surface/10">
      <h2 className="font-display text-xl font-medium">Ulasan Pembeli</h2>

      {reviews === null ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-paper-surface dark:bg-paper-dark-surface" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center dark:border-paper-surface/15">
          <MessageSquare size={22} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
          <p className="mt-3 text-sm text-ink/55 dark:text-paper-surface/55">
            Belum ada ulasan untuk produk ini.
          </p>
        </div>
      ) : (
        <div className="mt-6 max-w-2xl space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-ink/10 pb-6 last:border-0 dark:border-paper-surface/10">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{review.buyerName}</p>
                <p className="text-xs text-ink/45 dark:text-paper-surface/45">{formatDate(review.createdAt)}</p>
              </div>
              <div className="mt-1.5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < review.rating ? 'fill-gold text-gold' : 'text-ink/20 dark:text-paper-surface/20'}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-2 text-sm leading-relaxed text-ink/70 dark:text-paper-surface/70">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
