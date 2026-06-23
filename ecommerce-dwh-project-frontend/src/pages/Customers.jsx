import { useEffect, useState, useCallback } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 15

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [churnOnly, setChurnOnly] = useState(false)
  const [loading, setLoading]     = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const url = `${API}/api/customers?page=${page}&page_size=${PAGE_SIZE}&churned_only=${churnOnly}`
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setCustomers(d.data || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, churnOnly])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <>
      <div className="page-header">
        <div className="header-badge">👥 Customer Intelligence</div>
        <h1>Customer Directory</h1>
        <p>Full list of warehouse customers with ML churn predictions from the analytics fact table</p>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div className="table-title">
            {total.toLocaleString()} customers
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>
              · Page {page} of {totalPages || 1}
            </span>
          </div>
          <div className="table-controls">
            <div className="filter-toggle">
              <button
                className={!churnOnly ? 'active' : ''}
                onClick={() => { setChurnOnly(false); setPage(1) }}
              >All</button>
              <button
                className={churnOnly ? 'active' : ''}
                onClick={() => { setChurnOnly(true); setPage(1) }}
              >⚠️ Churn Risk</button>
            </div>
            <button className="btn btn-ghost" onClick={load}>↻ Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Loading customers…</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
            <p>No customers found. Run the Airflow pipeline first.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Total Spend</th>
                    <th>Avg Session</th>
                    <th>Support Tickets</th>
                    <th>Converted</th>
                    <th>Churn Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.user_id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 11 }}>
                        {c.user_id}
                      </td>
                      <td className="name">{c.name}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.email}</td>
                      <td>{c.country}</td>
                      <td className="spend">${Number(c.total_spend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td>{c.avg_session_duration}s</td>
                      <td style={{ textAlign: 'center' }}>{c.total_tickets}</td>
                      <td style={{ textAlign: 'center' }}>
                        {c.marketing_converted
                          ? <span style={{ color: 'var(--green)' }}>✓</span>
                          : <span style={{ color: 'var(--text-muted)' }}>–</span>}
                      </td>
                      <td>
                        <span className={`churn-badge ${c.is_churned ? 'risk' : 'safe'}`}>
                          {c.is_churned ? '⚠ At Risk' : '✓ Retained'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span className="pagination-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-ghost"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >← Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(1, page - 2) + i
                  if (p > totalPages) return null
                  return (
                    <button
                      key={p}
                      className={`btn ${p === page ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  )
                })}
                <button
                  className="btn btn-ghost"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
