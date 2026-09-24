import { Router } from 'express'
import {
  getCategories,
  listProducts,
  getMyProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js'
import { verifyToken } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

export const productRouter = Router()

// Path statis WAJIB terdaftar sebelum /:id, kalau tidak Express akan menganggapnya sebagai id
productRouter.get('/categories', getCategories)
productRouter.get('/store/mine', verifyToken, getMyProducts)

productRouter.get('/', listProducts)
productRouter.get('/:id', getProduct)
productRouter.post('/', verifyToken, upload.array('images', 4), createProduct)
productRouter.put('/:id', verifyToken, upload.array('images', 4), updateProduct)
productRouter.delete('/:id', verifyToken, deleteProduct)
