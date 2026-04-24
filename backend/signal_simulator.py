import numpy as np
from typing import Literal, Tuple, List

SignalType = Literal[
    "sine", "noisy_sine", "exponential_decay", "photon_intensity", "random_noise"
]


def generate_signal(
    signal_type: SignalType,
    frequency: float = 1.0,
    sampling_rate: float = 200.0,
    duration: float = 3.0,
    noise_level: float = 0.2,
    amplitude: float = 1.0,
) -> Tuple[List[float], List[float]]:
    """Generate a synthetic time-domain optical intensity signal."""
    n_samples = int(sampling_rate * duration)
    t = np.linspace(0, duration, n_samples, endpoint=False)

    if signal_type == "sine":
        signal = amplitude * np.sin(2 * np.pi * frequency * t)

    elif signal_type == "noisy_sine":
        clean = amplitude * np.sin(2 * np.pi * frequency * t)
        noise = noise_level * amplitude * np.random.randn(n_samples)
        signal = clean + noise

    elif signal_type == "exponential_decay":
        # Damped oscillation similar to DCS g2(tau) decorrelation curves
        decay_rate = max(frequency, 0.01)
        signal = amplitude * np.exp(-decay_rate * t) * np.cos(2 * np.pi * 0.5 * t)
        signal += noise_level * amplitude * np.random.randn(n_samples)

    elif signal_type == "photon_intensity":
        # Simulates photon-counting detector output with Poisson statistics.
        # Blood-flow oscillations modulate the mean photon arrival rate.
        mean_rate = max(amplitude * 50.0, 1.0)
        flow_mod = 1.0 + 0.35 * np.sin(2 * np.pi * frequency * t)
        counts = np.random.poisson(mean_rate * flow_mod).astype(float)
        signal = counts / mean_rate

    elif signal_type == "random_noise":
        signal = amplitude * noise_level * np.random.randn(n_samples)
        if noise_level == 0:
            signal = np.zeros(n_samples)

    else:
        raise ValueError(f"Unknown signal type: {signal_type!r}")

    return t.tolist(), signal.tolist()
