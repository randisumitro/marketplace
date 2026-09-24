import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Store, PackageSearch } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { api, ApiError } from '@/lib/api'
import type { Product } from '@/types/product'

interface StoreInfo {
  id: string
  storeName: string
  storeSlug: string
  storeDescription: string
  productCount: number
}

export function StorePage() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<StoreInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (!slug) return
    setStore(null)
    setError(null)

    api
      .get<{ data: StoreInfo }>(`/api/store/${slug}`)
      .then((res) => setStore(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Gagal memuat toko'))
  }, [slug])

  useEffect(() => {
    if (!store) return
    api
      .get<{ data: Product[] }>(`/api/products?storeId=${store.id}`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
  }, [store])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        {error && (
          <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center dark:border-paper-surface/15">
            <p className="font-display text-lg">{error}</p>
          </div>
        )}

        {!error && !store && (
          <div className="space-y-4">
            <div className="h-8 w-56 animate-pulse rounded bg-paper-surface dark:bg-paper-dark-surface" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-paper-surface dark:bg-paper-dark-surface" />
          </div>
        )}

        {store && (
          <>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald/10 text-emerald dark:bg-gold/10 dark:text-gold">
                <Store size={24} />
              </span>
              <div>
                <h1 className="font-display text-2xl font-medium sm:text-3xl">{store.storeName}</h1>
                <p className="text-sm text-ink/55 dark:text-paper-surface/55">{store.productCount} produk</p>
              </div>
            </div>

            {store.storeDescription && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/70 dark:text-paper-surface/70">
                {store.storeDescription}
              </p>
            )}

            <div className="mt-10">
              {products === null ? (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4.2] animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center dark:border-paper-surface/15">
                  <PackageSearch size={26} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
                  <p className="mt-4 font-display text-lg">Toko ini belum punya produk</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
