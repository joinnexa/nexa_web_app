import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { DashboardStats } from '../api/types'
import { DASHBOARD_KPI_POLL_MS } from '../constants/dashboardPoll'
import { useIntervalPoll } from '../hooks/useIntervalPoll'

function formatVol(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(n)
}

export function PayDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<{ daily_revenue?: number; monthly_revenue?: number; total?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback((opts?: { background?: boolean }) => {
    const bg = opts?.background ?? false
    if (!bg) {
      setLoading(true)
      setError(null)
    }
    Promise.all([
      api.DASHBOARD.getStats().catch((e) => e),
      api.FINANCE.getRevenue().catch(() => null),
    ])
      .then(([s, r]) => {
        if (s && !(s instanceof Error)) setStats(s)
        else if (!bg && s instanceof Error) setError(s?.message ?? 'Failed to load')
        if (r && typeof r === 'object') setRevenue(r)
      })
      .catch((e) => {
        if (!bg) setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load')
      })
      .finally(() => {
        if (!bg) setLoading(false)
      })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useIntervalPoll(() => load({ background: true }), DASHBOARD_KPI_POLL_MS)

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
      {revenue && (revenue.daily_revenue != null || revenue.monthly_revenue != null) && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginTop: 16 }}>
          <div className="stat-card y"><div className="stat-label">DAILY REVENUE</div><div className="stat-val">{revenue.daily_revenue != null ? formatVol(revenue.daily_revenue) : '—'} MAD</div></div>
          <div className="stat-card g"><div className="stat-label">MONTHLY REVENUE</div><div className="stat-val">{revenue.monthly_revenue != null ? formatVol(revenue.monthly_revenue) : '—'} MAD</div></div>
        </div>
      )}
      <div className="alert alert-y" style={{ marginTop: 16 }}>
        NFC payments: enable/disable via Config → Feature Flags when backend supports it.
      </div>
    </>
  )
}
