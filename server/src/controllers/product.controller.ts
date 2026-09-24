import type { Request, Response } from 'express'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { CATEGORIES, type Category } from '../constants/categories.js'

export function getCategories(_req: Request, res: Response) {
  res.json({ success: true, data: CATEGORIES })
}

export async function listProducts(req: Request, res: Response) {
  try {
    const { category, search, storeId, limit } = req.query as {
      category?: string
      search?: string
      storeId?: string
      limit?: string
    }

    const query: Record<string, unknown> = {}
    if (category) query.category = category
    if (storeId) query.storeId = storeId
    if (search) query.$text = { $search: search }

    let cursor = Product.find(query).sort({ createdAt: -1 })
    const parsedLimit = limit ? parseInt(limit, 10) : undefined
    if (parsedLimit && !Number.isNaN(parsedLimit)) cursor = cursor.limit(parsedLimit)

    const products = await cursor
    res.json({ success: true, data: products, count: products.length })
  } catch (error) {
    console.error('❌ List products error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function getMyProducts(req: Request, res: Response) {
  try {
    const products = await Product.find({ storeId: req.user!.userId }).sort({ createdAt: -1 })
    res.json({ success: true, data: products, count: products.length })
  } catch (error) {
    console.error('❌ Get my products error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    }
    res.json({ success: true, data: product })
  } catch {
    res.status(400).json({ success: false, error: 'Format ID produk tidak valid' })
  }
}

interface ProductInput {
  name?: string
  description?: string
  category?: string
  price?: string
  oldPrice?: string
  stock?: string
}

function validateProductInput(body: ProductInput) {
  const { name, category, price, stock } = body
  if (!name || name.trim().length < 3) return 'Nama produk minimal 3 karakter'
  if (!category || !(CATEGORIES as readonly string[]).includes(category)) return 'Kategori tidak valid'

  const priceNum = Number(price)
  if (!price || Number.isNaN(priceNum) || priceNum <= 0) return 'Harga harus angka lebih dari 0'

  const stockNum = Number(stock)
  if (stock === undefined || Number.isNaN(stockNum) || stockNum < 0) return 'Stok harus angka valid'

  return null
}

export async function createProduct(req: Request, res: Response) {
  try {
    const seller = await User.findById(req.user!.userId)
    if (!seller || !seller.storeName || !seller.storeSlug) {
      return res.status(403).json({ success: false, error: 'Kamu belum punya toko' })
    }

    const body = req.body as ProductInput
    const validationError = validateProductInput(body)
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError })
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'Unggah minimal 1 foto produk' })
    }

    const images: string[] = files.map((f) => `https://janjingopi.web.id/uploads/${f.filename}`)

    const product = await Product.create({
      storeId: seller._id,
      storeName: seller.storeName,
      storeSlug: seller.storeSlug,
      name: body.name!.trim(),
      description: body.description?.trim() ?? '',
      category: body.category as Category,
      price: Number(body.price),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
      stock: Number(body.stock),
      images,
    })

    res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: product })
  } catch (error) {
    console.error('❌ Create product error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    }
    if (product.storeId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Kamu tidak berhak mengubah produk ini' })
    }

    // Sinkronkan ulang nama & slug toko dari data terbaru — ini juga membetulkan produk lama
    // yang dibuat sebelum field storeSlug ada, dan menjaga produk tetap sesuai kalau toko diganti nama.
    const seller = await User.findById(req.user!.userId)
    if (seller?.storeName && seller?.storeSlug) {
      product.storeName = seller.storeName
      product.storeSlug = seller.storeSlug
    }

    const body = req.body as ProductInput & { existingImages?: string }
    const validationError = validateProductInput(body)
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError })
    }

    // Foto lama yang tetap dipertahankan user (dikirim frontend sebagai daftar URL)
    let keptImages: string[] = []
    if (body.existingImages) {
      try {
        const parsed = JSON.parse(body.existingImages)
        if (Array.isArray(parsed)) keptImages = parsed.filter((url) => typeof url === 'string')
      } catch {
        // biarkan kosong kalau JSON-nya rusak — fallback aman ke bawah
      }
    }

    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    let newImageUrls: string[] = []
    if (files.length > 0) {
      newImageUrls = files.map((f) => `https://janjingopi.web.id/uploads/${f.filename}`)
    }

    const combinedImages = [...keptImages, ...newImageUrls].slice(0, 4)
    if (combinedImages.length === 0) {
      return res.status(400).json({ success: false, error: 'Produk harus punya minimal 1 foto' })
    }
    product.images = combinedImages

    product.name = body.name!.trim()
    product.description = body.description?.trim() ?? ''
    product.category = body.category as Category
    product.price = Number(body.price)
    product.oldPrice = body.oldPrice ? Number(body.oldPrice) : null
    product.stock = Number(body.stock)
    await product.save()

    res.json({ success: true, message: 'Produk berhasil diperbarui', data: product })
  } catch (error) {
    console.error('❌ Update product error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' })
    }
    if (product.storeId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Kamu tidak berhak menghapus produk ini' })
    }

    await product.deleteOne()
    res.json({ success: true, message: 'Produk berhasil dihapus' })
  } catch (error) {
    console.error('❌ Delete product error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
