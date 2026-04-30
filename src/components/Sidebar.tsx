import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { themeLogoSrc, useTheme } from '../contexts/ThemeContext'
import { api } from '../api'

type NotifSummary = { pendingKyc?: number; openRiskAlerts?: number; pendingHostApplications?: number; total?: number } | null

const COLLAPSE_KEY = 'nexa-admin-sidebar-collapsed'

const navItems = [
  { section: 'Overview', links: [
    { to: '/', label: 'Overview', icon: 'grid' },
    { to: '/activity', label: 'Live Activity', icon: 'activity', badge: true },
    { to: '/users', label: 'All Users', icon: 'users' },
  ]},
  { product: 'NEXA PAY', color: 'var(--y)', links: [
    { to: '/pay', label: 'Pay Dashboard', icon: 'credit' },
    { to: '/waitlist', label: 'Waitlist Leads', icon: 'users' },
    { to: '/kyc', label: 'KYC Review', icon: 'user-check', badgeKey: 'pendingKyc' as const },
    { to: '/transactions', label: 'Transactions', icon: 'dollar' },
    { to: '/wallets', label: 'Wallets', icon: 'wallet' },
    { to: '/fraud', label: 'Fraud & Risk', icon: 'shield', badgeKey: 'openRiskAlerts' as const },
    { to: '/settlements', label: 'Settlements', icon: 'repeat' },
  ]},
  { product: 'NEXA GO', color: 'var(--v)', links: [
    { to: '/go', label: 'Go Dashboard', icon: 'play' },
    { to: '/rides', label: 'Rides', icon: 'car' },
    { to: '/drivers', label: 'Drivers', icon: 'users' },
    { to: '/delivery', label: 'Delivery', icon: 'package' },
    { to: '/merchants', label: 'Merchants', icon: 'store' },
    { to: '/pricing', label: 'Pricing Rules', icon: 'tag' },
  ]},
  { product: 'NEXA STAYS', color: 'var(--p)', links: [
    { to: '/stays', label: 'Stays Dashboard', icon: 'home' },
    { to: '/listings', label: 'Listings', icon: 'layout' },
    { to: '/bookings', label: 'Bookings', icon: 'calendar' },
    { to: '/hosts', label: 'Host review', icon: 'users', badgeKey: 'pendingHostApplications' as const },
  ]},
  { section: 'System', links: [
    { to: '/admins', label: 'Admin Users', icon: 'settings' },
    { to: '/config', label: 'Config', icon: 'settings' },
    { to: '/logs', label: 'Audit Logs', icon: 'file' },
  ]},
]

const icons: Record<string, JSX.Element> = {
  grid: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={3} width={7} height={7} rx={1} /><rect x={14} y={3} width={7} height={7} rx={1} />
      <rect x={3} y={14} width={7} height={7} rx={1} /><rect x={14} y={14} width={7} height={7} rx={1} />
    </svg>
  ),
  activity: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  users: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx={9} cy={7} r={4} />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  credit: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={2} y={5} width={20} height={14} rx={2} /><line x1={2} y1={10} x2={22} y2={10} />
    </svg>
  ),
  'user-check': (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx={12} cy={7} r={4} /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  dollar: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1={12} y1={1} x2={12} y2={23} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  wallet: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  shield: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1={12} y1={8} x2={12} y2={12} /><line x1={12} y1={16} x2={12.01} y2={16} />
    </svg>
  ),
  repeat: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  play: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={10} /><polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  ),
  car: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={1} y={3} width={15} height={13} rx={2} /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx={5.5} cy={18.5} r={2.5} /><circle cx={18.5} cy={18.5} r={2.5} />
    </svg>
  ),
  package: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12H3l4-9h10l4 9h-2" /><path d="M3 12h18v9H3z" />
    </svg>
  ),
  store: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  ),
  tag: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1={7} y1={7} x2={7.01} y2={7} />
    </svg>
  ),
  home: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  layout: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={3} width={18} height={18} rx={2} /><path d="M3 9h18M9 21V9" />
    </svg>
  ),
  calendar: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /><line x1={3} y1={10} x2={21} y2={10} />
    </svg>
  ),
  settings: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={3} /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  file: (
    <svg className="sb-icon" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1={16} y1={13} x2={8} y2={13} /><line x1={16} y1={17} x2={8} y2={17} />
    </svg>
  ),
}

