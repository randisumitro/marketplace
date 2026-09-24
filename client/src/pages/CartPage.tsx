import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useShippingRate } from '@/hooks/useShippingRate'
import type { CartItem } from '@/types/cart'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function CartPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const { cart, isLoading, updateQuantity, removeItem } = useCart()
  const shippingRate = useShippingRate()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/keranjang' } })
    }
  }, [authLoading, isLoggedIn, navigate])

  const groups = cart.items.reduce<Record<string, { storeName: string; items: CartItem[] }>>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = { storeName: item.storeName, items: [] }
    acc[item.storeId].items.push(item)
    return acc
  }, {})
  const storeCount = Object.keys(groups).length

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">Keranjang</h1>

        {isLoading && cart.items.length === 0 ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
            <ShoppingBag size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
            <p className="mt-4 font-display text-lg">Keranjang kamu kosong</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
              Yuk mulai jelajahi produk dari toko-toko di OneShop.
            </p>
            <Link to="/produk" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline dark:text-gold">
              Jelajahi produk
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              {Object.entries(groups).map(([storeId, group]) => (
                <div key={storeId} className="rounded-2xl border border-ink/10 dark:border-paper-surface/10">
                  <div className="flex items-center gap-2 border-b border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                    <Store size={15} className="text-ink/50 dark:text-paper-surface/50" />
                    <p className="text-sm font-medium">{group.storeName}</p>
                  </div>

                  <div className="divide-y divide-ink/10 dark:divide-paper-surface/10">
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-5">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-surface dark:bg-paper-dark-surface">
                          {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">{formatRupiah(item.price)}</p>
                          {item.quantity > item.stock && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">Stok tersisa {item.stock}</p>
                          )}
                        </div>

                        <div className="flex items-center rounded-full border border-ink/15 dark:border-paper-surface/15">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-ink dark:text-paper-surface/60 dark:hover:text-paper-surface"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-ink disabled:opacity-30 dark:text-paper-surface/60 dark:hover:text-paper-surface"
                            aria-label="Tambah jumlah"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="w-24 shrink-0 text-right text-sm font-semibold">{formatRupiah(item.lineTotal)}</p>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          aria-label="Hapus dari keranjang"
                          className="text-ink/35 hover:text-red-500 dark:text-paper-surface/35"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="h-fit rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
              <p className="text-sm font-semibold">Ringkasan Belanja</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink/60 dark:text-paper-surface/60">Subtotal</span>
                  <span className="font-medium">{formatRupiah(cart.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink/60 dark:text-paper-surface/60">
                    Ongkos kirim ({storeCount} toko)
                  </span>
                  <span className="font-medium">
                    {shippingRate === null ? '...' : formatRupiah(storeCount * shippingRate)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-ink/10 pt-2 dark:border-paper-surface/10">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-lg font-medium">
                    {shippingRate === null ? '...' : formatRupiah(cart.subtotal + storeCount * shippingRate)}
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => navigate('/checkout')}
                className="mt-5 w-full"
                disabled={cart.items.some((i) => i.quantity > i.stock)}
              >
                Lanjut ke Checkout
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
