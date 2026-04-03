import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'

const titles: Record<string, string> = {
  '/': 'Overview',
  '/activity': 'Live Activity',
  '/users': 'All Users',
  '/pay': 'Pay Dashboard',
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

export function Topbar() {
  const path = useLocation().pathname
  const title = titles[path] ?? 'Overview'
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ users: unknown[]; transactions: unknown[]; rides: unknown[] } | null>(null)
  const [searching, setSearching] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<{
    pendingKyc?: number
    openRiskAlerts?: number
    pendingHostApplications?: number
    total?: number
  } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLButtonElement | null>(null)

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
        .finally(() => { setSearching(false); debounceRef.current = null })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q])

  useEffect(() => {
    setOpen(!!q.trim())
  }, [q])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
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

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-breadcrumb">
          <span>Nexa Admin</span> › <span>{title}</span>
        </div>
      </div>
      <div className="topbar-search" ref={boxRef} style={{ position: 'relative' }}>
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round">
          <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
        <input
          placeholder="Search users, transactions, rides…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q.trim() && setOpen(true)}
        />
        {open && q.trim() && (
          <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, maxHeight: 360, overflow: 'auto', zIndex: 100 }}>
            <div className="card-body">
              {searching && <div className="td-muted" style={{ padding: 8 }}>Searching…</div>}
              {!searching && !hasResults && <div className="td-muted" style={{ padding: 8 }}>No results</div>}
              {!searching && users.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>Users</div>
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="search-hit" style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--surf2)' }} onClick={() => { navigate(`/users`); setOpen(false); setQ('') }}>
                      {u.full_name ?? u.email ?? u.phone_number ?? u.id}
                    </div>
                  ))}
                </>
              )}
              {!searching && transactions.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 8, marginBottom: 4 }}>Transactions</div>
                  {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="search-hit" style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--surf2)' }} onClick={() => { navigate(`/transactions`); setOpen(false); setQ('') }}>
                      {t.reference ?? t.id} {t.amount != null ? `· ${t.amount} MAD` : ''}
                    </div>
                  ))}
                </>
              )}
              {!searching && rides.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 8, marginBottom: 4 }}>Rides</div>
                  {rides.slice(0, 5).map((r) => (
                    <div key={r.id} className="search-hit" style={{ padding: '6px 0', cursor: 'pointer', borderBottom: '1px solid var(--surf2)' }} onClick={() => { navigate(`/rides`); setOpen(false); setQ('') }}>
                      {r.id} {r.fare_amount != null ? `· ${r.fare_amount} MAD` : ''} · {r.status ?? ''}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="topbar-actions">
        <span className="env-pill">● Live</span>
        <button
          type="button"
          className="topbar-btn"
          title="Notifications"
          ref={notifRef as any}
          onClick={() => setNotifOpen((o) => !o)}
          style={{ position: 'relative' }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifications?.total && notifications.total > 0 && (
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
                  padding: '0 4px',
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                {notifications.total}
              </span>
            </>
          )}
        </button>
        {notifOpen && (
          <div className="card" style={{ position: 'absolute', top: '100%', right: 48, marginTop: 4, minWidth: 240, zIndex: 120 }}>
            <div className="card-body" style={{ fontSize: 12 }}>
              {!notifications && <div className="td-muted">No notification summary</div>}
              {notifications && (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Notifications</div>
                  <div
                    className="notif-row"
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
                    onClick={() => { navigate('/kyc'); setNotifOpen(false) }}
                  >
                    <span>Pending KYC</span>
                    <span style={{ fontWeight: 700 }}>{notifications.pendingKyc ?? 0}</span>
                  </div>
                  <div
                    className="notif-row"
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
                    onClick={() => { navigate('/fraud'); setNotifOpen(false) }}
                  >
                    <span>Open risk alerts</span>
                    <span style={{ fontWeight: 700 }}>{notifications.openRiskAlerts ?? 0}</span>
                  </div>
                  <div
                    className="notif-row"
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', cursor: 'pointer' }}
                    onClick={() => { navigate('/hosts'); setNotifOpen(false) }}
                  >
                    <span>Pending host applications</span>
                    <span style={{ fontWeight: 700 }}>{notifications.pendingHostApplications ?? 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <button type="button" className="topbar-btn" title="Settings" onClick={() => navigate('/config')}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={3} /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>
      </div>
    </header>
  )
}