function getBadgeCount(link: { badge?: boolean; badgeKey?: keyof NonNullable<NotifSummary> }, notifications: NotifSummary): number | null {
  if (!('badgeKey' in link) || !link.badgeKey) return null
  const n = notifications?.[link.badgeKey]
  return n != null && n > 0 ? n : null
}

function showLiveBadge(link: object): boolean {
  return 'badge' in link && (link as { badge?: boolean }).badge === true
}

function getEnvBadge() {
  const raw = (import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development').toString().toLowerCase()
  if (raw === 'production' || raw === 'prod') return 'PROD'
  if (raw === 'staging' || raw === 'stage') return 'STAGE'
  return 'DEV'
}

type SidebarProps = {
  mobileDrawerOpen?: boolean
  onRequestCloseMobile?: () => void
}

export function Sidebar({ mobileDrawerOpen = false, onRequestCloseMobile }: SidebarProps) {
  const { theme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotifSummary>(null)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const envBadge = getEnvBadge()

  useEffect(() => {
    api.NOTIFICATIONS.getSummary()
      .then((s) => setNotifications(s))
      .catch(() => setNotifications(null))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkExtra = { onClick: () => onRequestCloseMobile?.() }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileDrawerOpen ? 'drawer-open' : ''}`}>
      <div className="sb-brand">
        <div className="sb-logo">
          <img src={themeLogoSrc(theme)} alt="Nexa" />
        </div>
        <div className="sb-brand-text">
          <div className="sb-brand-name">Nexa Admin</div>
          <div className="sb-brand-sub">Ecosystem Dashboard</div>
        </div>
        <span className="env-badge">{envBadge}</span>
        <button
          type="button"
          className="sb-collapse-btn"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((c) => !c)}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? <path d="M9 18l6-6-6-6" /> : <path d="M15 18l-6-6 6-6" />}
          </svg>
        </button>
      </div>

      {navItems.map((block, i) => (
        <div key={i}>
          {'section' in block && (
            <div className="sb-section">
              <div className="sb-section-label">{block.section}</div>
              {block.links.map((link) => {
                const count = getBadgeCount(link, notifications)
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
                    {...linkExtra}
                  >
                    {icons[link.icon]}
                    <span className="sb-link-text">{link.label}</span>
                    {showLiveBadge(link) && <span className="sb-badge">●</span>}
                    {count != null && <span className="sb-badge sb-badge-y">{count}</span>}
                  </NavLink>
                )
              })}
            </div>
          )}
          {'product' in block && (
            <>
              <div className="sb-divider" />
              <div className="sb-section">
                <div className="sb-product-tag">
                  <div className="sb-product-dot" style={{ background: block.color }} />
                  <span style={{ fontSize: '9.5px', fontWeight: 800, color: 'rgba(255,255,255,.38)', letterSpacing: '.8px' }}>{block.product}</span>
                </div>
                {block.links.map((link) => {
                  const count = getBadgeCount(link, notifications)
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
                      {...linkExtra}
                    >
                      {icons[link.icon]}
                      <span className="sb-link-text">{link.label}</span>
                      {showLiveBadge(link) && <span className="sb-badge">●</span>}
                      {count != null && (
                        <span
                          className="sb-badge"
                          style={block.product === 'NEXA PAY' ? { background: 'var(--y)', color: '#0b1020' } : block.product === 'NEXA STAYS' ? { background: 'var(--p)', color: 'white' } : undefined}
                        >
                          {count}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </>
          )}
        </div>
      ))}

      <div className="sb-bottom">
        <div className="sb-profile-card">
          <div className="sb-user">
            <div className="sb-user-av">{(user?.email || 'A').slice(0, 1).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">Super Admin</div>
              <div className="sb-user-role">{user?.email ?? 'admin@nexa.ma'}</div>
            </div>
          </div>
          <button type="button" className="btn-signout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
