import { useEffect, useState } from 'react'

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void
          onPending?: (result: unknown) => void
          onError?: (result: unknown) => void
          onClose?: () => void
        },
      ) => void
    }
  }
}

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string | undefined
const IS_PRODUCTION = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
const SNAP_SRC = IS_PRODUCTION ? 'https://app.midtrans.com/snap/snap.js' : 'https://app.sandbox.midtrans.com/snap/snap.js'

let scriptPromise: Promise<void> | null = null

function loadSnapScript(): Promise<void> {
  if (window.snap) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SNAP_SRC
    script.setAttribute('data-client-key', CLIENT_KEY ?? '')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** Mengembalikan fungsi untuk membuka popup pembayaran Midtrans Snap dari sebuah token. */
export function useMidtransSnap() {
  const [isReady, setIsReady] = useState(Boolean(window.snap))

  useEffect(() => {
    if (!CLIENT_KEY || isReady) return
    loadSnapScript()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false))
  }, [isReady])

  function pay(
    token: string,
    handlers: {
      onSuccess?: () => void
      onPending?: () => void
      onError?: () => void
      onClose?: () => void
    },
  ) {
    if (!window.snap) {
      handlers.onError?.()
      return
    }
    window.snap.pay(token, {
      onSuccess: () => handlers.onSuccess?.(),
      onPending: () => handlers.onPending?.(),
      onError: () => handlers.onError?.(),
      onClose: () => handlers.onClose?.(),
    })
  }

  return { isConfigured: Boolean(CLIENT_KEY), isReady, pay }
}
