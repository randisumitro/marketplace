import { Router } from 'express'
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const wishlistRouter = Router()

wishlistRouter.use(verifyToken)
wishlistRouter.get('/', getWishlist)
wishlistRouter.post('/:productId', addToWishlist)
wishlistRouter.delete('/:productId', removeFromWishlist)
