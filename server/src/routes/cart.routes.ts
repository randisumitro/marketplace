import { Router } from 'express'
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cart.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const cartRouter = Router()

cartRouter.use(verifyToken)
cartRouter.get('/', getCart)
cartRouter.post('/add', addToCart)
cartRouter.put('/item/:productId', updateCartItem)
cartRouter.delete('/item/:productId', removeCartItem)
