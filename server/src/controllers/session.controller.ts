import type { Request, Response } from 'express'
import { Session } from '../models/Session.js'

export async function listSessions(req: Request, res: Response) {
  try {
    const sessions = await Session.find({ userId: req.user!.userId }).sort({ lastActiveAt: -1 })
    const data = sessions.map((s) => ({
      id: s._id,
      device: s.device,
      ipAddress: s.ipAddress,
      lastActiveAt: s.lastActiveAt,
      createdAt: s.get('createdAt'),
      isCurrent: s._id.toString() === req.user!.sessionId,
    }))
    res.json({ success: true, data })
  } catch (error) {
    console.error('❌ List sessions error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function revokeSession(req: Request, res: Response) {
  try {
    const result = await Session.deleteOne({ _id: req.params.id, userId: req.user!.userId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Sesi tidak ditemukan' })
    }
    res.json({ success: true, message: 'Sesi berhasil diakhiri' })
  } catch {
    res.status(400).json({ success: false, error: 'ID sesi tidak valid' })
  }
}

export async function revokeOtherSessions(req: Request, res: Response) {
  try {
    const result = await Session.deleteMany({
      userId: req.user!.userId,
      _id: { $ne: req.user!.sessionId },
    })
    res.json({ success: true, message: `${result.deletedCount} sesi lain berhasil diakhiri` })
  } catch (error) {
    console.error('❌ Revoke other sessions error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
