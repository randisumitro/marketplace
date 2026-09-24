import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StoreSetupModal } from '@/components/ui/StoreSetupModal'
import { useAuth } from '@/context/AuthContext'

interface BukaTokoCTAProps {
  children: ReactNode
  className?: string
}

/**
 * Tombol "Buka Toko" yang dipakai di berbagai tempat (Hero, CTA penjual, dll).
 * - Belum login             → ke /login (harus masuk/daftar sebagai user dulu)
 * - Login, belum punya toko → buka modal setup toko langsung (tanpa pindah halaman)
 * - Login, sudah punya toko → langsung ke /toko (dashboard)
 * Satu akun untuk semua peran — tidak ada lagi jalur pendaftaran toko terpisah untuk tamu.
 */
export function BukaTokoCTA({ children, className }: BukaTokoCTAProps) {
  const { isLoggedIn, user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)

  if (!isLoggedIn) {
    return (
      <Link to="/login" className={className}>
        {children}
      </Link>
    )
  }

  if (user?.storeName) {
    return (
      <Link to="/toko" className={className}>
        {children}
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setModalOpen(true)} className={className}>
        {children}
      </button>
      {modalOpen && <StoreSetupModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
