import { useEffect, useState } from 'react'
import { AlertTriangle, ShieldAlert, FileWarning, Scale } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '../../components/ui/Card'
import { adminApi } from '../../services/adminApi'
import type { RiskSummary } from '../../types/riskCompliance'

const defaultSummary: RiskSummary = {
  window: { from_date: null, to_date: null, severity: 'all' },
  totals: { risk_alerts: 0, fraud_events: 0, sar_reports: 0, reconciliation_issues: 0 },
  open: { risk_alerts: 0, sar_reports: 0, reconciliation_issues: 0 },
}

export default function RiskComplianceOverview() {
  const [summary, setSummary] = useState<RiskSummary>(defaultSummary)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await adminApi.getRiskSummary({ limit: 50 })
      setSummary(data)
    } catch (e: any) {
      setError(e?.message || 'Failed to load risk summary')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const chartData = [
    { name: 'Alerts', total: summary.totals.risk_alerts, open: summary.open.risk_alerts },
    { name: 'Fraud', total: summary.totals.fraud_events, open: summary.open.risk_alerts },
    { name: 'SAR', total: summary.totals.sar_reports, open: summary.open.sar_reports },
    {
      name: 'Recon',
      total: summary.totals.reconciliation_issues,
      open: summary.open.reconciliation_issues,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Risk & Compliance Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Operational health across fraud, SAR, and reconciliation</p>
        </div>
        <button onClick={load} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Risk Alerts">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{isLoading ? '...' : summary.totals.risk_alerts}</p>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
        <Card title="Fraud Events">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{isLoading ? '...' : summary.totals.fraud_events}</p>
            <ShieldAlert className="h-5 w-5 text-red-500" />
          </div>
        </Card>
        <Card title="SAR Reports">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{isLoading ? '...' : summary.totals.sar_reports}</p>
            <FileWarning className="h-5 w-5 text-orange-500" />
          </div>
        </Card>
        <Card title="Recon Issues">
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{isLoading ? '...' : summary.totals.reconciliation_issues}</p>
            <Scale className="h-5 w-5 text-blue-500" />
          </div>
        </Card>
      </div>

      <Card title="Totals vs Open Items">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
              <Bar dataKey="open" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
