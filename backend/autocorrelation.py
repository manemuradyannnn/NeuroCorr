import numpy as np
import time
from typing import Tuple


def direct_autocorrelation(
    signal: np.ndarray,
    sampling_rate: float,
) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    Direct autocorrelation using np.correlate (O(N^2) convolution).
    Simple and exact, but slow for large signals.
    """
    t0 = time.perf_counter()

    x = signal - np.mean(signal)
    n = len(x)
    acf = np.correlate(x, x, mode="full")
    acf = acf[n - 1 :]          # keep positive lags
    if acf[0] != 0:
        acf = acf / acf[0]      # normalise so g(0) = 1

    runtime_ms = (time.perf_counter() - t0) * 1000.0
    lags = np.arange(len(acf)) / sampling_rate
    return lags, acf, runtime_ms


def fft_autocorrelation(
    signal: np.ndarray,
    sampling_rate: float,
) -> Tuple[np.ndarray, np.ndarray, float]:
    """
    FFT-based autocorrelation via the Wiener-Khinchin theorem (O(N log N)).
    PSD = |FFT(x)|^2  =>  ACF = IFFT(PSD).
    Zero-pads to 2N to avoid circular aliasing.
    """
    t0 = time.perf_counter()

    x = signal - np.mean(signal)
    n = len(x)
    fft_size = 2 * n            # zero-pad to prevent wrap-around artefacts
    F = np.fft.rfft(x, n=fft_size)
    psd = F * np.conj(F)
    acf_full = np.fft.irfft(psd)
    acf = np.real(acf_full[:n])
    if acf[0] != 0:
        acf = acf / acf[0]

    runtime_ms = (time.perf_counter() - t0) * 1000.0
    lags = np.arange(n) / sampling_rate
    return lags, acf, runtime_ms
