export interface Product {
  _id: string
  storeId: string
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
  createdAt: string
  updatedAt: string
}
