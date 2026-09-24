import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { env } from './config/env.js'
import { healthRouter } from './routes/health.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { storeRouter } from './routes/store.routes.js'
import { productRouter } from './routes/product.routes.js'
import { cartRouter } from './routes/cart.routes.js'
import { orderRouter } from './routes/order.routes.js'
import { wishlistRouter } from './routes/wishlist.routes.js'
import { notificationRouter } from './routes/notification.routes.js'
import { reviewRouter } from './routes/review.routes.js'
import { paymentRouter } from './routes/payment.routes.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()

  // Railway (dan platform hosting sejenis) menaruh app di belakang reverse proxy — tanpa
  // ini, req.ip akan selalu menunjuk IP proxy-nya (sama untuk semua orang), bukan IP
  // pengguna sungguhan. Ini penting untuk rate limiting yang benar dan pencatatan IP sesi
  // login. Di lokal (development) tidak ada proxy jadi ini aman diaktifkan selalu.
  app.set('trust proxy', 1)

  app.use(
    helmet({
      // Default helmet ('same-origin') memblokir komunikasi popup yang dipakai Google
      // Sign-In dan Midtrans Snap — 'same-origin-allow-popups' ini rekomendasi resmi
      // Google untuk situs yang memakai alur login via popup.
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  )
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(cookieParser())

  // Global rate limit — tighten per-route (e.g. /api/auth/login) as those routes are built
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Terlalu banyak request. Coba lagi sebentar lagi.' },
    }),
  )

  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'OneShop API — lihat /api/health untuk status' })
  })

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/store', storeRouter)
  app.use('/api/products', productRouter)
  app.use('/api/cart', cartRouter)
  app.use('/api/orders', orderRouter)
  app.use('/api/wishlist', wishlistRouter)
  app.use('/api/notifications', notificationRouter)
  app.use('/api/reviews', reviewRouter)
  app.use('/api/payments', paymentRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
