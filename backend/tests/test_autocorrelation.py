"""
Verification tests for the NeuroCorr autocorrelation engine.
Run with:  cd backend && pytest tests/ -v
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
import numpy as np

from autocorrelation import direct_autocorrelation, fft_autocorrelation
from signal_simulator import generate_signal


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_sine(freq: float = 2.0, sr: float = 500.0, dur: float = 5.0) -> tuple:
    _, signal = generate_signal(
        "sine", frequency=freq, sampling_rate=sr, duration=dur,
        noise_level=0.0, amplitude=1.0,
    )
    return np.array(signal), sr


# ---------------------------------------------------------------------------
# Tests: peak at lag 0
# ---------------------------------------------------------------------------

def test_direct_acf_is_one_at_lag_zero():
    signal, sr = make_sine()
    _, acf, _ = direct_autocorrelation(signal, sr)
    assert acf[0] == pytest.approx(1.0, abs=1e-6), "Direct ACF must equal 1 at lag 0"


def test_fft_acf_is_one_at_lag_zero():
    signal, sr = make_sine()
    _, acf, _ = fft_autocorrelation(signal, sr)
    assert acf[0] == pytest.approx(1.0, abs=1e-6), "FFT ACF must equal 1 at lag 0"


def test_direct_acf_does_not_exceed_one():
    signal, sr = make_sine()
    _, acf, _ = direct_autocorrelation(signal, sr)
    assert np.all(acf <= 1.0 + 1e-9), "ACF values must not exceed 1"


# ---------------------------------------------------------------------------
# Tests: periodicity of a sine wave
# ---------------------------------------------------------------------------

def test_sine_acf_is_periodic_direct():
    freq, sr = 2.0, 500.0
    signal, _ = make_sine(freq=freq, sr=sr)
    _, acf, _ = direct_autocorrelation(signal, sr)
    period_samples = int(sr / freq)
    if period_samples < len(acf):
        assert acf[period_samples] > 0.85, (
            f"Sine ACF should be high at lag=1/f, got {acf[period_samples]:.4f}"
        )


def test_sine_acf_is_periodic_fft():
    freq, sr = 2.0, 500.0
    signal, _ = make_sine(freq=freq, sr=sr)
    _, acf, _ = fft_autocorrelation(signal, sr)
    period_samples = int(sr / freq)
    if period_samples < len(acf):
        assert acf[period_samples] > 0.85, (
            f"FFT sine ACF should be high at lag=1/f, got {acf[period_samples]:.4f}"
        )


# ---------------------------------------------------------------------------
# Tests: FFT and direct methods agree
# ---------------------------------------------------------------------------

def test_methods_agree_on_sine():
    signal, sr = make_sine()
    _, acf_d, _ = direct_autocorrelation(signal, sr)
    _, acf_f, _ = fft_autocorrelation(signal, sr)
    min_len = min(len(acf_d), len(acf_f))
    max_diff = float(np.max(np.abs(acf_d[:min_len] - acf_f[:min_len])))
    assert max_diff < 1e-6, f"Methods must agree within 1e-6; got max_diff={max_diff}"


def test_methods_agree_on_noisy_signal():
    np.random.seed(7)
    signal = np.random.randn(2000)
    sr = 1000.0
    _, acf_d, _ = direct_autocorrelation(signal, sr)
    _, acf_f, _ = fft_autocorrelation(signal, sr)
    min_len = min(len(acf_d), len(acf_f))
    max_diff = float(np.max(np.abs(acf_d[:min_len] - acf_f[:min_len])))
    assert max_diff < 1e-5, f"Methods must agree on noisy signal; got max_diff={max_diff}"


# ---------------------------------------------------------------------------
# Tests: white noise decorrelates quickly
# ---------------------------------------------------------------------------

def test_white_noise_acf_near_zero_at_nonzero_lags():
    np.random.seed(42)
    noise = np.random.randn(2000)
    _, acf, _ = fft_autocorrelation(noise, 1000.0)
    avg_nonzero = float(np.mean(np.abs(acf[1:100])))
    assert avg_nonzero < 0.15, (
        f"White noise ACF should be ~0 away from lag 0; got mean={avg_nonzero:.4f}"
    )


# ---------------------------------------------------------------------------
# Tests: runtimes are recorded
# ---------------------------------------------------------------------------

def test_runtimes_are_positive():
    signal, sr = make_sine()
    _, _, rt_d = direct_autocorrelation(signal, sr)
    _, _, rt_f = fft_autocorrelation(signal, sr)
    assert rt_d > 0, "Direct runtime must be positive"
    assert rt_f > 0, "FFT runtime must be positive"


# ---------------------------------------------------------------------------
# Tests: signal simulator output shapes
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("sig_type", [
    "sine", "noisy_sine", "exponential_decay", "photon_intensity", "random_noise"
])
def test_simulator_returns_correct_length(sig_type):
    sr, dur = 200.0, 2.0
    t, signal = generate_signal(sig_type, frequency=1.0, sampling_rate=sr, duration=dur)
    expected = int(sr * dur)
    assert len(t) == expected, f"{sig_type}: expected {expected} samples, got {len(t)}"
    assert len(signal) == expected
