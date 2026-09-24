import { Types } from 'mongoose'
import { Notification } from '../models/Notification.js'
import { User } from '../models/User.js'
import { env } from '../config/env.js'
import { sendEmail, notificationEmail } from './sendEmail.js'

export async function notify(userId: Types.ObjectId | string, title: string, message: string, link?: string) {
  try {
    await Notification.create({ userId, title, message, link: link ?? null })
  } catch (error) {
    console.error('❌ Gagal membuat notifikasi:', error)
  }

  // Kirim email juga (best-effort) — supaya orang tetap tahu meski tidak sedang buka OneShop.
  try {
    const user = await User.findById(userId).select('email')
    if (user?.email) {
      const fullLink = `${env.clientOrigin}${link ?? ''}`
      await sendEmail({ to: user.email, subject: title, html: notificationEmail(title, message, fullLink) })
    }
  } catch (error) {
    console.error('❌ Gagal mengirim email notifikasi:', error)
  }
}
