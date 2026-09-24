export interface CartItem {
  productId: string
  name: string
  image: string | null
  price: number
  stock: number
  storeId: string
  storeName: string
  quantity: number
  lineTotal: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
}
