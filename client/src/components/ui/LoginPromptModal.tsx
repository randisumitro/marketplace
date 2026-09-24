import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useScrollLock } from '@/hooks/useScrollLock'

interface LoginPromptModalProps {
  onClose: () => void
}

export function LoginPromptModal({ onClose }: LoginPromptModalProps) {
  const navigate = useNavigate()
  useScrollLock()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const goToLogin = () => {
    onClose()
    navigate('/login')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm dark:bg-black/60"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-7 shadow-2xl dark:border-paper-surface/10 dark:bg-paper-dark-surface">
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-paper-surface hover:text-ink dark:text-paper-surface/50 dark:hover:bg-paper-dark"
        >
          <X size={16} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald/10 text-emerald dark:bg-gold/10 dark:text-gold">
          <LogIn size={20} />
        </div>

        <h3 id="login-prompt-title" className="mt-4 font-display text-xl font-medium">
          Masuk dulu, yuk
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/65 dark:text-paper-surface/65">
          Untuk menambah ke keranjang atau melanjutkan pembelian, kamu perlu masuk ke akun OneShop kamu terlebih dahulu.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button variant="primary" onClick={goToLogin} className="w-full">
            Masuk Sekarang
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full !px-6">
            Nanti saja
          </Button>
        </div>
      </div>
    </div>
  )
}
