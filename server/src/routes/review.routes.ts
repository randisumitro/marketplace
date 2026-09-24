import { Router } from 'express'
import { createReview, listProductReviews, listMyReviewsForOrder } from '../controllers/review.controller.js'
import { verifyToken } from '../middleware/auth.js'

export const reviewRouter = Router()

reviewRouter.get('/product/:productId', listProductReviews)
reviewRouter.get('/mine', verifyToken, listMyReviewsForOrder)
reviewRouter.post('/', verifyToken, createReview)
