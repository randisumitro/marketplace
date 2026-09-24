import { useEffect, useState } from 'react'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { EmptyState } from '@/components/seller/EmptyState'
import { ProductFormModal } from '@/components/seller/ProductFormModal'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function SellerProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  function loadProducts() {
    api
      .get<{ data: Product[] }>('/api/products/store/mine', token)
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
  }

  function openCreate() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  function handleSaved(product: Product) {
    setProducts((prev) => {
      if (!prev) return [product]
      const exists = prev.some((p) => p._id === product._id)
      return exists ? prev.map((p) => (p._id === product._id ? product : p)) : [product, ...prev]
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus produk ini? Tindakan ini tidak bisa dibatalkan.')) return
    setDeletingId(id)
    try {
      await api.del(`/api/products/${id}`, token)
      setProducts((prev) => prev?.filter((p) => p._id !== id) ?? null)
    } catch {
      alert('Gagal menghapus produk. Coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <SellerLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium">Produk</h1>
          <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">Kelola semua produk yang kamu jual.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-emerald dark:bg-paper-surface dark:text-ink dark:hover:bg-gold"
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      <div className="mt-8">
        {products === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-paper dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Belum ada produk"
            description="Klik “Tambah Produk” untuk mengunggah produk pertamamu — lengkap dengan foto, harga, dan stok."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-2xl border border-ink/10 bg-paper dark:border-paper-surface/10 dark:bg-paper-dark-surface"
              >
                <div className="aspect-video overflow-hidden bg-paper-surface dark:bg-paper-dark">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-ink/50 dark:text-paper-surface/50">{product.category}</p>
                  <p className="mt-0.5 truncate font-semibold">{product.name}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="font-display text-base font-medium">{formatRupiah(product.price)}</p>
                    <p className="text-xs text-ink/50 dark:text-paper-surface/50">Stok {product.stock}</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink/15 py-2 text-xs font-medium text-ink/70 hover:border-emerald hover:text-emerald dark:border-paper-surface/15 dark:text-paper-surface/70 dark:hover:border-gold dark:hover:text-gold"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      disabled={deletingId === product._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/25 py-2 text-xs font-medium text-red-500 hover:bg-red-500/5 disabled:opacity-50 dark:text-red-400"
                    >
                      <Trash2 size={13} />
                      {deletingId === product._id ? 'Menghapus...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <ProductFormModal product={editingProduct} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      )}
    </SellerLayout>
  )
}
