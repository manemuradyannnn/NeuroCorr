import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const MAX_RENDER_POINTS = 1000

export default function SignalChart({ data }) {
  const chartData = useMemo(() => {
    const { time, signal } = data
    const step = Math.max(1, Math.floor(signal.length / MAX_RENDER_POINTS))
    return time
      .filter((_, i) => i % step === 0)
      .map((t, i) => ({
        t: parseFloat(t.toFixed(4)),
        v: parseFloat((signal[i * step] ?? 0).toFixed(5)),
      }))
  }, [data])

  const values = chartData.map((d) => d.v)
  const yMin = Math.min(...values)
  const yMax = Math.max(...values)
  const pad = Math.max((yMax - yMin) * 0.1, 0.05)
  const tickInterval = Math.max(0, Math.floor(chartData.length / 7))

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 38, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis
            dataKey="t"
            height={60}
            tickFormatter={(v) => `${Number(v).toFixed(2)}s`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-90}
            textAnchor="end"
            tickMargin={16}
            minTickGap={24}
            interval={tickInterval}
            label={{
              value: 'Time (s)',
              position: 'insideBottomRight',
              offset: -4,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <YAxis
            domain={[yMin - pad, yMax + pad]}
            tickFormatter={(v) => v.toFixed(2)}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{
              value: 'Intensity',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
            width={52}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(v) => [Number(v).toFixed(5), 'Intensity']}
            labelFormatter={(l) => `t = ${Number(l).toFixed(4)} s`}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke="#4f46e5"
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
