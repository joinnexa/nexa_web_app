import { useCallback, useEffect, useState } from 'react'
import { api, type GoPricingConfig } from '../api'

const NUMERIC_FIELDS = [
  'base_fare',
  'per_km_rate',
  'per_min_rate',
  'min_fare',
  'booking_fee',
  'commission_min',
  'cancellation_window_secs',
  'cancellation_fee',
  'surge_multiplier',
] as const

export function PricingRules() {
  const [configs, setConfigs] = useState<GoPricingConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{
    vehicleType: string
    field: string
    oldValue: string | number | boolean
    newValue: string | number | boolean
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.GO.getPricing()
      .then((data) => setConfigs(Array.isArray(data) ? data : []))
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load pricing'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleCellEdit = (row: GoPricingConfig, field: string, newVal: string) => {
    const oldVal = (row as Record<string, unknown>)[field]
    if (oldVal == null && newVal === '') return
    const parsed = field === 'surge_active' || field === 'is_active'
      ? newVal === 'true' || newVal === '1'
      : Number(newVal)
    if (field !== 'surge_active' && field !== 'is_active' && Number.isNaN(parsed as number)) return
    if (String(oldVal) === String(parsed)) return
    setEditModal({
      vehicleType: row.vehicle_type,
      field,
      oldValue: oldVal as string | number | boolean,
      newValue: parsed as string | number | boolean,
    })
  }

  const confirmSave = useCallback(() => {
    if (!editModal) return
    setSaving(true)
    api.GO.updatePricing(editModal.vehicleType, { [editModal.field]: editModal.newValue })
      .then(() => {
        setEditModal(null)
        load()
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Update failed'))
      .finally(() => setSaving(false))
  }, [editModal, load])

  const toggleSurge = useCallback((row: GoPricingConfig) => {
    const next = !row.surge_active
    api.GO.setSurge(row.vehicle_type, next, row.surge_multiplier)
      .then(() => load())
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Surge update failed'))
  }, [load])

  if (loading && configs.length === 0) return <div className="section-title">Pricing Rules</div>
  if (error && configs.length === 0) {
    return (
      <>
        <div className="section-title">Pricing Rules</div>
        <div className="alert alert-r">{error}</div>
      </>
    )
  }

  return (
    <>
      <div className="section-title">Pricing Rules</div>
      <div className="section-sub">Config-driven rates from backend (go_pricing_config). Inline edit and confirm to save.</div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Vehicle Type Rates</div>
          <button type="button" className="btn btn-dark btn-sm" onClick={load}>Refresh</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Base Fare</th>
                <th>Per km</th>
                <th>Per min</th>
                <th>Min Fare</th>
                <th>Booking Fee</th>
                <th>Commission min</th>
                <th>Canc. window (s)</th>
                <th>Canc. fee</th>
                <th>Surge</th>
              </tr>
            </thead>
            <tbody>
              {configs.length === 0 && !loading && (
                <tr><td colSpan={11} className="td-muted" style={{ padding: 16 }}>No pricing data</td></tr>
              )}
              {configs.map((row) => (
                <tr key={row.vehicle_type}>
                  <td><span className="badge badge-v">{row.vehicle_type}</span></td>
                  {NUMERIC_FIELDS.map((field) => (
                    <td key={field}>
                      <input
                        type="text"
                        className="input-sm"
                        style={{ width: 64 }}
                        defaultValue={String((row as Record<string, unknown>)[field] ?? '')}
                        onBlur={(e) => handleCellEdit(row, field, e.target.value.trim())}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${row.surge_active ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleSurge(row)}
                    >
                      {row.surge_active ? 'ON' : 'OFF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal card">
            <div className="card-hdr"><div className="card-title">Confirm change</div></div>
            <p>
              <strong>{editModal.vehicleType}</strong> / <strong>{editModal.field}</strong>
            </p>
            <p>Old value: <code>{String(editModal.oldValue)}</code></p>
            <p>New value: <code>{String(editModal.newValue)}</code></p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={confirmSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
