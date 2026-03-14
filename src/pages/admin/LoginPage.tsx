import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card } from '../../components/ui/Card'
import { Shield, Lock, Mail } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 'credentials') {
      setStep('2fa')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter email and password')
      return
    }
    setStep('2fa')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nexa Admin</h1>
          <p className="text-gray-600 dark:text-gray-400">Secure access to admin portal</p>
        </div>

        <Card className="p-8 shadow-xl border-gray-200 dark:border-gray-700">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Sign in to your account
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter your credentials to continue</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@nexa.com"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Continue'}
              </Button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  Forgot password?
                </button>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Secure login</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Two-factor authentication
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <Label htmlFor="code">Authentication code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest mt-1.5"
                  required
                />
              </div>

              <Button type="submit" className="w-full mb-4" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Sign in'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              >
                Back to login
              </button>
            </form>
          )}
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Protected by advanced security measures</p>
          <p className="mt-1">All activities are logged and monitored</p>
        </div>
      </div>
    </div>
  )
}
