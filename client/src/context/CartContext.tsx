import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import type { Cart } from '@/types/cart'

interface CartResponse {
  data: Cart
}

interface CartContextValue {
  cart: Cart
  isLoading: boolean
  itemCount: number
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  refresh: () => Promise<void>
  clearLocal: () => void
}

const EMPTY_CART: Cart = { items: [], subtotal: 0 }
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, token } = useAuth()
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [isLoading, setIsLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setCart(EMPTY_CART)
      return
    }
    setIsLoading(true)
    try {
      const res = await api.get<CartResponse>('/api/cart', token)
      setCart(res.data)
    } catch {
      // biarkan cart apa adanya kalau gagal fetch — jangan timpa dengan kosong secara mengejutkan
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, token])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addItem = async (productId: string, quantity = 1) => {
    const res = await api.post<CartResponse>('/api/cart/add', { productId, quantity }, token)
    setCart(res.data)
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    const res = await api.put<CartResponse>(`/api/cart/item/${productId}`, { quantity }, token)
    setCart(res.data)
  }

  const removeItem = async (productId: string) => {
    const res = await api.del<CartResponse>(`/api/cart/item/${productId}`, token)
    setCart(res.data)
  }

  const clearLocal = () => setCart(EMPTY_CART)

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, isLoading, itemCount, addItem, updateQuantity, removeItem, refresh, clearLocal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
