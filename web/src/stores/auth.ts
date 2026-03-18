import { create } from 'zustand'
import { authApi } from '@/lib/api'
import type { User } from '@/types'

// Sync cookie for middleware (server-side redirect check)
function syncCookie(token: string | null) {
  if (typeof document === 'undefined') return
  if (token) {
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  } else {
    document.cookie = 'auth_token=; path=/; max-age=0'
  }
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setToken: (token: string) => void
  setUser: (user: User) => void
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null,
  isLoading: false,
  isAuthenticated: false,

  setToken: (token: string) => {
    localStorage.setItem('auth_token', token)
    syncCookie(token)
    set({ token })
  },

  setUser: (user: User) => {
    set({ user })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login({ email, password })
      localStorage.setItem('auth_token', data.token)
      syncCookie(data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name, email, password, referralCode) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.register({
        name,
        email,
        password,
        password_confirmation: password,
        referral_code: referralCode || undefined,
      })
      localStorage.setItem('auth_token', data.token)
      syncCookie(data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {}
    localStorage.removeItem('auth_token')
    syncCookie(null)
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    const token = get().token
    if (!token) return

    set({ isLoading: true })
    try {
      const { data } = await authApi.user()
      set({ user: data, isAuthenticated: true })
    } catch {
      localStorage.removeItem('auth_token')
      syncCookie(null)
      set({ user: null, token: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },
}))
