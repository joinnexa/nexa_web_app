import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(redirect, { replace: true })
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null
      setError(msg ?? 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surf)',
    padding: 24,
  }}>
      <div style={{
        width: '100%',
        maxWidth: 380,
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--surf3)',
        boxShadow: 'var(--sh2)',
        padding: 32,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo/nexa-icon.png" alt="Nexa" style={{ width: 48, height: 48, marginBottom: 12 }} />
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>Nexa Admin</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Sign in to the ecosystem dashboard</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: '1px solid var(--surf3)',
              borderRadius: 9,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: '1px solid var(--surf3)',
              borderRadius: 9,
              marginBottom: 20,
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div className="alert alert-r" style={{ marginBottom: 16 }}>{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
