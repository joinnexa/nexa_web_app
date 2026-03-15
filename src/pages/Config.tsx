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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.SYSTEM.getFeatureFlags()
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
            <div className="card-hdr"><div className="card-title">Nexa Pay — Limits</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Daily send limit (unverified)</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>No API yet</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>500 MAD</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Daily send limit (KYC approved)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>50,000 MAD</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>QR expiry (seconds)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>300</div></div>
            </div>
          </div>
        </div>
        <div className="col-1">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Nexa Go — Pricing</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Base fare (Economy)</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>No API yet</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>15 MAD</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Per km rate (Economy)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>3.5 MAD</div></div>
              <div style={{ height: 1, background: 'var(--surf2)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Platform commission</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>10%</div></div>
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
