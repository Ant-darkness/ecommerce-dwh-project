import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5','#6366f1','#818cf8','#f59e0b','#fcd34d','#3b82f6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#1a2235', border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12
      }}>
        <div style={{ color: '#8b9ab8', marginBottom: 4 }}>{label}</div>
        <div style={{ color: '#10b981', fontWeight: 700 }}>
          ${Number(payload[0].value).toLocaleString()} revenue
        </div>
        <div style={{ color: '#4a5568', fontSize: 11 }}>
          {payload[0]?.payload?.customers} customers
        </div>
      </div>
    )
  }
  return null
}

export default function TopCountries({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, left: 60, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,130,255,0.08)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: '#4a5568', fontSize: 10 }}
          axisLine={false} tickLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          type="category"
          dataKey="country"
          tick={{ fill: '#8b9ab8', fontSize: 11 }}
          axisLine={false} tickLine={false}
          width={58}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
