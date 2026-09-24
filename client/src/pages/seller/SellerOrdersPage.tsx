import { useEffect, useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { EmptyState } from '@/components/seller/EmptyState'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from '@/types/order'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const TABS: { label: string; status: OrderStatus | 'semua' }[] = [
  { label: 'Semua', status: 'semua' },
  { label: 'Menunggu Pembayaran', status: 'menunggu_pembayaran' },
  { label: 'Menunggu Konfirmasi', status: 'menunggu_konfirmasi' },
  { label: 'Diproses', status: 'diproses' },
  { label: 'Dikirim', status: 'dikirim' },
  { label: 'Selesai', status: 'selesai' },
]

// 'dikirim' sengaja tidak punya tombol lanjutan di sini — status 'selesai' hanya
// bisa dikonfirmasi oleh pembeli dari halaman Pesanan mereka (atau auto-selesai 24 jam).
const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  menunggu_konfirmasi: { next: 'diproses', label: 'Proses Pesanan' },
  diproses: { next: 'dikirim', label: 'Tandai Dikirim' },
}

export function SellerOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [activeTab, setActiveTab] = useState<OrderStatus | 'semua'>('semua')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<{ data: Order[] }>('/api/orders/store/mine', token)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
  }, [token])

  const filtered = useMemo(() => {
    if (!orders) return null
    if (activeTab === 'semua') return orders
    return orders.filter((o) => o.status === activeTab)
  }, [orders, activeTab])

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId)
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/status`, { status }, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
    } catch {
      alert('Gagal memperbarui status. Coba lagi.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <SellerLayout>
      <h1 className="font-display text-2xl font-medium">Pesanan</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">Pantau dan proses pesanan yang masuk ke toko kamu.</p>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-ink/10 dark:border-paper-surface/10">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            type="button"
            onClick={() => setActiveTab(tab.status)}
            className={`relative shrink-0 px-4 py-2.5 text-sm transition-colors ${
              activeTab === tab.status
                ? 'font-medium text-ink dark:text-paper-surface'
                : 'text-ink/50 hover:text-ink dark:text-paper-surface/50 dark:hover:text-paper-surface'
            }`}
          >
            {tab.label}
            {activeTab === tab.status && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-emerald dark:bg-gold" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filtered === null ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper dark:bg-paper-dark-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada pesanan"
            description="Begitu ada pembeli yang checkout dari tokomu, pesanannya akan muncul di sini."
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const action = NEXT_STATUS[order.status]
              return (
                <div key={order._id} className="rounded-2xl border border-ink/10 bg-paper dark:border-paper-surface/10 dark:bg-paper-dark-surface">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                    <div>
                      <p className="text-sm font-medium">{order.buyerName}</p>
                      <p className="text-xs text-ink/45 dark:text-paper-surface/45">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-paper-surface px-3 py-1 text-xs font-medium dark:bg-paper-dark">
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  <div className="divide-y divide-ink/10 p-1 dark:divide-paper-surface/10">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 px-4 py-2.5">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-paper-surface dark:bg-paper-dark">
                          {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{item.name}</p>
                          <p className="text-xs text-ink/45 dark:text-paper-surface/45">
                            {item.quantity} × {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                    <div className="text-xs text-ink/55 dark:text-paper-surface/55">
                      <p className="font-medium text-ink dark:text-paper-surface">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.phone}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-medium">{formatRupiah(order.subtotal)}</span>
                      {action && (
                        <button
                          type="button"
                          onClick={() => updateStatus(order._id, action.next)}
                          disabled={updatingId === order._id}
                          className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-emerald disabled:opacity-50 dark:bg-paper-surface dark:text-ink dark:hover:bg-gold"
                        >
                          {updatingId === order._id ? 'Memproses...' : action.label}
                        </button>
                      )}
                      {order.status === 'dikirim' && (
                        <span className="text-xs italic text-ink/45 dark:text-paper-surface/45">
                          Menunggu konfirmasi pembeli
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  )
}
