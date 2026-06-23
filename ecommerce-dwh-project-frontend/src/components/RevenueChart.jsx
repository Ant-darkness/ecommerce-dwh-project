import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a2235', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12
      }}>
        <div style={{ color: '#8b9ab8', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#818cf8', fontWeight: 700 }}>
          ${payload[0].value.toLocaleString()}
        </div>
      </div>
    )
  }
  return null
}

export default function RevenueChart({ data = [] }) {
  const formatted = data.map(d => ({
    ...d,
    label: d.date ? d.date.slice(5) : '',   // MM-DD
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,255,0.08)" />
        <XAxis
          dataKey="label"
          tick={{ fill: '#4a5568', fontSize: 10 }}
          axisLine={false} tickLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#4a5568', fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#818cf8' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
