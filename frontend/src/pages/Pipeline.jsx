import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TABLE_META = {
  stage_crm_users:            { icon: '👤', label: 'CRM Users',           layer: 'Staging' },
  stage_web_logs:             { icon: '🌐', label: 'Web Logs',            layer: 'Staging' },
  stage_pos_sales:            { icon: '🛒', label: 'POS Sales',           layer: 'Staging' },
  stage_support_tickets:      { icon: '🎫', label: 'Support Tickets',     layer: 'Staging' },
  stage_marketing_campaigns:  { icon: '📢', label: 'Marketing Campaigns', layer: 'Staging' },
  fact_customer_analytics:    { icon: '📊', label: 'Fact Analytics',      layer: 'Production' },
}

export default function Pipeline() {
  const [status, setStatus]   = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRun, setLastRun] = useState(null)

  const load = () => {
    setLoading(true)
    fetch(`${API}/api/pipeline-status`)
      .then(r => r.json())
      .then(d => {
        setStatus(d)
        setLastRun(new Date().toLocaleTimeString())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const staging    = status.filter(s => s.table.startsWith('stage_'))
  const production = status.filter(s => s.table.startsWith('fact_'))
  const totalRows  = status.reduce((a, s) => a + (s.rows || 0), 0)

  return (
    <>
      <div className="page-header">
        <div className="header-badge">⚙️ Orchestration</div>
        <h1>Pipeline Status</h1>
        <p>Live row counts for all staging and production tables in the Data Warehouse</p>
      </div>

      {/* Top stats */}
      <div className="metrics-grid" style={{ marginBottom: 24 }}>
        <div className="metric-card accent">
          <div className="metric-top">
            <span className="metric-label">Total Tables</span>
            <div className="metric-icon">🗄️</div>
          </div>
          <div className="metric-value">{status.length}</div>
          <div className="metric-sub">5 staging + 1 production</div>
        </div>
        <div className="metric-card green">
          <div className="metric-top">
            <span className="metric-label">Total Rows</span>
            <div className="metric-icon">📦</div>
          </div>
          <div className="metric-value">{totalRows.toLocaleString()}</div>
          <div className="metric-sub">Across all tables</div>
        </div>
        <div className="metric-card blue">
          <div className="metric-top">
            <span className="metric-label">Pipeline Health</span>
            <div className="metric-icon">🛡️</div>
          </div>
          <div className="metric-value">
            {status.length > 0 && status.every(s => s.status === 'ok') ? '100%' : 'Error'}
          </div>
          <div className="metric-sub">All tables reachable</div>
        </div>
        <div className="metric-card amber">
          <div className="metric-top">
            <span className="metric-label">Last Checked</span>
            <div className="metric-icon">🕐</div>
          </div>
          <div className="metric-value" style={{ fontSize: 18 }}>{lastRun || '…'}</div>
          <div className="metric-sub">
            <button
              className="btn btn-ghost"
              onClick={load}
              style={{ padding: '2px 8px', fontSize: 11, marginTop: 4 }}
            >↻ Refresh</button>
          </div>
        </div>
      </div>

      {/* Airflow pipeline diagram */}
      <div className="chart-card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">🔄 Airflow DAG — complete_ecommerce_dwh_pipeline</div>
            <div className="chart-subtitle">Daily schedule · 3 tasks in sequence</div>
          </div>
          <span className="chart-badge">@daily</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', overflowX: 'auto' }}>
          {[
            { id: 'generate_faker_data', label: 'Generate Data', icon: '🏭', desc: 'Faker → 5 CSVs' },
            { id: 'run_etl_pipeline',   label: 'ETL Pipeline',  icon: '⚙️', desc: 'Extract · Clean · Load' },
            { id: 'ml_churn_prediction',label: 'ML Prediction', icon: '🤖', desc: 'KMeans churn model' },
          ].map((task, i, arr) => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-bright)',
                borderRadius: 10,
                padding: '14px 18px',
                minWidth: 160,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{task.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{task.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{task.desc}</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginTop: 8, padding: '2px 8px',
                  background: 'var(--green-glow)', border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 20, fontSize: 10, color: 'var(--green)', fontWeight: 600,
                }}>
                  <span style={{ width: 5, height: 5, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
                  Active
                </div>
              </div>
              {i < arr.length - 1 && (
                <div style={{ color: 'var(--accent-light)', fontSize: 20, fontWeight: 700 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Staging tables */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="chart-title">📥 Staging Layer</div>
            <div className="chart-subtitle">Raw data from 5 source systems</div>
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="pipeline-grid">
            {staging.map(s => {
              const meta = TABLE_META[s.table] || { icon: '📋', label: s.table }
              return (
                <div key={s.table} className="pipeline-item">
                  <div className="pipeline-item-icon">{meta.icon}</div>
                  <div>
                    <div className="pipeline-item-name">{meta.label}</div>
                    <div className="pipeline-item-rows">{(s.rows || 0).toLocaleString()}</div>
                    <div className={`pipeline-item-status ${s.status !== 'ok' ? 'error' : ''}`}>
                      {s.status === 'ok' ? '✓ OK' : `✗ ${s.status}`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Production layer */}
      <div className="chart-card">
        <div className="chart-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="chart-title">🏭 Production Layer</div>
            <div className="chart-subtitle">Cleaned, merged analytics fact table</div>
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="pipeline-grid">
            {production.map(s => {
              const meta = TABLE_META[s.table] || { icon: '📊', label: s.table }
              return (
                <div key={s.table} className="pipeline-item" style={{ border: '1px solid var(--border-bright)' }}>
                  <div className="pipeline-item-icon" style={{ background: 'var(--accent-glow)' }}>{meta.icon}</div>
                  <div>
                    <div className="pipeline-item-name">{meta.label}</div>
                    <div className="pipeline-item-rows" style={{ color: 'var(--accent-light)' }}>
                      {(s.rows || 0).toLocaleString()}
                    </div>
                    <div className="pipeline-item-status">✓ OK</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
