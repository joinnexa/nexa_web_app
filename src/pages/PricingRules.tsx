import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'

interface RidePricing {
  rideType?: string
  baseFare?: number
  perKm?: number
  perMin?: number
  minimumFare?: number
  bookingFee?: number
  fixedCommission?: number
}

export function PricingRules() {
  const [rideTypes, setRideTypes] = useState<string[]>([])
  const [pricing, setPricing] = useState<Record<string, RidePricing>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    api.GO.getPricing()
      .then((res) => {
        setRideTypes(res?.rideTypes ?? [])
        setPricing((res?.pricing ?? {}) as Record<string, RidePricing>)
      })
      .catch((e) => setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load pricing'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  if (loading && rideTypes.length === 0) return <div className="section-title">Pricing Rules</div>
  if (error && rideTypes.length === 0) return <><div className="section-title">Pricing Rules</div><div className="alert alert-r">{error}</div></>

  return (
    <>
      <div className="section-title">Pricing Rules</div>
      <div className="section-sub">Fare tables from backend (Casablanca)</div>
      <div className="card">
        <div className="card-hdr"><div className="card-title">Vehicle Type Rates</div><button type="button" className="btn btn-dark btn-sm" onClick={load}>Refresh</button></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Base Fare</th><th>Per km</th><th>Per min</th><th>Min Fare</th><th>Booking Fee</th><th>Commission</th></tr></thead>
            <tbody>
              {rideTypes.length === 0 && !loading && <tr><td colSpan={7} className="td-muted" style={{ padding: 16 }}>No pricing data</td></tr>}
              {rideTypes.map((type) => {
                const p = pricing[type]
                if (!p) return null
                return (
                  <tr key={type}>
                    <td><span className="badge badge-v">{type}</span></td>
                    <td>{p.baseFare != null ? `${p.baseFare} MAD` : '—'}</td>
                    <td>{p.perKm != null ? `${p.perKm} MAD` : '—'}</td>
                    <td>{p.perMin != null ? `${p.perMin} MAD` : '—'}</td>
                    <td>{p.minimumFare != null ? `${p.minimumFare} MAD` : '—'}</td>
                    <td>{p.bookingFee != null ? `${p.bookingFee} MAD` : '—'}</td>
                    <td>{p.fixedCommission != null ? `${p.fixedCommission} MAD` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
