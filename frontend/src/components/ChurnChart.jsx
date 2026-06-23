import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#6366f1','#818cf8','#a78bfa','#8b5cf6','#7c3aed','#6d28d9','#5b21b6','#4c1d95','#ef4444','#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a2235', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12
      }}>
        <div style={{ color: '#8b9ab8', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#ef4444', fontWeight: 700 }}>
          {payload[0].value} churned ({payload[0]?.payload?.churn_rate}%)
        </div>
      </div>
    )
  }
  return null
}

export default function ChurnChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,255,0.08)" />
        <XAxis
          dataKey="country"
          tick={{ fill: '#4a5568', fontSize: 9 }}
          axisLine={false} tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={40}
        />
        <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="churned" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
