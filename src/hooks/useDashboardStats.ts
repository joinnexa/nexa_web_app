import { useEffect, useState } from 'react'
import { api } from '../api'
import type { DashboardStats } from '../api/types'

interface StaysStats {
  activeListings?: number
  bookingsMtd?: number
  hostsPending?: number
  revenueMtd?: number
}

export function useDashboardStats() {
  const [pay, setPay] = useState<DashboardStats | null>(null)
  const [stays, setStays] = useState<StaysStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      api.DASHBOARD.getStats().catch((e) => e),
      api.STAYS.getStats().catch((e) => e),
    ])
      .then(([payRes, staysRes]) => {
        if (cancelled) return
        if (payRes && !(payRes instanceof Error)) setPay(payRes as DashboardStats)
        else if (payRes instanceof Error) setError(payRes.message ?? 'Failed to load stats')
        if (staysRes && !(staysRes instanceof Error)) setStays(staysRes as StaysStats)
        setLoading(false)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  return { pay, stays, loading, error }
}
