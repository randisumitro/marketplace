import type { Request, Response } from 'express'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'

interface PopulatedProduct {
  _id: unknown
  name: string
  price: number
  images: string[]
  stock: number
  storeId: unknown
  storeName: string
}

/** Bentuk ulang cart jadi shape siap-pakai untuk frontend: harga & stok selalu data terbaru dari Product. */
async function buildCartResponse(userId: string) {
  const cart = await Cart.findOne({ userId }).populate<{
    items: { productId: PopulatedProduct | null; quantity: number }[]
  }>('items.productId')

  if (!cart) {
    return { items: [], subtotal: 0 }
  }

  const items = cart.items
    .filter((item) => item.productId !== null)
    .map((item) => {
      const product = item.productId as unknown as PopulatedProduct
      return {
        productId: product._id,
        name: product.name,
        image: product.images[0] ?? null,
        price: product.price,
        stock: product.stock,
        storeId: product.storeId,
        storeName: product.storeName,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      }
    })

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  return { items, subtotal }
}

export async function getCart(req: Request, res: Response) {
  try {
    const data = await buildCartResponse(req.user!.userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('❌ Get cart error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    const { productId, quantity } = req.body as { productId?: string; quantity?: number }
    const qty = quantity && quantity > 0 ? quantity : 1

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId wajib diisi' })
    }
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    }

    let cart = await Cart.findOne({ userId: req.user!.userId })
    if (!cart) {
      cart = await Cart.create({ userId: req.user!.userId, items: [] })
    }

    const existing = cart.items.find((item) => item.productId.toString() === productId)
    if (existing) {
      existing.quantity += qty
    } else {
      cart.items.push({ productId: product._id, quantity: qty } as never)
    }
    await cart.save()

    const data = await buildCartResponse(req.user!.userId)
    res.json({ success: true, message: 'Ditambahkan ke keranjang', data })
  } catch (error) {
    console.error('❌ Add to cart error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    const { productId } = req.params
    const { quantity } = req.body as { quantity?: number }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'Kuantitas minimal 1' })
    }

    const cart = await Cart.findOne({ userId: req.user!.userId })
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Keranjang tidak ditemukan' })
    }

    const item = cart.items.find((i) => i.productId.toString() === productId)
    if (!item) {
      return res.status(404).json({ success: false, error: 'Produk tidak ada di keranjang' })
    }
    item.quantity = quantity
    await cart.save()

    const data = await buildCartResponse(req.user!.userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('❌ Update cart item error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function removeCartItem(req: Request, res: Response) {
  try {
    const { productId } = req.params
    const cart = await Cart.findOne({ userId: req.user!.userId })
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Keranjang tidak ditemukan' })
    }

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as typeof cart.items
    await cart.save()

    const data = await buildCartResponse(req.user!.userId)
    res.json({ success: true, data })
  } catch (error) {
    console.error('❌ Remove cart item error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
