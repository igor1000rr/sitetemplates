import { create } from 'zustand'
import { authApi, setAuthToken } from '@/lib/api'
import type { User } from '@/types'

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

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  setToken: (token: string) => {
    setAuthToken(token)
    set({ token })
  },

  setUser: (user: User) => {
    set({ user })
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data } = await authApi.login({ email, password })
      setAuthToken(data.token)
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
      setAuthToken(data.token)
      set({ user: data.user, token: data.token, isAuthenticated: true })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await authApi.logout() // бэкенд удаляет токен и сбрасывает httpOnly-cookie
    } catch {}
    setAuthToken(null)
    set({ user: null, token: null, isAuthenticated: false })
  },

  loadUser: async () => {
    // Пытаемся всегда: в проде сессия восстановится из httpOnly-cookie,
    // даже если токена в памяти нет (например, после перезагрузки страницы).
    set({ isLoading: true })
    try {
      const { data } = await authApi.user()
      set({ user: data, isAuthenticated: true })
    } catch {
      setAuthToken(null)
      set({ user: null, token: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },
}))
