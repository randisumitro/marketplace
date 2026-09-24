import { useEffect, useState, type FormEvent } from 'react'
import { X, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth, ApiError } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { CATEGORIES } from '@/lib/categories'
import { useScrollLock } from '@/hooks/useScrollLock'
import type { Product } from '@/types/product'

interface ProductFormModalProps {
  product?: Product | null
  onClose: () => void
  onSaved: (product: Product) => void
}

const MAX_IMAGES = 4

export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const { token } = useAuth()
  const isEdit = Boolean(product)

  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [oldPrice, setOldPrice] = useState(product?.oldPrice?.toString() ?? '')
  const [stock, setStock] = useState(product?.stock?.toString() ?? '')

  const [existingImages, setExistingImages] = useState(product?.images ?? [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f))
    setNewPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [newFiles])

  const totalImageCount = existingImages.length + newFiles.length

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    const room = MAX_IMAGES - totalImageCount
    setNewFiles((prev) => [...prev, ...picked.slice(0, room)])
    e.target.value = ''
  }

  function removeExisting(index: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeNew(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 3) return setError('Nama produk minimal 3 karakter')
    const priceNum = Number(price)
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) return setError('Harga harus angka lebih dari 0')
    const stockNum = Number(stock)
    if (!stock || Number.isNaN(stockNum) || stockNum < 0) return setError('Stok harus angka valid')
    if (totalImageCount === 0) return setError('Unggah minimal 1 foto produk')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('category', category)
    formData.append('description', description)
    formData.append('price', price)
    if (oldPrice) formData.append('oldPrice', oldPrice)
    formData.append('stock', stock)
    // Foto lama yang TIDAK dihapus user harus dikirim juga — server tidak tahu mana yang
    // harus dipertahankan kalau kita cuma kirim file baru.
    formData.append('existingImages', JSON.stringify(existingImages))
    newFiles.forEach((file) => formData.append('images', file))

    setIsSubmitting(true)
    try {
      const res = isEdit
        ? await api.putForm<{ data: Product }>(`/api/products/${product!._id}`, formData, token)
        : await api.postForm<{ data: Product }>('/api/products', formData, token)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal menyimpan produk. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm dark:bg-black/60" />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink/10 bg-paper p-6 shadow-2xl sm:p-7 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-paper-surface hover:text-ink dark:text-paper-surface/50 dark:hover:bg-paper-dark"
        >
          <X size={16} />
        </button>

        <h3 className="font-display text-xl font-medium">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {/* Images */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Foto produk (maks {MAX_IMAGES})</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img, i) => (
                <div key={img} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-ink/10 dark:border-paper-surface/10">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={src} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-ink/10 dark:border-paper-surface/10">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {totalImageCount < MAX_IMAGES && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ink/20 text-ink/40 hover:border-emerald hover:text-emerald dark:border-paper-surface/20 dark:text-paper-surface/40 dark:hover:border-gold dark:hover:text-gold">
                  <ImagePlus size={18} />
                  <span className="text-[10px]">Tambah</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="product-name" className="mb-1.5 block text-sm font-medium">
              Nama produk
            </label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kemeja Linen Oversized"
              className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium">
              Kategori
            </label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium">
              Deskripsi
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="product-price" className="mb-1.5 block text-sm font-medium">
                Harga
              </label>
              <input
                id="product-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>
            <div>
              <label htmlFor="product-old-price" className="mb-1.5 block text-sm font-medium">
                Harga coret
              </label>
              <input
                id="product-old-price"
                type="number"
                min={0}
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                placeholder="Opsional"
                className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>
            <div>
              <label htmlFor="product-stock" className="mb-1.5 block text-sm font-medium">
                Stok
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </form>
      </div>
    </div>
  )
}
