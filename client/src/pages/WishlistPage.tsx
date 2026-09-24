import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'

export function WishlistPage() {
  const { isLoggedIn, isLoading: authLoading, token } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/wishlist' } })
    }
  }, [authLoading, isLoggedIn, navigate])

  const load = () => {
    api
      .get<{ data: Product[] }>('/api/wishlist', token)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
  }

  useEffect(() => {
    if (isLoggedIn) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  async function handleToggle(productId: string) {
    await api.del(`/api/wishlist/${productId}`, token)
    setProducts((prev) => prev?.filter((p) => p._id !== productId) ?? null)
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">Wishlist</h1>

        {products === null ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.2] animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
            <Heart size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
            <p className="mt-4 font-display text-lg">Wishlist kamu kosong</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
              Tap ikon hati di produk yang kamu suka untuk menyimpannya di sini.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} isWishlisted onToggleWishlist={handleToggle} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
