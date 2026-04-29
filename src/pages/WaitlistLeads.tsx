import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { WaitlistEntry } from '../api/types'

function fmtDate(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export function WaitlistLeads() {
  const [rows, setRows] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.WAITLIST.getList({ page, limit: 20 })
      .then((res) => {
        setRows(res?.data ?? [])
        setTotal(res?.total ?? 0)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load waitlist'))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <div className="section-title">Waitlist Leads</div>
      <div className="section-sub">Submissions from public web forms (Pay/Go/Stays)</div>
      {error && <div className="alert alert-r">{error}</div>}

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card y">
          <div className="stat-label">TOTAL LEADS</div>
          <div className="stat-val">{total.toLocaleString()}</div>
        </div>
        <div className="stat-card g">
          <div className="stat-label">VISIBLE ON PAGE</div>
          <div className="stat-val">{rows.length}</div>
        </div>
        <div className="stat-card o">
          <div className="stat-label">UNIQUE EMAILS</div>
          <div className="stat-val">{new Set(rows.map((r) => r.email)).size}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Lead List</div>
          <div className="card-actions">
            <button type="button" className="btn btn-dark btn-sm" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Created</th>
                <th>Full name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Intent</th>
              </tr>
            </thead>
            <tbody>
              {loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted" style={{ padding: 16 }}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-muted" style={{ padding: 16 }}>
                    No waitlist leads yet
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{fmtDate(row.created_at)}</td>
                  <td>{row.full_name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone_number}</td>
                  <td>{row.city}</td>
                  <td>{row.how_will_use_nexa || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div className="card-body" style={{ borderTop: '1px solid var(--surf2)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="td-muted">Total: {total}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-dark btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button type="button" className="btn btn-dark btn-sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
