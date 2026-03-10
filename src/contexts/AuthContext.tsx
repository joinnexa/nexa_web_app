import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../services/api'
import { endpoints } from '../services/endpoints'
import { AdminRole, Permission, ROLE_PERMISSIONS, AdminUser } from '../types/roles'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
  adminUser: AdminUser | null
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: AdminRole) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_ADMIN: AdminUser = {
  id: '1',
  email: 'admin@nexa.ma',
  role: AdminRole.SUPER_ADMIN,
  name: 'Super Admin',
  twoFactorEnabled: false,
  permissions: ROLE_PERMISSIONS[AdminRole.SUPER_ADMIN],
}

const normalizeRole = (role?: string): AdminRole => {
  const normalized = role as AdminRole | undefined
  return normalized && ROLE_PERMISSIONS[normalized] ? normalized : AdminRole.SUPER_ADMIN
}

const buildAdminUser = (data: any): AdminUser => {
  const role = normalizeRole(data?.role)
  return {
    id: data?.id || 'unknown',
    email: data?.email || 'admin@nexa.ma',
    role,
    name: data?.name || 'Admin',
    twoFactorEnabled: data?.twoFactorEnabled || false,
    permissions: ROLE_PERMISSIONS[role],
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_access_token')
    const storedUser = localStorage.getItem('admin_user')

    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          const normalizedUser = buildAdminUser(parsed)
          localStorage.setItem('admin_user', JSON.stringify(normalizedUser))
          setAdminUser(normalizedUser)
        } catch {
          setAdminUser(MOCK_ADMIN)
        }
      } else {
        setAdminUser(MOCK_ADMIN)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post(endpoints.auth.adminLogin, { email, password })
      const responseData = response.data?.data || response.data
      const accessToken = responseData?.access_token
      const userData = responseData?.user

      if (accessToken) {
        localStorage.setItem('admin_access_token', accessToken)
        setToken(accessToken)

        if (userData) {
          const admin = buildAdminUser(userData)
          localStorage.setItem('admin_user', JSON.stringify(admin))
          setAdminUser(admin)
        } else {
          localStorage.setItem('admin_user', JSON.stringify(MOCK_ADMIN))
          setAdminUser(MOCK_ADMIN)
        }

        setIsAuthenticated(true)
      } else {
        throw new Error('No access token received from server')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('admin_access_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setAdminUser(null)
    setIsAuthenticated(false)
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!adminUser) return false
    return adminUser.permissions.includes(permission)
  }

  const hasRole = (role: AdminRole): boolean => {
    if (!adminUser) return false
    return adminUser.role === role
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      login,
      logout,
      token,
      adminUser,
      hasPermission,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
