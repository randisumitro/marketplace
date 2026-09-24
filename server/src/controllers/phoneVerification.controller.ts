import type { Request, Response } from 'express'
import twilio from 'twilio'
import { User } from '../models/User.js'
import { env, isTwilioConfigured } from '../config/env.js'
import { toE164Indonesia } from '../utils/phoneFormat.js'

const client = isTwilioConfigured ? twilio(env.twilio.accountSid, env.twilio.authToken) : null

export async function sendPhoneOtp(req: Request, res: Response) {
  // Dideklarasikan di sini (bukan di dalam try) supaya tetap terbaca dari blok catch di bawah.
  let attemptedNumber: string | null = null

  try {
    if (!client) {
      return res.status(503).json({
        success: false,
        error: 'Verifikasi HP belum dikonfigurasi di server ini (kredensial Twilio kosong).',
      })
    }

    const user = await User.findById(req.user!.userId)
    if (!user || !user.phone) {
      return res.status(400).json({ success: false, error: 'Isi nomor HP kamu dulu sebelum verifikasi' })
    }
    if (user.isPhoneVerified) {
      return res.status(400).json({ success: false, error: 'Nomor HP kamu sudah terverifikasi' })
    }

    attemptedNumber = toE164Indonesia(user.phone)
    await client.verify.v2
      .services(env.twilio.verifyServiceSid)
      .verifications.create({ to: attemptedNumber, channel: 'sms' })

    res.json({ success: true, message: `Kode OTP dikirim ke ${user.phone}` })
  } catch (error) {
    console.error('❌ Send OTP error:', error)
    // Kode 21608 = akun Twilio trial cuma boleh SMS ke nomor yang sudah diverifikasi manual
    // di Twilio Console. Tunjukkan nomor E.164 yang dicoba supaya gampang ketahuan kalau
    // formatnya tidak cocok dengan yang diverifikasi di sana.
    if (error && typeof error === 'object' && 'code' in error && error.code === 21608) {
      return res.status(400).json({
        success: false,
        error: `Nomor ${attemptedNumber ?? ''} belum diverifikasi di Twilio (akun trial cuma bisa kirim SMS ke nomor yang sudah diverifikasi manual di Twilio Console > Phone Numbers > Verified Caller IDs). Pastikan nomor di Akun Saya sama persis dengan yang diverifikasi di sana.`,
      })
    }
    res.status(500).json({ success: false, error: 'Gagal mengirim kode OTP. Pastikan nomor HP valid.' })
  }
}

export async function verifyPhoneOtp(req: Request, res: Response) {
  try {
    if (!client) {
      return res.status(503).json({ success: false, error: 'Verifikasi HP belum dikonfigurasi di server ini.' })
    }

    const { code } = req.body as { code?: string }
    if (!code) {
      return res.status(400).json({ success: false, error: 'Kode OTP wajib diisi' })
    }

    const user = await User.findById(req.user!.userId)
    if (!user || !user.phone) {
      return res.status(400).json({ success: false, error: 'Nomor HP tidak ditemukan' })
    }

    const check = await client.verify.v2
      .services(env.twilio.verifyServiceSid)
      .verificationChecks.create({ to: toE164Indonesia(user.phone), code })

    if (check.status !== 'approved') {
      return res.status(400).json({ success: false, error: 'Kode OTP salah atau sudah kedaluwarsa' })
    }

    user.isPhoneVerified = true
    await user.save()

    res.json({ success: true, message: 'Nomor HP berhasil diverifikasi' })
  } catch (error) {
    console.error('❌ Verify OTP error:', error)
    res.status(500).json({ success: false, error: 'Gagal memverifikasi kode OTP' })
  }
}
