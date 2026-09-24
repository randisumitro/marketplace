import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ClipboardList, Wallet, Star, ArrowUpRight, Circle, CheckCircle2 } from 'lucide-react'
import { SellerLayout } from '@/components/seller/SellerLayout'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Product } from '@/types/product'
import type { Order } from '@/types/order'

function formatRupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`
}

export function SellerOverviewPage() {
  const { user, token } = useAuth()
  const [productCount, setProductCount] = useState<number | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    api
      .get<{ data: Product[] }>('/api/products/store/mine', token)
      .then((res) => setProductCount(res.data.length))
      .catch(() => setProductCount(0))

    api
      .get<{ data: Order[] }>('/api/orders/store/mine', token)
      .then((res) => setOrders(res.data))
      .catch(() => setOrders([]))
  }, [token])

  const newOrdersCount = orders?.filter((o) => o.status === 'menunggu_konfirmasi').length ?? null

  const now = new Date()
  const revenueThisMonth =
    orders
      ?.filter((o) => {
        const d = new Date(o.createdAt)
        return o.status !== 'dibatalkan' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((sum, o) => sum + o.subtotal, 0) ?? null

  const stats = [
    { icon: Package, label: 'Produk aktif', value: productCount === null ? '…' : String(productCount) },
    { icon: ClipboardList, label: 'Pesanan baru', value: newOrdersCount === null ? '…' : String(newOrdersCount) },
    { icon: Wallet, label: 'Pendapatan bulan ini', value: revenueThisMonth === null ? '…' : formatRupiah(revenueThisMonth) },
    { icon: Star, label: 'Rating toko', value: '—' },
  ]

  const checklist = [
    { done: true, label: 'Buat akun & buka toko', hint: 'Selesai' },
    { done: Boolean(user?.storeDescription), label: 'Lengkapi deskripsi toko', hint: 'Di halaman Pengaturan' },
    { done: Boolean(productCount), label: 'Tambah produk pertama', hint: productCount ? 'Selesai' : 'Di halaman Produk' },
    { done: Boolean(orders?.length), label: 'Dapatkan pesanan pertama', hint: orders?.length ? 'Selesai' : 'Bagikan tokomu ke calon pembeli' },
  ]

  return (
    <SellerLayout>
      <h1 className="font-display text-2xl font-medium">Halo, {user?.name.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-ink/60 dark:text-paper-surface/60">
        Ini ringkasan toko <span className="font-medium text-ink dark:text-paper-surface">{user?.storeName}</span> kamu.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink/10 bg-paper p-5 dark:border-paper-surface/10 dark:bg-paper-dark-surface"
          >
            <stat.icon size={17} className="text-ink/40 dark:text-paper-surface/40" />
            <p className="mt-3 font-display text-2xl font-medium">{stat.value}</p>
            <p className="mt-0.5 text-xs text-ink/55 dark:text-paper-surface/55">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Quick actions */}
        <div className="rounded-2xl border border-ink/10 bg-paper p-6 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
          <p className="text-sm font-semibold">Mulai jualan</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/toko/produk"
              className="group flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:border-emerald dark:border-paper-surface/10 dark:hover:border-gold"
            >
              <div>
                <p className="text-sm font-medium">Tambah produk</p>
                <p className="mt-0.5 text-xs text-ink/55 dark:text-paper-surface/55">Unggah foto, atur harga & stok</p>
              </div>
              <ArrowUpRight size={16} className="text-ink/30 transition-colors group-hover:text-emerald dark:text-paper-surface/30 dark:group-hover:text-gold" />
            </Link>
            <Link
              to="/toko/pesanan"
              className="group flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:border-emerald dark:border-paper-surface/10 dark:hover:border-gold"
            >
              <div>
                <p className="text-sm font-medium">Kelola pesanan</p>
                <p className="mt-0.5 text-xs text-ink/55 dark:text-paper-surface/55">Pantau dan proses pesanan masuk</p>
              </div>
              <ArrowUpRight size={16} className="text-ink/30 transition-colors group-hover:text-emerald dark:text-paper-surface/30 dark:group-hover:text-gold" />
            </Link>
            <Link
              to="/toko/pengaturan"
              className="group flex items-center justify-between rounded-xl border border-ink/10 p-4 transition-colors hover:border-emerald dark:border-paper-surface/10 dark:hover:border-gold sm:col-span-2"
            >
              <div>
                <p className="text-sm font-medium">Lengkapi profil toko</p>
                <p className="mt-0.5 text-xs text-ink/55 dark:text-paper-surface/55">Deskripsi, nomor HP, dan nama toko</p>
              </div>
              <ArrowUpRight size={16} className="text-ink/30 transition-colors group-hover:text-emerald dark:text-paper-surface/30 dark:group-hover:text-gold" />
            </Link>
          </div>
        </div>

        {/* Onboarding checklist */}
        <div className="rounded-2xl border border-ink/10 bg-paper p-6 dark:border-paper-surface/10 dark:bg-paper-dark-surface">
          <p className="text-sm font-semibold">Langkah menyiapkan toko</p>
          <ul className="mt-4 space-y-3.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5">
                {item.done ? (
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald dark:text-gold" />
                ) : (
                  <Circle size={17} className="mt-0.5 shrink-0 text-ink/25 dark:text-paper-surface/25" />
                )}
                <div>
                  <p className={`text-sm ${item.done ? 'text-ink/50 line-through dark:text-paper-surface/50' : ''}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-ink/40 dark:text-paper-surface/40">{item.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SellerLayout>
  )
}
