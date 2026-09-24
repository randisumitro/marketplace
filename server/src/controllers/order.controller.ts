import type { Request, Response } from 'express'
import { Cart } from '../models/Cart.js'
import { Order, ORDER_STATUSES, type OrderStatus } from '../models/Order.js'
import { Payment } from '../models/Payment.js'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { notify } from '../utils/notify.js'
import { isMidtransConfigured } from '../config/env.js'
import { createSnapTransaction, generateMidtransOrderId } from '../utils/midtrans.js'

const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_pembayaran: 'Menunggu Pembayaran',
  menunggu_konfirmasi: 'Menunggu Konfirmasi',
  diproses: 'Diproses',
  dikirim: 'Dikirim',
  sampai_tujuan: 'Tiba di Tujuan',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

interface PopulatedProduct {
  _id: { toString(): string }
  name: string
  price: number
  images: string[]
  stock: number
  storeId: { toString(): string }
  storeName: string
}

const AUTO_COMPLETE_WINDOW_MS = 24 * 60 * 60 * 1000

// Ongkir flat per toko (bukan per kurir sungguhan — lihat catatan di README).
const FLAT_SHIPPING_COST = 15000

/**
 * Pesanan berstatus 'dikirim' yang sudah melewati 24 jam tanpa konfirmasi pembeli
 * otomatis diselesaikan. Dipanggil setiap kali daftar pesanan diambil (bukan cron job
 * terjadwal — cukup untuk skala proyek ini, tapi di sistem produksi sungguhan idealnya
 * pakai scheduled job supaya tetap ter-update walau tidak ada yang membuka halaman pesanan).
 */
export async function autoCompleteOverdueOrders() {
  const overdue = await Order.find({
    status: { $in: ['dikirim', 'sampai_tujuan'] },
    shippedAt: { $lte: new Date(Date.now() - AUTO_COMPLETE_WINDOW_MS) },
  })

  for (const order of overdue) {
    order.status = 'selesai'
    await order.save()
    await notify(
      order.storeId,
      'Pesanan otomatis selesai',
      `Pesanan dari ${order.buyerName} otomatis ditandai selesai (tidak dikonfirmasi dalam 24 jam)`,
      '/toko/pesanan',
    )
  }
}

interface ShippingAddressInput {
  name?: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
}

function validateShippingAddress(input: ShippingAddressInput): string | null {
  if (!input.name || input.name.trim().length < 3) return 'Nama penerima minimal 3 karakter'
  if (!input.phone || input.phone.trim().length < 10) return 'Nomor HP minimal 10 digit'
  if (!input.address || input.address.trim().length < 10) return 'Alamat lengkap minimal 10 karakter'
  if (!input.city || input.city.trim().length < 2) return 'Kota wajib diisi'
  if (!input.postalCode || input.postalCode.trim().length < 4) return 'Kode pos tidak valid'
  return null
}

export function getShippingRate(_req: Request, res: Response) {
  res.json({ success: true, data: { flatRatePerStore: FLAT_SHIPPING_COST } })
}

