import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { checkStoreName, registerStore, setupStore, updateStoreProfile, getStoreBySlug } from '../controllers/store.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { env } from '../config/env.js'

export const storeRouter = Router()

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.nodeEnv === 'test',
  message: { success: false, error: 'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.' },
})

// Path statis WAJIB sebelum /:slug
storeRouter.get('/check-name', checkStoreName)
storeRouter.post('/register', registerLimiter, registerStore)
storeRouter.post('/setup', verifyToken, setupStore)
storeRouter.put('/profile', verifyToken, updateStoreProfile)
storeRouter.get('/:slug', getStoreBySlug)
