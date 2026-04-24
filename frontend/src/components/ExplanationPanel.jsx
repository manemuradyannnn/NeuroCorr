import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SECTIONS = [
  {
    id: 'autocorr',
    icon: '∿',
    title: 'What is Autocorrelation?',
    accent: 'indigo',
    body: `Autocorrelation measures the relationship between a signal and a lagged version of itself over successive time intervals. It determines how data points are correlated with their own past values with values ranging from -1 (perfect negative correlation) to 1 (perfect positive correlation).
Mathematically the normalised autocorrelation function is:
    g(τ) = ⟨ I(t) · I(t+τ) ⟩ / ⟨ I(t) ⟩²
At lag τ = 0, g(0) = 1 always — a signal is perfectly correlated with itself. As τ grows, g(τ) decays toward zero. The shape of that decay carries physical information about what's happening in the system.`,
    bullets: [
      'g(0) = 1 by definition — no delay, perfect agreement',
      'Periodic signals (sine waves) stay correlated at τ = multiples of the period',
      'Random (white) noise decorrelates instantly — g(τ≠0) ≈ 0',
      'Blood-flow dynamics live between these extremes',
    ],
  },
  {
    id: 'dcs',
    icon: '',
    title: 'Why Autocorrelation Matters in DCS / fNIRS',
    accent: 'blue',
    body: `In Diffuse Correlation Spectroscopy (DCS), a continuous-wave, long-coherence laser illuminates the scalp. Near-infrared photons scatter hundreds of times through brain tissue before returning to the surface.

Red blood cells moving through capillaries randomise the optical path lengths. This creates a speckle intensity pattern I(t) at the detector that fluctuates over time — like a star twinkling through the atmosphere, but caused by blood, not air.

The autocorrelation g²(τ) of that intensity directly encodes how fast the red blood cells are moving. Faster blood flow → faster fluctuations → g²(τ) decays faster. This is the core principle behind non-invasive cerebral blood flow monitoring at the bedside.`,
    bullets: [
      'Laser scatters through scalp & brain → back to detector as fluctuating speckle',
      'Red blood cell speed determines the fluctuation timescale',
      'g²(τ) decay rate maps to the Blood Flow Index (BFI)',
      'Used clinically: neonatal ICU, stroke, TBI, surgical monitoring',
    ],
  },
  {
    id: 'bloodflow',
    icon: '💉',
    title: 'How Changing Blood Flow Changes the Signal',
    accent: 'rose',
    body: `When cerebral blood flow increases — during a mental task, after a stroke, or with rising intracranial pressure — red blood cells move faster. The detected intensity I(t) then changes more rapidly, and the autocorrelation curve g²(τ) decays faster toward its baseline.

The standard DCS model fits the measured curve to:

    g²(τ) = 1 + β · exp(−2 Γ τ)

where Γ = 6π² n² μₐ · BFI · k₀² encodes the Blood Flow Index (BFI).

A software autocorrelator running this fit every 100 ms on a Raspberry Pi can deliver real-time, continuous blood flow numbers — replacing proprietary hardware correlator cards that cost $5 000–$50 000.`,
    bullets: [
      'Higher BFI → faster g²(τ) decay → shorter decorrelation time',
      'Brain activation, hyperaemia, and hypoxia all shift the BFI',
      'Standard fit: g²(τ) = 1 + β·exp(−2Γτ) — solvable in milliseconds',
      'NeuroCorr computes exactly this curve from simulated intensity data',
    ],
  },
  {
    id: 'hardware',
    icon: '🖥️',
    title: 'Software vs Hardware Autocorrelators',
    accent: 'emerald',
    body: `Traditional DCS systems use dedicated hardware correlator boards — ASICs with dozens of parallel delay channels running at nanosecond resolution (e.g., Correlator.com Flex08-8D, ~$5 000–$50 000). These boards are fast, but they are proprietary, bulky, and inaccessible to most labs.

Software autocorrelators replace the ASIC with an FFT on a CPU or GPU:

• FFT method O(N log N): efficient, runs in < 1 ms for typical signals
• Direct method O(N²): educational, exact, but scales poorly

For photon-counting rates up to ~2 MHz, a modern laptop matches hardware correlator throughput. For research and education, a Raspberry Pi 4 handles ~500 kHz with Python and NumPy — and NeuroCorr's backend is already structured to run there with no changes.`,
    bullets: [
      'Hardware correlators: fast, $5 k–$50 k, proprietary firmware',
      'FFT software: O(N log N), $0 extra cost, runs on any CPU',
      'Raspberry Pi 4 + Python handles ~500 kHz DCS in real time',
      'This FastAPI backend is directly deployable to RPi with zero code changes',
    ],
  },
]

const accentMap = {
  indigo: {
    card: 'border-indigo-100 bg-indigo-50/60',
    icon: 'bg-indigo-100 text-indigo-700',
    bullet: 'text-indigo-500',
  },
  blue: {
    card: 'border-blue-100 bg-blue-50/60',
    icon: 'bg-blue-100 text-blue-700',
    bullet: 'text-blue-500',
  },
  rose: {
    card: 'border-rose-100 bg-rose-50/60',
    icon: 'bg-rose-100 text-rose-700',
    bullet: 'text-rose-500',
  },
  emerald: {
    card: 'border-emerald-100 bg-emerald-50/60',
    icon: 'bg-emerald-100 text-emerald-700',
    bullet: 'text-emerald-500',
  },
}

function AccordionSection({ section }) {
  const [open, setOpen] = useState(false)
  const colors = accentMap[section.accent]

  return (
    <div className={`rounded-xl border overflow-hidden ${colors.card}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/50 transition-colors"
      >
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${colors.icon}`}
        >
          {section.icon}
        </span>
        <span className="font-semibold text-gray-800 text-sm flex-1">{section.title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {section.body.trim()}
              </p>
              <ul className="space-y-2">
                {section.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.bullet}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ExplanationPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 text-sm font-bold">
          ?
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Research Background</h2>
          <p className="text-sm text-gray-500">
            Beginner-friendly explanations of autocorrelation, DCS, and blood-flow sensing
          </p>
        </div>
      </div>
      <div className="space-y-2.5">
        {SECTIONS.map((s) => (
          <AccordionSection key={s.id} section={s} />
        ))}
      </div>
    </div>
  )
}
