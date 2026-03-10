import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminRole } from '../types/roles'

export function AdminOnlyGuard({ children }: { children: React.ReactNode }) {
  const { adminUser, isLoading } = useAuth()
  if (isLoading) return null
  if (!adminUser || adminUser.role !== AdminRole.SUPER_ADMIN) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}
