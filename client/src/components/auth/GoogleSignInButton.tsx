import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, ApiError } from '@/context/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

export function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  // `location` dari React Router berganti referensi tiap navigasi — kalau dipakai langsung
  // sebagai dependency efek di bawah, initialize() Google akan terpanggil ulang tiap kali
  // pindah halaman (itu sumber peringatan "initialize() called multiple times"). Simpan versi
  // terbaru di ref supaya callback tetap bisa akses data terkini tanpa memicu re-init.
  const latestRef = useRef({ loginWithGoogle, navigate, location })
  useEffect(() => {
    latestRef.current = { loginWithGoogle, navigate, location }
  })

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return
    let cancelled = false

    async function handleCredential(response: { credential: string }) {
      setError(null)
      try {
        await latestRef.current.loginWithGoogle(response.credential)
        const redirectTo = (latestRef.current.location.state as { from?: string } | null)?.from ?? '/'
        latestRef.current.navigate(redirectTo, { replace: true })
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Gagal masuk dengan Google. Coba lagi.')
      }
    }

    function init() {
      if (!window.google || !containerRef.current || cancelled) return
      window.google.accounts.id.initialize({ client_id: CLIENT_ID!, callback: handleCredential })
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      })
    }

    if (window.google) {
      init()
      return
    }

    // Skrip Google Identity Services dimuat async — tunggu sampai siap
    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval)
        init()
      }
    }, 100)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
    // Sengaja cuma jalan sekali per mount — lihat catatan latestRef di atas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!CLIENT_ID) return null

  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/10 dark:bg-paper-surface/10" />
        <span className="text-xs text-ink/40 dark:text-paper-surface/40">atau</span>
        <div className="h-px flex-1 bg-ink/10 dark:bg-paper-surface/10" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
