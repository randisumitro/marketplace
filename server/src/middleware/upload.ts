import multer from 'multer'

import path from 'path'
import crypto from 'crypto'

const storage = multer.diskStorage({
  destination: '/www/wwwroot/tech.rand.com/public/uploads',
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex')
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 4 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File harus berupa gambar'))
      return
    }
    cb(null, true)
  },
})
