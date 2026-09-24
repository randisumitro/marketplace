import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ClipboardList, CheckCircle2, Store, PackageCheck, Star, XCircle, CreditCard, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { ReviewModal } from '@/components/ui/ReviewModal'
import { useAuth } from '@/context/AuthContext'
import { ManualPaymentModal } from '@/components/ui/ManualPaymentModal'
import { api } from '@/lib/api'
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from '@/types/order'

const AUTO_COMPLETE_HOURS = 24

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  menunggu_pembayaran: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  menunggu_konfirmasi: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  diproses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  dikirim: 'bg-emerald/10 text-emerald dark:text-gold',
  sampai_tujuan: 'bg-emerald/10 text-emerald dark:text-gold',
  selesai: 'bg-emerald/15 text-emerald dark:text-gold',
  dibatalkan: 'bg-red-500/10 text-red-500 dark:text-red-400',
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const steps = [
    { key: 'menunggu_pembayaran', label: 'Belum Dibayar' },
    { key: 'menunggu_konfirmasi', label: 'Tunggu Konfirmasi' },
    { key: 'diproses', label: 'Pesanan Diproses' },
    { key: 'dikirim', label: 'Dalam Pengiriman' },
    { key: 'sampai_tujuan', label: 'Tiba di Tujuan' },
    { key: 'selesai', label: 'Pesanan Selesai' },
  ]
  if (status === 'dibatalkan') return null

  const currentIndex = steps.findIndex((s) => s.key === status)
  
  return (
    <div className="flex items-center text-xs font-medium px-5 py-3 border-t border-ink/10 dark:border-paper-surface/10 bg-ink/5 dark:bg-paper-surface/5 overflow-x-auto custom-scrollbar">
      {steps.map((step, idx) => {
        // Jika statusnya lebih dari 'menunggu_pembayaran', tapi index ini menunggu_pembayaran, artinya sudah lewat
        const isPast = idx <= currentIndex
        const isCurrent = idx === currentIndex
        return (
          <div key={step.key} className="flex items-center shrink-0">
            <div className={`flex items-center gap-1.5 ${isCurrent ? 'text-emerald dark:text-gold' : isPast ? 'text-ink/80 dark:text-paper-surface/80' : 'text-ink/30 dark:text-paper-surface/30'}`}>
              <div className={`w-2 h-2 rounded-full ${isPast ? 'bg-emerald dark:bg-gold' : 'bg-ink/20 dark:bg-paper-surface/20'}`} />
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-6 h-px mx-2 ${idx < currentIndex ? 'bg-emerald dark:bg-gold' : 'bg-ink/20 dark:bg-paper-surface/20'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}


export function OrdersPage() {
  const { isLoggedIn, isLoading: authLoading, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { justOrdered?: boolean; paymentResult?: 'success' | 'pending' | 'error' } | null
  const justOrdered = Boolean(locationState?.justOrdered)
  const paymentResult = locationState?.paymentResult

  const [orders, setOrders] = useState<Order[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [reviewedByOrder, setReviewedByOrder] = useState<Record<string, string[]>>({})
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; productId: string; productName: string } | null>(null)
  const [paymentTarget, setPaymentTarget] = useState<{ orderId: string; total: number } | null>(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true, state: { from: '/pesanan' } })
    }
  }, [authLoading, isLoggedIn, navigate])

  useEffect(() => {
    if (!isLoggedIn) return
    api
      .get<{ data: Order[] }>('/api/orders/mine', token)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
  }, [isLoggedIn, token])

  useEffect(() => {
    const completed = orders?.filter((o) => o.status === 'selesai') ?? []
    completed.forEach((order) => {
      if (reviewedByOrder[order._id] !== undefined) return
      api
        .get<{ data: string[] }>(`/api/reviews/mine?orderId=${order._id}`, token)
        .then((res) => setReviewedByOrder((prev) => ({ ...prev, [order._id]: res.data })))
        .catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, token])

  async function handleComplete(orderId: string) {
    setBusyId(orderId)
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/complete`, undefined, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
    } catch {
      alert('Gagal menyelesaikan pesanan. Coba lagi.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleRetryPayment(orderId: string, total: number) {
    setPaymentTarget({ orderId, total })
  }

  async function handleConfirmPayment(orderId: string) {
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/confirm-payment`, undefined, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
      setPaymentTarget(null)
      alert('Pembayaran berhasil dikonfirmasi, menunggu pengecekan oleh penjual.')
    } catch {
      alert('Gagal mengonfirmasi pembayaran. Coba lagi.')
    }
  }

  async function handleCancel(orderId: string) {
    if (!confirm('Batalkan pesanan ini?')) return
    setBusyId(orderId)
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/cancel`, undefined, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
    } catch {
      alert('Gagal membatalkan pesanan. Coba lagi.')
    } finally {
      setBusyId(null)
    }
  }

  if (!isLoggedIn) return null

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container-content pb-20 pt-28 sm:pt-32">
        <h1 className="font-display text-3xl font-light">Pesanan Saya</h1>

        {justOrdered && !paymentResult && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-emerald/10 px-4 py-3 text-sm text-emerald dark:bg-gold/10 dark:text-gold">
            <CheckCircle2 size={17} />
            Pesanan berhasil dibuat! Penjual akan segera mengonfirmasi.
          </div>
        )}
        {paymentResult === 'success' && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-emerald/10 px-4 py-3 text-sm text-emerald dark:bg-gold/10 dark:text-gold">
            <CheckCircle2 size={17} />
            Pembayaran berhasil! Penjual akan segera mengonfirmasi pesananmu.
          </div>
        )}
        {paymentResult === 'pending' && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle size={17} />
            Pesanan sudah dibuat, tapi pembayaran belum selesai. Klik "Bayar Sekarang" di pesanan itu untuk melanjutkan.
          </div>
        )}
        {paymentResult === 'error' && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
            <AlertCircle size={17} />
            Pembayaran gagal diproses. Kamu bisa coba lagi lewat tombol "Bayar Sekarang".
          </div>
        )}

        {orders === null ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
            <ClipboardList size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
            <p className="mt-4 font-display text-lg">Belum ada pesanan</p>
            <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
              Riwayat belanja kamu akan muncul di sini setelah checkout pertama.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => {
              const reviewedIds = reviewedByOrder[order._id] ?? []
              return (
                <div key={order._id} className="rounded-2xl border border-ink/10 dark:border-paper-surface/10">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-ink/45 dark:text-paper-surface/45" />
                      <span className="text-sm font-medium">{order.storeName}</span>
                      <span className="text-xs text-ink/40 dark:text-paper-surface/40">· {formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <OrderTimeline status={order.status} />

                  <div className="divide-y divide-ink/10 dark:divide-paper-surface/10">
                    {order.items.map((item) => {
                      const alreadyReviewed = reviewedIds.includes(item.productId)
                      return (
                        <div key={item.productId} className="flex items-center gap-3 p-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-surface dark:bg-paper-dark-surface">
                            {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm">{item.name}</p>
                            <p className="text-xs text-ink/50 dark:text-paper-surface/50">
                              {item.quantity} × {formatRupiah(item.price)}
                            </p>
                          </div>
                          {order.status === 'selesai' && (
                            <button
                              type="button"
                              disabled={alreadyReviewed}
                              onClick={() =>
                                setReviewTarget({ orderId: order._id, productId: item.productId, productName: item.name })
                              }
                              className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
                                alreadyReviewed
                                  ? 'text-ink/35 dark:text-paper-surface/35'
                                  : 'text-emerald hover:underline dark:text-gold'
                              }`}
                            >
                              <Star size={12} className={alreadyReviewed ? 'fill-current' : ''} />
                              {alreadyReviewed ? 'Sudah diulas' : 'Beri Ulasan'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-1 px-5 py-3.5 text-xs text-ink/50 dark:text-paper-surface/50">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatRupiah(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ongkos kirim</span>
                      <span>{formatRupiah(order.shippingCost)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-sm text-ink dark:text-paper-surface">
                      <span className="font-medium">Total</span>
                      <span className="font-display text-base font-medium">{formatRupiah(order.total)}</span>
                    </div>
                  </div>

                  {order.status === 'menunggu_pembayaran' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                      <button
                        type="button"
                        onClick={() => handleCancel(order._id)}
                        disabled={busyId === order._id}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        <XCircle size={13} />
                        Batalkan Pesanan
                      </button>
                      <Button
                        variant="primary"
                        onClick={() => handleRetryPayment(order._id, order.total)}
                        disabled={busyId === order._id}
                        className="!py-2 text-xs"
                      >
                        <CreditCard size={14} />
                        {busyId === order._id ? 'Memproses...' : 'Bayar Sekarang'}
                      </Button>
                    </div>
                  )}

                  {order.status === 'menunggu_konfirmasi' && (
                    <div className="flex justify-end border-t border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                      <button
                        type="button"
                        onClick={() => handleCancel(order._id)}
                        disabled={busyId === order._id}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline disabled:opacity-50 dark:text-red-400"
                      >
                        <XCircle size={13} />
                        {busyId === order._id ? 'Memproses...' : 'Batalkan Pesanan'}
                      </button>
                    </div>
                  )}

                  {order.status === 'dikirim' && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-4 dark:border-paper-surface/10">
                      <p className="text-xs text-ink/55 dark:text-paper-surface/55">
                        Pesanan sedang dalam perjalanan ke alamatmu.
                      </p>
                    </div>
                  )}

                  {order.status === 'sampai_tujuan' && order.shippedAt && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-4 dark:border-paper-surface/10">
                      <p className="text-xs text-ink/55 dark:text-paper-surface/55">
                        Pesanan sudah sampai. Konfirmasi supaya penjual tahu.
                        <br />
                        Kalau tidak dikonfirmasi, otomatis selesai dalam{' '}
                        <CountdownTimer
                          deadline={new Date(new Date(order.shippedAt).getTime() + AUTO_COMPLETE_HOURS * 60 * 60 * 1000)}
                        />
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => handleComplete(order._id)}
                        disabled={busyId === order._id}
                        className="!py-2 text-xs"
                      >
                        <PackageCheck size={14} />
                        {busyId === order._id ? 'Memproses...' : 'Pesanan Sudah Sampai'}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />

      {reviewTarget && (
        <ReviewModal
          orderId={reviewTarget.orderId}
          productId={reviewTarget.productId}
          productName={reviewTarget.productName}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() =>
            setReviewedByOrder((prev) => ({
              ...prev,
              [reviewTarget.orderId]: [...(prev[reviewTarget.orderId] ?? []), reviewTarget.productId],
            }))
          }
        />
      )}

      {paymentTarget && (
        <ManualPaymentModal
          orderId={paymentTarget.orderId}
          total={paymentTarget.total}
          onClose={() => setPaymentTarget(null)}
          onConfirm={handleConfirmPayment}
        />
      )}
    </div>
  )
}
