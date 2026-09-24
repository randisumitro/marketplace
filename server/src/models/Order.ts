import { Schema, model } from 'mongoose'

export const ORDER_STATUSES = [
  'menunggu_pembayaran',
  'menunggu_konfirmasi',
  'diproses',
  'dikirim',
  'sampai_tujuan',
  'selesai',
  'dibatalkan',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, default: null },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
)

const shippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false },
)

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    buyerName: { type: String, required: true },
    storeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storeName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'menunggu_pembayaran' },
    // Diisi saat penjual menandai "Dikirim" — jadi patokan jendela 24 jam auto-selesai
    shippedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export const Order = model('Order', orderSchema)
