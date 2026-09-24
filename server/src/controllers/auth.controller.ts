import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import { Session } from '../models/Session.js'
import { env, isGoogleConfigured } from '../config/env.js'
import { validatePassword } from '../utils/passwordValidator.js'
import { createSessionAndToken } from '../utils/createSession.js'
import { sendEmail, passwordResetEmail } from '../utils/sendEmail.js'

const googleClient = isGoogleConfigured ? new OAuth2Client(env.google.clientId) : null

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(user: {
  _id: unknown
  name: string
  email: string
  role: string
  phone?: string | null
  storeName?: string | null
  storeSlug?: string | null
  storeDescription?: string | null
  isPhoneVerified?: boolean
}) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone ?? null,
    storeName: user.storeName ?? null,
    storeSlug: user.storeSlug ?? null,
    storeDescription: user.storeDescription ?? '',
    isPhoneVerified: user.isPhoneVerified ?? false,
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nama, email, dan password wajib diisi' })
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Nama minimal 3 karakter' })
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, error: 'Email tidak valid' })
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.valid) {
      return res.status(400).json({ success: false, error: pwCheck.error })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: hashedPassword })

    const token = await createSessionAndToken(user, req)

    res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat',
      data: publicUser(user),
      token,
    })
  } catch (error) {
    console.error('❌ Register error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password wajib diisi' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' })
    }
    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Akun ini terdaftar lewat Google. Masuk dengan tombol "Lanjutkan dengan Google", atau atur password lewat Akun Saya setelah masuk.',
      })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' })
    }

    const token = await createSessionAndToken(user, req)

    res.json({
      success: true,
      message: 'Berhasil masuk',
      data: publicUser(user),
      token,
    })
  } catch (error) {
    console.error('❌ Login error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!.userId).select('-password')
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }
    res.json({ success: true, data: publicUser(user) })
  } catch (error) {
    console.error('❌ Me error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await Session.deleteOne({ _id: req.user!.sessionId })
    res.json({ success: true, message: 'Berhasil keluar' })
  } catch (error) {
    console.error('❌ Logout error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { name, phone } = req.body as { name?: string; phone?: string }

    const user = await User.findById(req.user!.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }

    if (name !== undefined) {
      if (name.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Nama minimal 3 karakter' })
      }
      user.name = name.trim()
    }

    if (phone !== undefined && phone.trim() !== '') {
      if (phone.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Nomor HP minimal 10 digit' })
      }
      const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } })
      if (existingPhone) {
        return res.status(409).json({ success: false, error: 'Nomor HP sudah terdaftar' })
      }
      if (phone.trim() !== user.phone) {
        user.isPhoneVerified = false // nomor baru, belum diverifikasi
      }
      user.phone = phone.trim()
    }

    await user.save()
    res.json({ success: true, message: 'Profil berhasil diperbarui', data: publicUser(user) })
  } catch (error) {
    console.error('❌ Update profile error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    if (!googleClient) {
      return res.status(503).json({
        success: false,
        error: 'Login Google belum dikonfigurasi di server ini (GOOGLE_CLIENT_ID kosong).',
      })
    }

    const { credential } = req.body as { credential?: string }
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Credential Google wajib diisi' })
    }

    let payload
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.google.clientId })
      payload = ticket.getPayload()
    } catch {
      return res.status(401).json({ success: false, error: 'Token Google tidak valid' })
    }

    if (!payload?.email) {
      return res.status(400).json({ success: false, error: 'Google tidak mengembalikan email' })
    }
    if (!payload.email_verified) {
      return res.status(400).json({ success: false, error: 'Email Google kamu belum terverifikasi' })
    }

    const normalizedEmail = payload.email.toLowerCase().trim()
    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: normalizedEmail }] })

    if (user) {
      // Akun sudah ada (mungkin daftar manual sebelumnya) — tautkan ke Google kalau belum
      if (!user.googleId) {
        user.googleId = payload.sub
        await user.save()
      }
    } else {
      user = await User.create({
        name: payload.name ?? normalizedEmail.split('@')[0],
        email: normalizedEmail,
        googleId: payload.sub,
        // password tetap kosong — akun ini cuma bisa masuk lewat Google sampai
        // pemiliknya set password sendiri lewat "Ganti Password" di Akun Saya
      })
    }

    const token = await createSessionAndToken(user, req)

    res.json({
      success: true,
      message: 'Berhasil masuk dengan Google',
      data: publicUser(user),
      token,
    })
  } catch (error) {
    console.error('❌ Google login error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body as { email?: string }
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email wajib diisi' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Selalu balas sukses walau email tidak terdaftar — supaya endpoint ini tidak bisa
    // dipakai untuk mengecek email mana saja yang punya akun (user enumeration).
    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetPasswordTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 jam
      await user.save()

      const resetUrl = `${env.clientOrigin}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`
      await sendEmail({
        to: user.email,
        subject: 'Reset Password OneShop',
        html: passwordResetEmail(resetUrl),
      })
    }

    res.json({ success: true, message: 'Kalau email terdaftar, link reset password sudah dikirim.' })
  } catch (error) {
    console.error('❌ Forgot password error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { email, token, newPassword } = req.body as { email?: string; token?: string; newPassword?: string }
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Data reset password tidak lengkap' })
    }
    const pwCheck = validatePassword(newPassword)
    if (!pwCheck.valid) {
      return res.status(400).json({ success: false, error: pwCheck.error })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    })
    if (!user) {
      return res.status(400).json({ success: false, error: 'Link reset password tidak valid atau sudah kedaluwarsa' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.resetPasswordTokenHash = null
    user.resetPasswordExpires = null
    await user.save()

    // Cabut semua sesi aktif setelah reset password — kalau akunnya sempat dibobol,
    // token lama yang mungkin sudah dipegang orang lain langsung tidak berlaku.
    await Session.deleteMany({ userId: user._id })

    res.json({ success: true, message: 'Password berhasil direset. Silakan masuk dengan password baru.' })
  } catch (error) {
    console.error('❌ Reset password error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { oldPassword, newPassword } = req.body as { oldPassword?: string; newPassword?: string }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Password lama dan baru wajib diisi' })
    }

    const pwCheck = validatePassword(newPassword)
    if (!pwCheck.valid) {
      return res.status(400).json({ success: false, error: pwCheck.error })
    }

    const user = await User.findById(req.user!.userId)
    if (!user || !user.password) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }

    const isValid = await bcrypt.compare(oldPassword, user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Password lama tidak sesuai' })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ success: true, message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('❌ Change password error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
