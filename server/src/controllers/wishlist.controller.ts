import type { Request, Response } from 'express'
import { User } from '../models/User.js'

export async function getWishlist(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!.userId).populate('wishlist')
    res.json({ success: true, data: user?.wishlist ?? [] })
  } catch (error) {
    console.error('❌ Get wishlist error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function addToWishlist(req: Request, res: Response) {
  try {
    await User.updateOne({ _id: req.user!.userId }, { $addToSet: { wishlist: req.params.productId } })
    res.json({ success: true, message: 'Ditambahkan ke wishlist' })
  } catch (error) {
    console.error('❌ Add to wishlist error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  try {
    await User.updateOne({ _id: req.user!.userId }, { $pull: { wishlist: req.params.productId } })
    res.json({ success: true, message: 'Dihapus dari wishlist' })
  } catch (error) {
    console.error('❌ Remove from wishlist error:', error)
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server' })
  }
}
