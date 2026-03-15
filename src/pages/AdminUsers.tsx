import { useState } from 'react'
import { api } from '../api'

export function AdminUsers() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('ADMIN')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const sendInvite = () => {
    if (!email.trim()) return
    setSending(true)
    setMessage(null)
    api.USERS.inviteAdmin(email.trim(), role)
      .then((res: unknown) => {
        const data = (res as { data?: { message?: string } })?.data
        setMessage({ type: 'ok', text: data?.message ?? 'Invite sent' })
        setEmail('')
        setInviteOpen(false)
      })
      .catch((e) => setMessage({ type: 'err', text: e?.response?.data?.message ?? e?.message ?? 'Failed to send invite' }))
      .finally(() => setSending(false))
  }

  return (
    <>
      <div className="section-title">Admin Users</div>
      <div className="section-sub">Staff accounts with dashboard access</div>
      {message && <div className={`alert ${message.type === 'ok' ? 'alert-g' : 'alert-r'}`}>{message.text}</div>}
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Admin Accounts</div>
          <div className="card-actions">
            <button type="button" className="btn btn-dark btn-sm" onClick={() => { setInviteOpen(true); setMessage(null) }}>+ Invite Admin</button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td colSpan={5} className="td-muted" style={{ padding: 16 }}>Admin list from backend not implemented yet. Use Invite to send an invite.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      {inviteOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => !sending && setInviteOpen(false)}>
          <div className="card" style={{ minWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <div className="card-hdr"><div className="card-title">Invite Admin</div><button type="button" className="topbar-btn" onClick={() => !sending && setInviteOpen(false)} aria-label="Close">×</button></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@nexa.ma" style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surf3)' }} />
              <label style={{ fontSize: 12, fontWeight: 700 }}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--surf3)' }}>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn btn-dark" onClick={sendInvite} disabled={sending || !email.trim()}>{sending ? 'Sending…' : 'Send Invite'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setInviteOpen(false)} disabled={sending}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
