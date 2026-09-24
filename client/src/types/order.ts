export type OrderStatus = 'menunggu_pembayaran' | 'menunggu_konfirmasi' | 'diproses' | 'dikirim' | 'sampai_tujuan' | 'selesai' | 'dibatalkan'

export interface OrderItem {
  productId: string
  name: string
  image: string | null
  price: number
  quantity: number
}

export interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
}

export interface Order {
  _id: string
  buyerId: string
  buyerName: string
  storeId: string
  storeName: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  shippingAddress: ShippingAddress
  status: OrderStatus
  shippedAt: string | null
  createdAt: string
  updatedAt: string
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_pembayaran: 'Menunggu Pembayaran',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diproses: 'Sedang Diproses',
  dikirim: 'Dalam Pengiriman',
  sampai_tujuan: 'Tiba di Tujuan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}
