import { Router } from 'express'
import { handlePaymentNotification, getPaymentForOrder } from '../controllers/payment.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const paymentRouter = Router()

// Endpoint ini dipanggil Midtrans langsung dari server mereka — tidak ada token user untuk
// diverifikasi di sini. Keamanannya dari verifikasi signature di dalam controller-nya sendiri.
paymentRouter.post('/notification', handlePaymentNotification)

paymentRouter.get('/order/:orderId', verifyToken, getPaymentForOrder)
