import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '@/lib/api'

export interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin' | 'warehouse'
  phone: string | null
  storeName: string | null
  storeSlug: string | null
  storeDescription: string
  isPhoneVerified: boolean
}

interface UpdateStoreProfileInput {
  storeName?: string
  phone?: string
  storeDescription?: string
}

interface UpdateProfileInput {
  name?: string
  phone?: string
}

interface RegisterStoreInput {
  storeName: string
  name: string
  email: string
  phone: string
  password: string
}

interface AuthResponse {
  success: true
  data: User
  token: string
}

interface MeResponse {
  success: true
  data: User
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: (credential: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<void>
  registerStore: (input: RegisterStoreInput) => Promise<void>
  setupStore: (storeName: string, phone: string) => Promise<void>
  updateStoreProfile: (input: UpdateStoreProfileInput) => Promise<void>
  updateProfile: (input: UpdateProfileInput) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const STORAGE_KEY = 'oneshop-token'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [isLoading, setIsLoading] = useState(true)

  // Saat app pertama kali dimuat, validasi token tersimpan ke backend
  useEffect(() => {
    let cancelled = false

    async function tryFetchMe(storedToken: string): Promise<'ok' | 'auth-failed' | 'transient-error'> {
      try {
        const res = await api.get<MeResponse>('/api/auth/me', storedToken)
        if (!cancelled) {
          setUser(res.data)
          setToken(storedToken)
        }
        return 'ok'
      } catch (err) {
        const isAuthFailure = err instanceof ApiError && (err.status === 401 || err.status === 403)
        return isAuthFailure ? 'auth-failed' : 'transient-error'
      }
    }

    async function restoreSession() {
      const storedToken = localStorage.getItem(STORAGE_KEY)
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      let result = await tryFetchMe(storedToken)

      // Gangguan sesaat (jaringan/database) — bukan berarti tokennya tidak valid.
      // Coba sekali lagi sebelum menyerah, supaya refresh cepat berturut-turut atau
      // koneksi yang sempat lambat tidak membuat orang terlihat ter-logout.
      if (result === 'transient-error' && !cancelled) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        if (!cancelled) result = await tryFetchMe(storedToken)
      }

      if (result === 'auth-failed') {
        // Hanya token yang BENAR-BENAR tidak valid/kedaluwarsa yang dihapus.
        localStorage.removeItem(STORAGE_KEY)
        if (!cancelled) {
          setUser(null)
          setToken(null)
        }
      }

      if (!cancelled) setIsLoading(false)
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password })
    localStorage.setItem(STORAGE_KEY, res.token)
    setToken(res.token)
    setUser(res.data)
    return res.data
  }

  const loginWithGoogle = async (credential: string) => {
    const res = await api.post<AuthResponse>('/api/auth/google', { credential })
    localStorage.setItem(STORAGE_KEY, res.token)
    setToken(res.token)
    setUser(res.data)
    return res.data
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/register', { name, email, password })
    localStorage.setItem(STORAGE_KEY, res.token)
    setToken(res.token)
    setUser(res.data)
  }

  const registerStore = async (input: RegisterStoreInput) => {
    const res = await api.post<AuthResponse>('/api/store/register', input)
    localStorage.setItem(STORAGE_KEY, res.token)
    setToken(res.token)
    setUser(res.data)
  }

  const setupStore = async (storeName: string, phone: string) => {
    const res = await api.post<AuthResponse>('/api/store/setup', { storeName, phone }, token)
    localStorage.setItem(STORAGE_KEY, res.token)
    setToken(res.token)
    setUser(res.data)
  }

  const updateStoreProfile = async (input: UpdateStoreProfileInput) => {
    const res = await api.put<MeResponse>('/api/store/profile', input, token)
    setUser(res.data)
  }

  const refreshUser = async () => {
    if (!token) return
    const res = await api.get<MeResponse>('/api/auth/me', token)
    setUser(res.data)
  }

  const updateProfile = async (input: UpdateProfileInput) => {
    const res = await api.put<MeResponse>('/api/auth/profile', input, token)
    setUser(res.data)
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', undefined, token)
    } catch {
      // Tetap bersihkan sesi lokal walau request ke server gagal (mis. sudah offline)
    }
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: Boolean(user),
        isLoading,
        login,
        loginWithGoogle,
        register,
        registerStore,
        setupStore,
        updateStoreProfile,
        updateProfile,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export { ApiError }
