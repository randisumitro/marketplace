import { useEffect, useState } from 'react'
import { PackageCheck, ClipboardList, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { ORDER_STATUS_LABEL, type Order, type OrderStatus } from '@/types/order'

const STATUS_STYLE: Record<OrderStatus, string> = {
  menunggu_pembayaran: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  menunggu_konfirmasi: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  diproses: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  dikirim: 'bg-emerald/10 text-emerald dark:text-gold',
  sampai_tujuan: 'bg-emerald/10 text-emerald dark:text-gold',
  selesai: 'bg-emerald/15 text-emerald dark:text-gold',
  dibatalkan: 'bg-red-500/10 text-red-500 dark:text-red-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function SellerWarehousePage() {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    api
      .get<{ data: Order[] }>('/api/orders/store/mine', token)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
  }, [token, user])

  async function handleSendOrder(orderId: string) {
    setBusyId(orderId)
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/status`, { status: 'dikirim' }, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
    } catch {
      alert('Gagal mengirim pesanan. Coba lagi.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleArriveOrder(orderId: string) {
    if (!confirm('Tandai pesanan ini sudah sampai ke pembeli?')) return
    setBusyId(orderId)
    try {
      const res = await api.put<{ data: Order }>(`/api/orders/${orderId}/status`, { status: 'sampai_tujuan' }, token)
      setOrders((prev) => prev?.map((o) => (o._id === orderId ? res.data : o)) ?? null)
    } catch {
      alert('Gagal menandai pesanan. Coba lagi.')
    } finally {
      setBusyId(null)
    }
  }

  const activeOrders = orders?.filter(o => o.status === 'diproses' || o.status === 'dikirim') ?? []

  return (
    <SellerLayout>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">Gudang Toko</h1>
          <p className="text-sm text-ink/60 dark:text-paper-surface/60">
            Kelola pengiriman barang dan konfirmasi pesanan tiba.
          </p>
        </div>
      </div>

      {orders === null ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-surface dark:bg-paper-dark-surface" />
          ))}
        </div>
      ) : activeOrders.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 px-6 py-20 text-center dark:border-paper-surface/15">
          <ClipboardList size={28} strokeWidth={1.5} className="text-ink/25 dark:text-paper-surface/25" />
          <p className="mt-4 font-display text-lg">Gudang Kosong</p>
          <p className="mt-1.5 max-w-sm text-sm text-ink/55 dark:text-paper-surface/55">
            Belum ada pesanan yang sedang diproses atau dikirim.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {activeOrders.map((order) => (
            <div key={order._id} className="flex flex-col rounded-2xl border border-ink/10 bg-paper dark:border-paper-surface/10 dark:bg-paper-dark-surface">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-5 py-3.5 dark:border-paper-surface/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{order.buyerName}</span>
                  <span className="text-xs text-ink/40 dark:text-paper-surface/40">· {formatDate(order.createdAt)}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLE[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="p-5 flex-1 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-ink/50 dark:text-paper-surface/50">Alamat Pengiriman</p>
                  <p className="text-xs mt-1 text-ink/70 dark:text-paper-surface/70">
                    {order.shippingAddress?.phone} <br/>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-ink/50 dark:text-paper-surface/50 mb-2">Item</p>
                  <ul className="text-sm space-y-1">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex gap-2">
                        <span className="font-medium text-emerald dark:text-gold">{item.quantity}x</span>
                        <span>{item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex border-t border-ink/10 px-5 py-4 dark:border-paper-surface/10 gap-3 justify-end bg-ink/5 dark:bg-paper-surface/5">
                {order.status === 'diproses' && (
                  <Button
                    variant="primary"
                    onClick={() => handleSendOrder(order._id)}
                    disabled={busyId === order._id}
                    className="!py-2 text-xs"
                  >
                    <Send size={14} />
                    {busyId === order._id ? 'Memproses...' : 'Kirim Pesanan'}
                  </Button>
                )}
                {order.status === 'dikirim' && (
                  <Button
                    variant="primary"
                    onClick={() => handleArriveOrder(order._id)}
                    disabled={busyId === order._id}
                    className="!py-2 text-xs !bg-emerald hover:!bg-emerald/90 !text-white dark:!bg-gold dark:hover:!bg-gold/90 dark:!text-ink"
                  >
                    <PackageCheck size={14} />
                    {busyId === order._id ? 'Memproses...' : 'Tandai Sampai di Tujuan'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SellerLayout>
  )
}
