import { Schema, model } from 'mongoose'

export const PAYMENT_STATUSES = ['pending', 'settlement', 'expire', 'cancel', 'deny', 'failure'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

const paymentSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // ID unik yang dikirim ke Midtrans — beda dari _id Mongo, formatnya harus ramah Midtrans
    midtransOrderId: { type: String, required: true, unique: true },
    orderIds: { type: [Schema.Types.ObjectId], ref: 'Order', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    snapToken: { type: String, required: true },
  },
  { timestamps: true },
)

export const Payment = model('Payment', paymentSchema)
