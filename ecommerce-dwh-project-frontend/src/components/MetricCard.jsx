export default function MetricCard({ label, value, icon, color = 'accent', sub }) {
  return (
    <div className={`metric-card ${color}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <div className="metric-value">{value ?? '—'}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}
