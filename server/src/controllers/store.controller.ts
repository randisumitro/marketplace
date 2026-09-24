import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'
import { validatePassword } from '../utils/passwordValidator.js'
import { createSessionAndToken } from '../utils/createSession.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function publicStoreUser(user: {
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

export async function getStoreBySlug(req: Request, res: Response) {
  try {
    const store = await User.findOne({ storeSlug: req.params.slug, role: 'admin' })
    if (!store) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' })
    }
    const productCount = await Product.countDocuments({ storeId: store._id })
    res.json({
      success: true,
      data: {
        id: store._id,
        storeName: store.storeName,
        storeSlug: store.storeSlug,
        storeDescription: store.storeDescription ?? '',
        productCount,
      },
    })
  } catch (error) {
    console.error('❌ Get store by slug error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function checkStoreName(req: Request, res: Response) {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name : ''
    if (name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Nama toko minimal 3 karakter' })
    }

    const slug = slugify(name)
    const existing = await User.findOne({ storeSlug: slug })

    res.json({
      success: true,
      data: {
        available: !existing,
        message: existing ? 'Nama toko sudah digunakan' : 'Nama toko tersedia',
      },
    })
  } catch (error) {
    console.error('❌ Check store name error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

/** Membuka toko untuk akun yang SUDAH login — tidak membuat akun baru, cukup lengkapi data toko. */
export async function setupStore(req: Request, res: Response) {
  try {
    const { storeName, phone } = req.body as { storeName?: string; phone?: string }

    if (!storeName || storeName.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Nama toko minimal 3 karakter' })
    }
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Nomor HP minimal 10 digit' })
    }

    const user = await User.findById(req.user!.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }
    if (user.storeName) {
      return res.status(409).json({ success: false, error: 'Kamu sudah punya toko' })
    }

    const normalizedPhone = phone.trim()
    const storeSlug = slugify(storeName)

    const [existingPhone, existingSlug] = await Promise.all([
      User.findOne({ phone: normalizedPhone, _id: { $ne: user._id } }),
      User.findOne({ storeSlug }),
    ])
    if (existingPhone) return res.status(409).json({ success: false, error: 'Nomor HP sudah terdaftar' })
    if (existingSlug) return res.status(409).json({ success: false, error: 'Nama toko sudah digunakan' })

    user.storeName = storeName.trim()
    user.storeSlug = storeSlug
    user.phone = normalizedPhone
    user.role = 'admin'
    await user.save()

    const token = await createSessionAndToken(user, req)

    res.json({
      success: true,
      message: 'Toko berhasil dibuka',
      data: publicStoreUser(user),
      token,
    })
  } catch (error) {
    console.error('❌ Setup store error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

/** Halaman Pengaturan Toko — ubah nama, HP, dan deskripsi toko untuk akun yang sedang login. */
export async function updateStoreProfile(req: Request, res: Response) {
  try {
    const { storeName, phone, storeDescription } = req.body as {
      storeName?: string
      phone?: string
      storeDescription?: string
    }

    const user = await User.findById(req.user!.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: 'User tidak ditemukan' })
    }
    if (!user.storeName) {
      return res.status(400).json({ success: false, error: 'Kamu belum punya toko' })
    }

    if (storeName !== undefined) {
      if (storeName.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Nama toko minimal 3 karakter' })
      }
      const newSlug = slugify(storeName)
      if (newSlug !== user.storeSlug) {
        const existingSlug = await User.findOne({ storeSlug: newSlug, _id: { $ne: user._id } })
        if (existingSlug) return res.status(409).json({ success: false, error: 'Nama toko sudah digunakan' })
        user.storeSlug = newSlug
      }
      user.storeName = storeName.trim()
    }

    if (phone !== undefined) {
      if (phone.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Nomor HP minimal 10 digit' })
      }
      const existingPhone = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } })
      if (existingPhone) return res.status(409).json({ success: false, error: 'Nomor HP sudah terdaftar' })
      if (phone.trim() !== user.phone) {
        user.isPhoneVerified = false
      }
      user.phone = phone.trim()
    }

    if (storeDescription !== undefined) {
      user.storeDescription = storeDescription.trim().slice(0, 500)
    }

    await user.save()

    res.json({ success: true, message: 'Profil toko berhasil diperbarui', data: publicStoreUser(user) })
  } catch (error) {
    console.error('❌ Update store profile error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function registerStore(req: Request, res: Response) {
  try {
    const { storeName, name, email, phone, password } = req.body as {
      storeName?: string
      name?: string
      email?: string
      phone?: string
      password?: string
    }

    if (!storeName || !name || !email || !phone || !password) {
      return res.status(400).json({ success: false, error: 'Semua field wajib diisi' })
    }
    if (storeName.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Nama toko minimal 3 karakter' })
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Nama pemilik minimal 3 karakter' })
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, error: 'Email tidak valid' })
    }
    if (phone.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Nomor HP minimal 10 digit' })
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.valid) {
      return res.status(400).json({ success: false, error: pwCheck.error })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedPhone = phone.trim()
    const storeSlug = slugify(storeName)

    const [existingEmail, existingPhone, existingSlug] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ phone: normalizedPhone }),
      User.findOne({ storeSlug }),
    ])

    if (existingEmail) return res.status(409).json({ success: false, error: 'Email sudah terdaftar' })
    if (existingPhone) return res.status(409).json({ success: false, error: 'Nomor HP sudah terdaftar' })
    if (existingSlug) return res.status(409).json({ success: false, error: 'Nama toko sudah digunakan' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: 'admin',
      storeName: storeName.trim(),
      storeSlug,
    })

    const token = await createSessionAndToken(user, req)

    res.status(201).json({
      success: true,
      message: 'Toko berhasil didaftarkan',
      data: publicStoreUser(user),
      token,
    })
  } catch (error) {
    console.error('❌ Register store error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
