import { useLocation } from 'react-router-dom'

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
  '/hosts': 'Hosts',
  '/admins': 'Admin Users',
  '/config': 'Configuration',
  '/logs': 'Audit Logs',
}

export function Topbar() {
  const path = useLocation().pathname
  const title = titles[path] ?? 'Overview'

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-breadcrumb">
          <span>Nexa Admin</span> › <span>{title}</span>
        </div>
      </div>
      <div className="topbar-search">
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2.5} strokeLinecap="round">
          <circle cx={11} cy={11} r={8} /><line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
        <input placeholder="Search users, transactions, rides…" />
      </div>
      <div className="topbar-actions">
        <span className="env-pill">● Live</span>
        <button type="button" className="topbar-btn" title="Notifications">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <div className="notif-dot" />
        </button>
        <button type="button" className="topbar-btn" title="Settings">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={3} /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
          </svg>
        </button>
      </div>
    </header>
  )
}
