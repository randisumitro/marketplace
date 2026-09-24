import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { Product } from '../models/Product.js'
import { useTestDatabase } from './dbSetup.js'
import { uniquePhone } from './helpers.js'

useTestDatabase()
const app = createApp()

async function registerBuyer(email: string) {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Pembeli Test',
    email,
    password: 'Password123',
  })
  return res.body.token as string
}

async function registerSeller(email: string, storeName: string) {
  const res = await request(app).post('/api/store/register').send({
    storeName,
    name: 'Penjual Test',
    email,
    phone: uniquePhone(),
    password: 'Password123',
  })
  return { token: res.body.token as string, storeId: res.body.data.id as string, storeName: res.body.data.storeName as string }
}

async function insertProduct(storeId: string, storeName: string, overrides: Partial<{ price: number; stock: number; name: string }> = {}) {
  const product = await Product.create({
    storeId,
    storeName,
    storeSlug: storeName.toLowerCase().replace(/\s+/g, '-'),
    name: overrides.name ?? 'Produk Test',
    description: 'Deskripsi produk test',
    category: 'Elektronik',
    price: overrides.price ?? 50000,
    stock: overrides.stock ?? 10,
    images: ['https://example.com/fake.jpg'],
  })
  return product
}

describe('Checkout', () => {
  it('membuat pesanan dengan subtotal, ongkir, dan total yang benar', async () => {
    const buyerToken = await registerBuyer('buyer1@example.com')
    const seller = await registerSeller('seller1@example.com', 'Toko Satu')
    const product = await insertProduct(seller.storeId, seller.storeName, { price: 50000, stock: 10 })

    await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId: product._id.toString(), quantity: 2 })

    const checkout = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        shippingAddress: {
          name: 'Pembeli Test',
          phone: '081234567890',
          address: 'Jalan Contoh No. 123',
          city: 'Jakarta',
          postalCode: '12345',
        },
      })

    expect(checkout.status).toBe(201)
    expect(checkout.body.data.orders).toHaveLength(1)
    expect(checkout.body.data.snapToken).toBeNull() // Midtrans tidak dikonfigurasi saat test
    const order = checkout.body.data.orders[0]
    expect(order.subtotal).toBe(100000) // 2 x 50000
    expect(order.shippingCost).toBe(15000)
    expect(order.total).toBe(115000)
    expect(order.status).toBe('menunggu_konfirmasi')

    // Stok harus berkurang
    const updatedProduct = await Product.findById(product._id)
    expect(updatedProduct?.stock).toBe(8)
    expect(updatedProduct?.terjual).toBe(2)

    // Keranjang harus kosong setelah checkout
    const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${buyerToken}`)
    expect(cart.body.data.items).toHaveLength(0)
  })

  it('memecah satu checkout jadi beberapa pesanan kalau produk dari toko berbeda', async () => {
    const buyerToken = await registerBuyer('buyer2@example.com')
    const sellerA = await registerSeller('sellerA@example.com', 'Toko A')
    const sellerB = await registerSeller('sellerB@example.com', 'Toko B')
    const productA = await insertProduct(sellerA.storeId, sellerA.storeName, { price: 20000 })
    const productB = await insertProduct(sellerB.storeId, sellerB.storeName, { price: 30000 })

    await request(app).post('/api/cart/add').set('Authorization', `Bearer ${buyerToken}`).send({ productId: productA._id.toString(), quantity: 1 })
    await request(app).post('/api/cart/add').set('Authorization', `Bearer ${buyerToken}`).send({ productId: productB._id.toString(), quantity: 1 })

    const checkout = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        shippingAddress: {
          name: 'Pembeli Test',
          phone: '081234567890',
          address: 'Jalan Contoh No. 123',
          city: 'Jakarta',
          postalCode: '12345',
        },
      })

    expect(checkout.status).toBe(201)
    expect(checkout.body.data.orders).toHaveLength(2) // dua toko = dua pesanan terpisah
  })

  it('menolak checkout kalau stok tidak cukup', async () => {
    const buyerToken = await registerBuyer('buyer3@example.com')
    const seller = await registerSeller('seller3@example.com', 'Toko Tiga')
    const product = await insertProduct(seller.storeId, seller.storeName, { stock: 1 })

    await request(app).post('/api/cart/add').set('Authorization', `Bearer ${buyerToken}`).send({ productId: product._id.toString(), quantity: 5 })

    const checkout = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        shippingAddress: {
          name: 'Pembeli Test',
          phone: '081234567890',
          address: 'Jalan Contoh No. 123',
          city: 'Jakarta',
          postalCode: '12345',
        },
      })

    expect(checkout.status).toBe(409)

    // Stok tidak boleh berubah sama sekali kalau checkout gagal
    const unchangedProduct = await Product.findById(product._id)
    expect(unchangedProduct?.stock).toBe(1)
  })

  it('menolak checkout dengan keranjang kosong', async () => {
    const buyerToken = await registerBuyer('buyer4@example.com')
    const checkout = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        shippingAddress: {
          name: 'Pembeli Test',
          phone: '081234567890',
          address: 'Jalan Contoh No. 123',
          city: 'Jakarta',
          postalCode: '12345',
        },
      })
    expect(checkout.status).toBe(400)
  })
})
