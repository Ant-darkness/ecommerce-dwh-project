import { useEffect, useState } from 'react'
import MetricCard from '../components/MetricCard'
import RevenueChart from '../components/RevenueChart'
import ChurnChart from '../components/ChurnChart'
import TopCountries from '../components/TopCountries'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])

  return { data, loading, error }
}

export default function Dashboard() {
  const { data: metrics, loading: mLoading } = useFetch(`${API}/api/metrics`)
  const { data: revenue }                     = useFetch(`${API}/api/revenue-trend`)
  const { data: churn }                       = useFetch(`${API}/api/churn-stats`)
  const { data: countries }                   = useFetch(`${API}/api/top-countries`)

  const fmt = (n, prefix = '') =>
    n == null ? '…' : `${prefix}${Number(n).toLocaleString()}`

  return (
    <>
      <div className="page-header">
        <div className="header-badge">⚡ Live Analytics</div>
        <h1>Data Warehouse Dashboard</h1>
        <p>Real-time metrics from 5 integrated data sources · ML-powered churn prediction · Airflow orchestrated</p>
      </div>

      {/* ── KPI Metrics ── */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Customers"
          value={fmt(metrics?.total_customers)}
          icon="👥"
          color="accent"
          sub="Across all integrated sources"
        />
        <MetricCard
          label="Total Revenue"
          value={fmt(metrics?.total_revenue, '$')}
          icon="💰"
          color="green"
          sub="Aggregated POS sales"
        />
        <MetricCard
          label="Churn Risk"
          value={fmt(metrics?.churned_customers)}
          icon="⚠️"
          color="red"
          sub="ML predicted — KMeans cluster"
        />
        <MetricCard
          label="Retention Rate"
          value={metrics?.retention_rate != null ? `${metrics.retention_rate}%` : '…'}
          icon="🛡️"
          color="blue"
          sub="Retained vs total customers"
        />
        <MetricCard
          label="Conversions"
          value={fmt(metrics?.conversion_count)}
          icon="🎯"
          color="amber"
          sub="Marketing campaign converted"
        />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">📈 Revenue Trend</div>
              <div className="chart-subtitle">Last 30 days · daily aggregation</div>
            </div>
            <span className="chart-badge">30-day</span>
          </div>
          {revenue ? <RevenueChart data={revenue} /> : (
            <div className="loading-spinner"><div className="spinner" /><span>Loading chart…</span></div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">🌍 Churn by Country</div>
              <div className="chart-subtitle">Top 10 countries · ML predicted</div>
            </div>
            <span className="chart-badge">Top 10</span>
          </div>
          {churn ? <ChurnChart data={churn} /> : (
            <div className="loading-spinner"><div className="spinner" /><span>Loading chart…</span></div>
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="chart-card" style={{ marginBottom: 0 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">🏆 Top Revenue Countries</div>
            <div className="chart-subtitle">Highest revenue-generating markets</div>
          </div>
          <span className="chart-badge">Top 10</span>
        </div>
        {countries ? <TopCountries data={countries} /> : (
          <div className="loading-spinner"><div className="spinner" /><span>Loading chart…</span></div>
        )}
      </div>
    </>
  )
}
