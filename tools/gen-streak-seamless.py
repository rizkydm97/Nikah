#!/usr/bin/env python3
"""Tema 10 (v63): membuat streak-seamless.webp dari streak.webp agar tepi atas & bawah menyambung mulus (aliran air tanpa patah)."""
import numpy as np
from PIL import Image
D = 'public/assets/t/ungu/'
a = np.array(Image.open(D + 'streak.webp').convert('RGBA')).astype(np.float32)
H = a.shape[0]
y = np.arange(H, dtype=np.float32)
band = 0.18 * H
d = np.minimum(y, H - 1 - y)                    # jarak ke tepi terdekat
w = np.clip(d / band, 0, 1); w = w * w * (3 - 2 * w)   # 0 di tepi, 1 di dalam
w = w[:, None, None]
out = a * w + np.roll(a, H // 2, axis=0) * (1 - w)
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA').save(D + 'streak-seamless.webp', quality=88, method=6)
print('seam diff', float(np.abs(out[0] - out[-1]).mean()), 'adjacent', float(np.abs(out[0] - out[1]).mean()))
