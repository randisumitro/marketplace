import { Router } from 'express'
import {
  checkout,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus,
  completeOrder,
  cancelOrder,
  getShippingRate,
  confirmManualPayment,
} from '../controllers/order.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const orderRouter = Router()

orderRouter.use(verifyToken)
orderRouter.get('/shipping-rate', getShippingRate)
orderRouter.post('/checkout', checkout)
orderRouter.get('/mine', getMyOrders)
orderRouter.get('/store/mine', getStoreOrders)
orderRouter.put('/:id/status', updateOrderStatus)
orderRouter.put('/:id/complete', completeOrder)
orderRouter.put('/:id/cancel', cancelOrder)
orderRouter.put('/:id/confirm-payment', confirmManualPayment)
