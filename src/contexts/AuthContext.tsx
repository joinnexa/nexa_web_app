import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api'

interface User {
  id: string
  email: string
  roles?: string[]
}

interface AuthState {
  token: string | null
  user: User | null
  ready: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = 'nexa_admin_token'
const USER_KEY = 'nexa_admin_user'

function loadStored(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY)
  let user: User | null = null
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) user = JSON.parse(raw) as User
  } catch {
    // ignore
  }
  return { token, user, ready: true }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({ token: null, user: null, ready: false }))

  useEffect(() => {
    const s = loadStored()
    setState((prev) => ({ ...prev, ...s, ready: true }))
  }, [])

  useEffect(() => {
    const onUnauth = () => setState({ token: null, user: null, ready: true })
    window.addEventListener('nexa:unauthorized', onUnauth)
    return () => window.removeEventListener('nexa:unauthorized', onUnauth)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.AUTH.login(email, password)
    api.AUTH.setToken(data.access_token)
    const user = data.user ? { id: data.user.id, email: data.user.email, roles: data.user.roles } : null
    localStorage.setItem(TOKEN_KEY, data.access_token)
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    setState({ token: data.access_token, user, ready: true })
  }, [])

  const logout = useCallback(() => {
    api.AUTH.logout()
    setState({ token: null, user: null, ready: true })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      isAuthenticated: !!state.token,
    }),
    [state.token, state.user, state.ready, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
