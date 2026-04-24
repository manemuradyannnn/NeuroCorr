import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SignalControls from './components/SignalControls'
import SignalChart from './components/SignalChart'
import AutocorrelationChart from './components/AutocorrelationChart'
import MethodComparison from './components/MethodComparison'
import ExplanationPanel from './components/ExplanationPanel'

const API_BASE = 'http://localhost:8000'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: 'easeOut' },
}

function SectionCard({ icon, title, sub, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {sub && <p className="text-sm text-gray-500">{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

export default function App() {
  const [signalData, setSignalData] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = useCallback(async (params) => {
    setLoading(true)
    setError(null)
    setSignalData(null)
    setComparisonData(null)

    try {
      // 1. Simulate signal
      const simRes = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!simRes.ok) {
        const err = await simRes.json().catch(() => ({}))
        throw new Error(err.detail ?? `Simulate failed (${simRes.status})`)
      }
      const simData = await simRes.json()
      setSignalData(simData)

      // 2. Compare autocorrelation methods
      const maxLag = Math.min(params.duration * 0.5, 2.0)
      const cmpRes = await fetch(`${API_BASE}/compare-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal: simData.signal,
          sampling_rate: params.sampling_rate,
          max_lag: maxLag,
        }),
      })
      if (!cmpRes.ok) {
        const err = await cmpRes.json().catch(() => ({}))
        throw new Error(err.detail ?? `Compare failed (${cmpRes.status})`)
      }
      const cmpData = await cmpRes.json()
      setComparisonData(cmpData)
    } catch (err) {
      const isNetwork =
        err instanceof TypeError && err.message.toLowerCase().includes('fetch')
      setError(
        isNetwork
          ? 'Cannot reach the backend. Start it with:\n  cd neurocorr/backend\n  uvicorn main:app --reload'
          : err.message,
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* ── Hero ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-slate-50 text-slate-950">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M44 0L0 0 0 44" fill="none" stroke="#cbd5e1" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div className="inline-flex items-center gap-3">
              <div className="text-xs uppercase tracking-[0.35em] font-semibold text-slate-500">NeuroCorr</div>
              <span className="rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                AI autocorrelation simulator
              </span>
            </div>
            <button className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition">
              Open simulator
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
              NeuroCorr
            </h1>
            <p className="text-lg md:text-xl leading-9 text-slate-700 max-w-3xl mx-auto">
              This website simulates optical signals that directly model how light behaves in brain tissue during techniques like diffuse correlation spectroscopy. By analyzing these signals with autocorrelation, it shows how patterns in light fluctuations can be used to estimate brain blood flow and underlying neural activity.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              {[
                'Signal generation',
                'Autocorrelation comparison',
                'Educational explanations before the simulator',
              ].map((f) => (
                <span key={f} className="rounded-full border border-slate-300 bg-white/90 px-4 py-2">
                  {f}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      {/*Main content*/}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-7">
        <motion.div {...fadeUp}>
          <div className="rounded-[2rem] border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/50 backdrop-blur-sm p-8">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">About this site</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 mb-4">
                Everything you need to understand about autocorrelation before you run the simulation.
              </h2>
              <p className="text-base leading-8 text-slate-700">
                NeuroCorr is built to help you learn how time-series signals behave when autocorrelated.
                Start by reading the research background, then generate a signal and compare the direct and FFT methods.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                'Interactive signal generation',
                'Comparison of direct and FFT autocorrelation',
                'Clear, educational explanations up front',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Research explanation accordion */}
        <motion.div {...fadeUp} transition={{ duration: 0.35, delay: 0.1 }}>
          <ExplanationPanel />
        </motion.div>

        {/* Signal Simulator */}
        <motion.div {...fadeUp}>
          <SectionCard
            icon="⚙"
            title="Signal Simulator"
            sub="Configure and generate a synthetic optical intensity signal"
          >
            <SignalControls onGenerate={handleGenerate} loading={loading} />
          </SectionCard>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-mono whitespace-pre-line overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Signal output chart */}
        <AnimatePresence>
          {signalData && (
            <motion.div key="signal" {...fadeUp}>
              <SectionCard
                icon="~"
                title="Generated Signal"
                sub={`${signalData.n_samples.toLocaleString()} samples · ${signalData.duration} s · ${signalData.sampling_rate} Hz · type: ${signalData.signal_type.replace('_', ' ')}`}
              >
                <SignalChart data={signalData} />
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Autocorrelation chart */}
        <AnimatePresence>
          {comparisonData && (
            <motion.div key="acf" {...fadeUp}>
              <SectionCard
                icon="g²"
                title="Autocorrelation Function g(τ)"
                sub="Direct method (blue solid) overlaid with FFT method (orange dashed)"
              >
                <AutocorrelationChart data={comparisonData} />
              </SectionCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Method comparison dashboard */}
        <AnimatePresence>
          {comparisonData && (
            <motion.div key="cmp" {...fadeUp} transition={{ duration: 0.35, delay: 0.05 }}>
              <MethodComparison data={comparisonData} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-10 py-6 border-t border-gray-200 text-center text-xs text-gray-400">
        NeuroCorr · Software Autocorrelator for DCS / fNIRS · FastAPI + React + NumPy
      </footer>
    </div>
  )
}
