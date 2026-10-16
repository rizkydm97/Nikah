# Membuat tekstur bulan realistis (prosedural) untuk animasi bulan berputar: public/assets/t/fx/moon.webp
import numpy as np, os
from PIL import Image, ImageFilter
N = 768; rng = np.random.default_rng(7)
y, x = np.mgrid[0:N, 0:N] / N
def noise(scale, oct=5):
    out = np.zeros((N, N)); amp = 1; tot = 0
    for o in range(oct):
        s = int(scale * 2 ** o); g = rng.random((s + 1, s + 1))
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((N, N), Image.BICUBIC)
        out += np.asarray(im, float) / 255 * amp; tot += amp; amp *= 0.5
    return out / tot
base = 0.62 + (noise(6) - 0.5) * 0.35
mare = noise(2, 4); mare = np.clip((mare - 0.5) * 3.2, 0, 1); mare = np.asarray(Image.fromarray((mare * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10)), float) / 255
alb = base * (1 - 0.5 * mare)
# kawah: lantai lebih gelap, bibir terang, beberapa sinar terang
for i in range(140):
    cx, cy = rng.random(2); r = (rng.random() ** 4) * 0.05 + 0.003
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
    floor = np.clip(1 - d, 0, 1) ** 0.6
    rim = np.exp(-((d - 1) ** 2) / 0.025)
    alb = alb * (1 - 0.12 * floor) + 0.045 * rim * (0.6 + 0.4 * rng.random())
for i in range(3):  # kawah besar bersinar (seperti Tycho)
    cx, cy = rng.random(2) * 0.6 + 0.2; d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    ang = np.arctan2(y - cy, x - cx); rays = (np.sin(ang * 23 + i) * 0.5 + 0.5) ** 6 * np.exp(-d * 9)
    alb += rays * 0.05 + np.exp(-(d / 0.012) ** 2) * 0.18
alb += (noise(60, 3) - 0.5) * 0.1
alb = np.clip(alb, 0, 1)
# bentuk bulat + gelap di tepi (limb darkening) — bayangan arah cahaya diberikan lewat CSS supaya rotasi tetap wajar
r = np.sqrt((x - 0.5) ** 2 + (y - 0.5) ** 2) / 0.5
mu = np.sqrt(np.clip(1 - r ** 2, 0, 1)); limb = 0.55 + 0.45 * mu
v = np.clip(alb * limb, 0, 1)
rgb = np.stack([v * 0.98 + 0.02, v * 0.98 + 0.02, v + 0.02], -1)
a = np.clip((1 - r) * N * 0.5, 0, 1)
img = Image.fromarray((np.dstack([np.clip(rgb, 0, 1), a]) * 255).astype(np.uint8), 'RGBA').resize((512, 512), Image.LANCZOS)
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't', 'fx', 'moon.webp')
img.save(out, 'WEBP', quality=90, method=6); print('ok', out)
