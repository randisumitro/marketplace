import { createContext, useContext, useState, type ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'
import { LoginPromptModal } from '@/components/ui/LoginPromptModal'

interface AuthGateContextValue {
  /** Runs `action` immediately if logged in, otherwise shows the login prompt. */
  requireAuth: (action: () => void) => void
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null)

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [promptOpen, setPromptOpen] = useState(false)

  const requireAuth = (action: () => void) => {
    if (isLoggedIn) {
      action()
    } else {
      setPromptOpen(true)
    }
  }

  return (
    <AuthGateContext.Provider value={{ requireAuth }}>
      {children}
      {promptOpen && <LoginPromptModal onClose={() => setPromptOpen(false)} />}
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  const ctx = useContext(AuthGateContext)
  if (!ctx) throw new Error('useAuthGate must be used within an AuthGateProvider')
  return ctx
}
