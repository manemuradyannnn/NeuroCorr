import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

function MetricCard({ title, value, sub, accent }) {
  const colors = {
    indigo: 'border-indigo-100 bg-indigo-50',
    orange: 'border-orange-100 bg-orange-50',
    green: 'border-green-100 bg-green-50',
    teal: 'border-teal-100 bg-teal-50',
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-4 ${colors[accent] ?? colors.indigo}`}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-900 font-mono leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  )
}

export default function MethodComparison({ data }) {
  const { direct, fft, comparison } = data

  const runtimeData = [
    { name: 'Direct', ms: parseFloat(direct.runtime_ms.toFixed(3)), key: 'direct' },
    { name: 'FFT', ms: parseFloat(fft.runtime_ms.toFixed(3)), key: 'fft' },
  ]

  const fasterLabel = comparison.faster_method === 'fft' ? 'FFT' : 'Direct'
  const fasterColor = comparison.faster_method === 'fft' ? 'text-orange-600' : 'text-indigo-600'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">
          ⚡
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Method Comparison</h2>
          <p className="text-sm text-gray-500">Runtime, accuracy, and numerical agreement between Direct and FFT</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Direct method"
          value={`${direct.runtime_ms.toFixed(3)} ms`}
          sub={`${direct.lags.length.toLocaleString()} lag values`}
          accent="indigo"
        />
        <MetricCard
          title="FFT method"
          value={`${fft.runtime_ms.toFixed(3)} ms`}
          sub={`${fft.lags.length.toLocaleString()} lag values`}
          accent="orange"
        />
        <MetricCard
          title="Max |Δg(τ)|"
          value={comparison.max_difference.toExponential(2)}
          sub="Peak absolute error"
          accent="green"
        />
        <MetricCard
          title="Mean |Δg(τ)|"
          value={comparison.mean_difference.toExponential(2)}
          sub="Average absolute error"
          accent="teal"
        />
      </div>

      {/* Chart + Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Runtime bar chart */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Runtime (lower is better)</p>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={runtimeData}
                layout="vertical"
                margin={{ left: 16, right: 40, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v.toFixed(2)} ms`}
                />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={44} />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(4)} ms`, 'Runtime']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="ms" radius={[0, 6, 6, 0]} barSize={24}>
                  <Cell fill="#4f46e5" />
                  <Cell fill="#f97316" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis text */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 space-y-2.5 text-sm text-gray-600 leading-relaxed">
          <p className="font-semibold text-gray-700 text-base">Analysis</p>
          <p>
            <span className={`font-semibold ${fasterColor}`}>{fasterLabel} method</span> was faster
            by{' '}
            <span className="font-semibold text-gray-800">
              {comparison.speedup_factor.toFixed(1)}×
            </span>{' '}
            on {comparison.n_samples.toLocaleString()} samples.
          </p>
          <p>
            The <strong>FFT method</strong> uses the Wiener-Khinchin theorem:
            <span className="font-mono text-xs bg-white/80 rounded px-1.5 py-0.5 mx-1 text-gray-700">
              g(τ) = IFFT(|FFT(x)|²)
            </span>
            reducing complexity from O(N²) → O(N log N).
          </p>
          <p>
            Numerical agreement:{' '}
            <span className="font-mono text-xs">{comparison.max_difference.toExponential(2)}</span>{' '}
            max error —{' '}
            <span className="text-green-600 font-semibold">both methods are effectively identical</span>.
          </p>
          {comparison.n_samples > 5000 && (
            <div className="bg-blue-100 text-blue-700 rounded-lg px-3 py-2 text-xs mt-1">
              At {comparison.n_samples.toLocaleString()} samples, the FFT advantage becomes
              significant. For continuous DCS monitoring (MHz photon rates), FFT is the only
              practical choice.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
