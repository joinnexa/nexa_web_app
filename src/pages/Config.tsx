import { useState } from 'react'

export function Config() {
  const [flags, setFlags] = useState({ nfc: false, surge: true, staysPublic: false, goDashboard: false })
  const toggle = (key: keyof typeof flags) => setFlags((p) => ({ ...p, [key]: !p[key] }))
  return (
    <>
      <div className="section-title">System Configuration</div>
      <div className="section-sub">Global settings across Nexa Pay, Go, and Stays</div>
      <div className="row">
        <div className="col-1">
          <div className="card">
            <div className="card-hdr"><div className="card-title">Nexa Pay — Limits</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Daily send limit (unverified)</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>/api/v1/pay/config</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>500 MAD</div></div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontSize: 12.5, fontWeight: 700 }}>Base fare (Economy)</div></div><div style={{ background: 'var(--surf2)', border: '1px solid var(--surf3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 800 }}>15 MAD</div></div>
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
              {[
                { key: 'nfc' as const, label: 'NFC Payments', sub: 'Nexa Pay · hardware' },
                { key: 'surge' as const, label: 'Surge Pricing', sub: 'Nexa Go rides' },
                { key: 'staysPublic' as const, label: 'Stays Public Site', sub: 'nexa_stay_web_public' },
                { key: 'goDashboard' as const, label: 'Go Admin Dashboard', sub: 'nexa_go_web_app' },
              ].map(({ key, label, sub }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</div><div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{sub}</div></div>
                    <button type="button" className={`toggle ${flags[key] ? '' : 'off'}`} onClick={() => toggle(key)} aria-pressed={flags[key]}><div className="toggle-knob" /></button>
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