export async function checkout(req: Request, res: Response) {
  try {
    const shippingAddress = req.body.shippingAddress as ShippingAddressInput | undefined
    const validationError = shippingAddress ? validateShippingAddress(shippingAddress) : 'Alamat pengiriman wajib diisi'
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError })
    }

    const buyer = await User.findById(req.user!.userId)
    if (!buyer) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }

    const cart = await Cart.findOne({ userId: buyer._id }).populate<{
      items: { productId: PopulatedProduct | null; quantity: number }[]
    }>('items.productId')

    const items = (cart?.items ?? []).filter((i) => i.productId !== null)
    if (items.length === 0) {
      return res.status(400).json({ success: false, error: 'Keranjang kamu kosong' })
    }

    // Validasi stok dulu sebelum membuat pesanan apa pun — semua atau tidak sama sekali
    for (const item of items) {
      const product = item.productId as unknown as PopulatedProduct
      if (item.quantity > product.stock) {
        return res.status(409).json({
          success: false,
          error: `Stok "${product.name}" tinggal ${product.stock}, tapi kamu pesan ${item.quantity}`,
        })
      }
    }

    // Kelompokkan item per toko — satu keranjang bisa jadi beberapa pesanan
    const byStore = new Map<string, { storeName: string; items: typeof items }>()
    for (const item of items) {
      const product = item.productId as unknown as PopulatedProduct
      const key = product.storeId.toString()
      if (!byStore.has(key)) byStore.set(key, { storeName: product.storeName, items: [] })
      byStore.get(key)!.items.push(item)
    }

    const initialStatus: OrderStatus = 'menunggu_pembayaran'

    const createdOrders = []
    const snapItemDetails: { id: string; price: number; quantity: number; name: string }[] = []

    for (const [storeId, group] of byStore) {
      const orderItems = group.items.map((item) => {
        const product = item.productId as unknown as PopulatedProduct
        return {
          productId: product._id,
          name: product.name,
          image: product.images[0] ?? null,
          price: product.price,
          quantity: item.quantity,
        }
      })
      const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const shippingCost = FLAT_SHIPPING_COST
      const total = subtotal + shippingCost

      const order = await Order.create({
        buyerId: buyer._id,
        buyerName: buyer.name,
        storeId,
        storeName: group.storeName,
        items: orderItems,
        subtotal,
        shippingCost,
        total,
        shippingAddress,
        status: initialStatus,
      })
      createdOrders.push(order)

      for (const item of orderItems) {
        snapItemDetails.push({
          id: item.productId.toString(),
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })
      }
      snapItemDetails.push({
        id: `shipping-${storeId}`,
        price: shippingCost,
        quantity: 1,
        name: `Ongkos Kirim - ${group.storeName}`,
      })

      // Kurangi stok & tambah hitungan terjual — tetap di sini terlepas dari status pembayaran,
      // supaya stok "dikunci" begitu checkout dibuat (mencegah race condition kehabisan stok
      // sementara orang lain masih menyelesaikan pembayaran). Kalau pembayaran gagal/kedaluwarsa,
      // stok dikembalikan lewat webhook Midtrans (lihat handlePaymentNotification).
      for (const item of group.items) {
        const product = item.productId as unknown as PopulatedProduct
        await Product.updateOne(
          { _id: product._id },
          { $inc: { stock: -item.quantity, terjual: item.quantity } },
        )
      }

      if (!isMidtransConfigured) {
        await notify(
          storeId,
          'Pesanan baru masuk',
          `${buyer.name} memesan ${orderItems.length} produk senilai Rp${subtotal.toLocaleString('id-ID')}`,
          '/toko/pesanan',
        )
      }
    }

    await Cart.updateOne({ userId: buyer._id }, { $set: { items: [] } })

    if (!isMidtransConfigured) {
      return res.status(201).json({
        success: true,
        message: `${createdOrders.length} pesanan berhasil dibuat`,
        data: { orders: createdOrders, snapToken: null },
      })
    }

    // Dengan Midtrans: buat satu transaksi pembayaran yang mencakup semua pesanan tadi
    // (bisa lebih dari satu kalau checkout dari beberapa toko sekaligus).
    const midtransOrderId = generateMidtransOrderId()
    const grossAmount = createdOrders.reduce((sum, o) => sum + o.total, 0)

    let snapResult
    try {
      snapResult = await createSnapTransaction({
        midtransOrderId,
        grossAmount,
        items: snapItemDetails,
        customerName: buyer.name,
        customerEmail: buyer.email,
        customerPhone: shippingAddress!.phone!,
      })
    } catch (err) {
      console.error('❌ Gagal membuat transaksi Midtrans:', err)
      return res.status(502).json({
        success: false,
        error: 'Gagal menghubungi payment gateway. Pesanan tidak dibatalkan — coba lagi dari halaman Pesanan.',
      })
    }

    await Payment.create({
      buyerId: buyer._id,
      midtransOrderId,
      orderIds: createdOrders.map((o) => o._id),
      amount: grossAmount,
      snapToken: snapResult.token,
    })

    res.status(201).json({
      success: true,
      message: `${createdOrders.length} pesanan dibuat, menunggu pembayaran`,
      data: { orders: createdOrders, snapToken: snapResult.token },
    })
  } catch (error) {
    console.error('❌ Checkout error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function getMyOrders(req: Request, res: Response) {
  try {
    await autoCompleteOverdueOrders()
    const orders = await Order.find({ buyerId: req.user!.userId }).sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('❌ Get my orders error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function getStoreOrders(req: Request, res: Response) {
  try {
    await autoCompleteOverdueOrders()
    const orders = await Order.find({ storeId: req.user!.userId }).sort({ createdAt: -1 })
    res.json({ success: true, data: orders })
  } catch (error) {
    console.error('❌ Get store orders error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

// Penjual hanya boleh menggerakkan pesanan sampai 'selesai' (melalui Gudang Toko) atau konfirmasi pembeli
// (atau auto-selesai 24 jam).
const SELLER_ALLOWED_STATUSES: OrderStatus[] = ['diproses', 'dikirim', 'sampai_tujuan', 'selesai', 'dibatalkan']

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { status } = req.body as { status?: OrderStatus }
    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Status tidak valid' })
    }
    if (!SELLER_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({
        success: false,
        error: 'Status tidak valid',
      })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' })
    }
    if (order.storeId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Kamu tidak berhak mengubah pesanan ini' })
    }

    order.status = status
    if (status === 'dikirim' && !order.shippedAt) {
      order.shippedAt = new Date()
    }
    await order.save()

    await notify(
      order.buyerId,
      `Pesanan ${STATUS_LABEL[status]}`,
      `Pesananmu dari ${order.storeName} sekarang berstatus "${STATUS_LABEL[status]}"`,
      '/pesanan',
    )

    res.json({ success: true, message: 'Status pesanan diperbarui', data: order })
  } catch (error) {
    console.error('❌ Update order status error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function cancelOrder(req: Request, res: Response) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' })
    }
    if (order.buyerId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Ini bukan pesanan kamu' })
    }
    const cancellableStatuses: OrderStatus[] = ['menunggu_pembayaran', 'menunggu_konfirmasi']
    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      return res.status(400).json({
        success: false,
        error: 'Pesanan hanya bisa dibatalkan sebelum diproses penjual',
      })
    }

    order.status = 'dibatalkan'
    await order.save()

    // Kembalikan stok yang sempat dikurangi saat checkout
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { stock: item.quantity, terjual: -item.quantity } },
      )
    }

    await notify(
      order.storeId,
      'Pesanan dibatalkan pembeli',
      `${order.buyerName} membatalkan pesanan sebelum diproses`,
      '/toko/pesanan',
    )

    res.json({ success: true, message: 'Pesanan berhasil dibatalkan', data: order })
  } catch (error) {
    console.error('❌ Cancel order error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function completeOrder(req: Request, res: Response) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' })
    }
    if (order.buyerId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Ini bukan pesanan kamu' })
    }
    if (order.status !== 'sampai_tujuan' && order.status !== 'dikirim') {
      return res.status(400).json({
        success: false,
        error: 'Pesanan baru bisa diselesaikan setelah berstatus "Tiba di Tujuan" atau "Dikirim"',
      })
    }

    order.status = 'selesai'
    await order.save()

    await notify(
      order.storeId,
      'Pesanan selesai',
      `${order.buyerName} sudah mengonfirmasi pesanan diterima`,
      '/toko/pesanan',
    )

    res.json({ success: true, message: 'Pesanan ditandai selesai', data: order })
  } catch (error) {
    console.error('❌ Complete order error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function confirmManualPayment(req: Request, res: Response) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' })
    }
    if (order.buyerId.toString() !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Ini bukan pesanan kamu' })
    }
    if (order.status !== 'menunggu_pembayaran') {
      return res.status(400).json({ success: false, error: 'Pesanan tidak dalam status menunggu pembayaran' })
    }
    order.status = 'menunggu_konfirmasi'
    await order.save()

    await notify(
      order.storeId,
      'Pembayaran dikonfirmasi pembeli',
      `${order.buyerName} sudah mengonfirmasi pembayaran secara manual untuk pesanannya. Harap cek mutasi rekening Anda.`,
      '/toko/pesanan',
    )
    res.json({ success: true, message: 'Pembayaran berhasil dikonfirmasi', data: order })
  } catch (error) {
    console.error('❌ Confirm manual payment error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

