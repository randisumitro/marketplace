import type { Request, Response } from 'express'
import { Payment, type PaymentStatus } from '../models/Payment.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { verifyMidtransSignature } from '../utils/midtrans.js'
import { notify } from '../utils/notify.js'

interface MidtransNotification {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
  transaction_status: string
  fraud_status?: string
}

function mapTransactionStatus(body: MidtransNotification): PaymentStatus {
  const { transaction_status, fraud_status } = body
  if (transaction_status === 'capture') {
    return fraud_status === 'accept' ? 'settlement' : 'deny'
  }
  if (transaction_status === 'settlement') return 'settlement'
  if (transaction_status === 'pending') return 'pending'
  if (transaction_status === 'deny') return 'deny'
  if (transaction_status === 'cancel') return 'cancel'
  if (transaction_status === 'expire') return 'expire'
  return 'failure'
}

/** Dipanggil Midtrans sendiri (server-to-server), bukan oleh browser pembeli. */
export async function handlePaymentNotification(req: Request, res: Response) {
  try {
    const body = req.body as MidtransNotification

    const isValid = verifyMidtransSignature({
      orderId: body.order_id,
      statusCode: body.status_code,
      grossAmount: body.gross_amount,
      signatureKey: body.signature_key,
    })
    if (!isValid) {
      return res.status(403).json({ success: false, error: 'Signature tidak valid' })
    }

    const payment = await Payment.findOne({ midtransOrderId: body.order_id })
    if (!payment) {
      return res.status(404).json({ success: false, error: 'Transaksi tidak ditemukan' })
    }

    const newStatus = mapTransactionStatus(body)
    if (payment.status === newStatus) {
      return res.json({ success: true, message: 'Status sudah sesuai, tidak ada perubahan' })
    }
    payment.status = newStatus
    await payment.save()

    const orders = await Order.find({ _id: { $in: payment.orderIds } })

    if (newStatus === 'settlement') {
      for (const order of orders) {
        if (order.status !== 'menunggu_pembayaran') continue
        order.status = 'menunggu_konfirmasi'
        await order.save()
        await notify(
          order.storeId,
          'Pesanan baru masuk',
          `${order.buyerName} memesan ${order.items.length} produk senilai Rp${order.subtotal.toLocaleString('id-ID')} (sudah dibayar)`,
          '/toko/pesanan',
        )
      }
    } else if (['expire', 'cancel', 'deny', 'failure'].includes(newStatus)) {
      for (const order of orders) {
        if (order.status !== 'menunggu_pembayaran') continue
        order.status = 'dibatalkan'
        await order.save()
        // Kembalikan stok yang sempat "dikunci" saat checkout
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: item.quantity, terjual: -item.quantity } },
          )
        }
      }
    }
    // status 'pending' — belum ada tindakan, tunggu notifikasi berikutnya

    res.json({ success: true, message: 'Notifikasi diproses' })
  } catch (error) {
    console.error('❌ Payment notification error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

/** Dipakai buyer untuk membuka ulang popup pembayaran kalau sebelumnya tertutup/gagal. */
export async function getPaymentForOrder(req: Request, res: Response) {
  try {
    const payment = await Payment.findOne({
      orderIds: req.params.orderId,
      buyerId: req.user!.userId,
    } as Record<string, unknown>).sort({ createdAt: -1 })

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Transaksi pembayaran tidak ditemukan' })
    }

    res.json({
      success: true,
      data: { snapToken: payment.snapToken, status: payment.status },
    })
  } catch {
    res.status(400).json({ success: false, error: 'ID pesanan tidak valid' })
  }
}
