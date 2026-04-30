import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

function formatAmount(n: number) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return String(Math.round(n))
}

export function Settlements() {
  type PayoutStatus = 'ALL' | 'PENDING' | 'PROCESSING' | 'PAID' | 'SETTLED' | 'FAILED'
  type PayoutRow = {
    id: string
    recipient_name: string
    recipient_type: string
    pending_balance: number | null
    status: string
    updated_at?: string | null
  }

  const [summary, setSummary] = useState<{
    pendingPayoutsAmount?: number
    settledThisWeekAmount?: number
    recipientsCount?: number
    nextBatchDate?: string
  } | null>(null)
  const [payouts, setPayouts] = useState<PayoutRow[]>([])
  const [merchants, setMerchants] = useState<PayoutRow[]>([])
  const [bucket, setBucket] = useState<'drivers' | 'merchants'>('drivers')
  const [statusFilter, setStatusFilter] = useState<PayoutStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizePayout = (row: Record<string, unknown>): PayoutRow => {
    const recipientName =
      (row.recipient_name as string | undefined) ||
      (row.driver_name as string | undefined) ||
      (row.courier_name as string | undefined) ||
      (row.merchant_name as string | undefined) ||
      (row.full_name as string | undefined) ||
      (row.user_name as string | undefined) ||
      String(row.id ?? 'Unknown')

    const recipientType =
      (row.recipient_type as string | undefined) ||
      (row.user_type as string | undefined) ||
      ((row.merchant_name as string | undefined) ? 'MERCHANT' : 'DRIVER/COURIER')

    return {
      id: String(row.id ?? recipientName),
      recipient_name: recipientName,
      recipient_type: recipientType,
      pending_balance:
        row.pending_balance != null ? Number(row.pending_balance) : row.amount != null ? Number(row.amount) : null,
      status: String((row.status as string | undefined) || 'PENDING').toUpperCase(),
      updated_at: (row.updated_at as string | undefined) || (row.created_at as string | undefined) || null,
    }
  }

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.FINANCE.getSettlementsSummary().catch(() => null),
      api.FINANCE.getDriverPayouts().catch(() => []),
      api.FINANCE.getMerchantSettlements().catch(() => []),
    ])
      .then(([sum, list, merch]) => {
        if (sum) setSummary(sum)
        const rawRows = Array.isArray(list) ? list : (list as { data?: unknown[] })?.data ?? []
        setPayouts(rawRows.slice(0, 100).map((r) => normalizePayout(r as Record<string, unknown>)))
        const mRows = Array.isArray( merch) ? merch : []
        setMerchants(
          mRows.slice(0, 200).map((r) => {
            const row = r as Record<string, unknown>
            return normalizePayout({
              ...row,
              recipient_name: row.merchant_name,
              recipient_type: 'MERCHANT',
              pending_balance:
                row.net_amount != null ? Number(row.net_amount) : row.amount != null ? Number(row.amount) : null,
            })
          }),
        )
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const activeList = bucket === 'drivers' ? payouts : merchants
  const filtered = activeList.filter((p) => statusFilter === 'ALL' || p.status === statusFilter)
  const pendingCount = activeList.filter((p) => p.status === 'PENDING').length
  const processingCount = activeList.filter((p) => p.status === 'PROCESSING').length
  const paidCount = activeList.filter((p) => p.status === 'PAID' || p.status === 'SETTLED').length
  const failedCount = activeList.filter((p) => p.status === 'FAILED' || p.status === 'ERROR').length

  if (loading && !summary) return <div className="section-title">Settlements</div>
  if (error && !summary) return <><div className="section-title">Settlements</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Settlements</div>
      <div className="section-sub">Driver, courier, and merchant payouts</div>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y">
          <div className="stat-label">PENDING PAYOUTS</div>
          <div className="stat-val">{summary?.pendingPayoutsAmount != null ? `${formatAmount(summary.pendingPayoutsAmount)} MAD` : '—'}</div>
          <div className="stat-sub">Next batch: {summary?.nextBatchDate ?? '—'}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">SETTLED THIS WEEK</div>
          <div className="stat-val">{summary?.settledThisWeekAmount != null ? `${formatAmount(summary.settledThisWeekAmount)} MAD` : '—'}</div>
        </div>
        <div className="stat-card v">
          <div className="stat-label">RECIPIENTS</div>
          <div className="stat-val">{summary?.recipientsCount != null ? summary.recipientsCount.toLocaleString() : '—'}</div>
          <div className="stat-sub">With pending balance</div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <div className="tabs">
              <button type="button" className={`tab ${bucket === 'drivers' ? 'active' : ''}`} onClick={() => setBucket('drivers')}>
                Drivers & couriers
              </button>
              <button type="button" className={`tab ${bucket === 'merchants' ? 'active' : ''}`} onClick={() => setBucket('merchants')}>
                Merchants
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">{bucket === 'drivers' ? 'Payout operations (drivers)' : 'Merchant settlements'}</div>
          <div className="card-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 12 }} className="td-muted">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PayoutStatus)}
              style={{ padding: '4px 8px', borderRadius: 6 }}
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="PAID">Paid</option>
              <option value="SETTLED">Settled</option>
              <option value="FAILED">Failed</option>
            </select>
            <button type="button" className="btn btn-dark btn-sm" onClick={load}>Refresh</button>
          </div>
        </div>
        <div className="card-body td-muted" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingBottom: 8 }}>
          <span>Pending: {pendingCount}</span>
          <span>Processing: {processingCount}</span>
          <span>Paid: {paidCount}</span>
          <span>Failed: {failedCount}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Recipient</th><th>Type</th><th>Pending</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>No payouts</td></tr>}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.recipient_name}</td>
                  <td><span className="badge badge-b">{p.recipient_type}</span></td>
                  <td>{p.pending_balance != null ? `${Number(p.pending_balance).toFixed(2)} MAD` : '—'}</td>
                  <td>
                    <span className={`badge ${p.status === 'PENDING' ? 'badge-y' : p.status === 'FAILED' || p.status === 'ERROR' ? 'badge-r' : 'badge-g'}`}>
                      {p.status ?? '—'}
                    </span>
                  </td>
                  <td className="td-muted">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
