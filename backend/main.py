from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
import numpy as np

from signal_simulator import generate_signal
from autocorrelation import direct_autocorrelation, fft_autocorrelation

app = FastAPI(
    title="NeuroCorr API",
    description="Software autocorrelator for brain blood-flow signal analysis (DCS / fNIRS)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SignalTypeLiteral = Literal[
    "sine", "noisy_sine", "exponential_decay", "photon_intensity", "random_noise"
]


class SignalRequest(BaseModel):
    signal_type: SignalTypeLiteral = "noisy_sine"
    frequency: float = Field(1.0, ge=0.01, le=50.0)
    sampling_rate: float = Field(200.0, ge=10.0, le=10_000.0)
    duration: float = Field(3.0, ge=0.1, le=30.0)
    noise_level: float = Field(0.2, ge=0.0, le=2.0)
    amplitude: float = Field(1.0, ge=0.01, le=10.0)


class AutocorrelateRequest(BaseModel):
    signal: List[float]
    sampling_rate: float = 200.0
    method: Literal["direct", "fft"] = "fft"
    max_lag: Optional[float] = None


class CompareRequest(BaseModel):
    signal: List[float]
    sampling_rate: float = 200.0
    max_lag: Optional[float] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "NeuroCorr", "version": "1.0.0"}


@app.post("/simulate")
def simulate(req: SignalRequest):
    t, signal = generate_signal(
        signal_type=req.signal_type,
        frequency=req.frequency,
        sampling_rate=req.sampling_rate,
        duration=req.duration,
        noise_level=req.noise_level,
        amplitude=req.amplitude,
    )
    return {
        "time": t,
        "signal": signal,
        "n_samples": len(signal),
        "duration": req.duration,
        "sampling_rate": req.sampling_rate,
        "signal_type": req.signal_type,
    }


@app.post("/autocorrelate")
def autocorrelate(req: AutocorrelateRequest):
    signal = np.array(req.signal, dtype=float)
    if len(signal) < 10:
        raise HTTPException(status_code=400, detail="Signal must have at least 10 samples.")

    if req.method == "direct":
        lags, acf, runtime = direct_autocorrelation(signal, req.sampling_rate)
    else:
        lags, acf, runtime = fft_autocorrelation(signal, req.sampling_rate)

    if req.max_lag is not None:
        mask = lags <= req.max_lag
        lags, acf = lags[mask], acf[mask]

    return {
        "lags": lags.tolist(),
        "acf": acf.tolist(),
        "runtime_ms": round(runtime, 4),
        "method": req.method,
        "n_lags": int(len(lags)),
    }


@app.post("/compare-methods")
def compare_methods(req: CompareRequest):
    signal = np.array(req.signal, dtype=float)
    if len(signal) < 10:
        raise HTTPException(status_code=400, detail="Signal must have at least 10 samples.")

    lags_d, acf_d, rt_d = direct_autocorrelation(signal, req.sampling_rate)
    lags_f, acf_f, rt_f = fft_autocorrelation(signal, req.sampling_rate)

    if req.max_lag is not None:
        mask_d = lags_d <= req.max_lag
        mask_f = lags_f <= req.max_lag
        lags_d, acf_d = lags_d[mask_d], acf_d[mask_d]
        lags_f, acf_f = lags_f[mask_f], acf_f[mask_f]

    min_len = min(len(acf_d), len(acf_f))
    diff = np.abs(acf_d[:min_len] - acf_f[:min_len])
    max_diff = float(np.max(diff))
    mean_diff = float(np.mean(diff))

    faster = "fft" if rt_f < rt_d else "direct"
    faster_rt = min(rt_d, rt_f)
    slower_rt = max(rt_d, rt_f)
    speedup = slower_rt / max(faster_rt, 1e-9)

    return {
        "direct": {
            "lags": lags_d.tolist(),
            "acf": acf_d.tolist(),
            "runtime_ms": round(rt_d, 4),
        },
        "fft": {
            "lags": lags_f.tolist(),
            "acf": acf_f.tolist(),
            "runtime_ms": round(rt_f, 4),
        },
        "comparison": {
            "max_difference": round(max_diff, 8),
            "mean_difference": round(mean_diff, 8),
            "faster_method": faster,
            "speedup_factor": round(speedup, 2),
            "n_samples": int(len(signal)),
        },
    }
