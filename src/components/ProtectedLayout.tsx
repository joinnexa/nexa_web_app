import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function ProtectedLayout() {
  const { isAuthenticated, ready } = useAuth()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--page-bg)',
        }}
      >
        <span style={{ color: 'var(--text-secondary)' }}>Loading…</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      <div
        className={`sb-scrim ${drawerOpen ? 'visible' : ''}`}
        aria-hidden={!drawerOpen}
        onClick={() => setDrawerOpen(false)}
      />
      <Sidebar mobileDrawerOpen={drawerOpen} onRequestCloseMobile={() => setDrawerOpen(false)} />
      <div className="main">
        <Topbar onOpenMobileMenu={() => setDrawerOpen(true)} />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  )
}
