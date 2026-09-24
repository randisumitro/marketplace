import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  register,
  login,
  me,
  logout,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  googleLogin,
} from '../controllers/auth.controller.js'
import { listSessions, revokeSession, revokeOtherSessions } from '../controllers/session.controller.js'
import { sendPhoneOtp, verifyPhoneOtp } from '../controllers/phoneVerification.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { env } from '../config/env.js'

export const authRouter = Router()

// Nonaktifkan rate limit saat automated test — supaya test suite tidak memblokir dirinya sendiri
// dengan banyak request register/login berturut-turut dalam satu proses.
const skipInTest = () => env.nodeEnv === 'test'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: skipInTest,
  message: { success: false, error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.' },
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, error: 'Terlalu banyak percobaan pendaftaran. Coba lagi nanti.' },
})

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
})

authRouter.post('/register', registerLimiter, register)
authRouter.post('/login', loginLimiter, login)
authRouter.post('/google', loginLimiter, googleLogin)
authRouter.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
authRouter.post('/reset-password', forgotPasswordLimiter, resetPassword)
authRouter.get('/me', verifyToken, me)
authRouter.post('/logout', verifyToken, logout)
authRouter.put('/change-password', verifyToken, changePassword)
authRouter.put('/profile', verifyToken, updateProfile)

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // SMS berbayar — batasi ketat supaya tidak disalahgunakan
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTest,
  message: { success: false, error: 'Terlalu banyak permintaan OTP. Coba lagi dalam 15 menit.' },
})

authRouter.post('/phone/send-otp', verifyToken, otpLimiter, sendPhoneOtp)
authRouter.post('/phone/verify-otp', verifyToken, verifyPhoneOtp)

authRouter.get('/sessions', verifyToken, listSessions)
authRouter.delete('/sessions/others', verifyToken, revokeOtherSessions)
authRouter.delete('/sessions/:id', verifyToken, revokeSession)
