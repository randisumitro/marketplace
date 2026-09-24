import type { Request, Response } from 'express'
import { Notification } from '../models/Notification.js'

export async function listNotifications(req: Request, res: Response) {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(30)
    res.json({ success: true, data: notifications })
  } catch (error) {
    console.error('❌ List notifications error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function unreadCount(req: Request, res: Response) {
  try {
    const count = await Notification.countDocuments({ userId: req.user!.userId, isRead: false })
    res.json({ success: true, data: { count } })
  } catch (error) {
    console.error('❌ Unread count error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function markRead(req: Request, res: Response) {
  try {
    await Notification.updateOne(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: { isRead: true } },
    )
    res.json({ success: true })
  } catch {
    res.status(400).json({ success: false, error: 'ID notifikasi tidak valid' })
  }
}

export async function markAllRead(req: Request, res: Response) {
  try {
    await Notification.updateMany({ userId: req.user!.userId, isRead: false }, { $set: { isRead: true } })
    res.json({ success: true })
  } catch (error) {
    console.error('❌ Mark all read error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
