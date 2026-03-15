import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import type { KycApplication } from '../api/types'

function toBadge(status: string) {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED' || s === 'VERIFIED') return 'badge-g'
  if (s === 'REJECTED' || s === 'FAILED') return 'badge-r'
  return 'badge-y'
}

export function KycReview() {
  const [data, setData] = useState<KycApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('All')
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const source = tab === 'All' ? 'ALL' : tab === 'CIN' ? 'PAY' : 'PAY'
    api.KYC.getApplications({ source, limit: 50 })
      .then((res) => {
        const items = Array.isArray(res) ? res : (res as { items?: KycApplication[] }).items ?? []
        setData(items)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => { load() }, [load])

  const handleApprove = (userId: string) => {
    setActing(userId)
    api.KYC.approve(userId)
      .then(() => load())
      .catch((e) => alert(e?.response?.data?.message ?? 'Failed'))
      .finally(() => setActing(null))
  }
  const handleReject = (userId: string) => {
    const reason = prompt('Rejection reason (optional):') ?? ''
    setActing(userId)
    api.KYC.reject(userId, reason)
      .then(() => load())
      .catch((e) => alert(e?.response?.data?.message ?? 'Failed'))
      .finally(() => setActing(null))
  }

  const pending = data.filter((a) => (a.status || '').toUpperCase() === 'PENDING').length
  const approved = data.filter((a) => ['APPROVED', 'VERIFIED'].includes((a.status || '').toUpperCase())).length
  const rejected = data.filter((a) => (a.status || '').toUpperCase() === 'REJECTED').length

  return (
    <>
      <div className="section-title">KYC Review</div>
      <div className="section-sub">Pending identity verifications from <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/kyc/applications</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card y"><div className="stat-label">PENDING REVIEW</div><div className="stat-val">{loading ? '…' : pending}</div><div className="stat-sub">Awaiting admin action</div></div>
        <div className="stat-card g"><div className="stat-label">APPROVED (sample)</div><div className="stat-val">{loading ? '…' : approved}</div><div className="stat-sub">In this list</div></div>
        <div className="stat-card r"><div className="stat-label">REJECTED (sample)</div><div className="stat-val">{loading ? '…' : rejected}</div><div className="stat-sub">In this list</div></div>
        <div className="stat-card b"><div className="stat-label">TOTAL IN LIST</div><div className="stat-val">{loading ? '…' : data.length}</div><div className="stat-sub">limit 50</div></div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Applications</div>
          <div className="card-actions">
            <div className="tabs">
              {['All', 'CIN', 'Passport', 'License'].map((t) => (
                <button key={t} type="button" className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Applicant</th><th>Document</th><th>Doc Type</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && data.length === 0 && <tr><td colSpan={6} className="td-muted" style={{ textAlign: 'center', padding: 24 }}>No applications</td></tr>}
              {!loading && data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="user-cell">
                      <div className="av av-y">{(row.user_name || row.user_phone || row.user_id || '?').slice(0, 1).toUpperCase()}</div>
                      <div>
                        <div className="user-name">{row.user_name || '—'}</div>
                        <div className="user-id">{row.user_phone || row.user_id?.slice(0, 8) || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td-mono">{row.national_id_number_extracted || row.national_id_number || '—'}</td>
                  <td><span className="badge badge-n">{row.document_type || '—'}</span></td>
                  <td><span className={toBadge(row.status)}>{row.status || '—'}</span></td>
                  <td className="td-muted">{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : '—'}</td>
                  <td>
                    {(row.status || '').toUpperCase() === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button type="button" className="btn btn-g btn-sm" disabled={acting === row.user_id} onClick={() => handleApprove(row.user_id)}>Approve</button>
                        <button type="button" className="btn btn-r btn-sm" disabled={acting === row.user_id} onClick={() => handleReject(row.user_id)}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
