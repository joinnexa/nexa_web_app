import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const titles: Record<string, string> = {
  '/': 'Overview',
  '/activity': 'Live Activity',
  '/users': 'All Users',
  '/pay': 'Pay Dashboard',
  '/waitlist': 'Waitlist Leads',
  '/kyc': 'KYC Review',
  '/transactions': 'Transactions',
  '/wallets': 'Wallets',
  '/fraud': 'Fraud & Risk',
  '/settlements': 'Settlements',
  '/go': 'Go Dashboard',
  '/rides': 'Rides',
  '/drivers': 'Drivers',
  '/delivery': 'Delivery',
  '/merchants': 'Merchants',
  '/pricing': 'Pricing Rules',
  '/stays': 'Stays Dashboard',
  '/listings': 'Listings',
  '/bookings': 'Bookings',
  '/hosts': 'Host review',
  '/admins': 'Admin Users',
  '/config': 'Configuration',
  '/logs': 'Audit Logs',
}

type TopbarProps = {
  onOpenMobileMenu?: () => void
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const path = useLocation().pathname
  const title = titles[path] ?? 'Overview'
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ users: unknown[]; transactions: unknown[]; rides: unknown[] } | null>(null)
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<{
    pendingKyc?: number
    openRiskAlerts?: number
    pendingHostApplications?: number
    total?: number
  } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearching(true)
      api.SEARCH.search(q.trim(), 10)
        .then(setResults)
        .catch(() => setResults({ users: [], transactions: [], rides: [] }))
        .finally(() => {
          setSearching(false)
          debounceRef.current = null
        })
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  useEffect(() => {
    setOpen(!!q.trim())
  }, [q])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const t = e.target as Node
    if (boxRef.current && !boxRef.current.contains(t)) setOpen(false)
    if (actionsRef.current && !actionsRef.current.contains(t)) {
      setNotifOpen(false)
      setQuickOpen(false)
      setProfileOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  useEffect(() => {
    api.NOTIFICATIONS.getSummary()
      .then((s) => setNotifications(s))
      .catch(() => setNotifications(null))
  }, [])

  const users = (results?.users ?? []) as Array<{ id: string; full_name?: string; email?: string; phone_number?: string }>
  const transactions = (results?.transactions ?? []) as Array<{ id: string; reference?: string; amount?: number }>
  const rides = (results?.rides ?? []) as Array<{ id: string; status?: string; fare_amount?: number }>

  const hasResults = users.length > 0 || transactions.length > 0 || rides.length > 0

  const handleLogout = () => {
    logout()
    navigate('/login')
    setProfileOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" aria-label="Open menu" onClick={() => onOpenMobileMenu?.()}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <line x1={4} y1={6} x2={20} y2={6} />
            <line x1={4} y1={12} x2={20} y2={12} />
            <line x1={4} y1={18} x2={20} y2={18} />
          </svg>
        </button>
        <div>
          <div className="topbar-title">{title}</div>
          <div className="topbar-breadcrumb">
            <span>Nexa Admin</span>
            <span className="bc-sep">›</span>
            <span>{title}</span>
          </div>
        </div>
      </div>

      <div className="topbar-search" ref={boxRef} style={{ position: 'relative' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="topbar-search-icon">
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
        <input
          placeholder="Search users, transactions, rides…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim() && setOpen(true)}
        />
        {open && q.trim() && (
          <div
            className="card search-dropdown"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, maxHeight: 360, overflow: 'auto', zIndex: 350 }}
          >
            <div className="card-body">
              {searching && <div className="td-muted" style={{ padding: 8 }}>Searching…</div>}
              {!searching && !hasResults && <div className="td-muted" style={{ padding: 8 }}>No results</div>}
              {!searching && users.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Users</div>
                  {users.slice(0, 5).map((u) => (
                    <div
                      key={u.id}
                      className="search-hit"
                      style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        navigate(`/users`)
                        setOpen(false)
                        setQ('')
                      }}
                    >
                      {u.full_name ?? u.email ?? u.phone_number ?? u.id}
                    </div>
                  ))}
                </>
              )}
              {!searching && transactions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 8, marginBottom: 4 }}>Transactions</div>
                  {transactions.slice(0, 5).map((tx) => (
                    <div
                      key={tx.id}
                      className="search-hit"
                      style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        navigate(`/transactions`)
                        setOpen(false)
                        setQ('')
                      }}
                    >
                      {tx.reference ?? tx.id} {tx.amount != null ? `· ${tx.amount} MAD` : ''}
                    </div>
                  ))}
                </>
              )}
              {!searching && rides.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 8, marginBottom: 4 }}>Rides</div>
                  {rides.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="search-hit"
                      style={{ padding: '8px 0', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}
                      onClick={() => {
                        navigate(`/rides`)
                        setOpen(false)
                        setQ('')
                      }}
                    >
                      {r.id} {r.fare_amount != null ? `· ${r.fare_amount} MAD` : ''} · {r.status ?? ''}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="topbar-actions" ref={actionsRef} style={{ position: 'relative' }}>
        <span className="env-pill">● Live</span>

        <button
          type="button"
          className="topbar-btn"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => {
            toggleTheme()
            setNotifOpen(false)
            setQuickOpen(false)
            setProfileOpen(false)
          }}
        >
          {theme === 'dark' ? (
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx={12} cy={12} r={4} />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          ) : (
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button type="button" className="topbar-btn" title="Quick actions" onClick={() => { setQuickOpen((o) => !o); setNotifOpen(false); setProfileOpen(false) }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={1} />
            <circle cx={12} cy={5} r={1} />
            <circle cx={12} cy={19} r={1} />
          </svg>
        </button>
        {quickOpen && (
          <div className="dropdown-panel" style={{ right: 0, top: 'calc(100% + 8px)' }}>
            <div className="dropdown-h">Quick actions</div>
            <button type="button" onClick={() => { navigate('/users'); setQuickOpen(false) }}>
              All Users
            </button>
            <button type="button" onClick={() => { navigate('/transactions'); setQuickOpen(false) }}>
              Transactions
            </button>
            <button type="button" onClick={() => { navigate('/rides'); setQuickOpen(false) }}>
              Rides
            </button>
            <button type="button" onClick={() => { navigate('/config'); setQuickOpen(false) }}>
              Config
            </button>
          </div>
        )}

        <button
          type="button"
          className="topbar-btn"
          title="Notifications"
          onClick={() => {
            setNotifOpen((o) => !o)
            setQuickOpen(false)
            setProfileOpen(false)
          }}
          style={{ position: 'relative' }}
        >
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifications?.total != null && notifications.total > 0 && (
            <>
              <div className="notif-dot" />
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: 'var(--r)',
                  color: 'white',
                  borderRadius: 999,
                  padding: '0 5px',
                  fontSize: 9,
                  fontWeight: 700,
                  minWidth: 16,
                  textAlign: 'center',
                }}
              >
                {notifications.total}
              </span>
            </>
          )}
        </button>
        {notifOpen && (
          <div className="dropdown-panel" style={{ right: 0, top: 'calc(100% + 8px)', minWidth: 260 }}>
            {!notifications && <div className="td-muted" style={{ padding: '12px 14px', fontSize: 13 }}>No notification summary</div>}
            {notifications && (
              <>
                <div className="dropdown-h">Notifications</div>
                <button type="button" onClick={() => { navigate('/kyc'); setNotifOpen(false) }} style={{ justifyContent: 'space-between' }}>
                  <span>Pending KYC</span>
                  <strong>{notifications.pendingKyc ?? 0}</strong>
                </button>
                <button type="button" onClick={() => { navigate('/fraud'); setNotifOpen(false) }} style={{ justifyContent: 'space-between' }}>
                  <span>Open risk alerts</span>
                  <strong>{notifications.openRiskAlerts ?? 0}</strong>
                </button>
                <button type="button" onClick={() => { navigate('/hosts'); setNotifOpen(false) }} style={{ justifyContent: 'space-between' }}>
                  <span>Pending host applications</span>
                  <strong>{notifications.pendingHostApplications ?? 0}</strong>
                </button>
              </>
            )}
          </div>
        )}

        <button
          type="button"
          className="topbar-btn"
          title="Settings"
          onClick={() => {
            navigate('/config')
            setProfileOpen(false)
            setNotifOpen(false)
          }}
        >
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={3} />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>

        <button
          type="button"
          className="topbar-btn"
          title="Account"
          onClick={() => {
            setProfileOpen((o) => !o)
            setNotifOpen(false)
            setQuickOpen(false)
          }}
          style={{ width: 'auto', padding: '0 12px', gap: 8 }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: 'linear-gradient(145deg, #7c6cff 0%, #5548d9 100%)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(user?.email || 'A').slice(0, 1).toUpperCase()}
          </span>
        </button>
        {profileOpen && (
          <div className="dropdown-panel" style={{ right: 0, top: 'calc(100% + 8px)', minWidth: 220 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Signed in</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{user?.email ?? 'admin@nexa.ma'}</div>
            </div>
            <button type="button" onClick={handleLogout} style={{ color: '#fca5a5' }}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
