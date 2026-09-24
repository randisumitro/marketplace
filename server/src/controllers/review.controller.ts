import type { Request, Response } from 'express'
import { Review } from '../models/Review.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { notify } from '../utils/notify.js'

async function recomputeProductRating(productId: unknown) {
  const stats = await Review.aggregate([
    { $match: { productId } },
    { $group: { _id: '$productId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const { avgRating = 0, count = 0 } = stats[0] ?? {}
  await Product.updateOne(
    { _id: productId },
    { $set: { rating: Math.round(avgRating * 10) / 10, totalReviews: count } },
  )
}

export async function createReview(req: Request, res: Response) {
  try {
    const { productId, orderId, rating, comment } = req.body as {
      productId?: string
      orderId?: string
      rating?: number
      comment?: string
    }

    if (!productId || !orderId) {
      return res.status(400).json({ success: false, error: 'productId dan orderId wajib diisi' })
    }
    const ratingNum = Number(rating)
    if (!rating || Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating harus antara 1-5' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' })
    }
    if (order.buyerId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Ini bukan pesananmu' })
    }
    if (order.status !== 'selesai') {
      return res.status(400).json({ success: false, error: 'Hanya bisa mengulas produk dari pesanan yang sudah selesai' })
    }
    const purchasedItem = order.items.find((i) => i.productId.toString() === productId)
    if (!purchasedItem) {
      return res.status(400).json({ success: false, error: 'Produk ini tidak ada di pesanan tersebut' })
    }

    let review
    try {
      review = await Review.create({
        productId,
        orderId,
        buyerId: req.user!.userId,
        buyerName: order.buyerName,
        rating: ratingNum,
        comment: comment?.trim() ?? '',
      })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
        return res.status(409).json({ success: false, error: 'Kamu sudah mengulas produk ini untuk pesanan tersebut' })
      }
      throw err
    }

    await recomputeProductRating(review.productId)

    const product = await Product.findById(productId)
    if (product) {
      await notify(product.storeId, 'Ulasan baru', `${order.buyerName} memberi rating untuk "${product.name}"`, `/produk/${productId}`)
    }

    res.status(201).json({ success: true, message: 'Ulasan berhasil dikirim', data: review })
  } catch (error) {
    console.error('❌ Create review error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function listProductReviews(req: Request, res: Response) {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 })
    res.json({ success: true, data: reviews })
  } catch {
    res.status(400).json({ success: false, error: 'ID produk tidak valid' })
  }
}

export async function listMyReviewsForOrder(req: Request, res: Response) {
  try {
    const orderId = req.query.orderId as string | undefined
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId wajib diisi' })
    }
    const reviews = await Review.find({ orderId, buyerId: req.user!.userId })
    res.json({ success: true, data: reviews.map((r) => r.productId.toString()) })
  } catch {
    res.status(400).json({ success: false, error: 'orderId tidak valid' })
  }
}
