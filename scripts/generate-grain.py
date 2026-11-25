"""Generate a tileable 1024x1024 monochrome film-grain texture (public/textures/grain.png)."""
import sys
import numpy as np
from PIL import Image

out = sys.argv[1] if len(sys.argv) > 1 else "public/textures/grain.png"
rng = np.random.default_rng(7)
n = rng.normal(0.0, 1.0, (1024, 1024))
# Soften very slightly in the frequency domain (keeps it tileable) for an organic, non-digital grain.
f = np.fft.fft2(n)
fy = np.fft.fftfreq(1024)[:, None]
fx = np.fft.fftfreq(1024)[None, :]
f *= np.exp(-((fx**2 + fy**2) / (2 * 0.22**2)))
g = np.real(np.fft.ifft2(f))
g = (g - g.mean()) / g.std()
img = np.clip(128 + g * 38, 0, 255).astype(np.uint8)
Image.fromarray(img, "L").save(out, optimize=True)
print("wrote", out)
