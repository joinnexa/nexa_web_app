import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { DashboardStats } from '../api/types'

function formatVol(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function PayDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.DASHBOARD.getStats()
      .then(setStats)
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading && !stats) return <div className="section-title">Pay Dashboard</div>
  if (error && !stats) return <><div className="section-title">Pay Dashboard</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Nexa Pay Dashboard</div>
      <div className="section-sub">Wallet operations, P2P, QR/NFC · <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/dashboard/stats</code></div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">VOLUME TODAY</div><div className="stat-val">{stats ? formatVol(stats.dailyVolume) : '—'} MAD</div><div className="stat-sub">Daily volume</div></div>
        <div className="stat-card g"><div className="stat-label">P2P TRANSFERS</div><div className="stat-val">{stats?.dailyTransactions ?? '—'}</div><div className="stat-sub">Today</div></div>
        <div className="stat-card b"><div className="stat-label">TOTAL WALLETS</div><div className="stat-val">{stats?.totalWallets?.toLocaleString() ?? '—'}</div><div className="stat-sub">Active</div></div>
        <div className="stat-card v"><div className="stat-label">TOTAL USERS</div><div className="stat-val">{stats?.totalUsers?.toLocaleString() ?? '—'}</div><div className="stat-sub">Success rate {stats?.successRate ?? '—'}%</div></div>
      </div>
      <div className="alert alert-y">
        NFC payments: enable/disable via Config → Feature Flags when backend supports it.
      </div>
    </>
  )
}
