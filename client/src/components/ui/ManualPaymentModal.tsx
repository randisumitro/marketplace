import { useState } from 'react'
import { X, Copy, CheckCircle2 } from 'lucide-react'
import { Button } from './Button'

interface Props {
  orderId: string
  total: number
  onClose: () => void
  onConfirm: (orderId: string) => Promise<void>
}

export function ManualPaymentModal({ orderId, total, onClose, onConfirm }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const banks = [
    { name: 'BCA', no: '1234567890', owner: 'OneShop Official' },
    { name: 'Mandiri', no: '0987654321', owner: 'OneShop Official' },
    { name: 'GoPay / OVO / Dana', no: '081234567890', owner: 'OneShop Official' },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    await onConfirm(orderId)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm dark:bg-black/50">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-xl dark:bg-paper-dark">
        <div className="flex items-center justify-between border-b border-ink/10 p-5 dark:border-paper-surface/10">
          <h2 className="font-display text-lg font-medium">Pembayaran Manual</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink/5 dark:hover:bg-paper-surface/10">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-6 rounded-xl bg-emerald/10 p-4 text-center">
            <p className="text-sm text-emerald dark:text-gold">Total yang harus dibayar</p>
            <p className="mt-1 font-display text-2xl font-semibold text-emerald dark:text-gold">
              Rp{total.toLocaleString('id-ID')}
            </p>
          </div>

          <p className="mb-3 text-sm font-medium">Silakan transfer ke salah satu rekening berikut:</p>
          
          <div className="space-y-3">
            {banks.map((bank) => (
              <div key={bank.name} className="flex items-center justify-between rounded-xl border border-ink/10 p-4 dark:border-paper-surface/10">
                <div>
                  <p className="font-medium">{bank.name}</p>
                  <p className="font-mono text-lg">{bank.no}</p>
                  <p className="text-xs text-ink/50 dark:text-paper-surface/50">a.n {bank.owner}</p>
                </div>
                <button
                  onClick={() => handleCopy(bank.no)}
                  className="flex items-center gap-1.5 rounded-lg bg-ink/5 px-3 py-1.5 text-xs font-medium hover:bg-ink/10 dark:bg-paper-surface/10 dark:hover:bg-paper-surface/20"
                >
                  {copied === bank.no ? <CheckCircle2 size={14} className="text-emerald" /> : <Copy size={14} />}
                  {copied === bank.no ? 'Disalin' : 'Salin'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Saya Sudah Transfer'}
            </Button>
            <p className="text-center text-xs text-ink/50 dark:text-paper-surface/50">
              Penjual akan memverifikasi pembayaran Anda sebelum memproses pesanan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
