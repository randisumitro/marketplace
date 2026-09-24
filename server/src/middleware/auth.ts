import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Session } from '../models/Session.js'

export interface AuthPayload {
  userId: string
  email: string
  name: string
  role: 'customer' | 'admin'
  sessionId: string
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token tidak ditemukan. Silakan masuk terlebih dahulu.' })
  }

  let payload: AuthPayload
  try {
    payload = jwt.verify(token, env.jwtSecret) as AuthPayload
  } catch {
    return res.status(403).json({ success: false, error: 'Token tidak valid atau sudah kedaluwarsa. Silakan masuk ulang.' })
  }

  // Sesi bisa dicabut manual (lihat fitur "Sesi Aktif") — JWT yang sesinya sudah dihapus
  // harus ikut ditolak, walau tanda tangannya masih valid.
  try {
    const sessionExists = await Session.exists({ _id: payload.sessionId })
    if (!sessionExists) {
      return res.status(401).json({ success: false, error: 'Sesi ini sudah berakhir. Silakan masuk ulang.' })
    }
  } catch (error) {
    // Gangguan koneksi database saat mengecek sesi — ini BUKAN berarti sesinya tidak valid,
    // jadi jangan disamakan dengan 401 (yang bikin frontend menghapus token). Beri 503 supaya
    // frontend tahu ini cuma masalah sementara dan token tetap dipertahankan.
    console.error('❌ Gagal memeriksa sesi:', error)
    return res.status(503).json({ success: false, error: 'Tidak bisa memverifikasi sesi saat ini. Coba lagi sebentar.' })
  }
  Session.updateOne({ _id: payload.sessionId }, { $set: { lastActiveAt: new Date() } }).catch(() => {})

  req.user = payload
  next()
}

