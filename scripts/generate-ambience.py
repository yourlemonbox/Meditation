"""
Procedural forest ambience bed: soft wind through leaves + sparse, distant birdsong.

Exactly 180 s, 48 kHz stereo, no loops (every second is generated fresh from a
seeded RNG), no voices or sound effects. Output is a 24-bit WAV; encode to AAC
with ffmpeg (see README) for public/audio/forest-ambience.m4a.

This is an original, royalty-free bed. It can be swapped for a licensed field
recording at any time by replacing the .m4a file (same name).

Usage: python3 scripts/generate-ambience.py out.wav [seed]
"""
import sys
import wave
import numpy as np

SR = 48000
DUR = 180.0
N = int(SR * DUR)
out = sys.argv[1] if len(sys.argv) > 1 else "forest-ambience.wav"
seed = int(sys.argv[2]) if len(sys.argv) > 2 else 11
rng = np.random.default_rng(seed)
t = np.arange(N) / SR


def band(x, lo, hi, order=4.0):
    """Zero-phase smooth band-pass via FFT (lo/hi in Hz; None = open)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** (2 * order))
    if hi:
        g *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * g, n=len(x))


def pink(n):
    X = np.fft.rfft(rng.normal(size=n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X /= np.sqrt(np.maximum(f, 20))
    y = np.fft.irfft(X, n=n)
    return y / np.std(y)


def slow_env(n, rate_hz, smooth_hz):
    """Smooth random control signal in [0,1]."""
    k = int(DUR * rate_hz) + 4
    pts = rng.random(k)
    xs = np.linspace(0, n, k)
    e = np.interp(np.arange(n), xs, pts)
    e = band(e, None, smooth_hz, order=2)
    e -= e.min()
    return e / e.max()


# ---------------- Wind ----------------
gust = 0.35 + 0.65 * slow_env(N, 0.12, 0.08) ** 1.6     # long, lazy gusts
flutter = 0.7 + 0.3 * slow_env(N, 1.2, 0.8)               # leaf flutter

wind = np.zeros((N, 2))
for ch in range(2):
    base = pink(N)
    low = band(base, 60, 420)          # body of the wind
    mid = band(base, 420, 1600)        # brightens as gusts rise
    leaves = band(rng.normal(size=N), 1800, 7500, order=3)  # rustle
    leaves *= (gust ** 2.2) * flutter
    w = low * (0.55 + 0.45 * gust) + mid * (0.25 * gust ** 1.5) + leaves * 0.10
    wind[:, ch] = w
# Slight stereo movement of the gusts
pan = 0.5 + 0.18 * np.sin(2 * np.pi * t / 37.0 + 1.3)
wind[:, 0] *= np.sqrt(1 - pan) * 1.41
wind[:, 1] *= np.sqrt(pan) * 1.41
wind /= np.max(np.abs(wind))
wind *= 0.32

# ---------------- Birds ----------------
def tone(dur, f0, f1, curve=1.0, vib=0.0, vib_hz=0.0, harm=0.12):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    p = (tt / dur) ** curve
    f = f0 + (f1 - f0) * p
    if vib:
        f = f * (1 + vib * np.sin(2 * np.pi * vib_hz * tt))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + harm * np.sin(2 * ph)
    a = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 1.5
    return s * a


def call_whistle():  # clear, descending two-note "tee-oo"
    f = rng.uniform(2800, 3600)
    return [(0.0, tone(0.22, f, f * 1.04)), (0.30, tone(0.32, f * 0.82, f * 0.74, vib=0.006, vib_hz=28))]


def call_trill():  # soft warbling trill
    f = rng.uniform(3800, 5200)
    n = rng.integers(6, 12)
    gap = rng.uniform(0.06, 0.09)
    return [(i * gap, tone(0.05, f * (1 + 0.04 * (i % 2)), f * 0.92, harm=0.05)) for i in range(n)]


def call_phrase():  # thrush-like varied phrase
    out, at = [], 0.0
    for _ in range(rng.integers(3, 6)):
        f0 = rng.uniform(2200, 4200)
        f1 = f0 * rng.uniform(0.8, 1.35)
        d = rng.uniform(0.08, 0.22)
        out.append((at, tone(d, f0, f1, curve=rng.uniform(0.5, 2), vib=rng.uniform(0, 0.01), vib_hz=40)))
        at += d + rng.uniform(0.03, 0.12)
    return out


def call_chip():  # distant single chips
    f = rng.uniform(5000, 6500)
    return [(i * rng.uniform(0.5, 0.9), tone(0.03, f, f * 0.85, harm=0.0)) for i in range(rng.integers(1, 4))]


birds = np.zeros((N, 2))
# Two or three "individuals" each with their own habit, distance and position, plus random chips.
singers = [
    dict(fn=call_whistle, every=(7, 15), gain=0.16, pan=0.25),
    dict(fn=call_phrase, every=(9, 20), gain=0.11, pan=0.72),
    dict(fn=call_trill, every=(16, 34), gain=0.07, pan=0.55),
    dict(fn=call_chip, every=(5, 12), gain=0.05, pan=None),
]
for s in singers:
    at = rng.uniform(2.5, 8.0)
    while at < DUR - 3:
        g = s["gain"] * rng.uniform(0.55, 1.0)
        p = s["pan"] if s["pan"] is not None else rng.uniform(0.1, 0.9)
        p = np.clip(p + rng.normal(0, 0.05), 0.05, 0.95)
        repeats = 1 if rng.random() < 0.6 else 2
        for r in range(repeats):
            for off, sig in s["fn"]():
                i0 = int((at + off + r * rng.uniform(0.9, 1.6)) * SR)
                i1 = min(N, i0 + len(sig))
                if i0 >= N:
                    continue
                birds[i0:i1, 0] += sig[: i1 - i0] * g * np.sqrt(1 - p)
                birds[i0:i1, 1] += sig[: i1 - i0] * g * np.sqrt(p)
        at += rng.uniform(*s["every"])

# Distance: soften highs, then a diffuse forest "room" (decaying filtered-noise IR).
for ch in range(2):
    birds[:, ch] = band(birds[:, ch], 1200, 7000, order=2)
ir_len = int(2.4 * SR)
tir = np.arange(ir_len) / SR
wet = np.zeros_like(birds)
for ch in range(2):
    ir = rng.normal(size=ir_len) * np.exp(-tir / 0.55)
    ir = band(ir, 300, 5000, order=2)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = N + ir_len
    nfft = 1 << (L - 1).bit_length()
    wet[:, ch] = np.fft.irfft(np.fft.rfft(birds[:, ch], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
birds = 0.45 * birds + 0.9 * wet

mix = wind + birds
# Gentle 3 s fade-in / 4 s fade-out at file level too (Remotion adds its own envelope).
fade = np.ones(N)
fi, fo = int(3 * SR), int(4 * SR)
fade[:fi] = np.linspace(0, 1, fi) ** 2
fade[-fo:] = np.linspace(1, 0, fo) ** 2
mix *= fade[:, None]
peak = np.max(np.abs(mix))
mix *= (10 ** (-3 / 20)) / peak  # -3 dBFS peak; ambience stays quiet overall

pcm = np.clip(mix * (2 ** 23 - 1), -(2 ** 23), 2 ** 23 - 1).astype(np.int32)
b = (pcm.astype("<i4").view(np.uint8).reshape(-1, 4)[:, :3]).tobytes()
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(3)
    w.setframerate(SR)
    w.writeframes(b)
print("wrote", out, f"{N / SR:.3f}s")
