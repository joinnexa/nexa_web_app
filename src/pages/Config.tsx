import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

interface FlagRow {
  key: string
  name?: string
  enabled: boolean
  description?: string | null
}

export function Config() {
  const [flags, setFlags] = useState<FlagRow[]>([])
  const [payConfig, setPayConfig] = useState<{ dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number } | null>(null)
  const [goPricing, setGoPricing] = useState<Record<string, { baseFare?: number; perKm?: number; fixedCommission?: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.SYSTEM.getFeatureFlags(),
      api.SYSTEM.getPayConfig().catch(() => null),
      api.GO.getPricing().catch(() => ({ rideTypes: [], pricing: {} })),
    ])
      .then(([flagsRes, pay, go]) => {
        if (pay) setPayConfig(pay)
        if (go && typeof go === 'object' && 'pricing' in go) setGoPricing((go as { pricing: Record<string, { baseFare?: number; perKm?: number }> }).pricing)
        return flagsRes
      })
      .then((res) => {
        if (Array.isArray(res)) {
          setFlags((res as { key: string; name?: string; enabled: boolean; description?: string | null }[]).map((f) => ({ key: f.key, name: f.name, enabled: f.enabled, description: f.description })))
        } else if (res && typeof res === 'object') {
          setFlags(Object.entries(res as Record<string, boolean>).map(([key, enabled]) => ({ key, enabled })))
        } else {
          setFlags([])
        }
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const updatePayConfig = (updates: { dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number }) => {
    api.SYSTEM.updatePayConfig(updates)
      .then((r: { data?: { dailyLimitUnverified?: number; dailyLimitKyc?: number; qrExpirySeconds?: number } }) => r?.data && setPayConfig(r.data))
      .catch((e) => alert(e?.response?.data?.message ?? 'Failed to update'))
  }

  useEffect(() => { load() }, [load])

  const toggle = (key: string, current: boolean) => {
    setToggling(key)
    api.SYSTEM.updateFeatureFlag(key, !current)
      .then(() => load())
      .catch((e) => alert(e?.response?.data?.message ?? 'Failed to update'))
      .finally(() => setToggling(null))
  }

  return (
    <>
      <div className="section-title">System Configuration</div>
      <div className="section-sub">Global settings across Nexa Pay, Go, and Stays · Feature flags from <code style={{ fontSize: 11, background: 'var(--surf2)', padding: '2px 6px', borderRadius: 4 }}>/admin/system/feature-flags</code></div>
      {error && <div className="alert alert-r">{error}</div>}
      <div className="row">
        <div className="col-1">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Nexa Pay — Limits</div><button type="button" className="btn btn-dark btn-sm" onClick={() => updatePayConfig({})} title="Reset to defaults">Reset</button></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Daily send limit (unverified)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{payConfig?.dailyLimitUnverified != null ? `${payConfig.dailyLimitUnverified.toLocaleString()} MAD` : '—'}</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Daily send limit (KYC approved)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{payConfig?.dailyLimitKyc != null ? `${payConfig.dailyLimitKyc.toLocaleString()} MAD` : '—'}</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>QR expiry (seconds)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{payConfig?.qrExpirySeconds ?? '—'}</div></div>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Nexa Go — Pricing</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Base fare (Economy)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{goPricing.economy?.baseFare != null ? `${goPricing.economy.baseFare} MAD` : '—'}</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Per km rate (Economy)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{goPricing.economy?.perKm != null ? `${goPricing.economy.perKm} MAD` : '—'}</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Fixed commission (Economy)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>{goPricing.economy?.fixedCommission != null ? `${goPricing.economy.fixedCommission} MAD` : '—'}</div></div>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Feature Flags</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {loading && <div className="td-muted" style={{ padding: 8 }}>Loading…</div>}
              {!loading && flags.length === 0 && <div className="td-muted" style={{ padding: 8 }}>No feature flags returned</div>}
              {!loading && flags.map((f) => (
                <div key={f.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{f.name || f.key}</div><div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{f.description || f.key}</div></div>
                    <button type="button" className={`toggle ${f.enabled ? '' : 'off'}`} disabled={toggling === f.key} onClick={() => toggle(f.key, f.enabled)} aria-pressed={f.enabled}><div className="toggle-knob" /></button>
                  </div>
                  <div style={{ height: 1, background: 'var(--surf2)', margin: '8px 0' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
