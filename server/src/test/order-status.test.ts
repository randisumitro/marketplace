import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { Product } from '../models/Product.js'
import { useTestDatabase } from './dbSetup.js'
import { uniquePhone } from './helpers.js'

useTestDatabase()
const app = createApp()

async function setupOrder() {
  const buyerRes = await request(app).post('/api/auth/register').send({
    name: 'Pembeli',
    email: `buyer-${Date.now()}-${Math.random()}@example.com`,
    password: 'Password123',
  })
  const buyerToken = buyerRes.body.token as string

  const sellerRes = await request(app).post('/api/store/register').send({
    storeName: `Toko ${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name: 'Penjual',
    email: `seller-${Date.now()}-${Math.random()}@example.com`,
    phone: uniquePhone(),
    password: 'Password123',
  })
  const sellerToken = sellerRes.body.token as string

  const product = await Product.create({
    storeId: sellerRes.body.data.id,
    storeName: sellerRes.body.data.storeName,
    storeSlug: 'toko-test',
    name: 'Produk',
    description: '',
    category: 'Elektronik',
    price: 10000,
    stock: 5,
    images: ['https://example.com/fake.jpg'],
  })

  await request(app).post('/api/cart/add').set('Authorization', `Bearer ${buyerToken}`).send({ productId: product._id.toString(), quantity: 1 })
  const checkout = await request(app)
    .post('/api/orders/checkout')
    .set('Authorization', `Bearer ${buyerToken}`)
    .send({
      shippingAddress: { name: 'Pembeli', phone: '081234567890', address: 'Jalan Contoh 123', city: 'Jakarta', postalCode: '12345' },
    })

  return { buyerToken, sellerToken, orderId: checkout.body.data.orders[0]._id as string, productId: product._id.toString() }
}

describe('Aturan status pesanan', () => {
  it('penjual TIDAK BISA langsung set status jadi selesai', async () => {
    const { sellerToken, orderId } = await setupOrder()
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'selesai' })
    expect(res.status).toBe(403)
  })

  it('penjual bisa memproses lalu mengirim pesanan', async () => {
    const { sellerToken, orderId } = await setupOrder()

    const proses = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'diproses' })
    expect(proses.status).toBe(200)
    expect(proses.body.data.status).toBe('diproses')

    const kirim = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ status: 'dikirim' })
    expect(kirim.status).toBe(200)
    expect(kirim.body.data.shippedAt).toBeTruthy()
  })

  it('pembeli tidak bisa menyelesaikan pesanan sebelum berstatus dikirim', async () => {
    const { buyerToken, orderId } = await setupOrder()
    const res = await request(app).put(`/api/orders/${orderId}/complete`).set('Authorization', `Bearer ${buyerToken}`)
    expect(res.status).toBe(400)
  })

  it('pembeli bisa menyelesaikan pesanan setelah berstatus dikirim', async () => {
    const { buyerToken, sellerToken, orderId } = await setupOrder()
    await request(app).put(`/api/orders/${orderId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'diproses' })
    await request(app).put(`/api/orders/${orderId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'dikirim' })

    const res = await request(app).put(`/api/orders/${orderId}/complete`).set('Authorization', `Bearer ${buyerToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('selesai')
  })

  it('penjual lain tidak bisa mengubah pesanan milik toko lain', async () => {
    const { orderId } = await setupOrder()
    const otherSeller = await request(app).post('/api/store/register').send({
      storeName: `Toko Lain ${Date.now()}`,
      name: 'Penjual Lain',
      email: `otherseller-${Date.now()}@example.com`,
      phone: uniquePhone(),
      password: 'Password123',
    })
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${otherSeller.body.token}`)
      .send({ status: 'diproses' })
    expect(res.status).toBe(403)
  })

  it('pembeli bisa membatalkan pesanan yang masih menunggu konfirmasi, dan stok dikembalikan', async () => {
    const { buyerToken, orderId, productId } = await setupOrder()

    const cancel = await request(app).put(`/api/orders/${orderId}/cancel`).set('Authorization', `Bearer ${buyerToken}`)
    expect(cancel.status).toBe(200)
    expect(cancel.body.data.status).toBe('dibatalkan')

    const product = await Product.findById(productId)
    expect(product?.stock).toBe(5) // balik ke stok semula (5, dikurangi 1 saat checkout, dikembalikan 1 saat batal)
  })

  it('pembeli tidak bisa membatalkan pesanan yang sudah diproses', async () => {
    const { buyerToken, sellerToken, orderId } = await setupOrder()
    await request(app).put(`/api/orders/${orderId}/status`).set('Authorization', `Bearer ${sellerToken}`).send({ status: 'diproses' })

    const cancel = await request(app).put(`/api/orders/${orderId}/cancel`).set('Authorization', `Bearer ${buyerToken}`)
    expect(cancel.status).toBe(400)
  })
})
