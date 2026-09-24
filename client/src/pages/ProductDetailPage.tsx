import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star, Minus, Plus, ShoppingBag, Store, ArrowLeft, Heart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuthGate } from '@/context/AuthGateContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { ReviewsSection } from '@/components/product/ReviewsSection'
import { api, ApiError } from '@/lib/api'
import type { Product } from '@/types/product'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { requireAuth } = useAuthGate()
  const { token } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    setProduct(null)
    setError(null)
    setActiveImage(0)
    setQuantity(1)

    api
      .get<{ data: Product }>(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat produk'))
  }, [id])

  useEffect(() => {
    if (!id || !token) return
    api
      .get<{ data: { _id: string }[] }>('/api/wishlist', token)
      .then((res) => setIsWishlisted(res.data.some((p) => p._id === id)))
      .catch(() => {})
  }, [id, token])

  const changeQuantity = (delta: number) => {
    if (!product) return
    setQuantity((q) => Math.min(Math.max(1, q + delta), product.stock || 1))
  }

  const handleAddToCart = () => {
    if (!product) return
    requireAuth(async () => {
      setBusy(true)
      try {
        await addItem(product._id, quantity)
      } finally {
        setBusy(false)
      }
    })
  }

  const handleBuyNow = () => {
    if (!product) return
    requireAuth(async () => {
      await addItem(product._id, quantity)
      navigate('/keranjang')
    })
  }

  const toggleWishlist = () => {
    if (!id) return
    requireAuth(async () => {
      if (isWishlisted) {
        await api.del(`/api/wishlist/${id}`, token)
        setIsWishlisted(false)
      } else {
        await api.post(`/api/wishlist/${id}`, undefined, token)
        setIsWishlisted(true)
      }
    })
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface">
          <ArrowLeft size={15} />
          Kembali
        </Link>

        {error && (
          <div className="mt-10 rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center dark:border-paper-surface/15">
            <p className="font-display text-lg">{error}</p>
          </div>
        )}

        {!error && !product && (
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-paper-surface dark:bg-paper-dark-surface" />
              <div className="h-8 w-3/4 animate-pulse rounded bg-paper-surface dark:bg-paper-dark-surface" />
              <div className="h-24 w-full animate-pulse rounded bg-paper-surface dark:bg-paper-dark-surface" />
            </div>
          </div>
        )}

        {product && (
          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
            {/* Gallery */}
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-paper-surface dark:bg-paper-dark-surface">
                <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="mt-3 flex gap-3">
                  {product.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors ${
                        i === activeImage ? 'border-emerald dark:border-gold' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-emerald dark:text-gold">{product.category}</p>
                <button
                  type="button"
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors hover:text-red-500 dark:border-paper-surface/15 dark:text-paper-surface/60"
                >
                  <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>
              <h1 className="mt-2 font-display text-3xl font-light leading-tight">{product.name}</h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-ink/20 dark:text-paper-surface/20'}
                    />
                  ))}
                </div>
                <span className="text-sm text-ink/55 dark:text-paper-surface/55">
                  {product.rating > 0 ? product.rating.toFixed(1) : 'Belum ada rating'} · {product.totalReviews} ulasan · {product.terjual} terjual
                </span>
              </div>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl font-medium">{formatRupiah(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-base text-ink/40 line-through dark:text-paper-surface/40">
                    {formatRupiah(product.oldPrice)}
                  </span>
                )}
              </div>

              <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/70 dark:text-paper-surface/70">
                {product.description || 'Belum ada deskripsi untuk produk ini.'}
              </p>

              <Link
                to={product.storeSlug ? `/toko/${product.storeSlug}` : `/produk?toko=${product.storeId}`}
                className="mt-6 flex items-center gap-2.5 rounded-xl border border-ink/10 p-3.5 transition-colors hover:border-emerald dark:border-paper-surface/10 dark:hover:border-gold"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald/10 text-emerald dark:bg-gold/10 dark:text-gold">
                  <Store size={16} />
                </span>
                <span>
                  <span className="block text-sm font-medium">{product.storeName}</span>
                  <span className="block text-xs text-ink/50 dark:text-paper-surface/50">Lihat produk lain dari toko ini</span>
                </span>
              </Link>

              <div className="mt-7 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-ink/15 dark:border-paper-surface/15">
                  <button
                    type="button"
                    onClick={() => changeQuantity(-1)}
                    className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface"
                    aria-label="Kurangi jumlah"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(1)}
                    className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface"
                    aria-label="Tambah jumlah"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-xs text-ink/50 dark:text-paper-surface/50">
                  {product.stock > 0 ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={busy || product.stock === 0}
                  className="flex h-12 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition-colors hover:border-emerald hover:text-emerald disabled:opacity-40 dark:border-paper-surface/15 dark:text-paper-surface dark:hover:border-gold dark:hover:text-gold"
                >
                  <ShoppingBag size={16} />
                  + Keranjang
                </button>
                <Button variant="primary" onClick={handleBuyNow} disabled={busy || product.stock === 0} className="h-12 flex-1">
                  {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {product && <ReviewsSection productId={product._id} />}
      </main>

      <Footer />
    </div>
  )
}
