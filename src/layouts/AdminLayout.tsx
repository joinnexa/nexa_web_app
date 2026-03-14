import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/admin/Sidebar'
import { Header } from '../components/admin/Header'
import { ScopeSwitcher } from '../components/admin/ScopeSwitcher'
import { AdminScope, ADMIN_SCOPES } from '../theme/constants'
import { useEffect, useState } from 'react'

function getScopeFromPath(path: string): AdminScope {
  if (path.startsWith('/pay')) return ADMIN_SCOPES.PAY
  if (path.startsWith('/go')) return ADMIN_SCOPES.GO
  if (path.startsWith('/stays')) return ADMIN_SCOPES.STAYS
  return ADMIN_SCOPES.SUPER
}

export function AdminLayout() {
  const location = useLocation()
  const [scope, setScope] = useState<AdminScope>(getScopeFromPath(location.pathname))

  useEffect(() => {
    setScope(getScopeFromPath(location.pathname))
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar scope={scope} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ScopeSwitcher scope={scope} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
