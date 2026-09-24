import type { NextFunction, Request, Response } from 'express'
import { isProduction } from '../config/env.js'

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, error: `Endpoint tidak ditemukan: ${req.method} ${req.path}` })
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error('❌ Server error:', err)
  res.status(500).json({
    success: false,
    error: isProduction ? 'Terjadi kesalahan pada server' : err.message,
  })
}
