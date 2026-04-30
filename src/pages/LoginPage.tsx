import { useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { themeLogoSrc, useTheme } from '../contexts/ThemeContext'

export function LoginPage() {
  const { theme, toggleTheme } = useTheme()
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
      await login(email.trim(), password)
      navigate(redirect, { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (!err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
          setError(
            'Cannot reach the API. Start the Nexa backend on port 3000, or set VITE_API_BASE_URL in .env.'
          )
          return
        }
        const data = err.response?.data as { message?: string | string[] } | undefined
        const raw = data?.message
        const msg = Array.isArray(raw) ? raw.join(', ') : raw
        setError(typeof msg === 'string' && msg.trim() ? msg : 'Invalid email or password')
        return
      }
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <button
        type="button"
        className="theme-fab"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? (
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <circle cx={12} cy={12} r={4} />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
      <div className="login-brand-panel">
        <div className="login-brand">
          <div className="logo-wrap">
            <img src={themeLogoSrc(theme)} alt="Nexa" />
          </div>
          <h1>Nexa Admin</h1>
          <p className="tagline">
            Sign in to manage Pay, Go, and Stays from one dashboard.
          </p>
        </div>
      </div>
      <div className="login-form-panel">
        <div className="login-form-card">
          <h2>Sign in</h2>
          <p className="form-sub">
            Use your authorized administrator account.
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="name@company.com"
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
            {error && (
              <div className="alert alert-r" role="alert">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
