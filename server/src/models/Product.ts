import { Schema, model, Types } from 'mongoose'
import { CATEGORIES } from '../constants/categories.js'

const productSchema = new Schema(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    storeName: { type: String, required: true },
    storeSlug: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [], validate: (v: string[]) => v.length > 0 && v.length <= 4 },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    terjual: { type: Number, default: 0 },
  },
  { timestamps: true },
)

productSchema.index({ name: 'text', description: 'text' })

export interface ProductDocument {
  _id: Types.ObjectId
  storeId: Types.ObjectId
  storeName: string
  storeSlug: string
  name: string
  description: string
  category: string
  price: number
  oldPrice: number | null
  stock: number
  images: string[]
  rating: number
  totalReviews: number
  terjual: number
  createdAt: Date
  updatedAt: Date
}

export const Product = model('Product', productSchema)
