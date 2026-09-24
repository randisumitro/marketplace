import crypto from 'node:crypto'
import midtransModule from 'midtrans-client'
import type { SnapClient } from 'midtrans-client'
import { env, isMidtransConfigured } from '../config/env.js'

const snap: SnapClient | null = isMidtransConfigured
  ? new midtransModule.Snap({
      isProduction: env.midtrans.isProduction,
      serverKey: env.midtrans.serverKey,
      clientKey: env.midtrans.clientKey,
    })
  : null

export function generateMidtransOrderId(): string {
  return `ONESHOP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

interface ItemDetail {
  id: string
  price: number
  quantity: number
  name: string
}

interface CreateSnapTransactionInput {
  midtransOrderId: string
  grossAmount: number
  items: ItemDetail[]
  customerName: string
  customerEmail: string
  customerPhone: string
}

export async function createSnapTransaction(input: CreateSnapTransactionInput) {
  if (!snap) {
    throw new Error('Midtrans belum dikonfigurasi')
  }

  // Midtrans mewajibkan nama produk maks 50 karakter
  const items = input.items.map((item) => ({ ...item, name: item.name.slice(0, 50) }))

  return snap.createTransaction({
    transaction_details: {
      order_id: input.midtransOrderId,
      gross_amount: input.grossAmount,
    },
    item_details: items,
    customer_details: {
      first_name: input.customerName.slice(0, 50),
      email: input.customerEmail,
      phone: input.customerPhone,
    },
  })
}

/**
 * Verifikasi signature notifikasi Midtrans sesuai dokumentasi resmi:
 * SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(params: {
  orderId: string
  statusCode: string
  grossAmount: string
  signatureKey: string
}): boolean {
  const expected = crypto
    .createHash('sha512')
    .update(params.orderId + params.statusCode + params.grossAmount + env.midtrans.serverKey)
    .digest('hex')
  return expected === params.signatureKey
}
