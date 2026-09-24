import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useShippingRate } from '@/hooks/useShippingRate'
import { useMidtransSnap } from '@/hooks/useMidtransSnap'
import { api, ApiError } from '@/lib/api'
import type { ShippingAddress } from '@/types/order'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function CheckoutPage() {
  const { isLoggedIn, isLoading: authLoading, token, user } = useAuth()
  const { cart, clearLocal } = useCart()
  const shippingRate = useShippingRate()
  const { pay: paySnap } = useMidtransSnap()
  const navigate = useNavigate()

  const storeCount = new Set(cart.items.map((i) => i.storeId)).size
  const shippingTotal = shippingRate === null ? null : storeCount * shippingRate
  const grandTotal = shippingTotal === null ? null : cart.subtotal + shippingTotal

  const [form, setForm] = useState<ShippingAddress>({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: '',
    city: '',
    postalCode: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/checkout' } })
    }
  }, [authLoading, isLoggedIn, navigate])

  useEffect(() => {
    if (!authLoading && isLoggedIn && cart.items.length === 0) {
      navigate('/keranjang', { replace: true })
    }
  }, [authLoading, isLoggedIn, cart.items.length, navigate])

  function update<K extends keyof ShippingAddress>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.name.trim().length < 3) return setError('Nama penerima minimal 3 karakter')
    if (form.phone.trim().length < 10) return setError('Nomor HP minimal 10 digit')
    if (form.address.trim().length < 10) return setError('Alamat lengkap minimal 10 karakter')
    if (!form.city.trim()) return setError('Kota wajib diisi')
    if (form.postalCode.trim().length < 4) return setError('Kode pos tidak valid')

    setIsSubmitting(true)
    try {
      const res = await api.post<{ data: { snapToken: string | null } }>(
        '/api/orders/checkout',
        { shippingAddress: form },
        token,
      )
      clearLocal()

      if (res.data.snapToken) {
        // Midtrans aktif — buka popup pembayaran. Pesanan sudah dibuat (status "Menunggu
        // Pembayaran"), jadi apa pun hasil popup ini, arahkan ke halaman Pesanan supaya
        // pembeli bisa lanjut dari sana (termasuk membayar ulang kalau ditutup/gagal).
        setIsSubmitting(false)
        paySnap(res.data.snapToken, {
          onSuccess: () => navigate('/pesanan', { state: { justOrdered: true, paymentResult: 'success' } }),
          onPending: () => navigate('/pesanan', { state: { justOrdered: true, paymentResult: 'pending' } }),
          onError: () => navigate('/pesanan', { state: { justOrdered: true, paymentResult: 'error' } }),
          onClose: () => navigate('/pesanan', { state: { justOrdered: true, paymentResult: 'pending' } }),
        })
      } else {
        // Midtrans belum dikonfigurasi — pesanan langsung jadi seperti sebelum payment gateway ada
        navigate('/pesanan', { state: { justOrdered: true } })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Gagal membuat pesanan. Coba lagi.')
      setIsSubmitting(false)
    }
  }

  if (!isLoggedIn || cart.items.length === 0) return null

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">Checkout</h1>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10" noValidate>
            <p className="text-sm font-semibold">Alamat Pengiriman</p>

            <div>
              <label htmlFor="checkout-name" className="mb-1.5 block text-sm font-medium">Nama penerima</label>
              <input
                id="checkout-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>

            <div>
              <label htmlFor="checkout-phone" className="mb-1.5 block text-sm font-medium">Nomor HP</label>
              <input
                id="checkout-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="08123456789"
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>

            <div>
              <label htmlFor="checkout-address" className="mb-1.5 block text-sm font-medium">Alamat lengkap</label>
              <textarea
                id="checkout-address"
                rows={3}
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan"
                className="w-full resize-none rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-city" className="mb-1.5 block text-sm font-medium">Kota</label>
                <input
                  id="checkout-city"
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
                />
              </div>
              <div>
                <label htmlFor="checkout-postal" className="mb-1.5 block text-sm font-medium">Kode pos</label>
                <input
                  id="checkout-postal"
                  value={form.postalCode}
                  onChange={(e) => update('postalCode', e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm outline-none transition-colors focus:border-emerald dark:border-paper-surface/15 dark:bg-paper-dark-surface dark:focus:border-gold"
                />
              </div>
            </div>

            <div className="rounded-xl bg-paper-surface p-4 text-xs leading-relaxed text-ink/60 dark:bg-paper-dark-surface dark:text-paper-surface/60">
              Pembayaran dilakukan lewat transfer manual — detail rekening penjual akan dikirim setelah pesanan
              dibuat. Penjual akan mengonfirmasi pesananmu dari dashboard mereka.
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" disabled={isSubmitting || grandTotal === null} className="w-full">
              {isSubmitting ? 'Memproses...' : `Buat Pesanan${grandTotal !== null ? ` — ${formatRupiah(grandTotal)}` : ''}`}
            </Button>
          </form>

          {/* Summary */}
          <div className="h-fit rounded-2xl border border-ink/10 p-6 dark:border-paper-surface/10">
            <p className="text-sm font-semibold">Ringkasan Pesanan</p>
            <div className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-surface dark:bg-paper-dark-surface">
                    {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-xs text-ink/50 dark:text-paper-surface/50">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold">{formatRupiah(item.lineTotal)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm dark:border-paper-surface/10">
              <div className="flex items-center justify-between">
                <span className="text-ink/60 dark:text-paper-surface/60">Subtotal</span>
                <span>{formatRupiah(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/60 dark:text-paper-surface/60">Ongkos kirim ({storeCount} toko)</span>
                <span>{shippingTotal === null ? '...' : formatRupiah(shippingTotal)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold">Total</span>
                <span className="font-display text-lg font-medium">
                  {grandTotal === null ? '...' : formatRupiah(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
