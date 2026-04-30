import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { DashboardStats } from '../api/types'
import { useIntervalPoll } from './useIntervalPoll'

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

export type UseDashboardStatsOptions = {
  /** Polling interval in ms; omit, `undefined`, `null`, or `0` to disable */
  pollIntervalMs?: number | null
}

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const pollIntervalMs = options.pollIntervalMs ?? null

  const [pay, setPay] = useState<DashboardStats | null>(null)
  const [stays, setStays] = useState<StaysStats | null>(null)
  const [go, setGo] = useState<GoStats | null>(null)
  const [systemStatus, setSystemStatus] = useState<{ api?: string; database?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSeq = useRef(0)

  const load = useCallback(async (initial: boolean) => {
    const id = ++requestSeq.current
    if (initial) {
      setLoading(true)
      setError(null)
    }

    const stale = () => id !== requestSeq.current

    const applyEcosystem = (ecosystem: {
      pay?: DashboardStats
      stays?: StaysStats
      go?: GoStats
      systemStatus?: { api?: string; database?: string }
    }) => {
      if (stale()) return
      if (ecosystem?.pay) setPay(ecosystem.pay)
      if (ecosystem?.stays) setStays(ecosystem.stays)
      if (ecosystem?.go) setGo(ecosystem.go)
      if (ecosystem?.systemStatus) setSystemStatus(ecosystem.systemStatus)
      if (initial) setError(null)
    }

    const applyFallback = (payRes: unknown, staysRes: unknown) => {
      if (stale()) return
      if (payRes && !(payRes instanceof Error)) {
        setPay(payRes as DashboardStats)
        if (initial) setError(null)
      } else if (initial && payRes instanceof Error) {
        setError('Failed to load Pay stats')
      }
      if (staysRes && !(staysRes instanceof Error)) setStays(staysRes as StaysStats)
    }

    try {
      const ecosystem = await api.ECOSYSTEM.getStats()
      applyEcosystem(ecosystem ?? {})
    } catch {
      try {
        const [payRes, staysRes] = await Promise.all([
          api.DASHBOARD.getStats().catch((e) => e),
          api.STAYS.getStats().catch((e) => e),
        ])
        applyFallback(payRes, staysRes)
      } catch (e) {
        if (!stale() && initial) setError(e instanceof Error ? e.message : 'Failed to load')
      }
    } finally {
      if (!stale() && initial) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(true)
  }, [load])

  useIntervalPoll(() => void load(false), pollIntervalMs ?? null)

  return { pay, stays, go, systemStatus, loading, error }
}
