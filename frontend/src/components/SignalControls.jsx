import { useState } from 'react'
import { motion } from 'framer-motion'

const SIGNAL_TYPES = [
  {
    value: 'noisy_sine',
    label: 'Noisy Sine',
    desc: 'Sine wave + Gaussian noise — mimics periodic brain signals with sensor noise',
  },
  {
    value: 'sine',
    label: 'Pure Sine',
    desc: 'Clean sinusoidal signal — ideal for verifying autocorrelation periodicity',
  },
  {
    value: 'photon_intensity',
    label: 'Photon Intensity',
    desc: 'Poisson-distributed photon counts — realistic DCS detector simulation',
  },
  {
    value: 'exponential_decay',
    label: 'Exp. Decay',
    desc: 'Damped oscillation — similar to a DCS g²(τ) decorrelation curve',
  },
  {
    value: 'random_noise',
    label: 'White Noise',
    desc: 'Pure Gaussian noise — ACF should collapse to 0 at all non-zero lags',
  },
]

const DEFAULT_PARAMS = {
  signal_type: 'noisy_sine',
  frequency: 1.0,
  sampling_rate: 200.0,
  duration: 3.0,
  noise_level: 0.2,
  amplitude: 1.0,
}

function SliderField({ label, name, value, min, max, step, unit, onChange }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          {value}
          {unit && <span className="text-indigo-400 ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function SignalControls({ onGenerate, loading }) {
  const [params, setParams] = useState(DEFAULT_PARAMS)

  const handleChange = (name, value) => setParams((p) => ({ ...p, [name]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate(params)
  }

  const selectedType = SIGNAL_TYPES.find((t) => t.value === params.signal_type)
  const totalSamples = Math.round(params.sampling_rate * params.duration)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Signal type picker */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Signal Type</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SIGNAL_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange('signal_type', type.value)}
              className={`p-3 rounded-xl border text-left text-sm transition-all ${
                params.signal_type === type.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="font-medium block">{type.label}</span>
            </button>
          ))}
        </div>
        {selectedType && (
          <p className="mt-2 text-xs text-gray-500 italic leading-relaxed">
            {selectedType.desc}
          </p>
        )}
      </div>

      {/* Parameter sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SliderField
          label="Frequency"
          name="frequency"
          value={params.frequency}
          min={0.1}
          max={20}
          step={0.1}
          unit=" Hz"
          onChange={handleChange}
        />
        <SliderField
          label="Sampling Rate"
          name="sampling_rate"
          value={params.sampling_rate}
          min={50}
          max={2000}
          step={50}
          unit=" Hz"
          onChange={handleChange}
        />
        <SliderField
          label="Duration"
          name="duration"
          value={params.duration}
          min={0.5}
          max={10}
          step={0.5}
          unit=" s"
          onChange={handleChange}
        />
        <SliderField
          label="Noise Level"
          name="noise_level"
          value={params.noise_level}
          min={0}
          max={1}
          step={0.05}
          unit=""
          onChange={handleChange}
        />
        <SliderField
          label="Amplitude"
          name="amplitude"
          value={params.amplitude}
          min={0.1}
          max={5}
          step={0.1}
          unit=""
          onChange={handleChange}
        />
      </div>

      {/* Info strip */}
      <div className="flex items-start gap-2.5 bg-blue-50 text-blue-700 rounded-xl px-4 py-3 text-sm">
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <span>
          <strong className="font-semibold">{totalSamples.toLocaleString()} samples</strong> will be
          generated and autocorrelated. Nyquist limit:{' '}
          <strong className="font-semibold">{(params.sampling_rate / 2).toFixed(0)} Hz</strong>.
        </span>
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.005 }}
        whileTap={{ scale: loading ? 1 : 0.995 }}
        className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2.5 text-sm"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Simulating &amp; computing autocorrelation…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z"
                clipRule="evenodd"
              />
            </svg>
            Generate Signal &amp; Run Autocorrelation
          </>
        )}
      </motion.button>
    </form>
  )
}
