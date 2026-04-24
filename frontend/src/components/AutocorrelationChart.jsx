import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

const MAX_RENDER_POINTS = 800

export default function AutocorrelationChart({ data }) {
  const chartData = useMemo(() => {
    const { direct, fft } = data
    const lags = direct.lags
    const acfD = direct.acf
    const acfF = fft.acf
    const step = Math.max(1, Math.floor(lags.length / MAX_RENDER_POINTS))
    const result = []
    for (let i = 0; i < lags.length; i += step) {
      result.push({
        lag: parseFloat(lags[i].toFixed(5)),
        direct: parseFloat((acfD[i] ?? 0).toFixed(6)),
        fft: parseFloat((acfF[i] ?? 0).toFixed(6)),
      })
    }
    return result
  }, [data])

  const legendFormatter = (value) =>
    value === 'direct' ? 'Direct (NumPy)' : 'FFT (Wiener-Khinchin)'
  const tickInterval = Math.max(0, Math.floor(chartData.length / 7))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 38, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis
            dataKey="lag"
            height={60}
            tickFormatter={(v) => `${Number(v).toFixed(3)}s`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            angle={-90}
            textAnchor="end"
            tickMargin={16}
            minTickGap={24}
            interval={tickInterval}
            label={{
              value: 'Lag τ (s)',
              position: 'insideBottomRight',
              offset: -4,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <YAxis
            tickFormatter={(v) => Number(v).toFixed(2)}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{
              value: 'g(τ)',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
            width={52}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(v, name) => [Number(v).toFixed(5), legendFormatter(name)]}
            labelFormatter={(l) => `τ = ${Number(l).toFixed(5)} s`}
          />
          <Legend formatter={legendFormatter} wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="direct"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="fft"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
