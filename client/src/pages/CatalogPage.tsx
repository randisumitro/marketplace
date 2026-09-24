import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, Search, X } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ProductCard } from '@/components/product/ProductCard'
import { api } from '@/lib/api'
import { CATEGORIES } from '@/lib/categories'
import type { Product } from '@/types/product'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('kategori') ?? ''
  const storeId = searchParams.get('toko') ?? ''
  const query = searchParams.get('cari') ?? ''

  const [searchInput, setSearchInput] = useState(query)
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => setSearchInput(query), [query])

  useEffect(() => {
    setProducts(null)
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (storeId) params.set('storeId', storeId)
    if (query) params.set('search', query)

    api
      .get<{ data: Product[] }>(`/api/products?${params.toString()}`)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
  }, [activeCategory, storeId, query])

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams)
    if (category) next.set('kategori', category)
    else next.delete('kategori')
    next.delete('toko')
    setSearchParams(next)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput.trim()) next.set('cari', searchInput.trim())
    else next.delete('cari')
    next.delete('toko')
    setSearchParams(next)
  }

  function clearSearch() {
    setSearchInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('cari')
    setSearchParams(next)
  }

  const heading = storeId ? 'Produk dari toko ini' : query ? `Hasil pencarian "${query}"` : activeCategory || 'Semua Produk'

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">{heading}</h1>

        {!storeId && (
          <form onSubmit={handleSearchSubmit} className="relative mt-6 max-w-md">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40 dark:text-paper-surface/40" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari produk..."
              className="w-full rounded-full border border-ink/15 bg-paper py-2.5 pl-10 pr-9 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink dark:text-paper-surface/40"
              >
                <X size={14} />
              </button>
            )}
          </form>
        )}

        {!storeId && !query && (
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCategory('')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                !activeCategory
                  ? 'bg-ink text-paper dark:bg-paper-surface dark:text-ink'
                  : 'border border-ink/15 text-ink/70 hover:border-emerald dark:border-paper-surface/15 dark:text-paper-surface/70 dark:hover:border-gold'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                  activeCategory === cat
                    ? 'bg-ink text-paper dark:bg-paper-surface dark:text-ink'
                    : 'border border-ink/15 text-ink/70 hover:border-emerald dark:border-paper-surface/15 dark:text-paper-surface/70 dark:hover:border-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {products === null ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.2] animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
            <PackageSearch size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
            <p className="mt-4 font-display text-lg">Belum ada produk</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
              {query
                ? `Tidak ada produk yang cocok dengan "${query}".`
                : activeCategory
                  ? `Belum ada produk di kategori ${activeCategory}.`
                  : 'Belum ada produk yang cocok di sini.'}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
