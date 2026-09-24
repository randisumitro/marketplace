import { Router } from 'express'
import mongoose from 'mongoose'

export const healthRouter = Router()

healthRouter.get('/', (_req, res) => {
  const dbState = mongoose.connection.readyState // 1 = connected
  res.json({
    success: true,
    status: 'ok',
    database: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})
