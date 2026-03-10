import { ReactNode } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Permission } from '../types/roles'

interface PermissionGuardProps {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return fallback || (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <p className="text-yellow-800 dark:text-yellow-300">You don't have permission to view this content.</p>
      </div>
    )
  }

  return <>{children}</>
}
