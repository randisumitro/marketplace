import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Star, ShoppingBag, Heart, Loader2 } from 'lucide-react'
import { useAuthGate } from '@/context/AuthGateContext'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types/product'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < filled ? 'fill-gold text-gold' : 'text-ink/20 dark:text-paper-surface/20'} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
  isWishlisted?: boolean
  onToggleWishlist?: (productId: string) => void
}

export function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const { requireAuth } = useAuthGate()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const detailUrl = `/produk/${product._id}`
  const [adding, setAdding] = useState(false)

  const handleAddToCart = () => {
    requireAuth(async () => {
      setAdding(true)
      try {
        await addItem(product._id, 1)
      } finally {
        setAdding(false)
      }
    })
  }

  const handleBuyNow = () => {
    requireAuth(async () => {
      await addItem(product._id, 1)
      navigate('/keranjang')
    })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper-surface transition-transform duration-300 hover:-translate-y-1 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
      <div className="relative">
        <Link to={detailUrl} className="block aspect-square overflow-hidden bg-paper dark:bg-paper-dark">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        </Link>
        {onToggleWishlist && (
          <button
            type="button"
            onClick={() => requireAuth(() => onToggleWishlist(product._id))}
            aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-ink/60 backdrop-blur-sm hover:text-red-500 dark:bg-paper-dark/90 dark:text-paper-surface/60"
          >
            <Heart size={15} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <Link to={detailUrl}>
          <p className="text-xs text-ink/50 dark:text-paper-surface/50">{product.category}</p>
          <h3 className="mt-1 font-semibold leading-snug hover:text-emerald dark:hover:text-gold">{product.name}</h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-ink/50 dark:text-paper-surface/50">
            {product.rating > 0 ? product.rating.toFixed(1) : 'Baru'} ({product.totalReviews})
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg font-medium">{formatRupiah(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-ink/40 line-through dark:text-paper-surface/40">
              {formatRupiah(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            aria-label="Tambah ke keranjang"
            title="Tambah ke keranjang"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-emerald hover:text-emerald disabled:opacity-40 dark:border-paper-surface/15 dark:text-paper-surface/70 dark:hover:border-gold dark:hover:text-gold"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
          </button>
          <Button variant="primary" onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 !py-2.5 text-xs">
            {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  )
}
