import jwt from 'jsonwebtoken'
import type { Request } from 'express'
import { Types } from 'mongoose'
import { Session } from '../models/Session.js'
import { env } from '../config/env.js'
import { parseUserAgent } from './parseUserAgent.js'

interface TokenUser {
  _id: Types.ObjectId
  email: string
  name: string
  role: string
}

/**
 * Membuat catatan sesi baru di DB lalu menandatangani JWT yang terikat ke sesi itu.
 * Kalau sudah ada sesi lain untuk kombinasi user + perangkat + IP yang sama, sesi itu
 * dipakai ulang (bukan bikin baru terus-menerus) — supaya daftar "Sesi Aktif" tidak
 * membengkak tiap kali orang login ulang dari browser yang sama.
 */
export async function createSessionAndToken(user: TokenUser, req: Request) {
  const device = parseUserAgent(req.headers['user-agent'])
  const ipAddress = req.ip ?? null

  let session = await Session.findOne({ userId: user._id, device, ipAddress })
  if (session) {
    session.lastActiveAt = new Date()
    await session.save()
  } else {
    session = await Session.create({ userId: user._id, device, ipAddress })
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      sessionId: session._id.toString(),
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  )

  return token
}
