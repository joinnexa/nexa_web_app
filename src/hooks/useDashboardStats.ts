import { useEffect, useState } from 'react'
import { api } from '../api'
import type { DashboardStats } from '../api/types'

interface StaysStats {
  activeListings?: number
  bookingsMtd?: number
  hostsPending?: number
  revenueMtd?: number
}

interface GoStats {
  ridesToday?: number
  deliveriesToday?: number
  goRevenueMtd?: number
}

export function useDashboardStats() {
  const [pay, setPay] = useState<DashboardStats | null>(null)
  const [stays, setStays] = useState<StaysStats | null>(null)
  const [go, setGo] = useState<GoStats | null>(null)
  const [systemStatus, setSystemStatus] = useState<{ api?: string; database?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.ECOSYSTEM.getStats()
      .then((ecosystem) => {
        if (cancelled) return
        if (ecosystem?.pay) setPay(ecosystem.pay)
        if (ecosystem?.stays) setStays(ecosystem.stays)
        if (ecosystem?.go) setGo(ecosystem.go)
        if (ecosystem?.systemStatus) setSystemStatus(ecosystem.systemStatus)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        Promise.all([
          api.DASHBOARD.getStats().catch((e) => e),
          api.STAYS.getStats().catch((e) => e),
        ]).then(([payRes, staysRes]) => {
          if (cancelled) return
          if (payRes && !(payRes instanceof Error)) setPay(payRes as DashboardStats)
          else setError('Failed to load Pay stats')
          if (staysRes && !(staysRes instanceof Error)) setStays(staysRes as StaysStats)
          setLoading(false)
        })
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  return { pay, stays, go, systemStatus, loading, error }
}
