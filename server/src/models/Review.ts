import { Schema, model } from 'mongoose'

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    buyerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true },
  },
  { timestamps: true },
)

// Satu pembeli hanya bisa mengulas satu produk sekali per pesanan (mencegah spam ulasan berulang)
reviewSchema.index({ productId: 1, orderId: 1, buyerId: 1 }, { unique: true })

export const Review = model('Review', reviewSchema)
