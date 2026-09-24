import { useEffect, useState } from 'react'
import { PackageSearch, ArrowUpRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { BukaTokoCTA } from '@/components/ui/BukaTokoCTA'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'

interface ProductsResponse {
  data: Product[]
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    let cancelled = false
    api
      .get<ProductsResponse>('/api/products?limit=8')
      .then((res) => !cancelled && setProducts(res.data))
      .catch(() => !cancelled && setProducts([]))
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="py-20 sm:py-28">
      <div className="container-content">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-emerald dark:text-gold">Produk pilihan</p>
            <h2 className="mt-3 max-w-lg font-display text-3xl font-light leading-tight sm:text-4xl">
              Sedang ramai dicari minggu ini
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm text-ink/60 sm:block dark:text-paper-surface/60">
            Produk dari toko-toko yang sudah bergabung di OneShop.
          </p>
        </div>

        {products === null ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.2] animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center dark:border-paper-surface/15">
            <PackageSearch size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
            <p className="mt-4 font-display text-lg">Belum ada produk di OneShop</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
              OneShop baru saja diluncurkan — jadilah salah satu toko pertama yang berjualan di sini.
            </p>
            <BukaTokoCTA className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline dark:text-gold">
              Buka toko sekarang
              <ArrowUpRight size={15} />
            </BukaTokoCTA>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
