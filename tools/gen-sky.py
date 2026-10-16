# Langit prosedural untuk Tema 10 & 11 (tanpa aset pihak lain):
#  - public/assets/t/istana/sky.webp   : galaksi merah-jingga & ungu-magenta penuh bintang (Istana Langit)
#  - public/assets/t/airterjun/milky.webp : bima sakti + bintang transparan untuk langit air terjun malam
import os, numpy as np
from PIL import Image, ImageFilter
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't')
rng = np.random.default_rng(11)

def fbm(w, h, scale, oct=6, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w)); amp = 1; tot = 0
    for o in range(oct):
        sx, sy = max(2, int(scale * 2 ** o)), max(2, int(scale * 2 ** o * h / w))
        g = r.random((sy + 1, sx + 1)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(im, np.float32) / 255 * amp; tot += amp; amp *= 0.52
    return out / tot

def stars(w, h, n, seed, big=0.03):
    r = np.random.default_rng(seed); a = np.zeros((h, w), np.float32)
    xs, ys = r.integers(0, w, n), r.integers(0, h, n); v = r.random(n) ** 3
    a[ys, xs] = 0.35 + 0.65 * v
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 255 * 2.2
    for i in range(int(n * big)):  # bintang terang dengan pendar
        x, y = r.integers(0, w), r.integers(0, h); rad = r.uniform(2, 5)
        yy, xx = np.ogrid[max(0, y - 14):min(h, y + 15), max(0, x - 14):min(w, x + 15)]
        a[yy, xx] += np.exp(-((xx - x) ** 2 + (yy - y) ** 2) / (rad ** 2)) * r.uniform(0.5, 1)
    return np.clip(a, 0, 1)

# ---------- Istana Langit: galaksi ----------
W, H = 900, 1500
yy = np.linspace(0, 1, H)[:, None] * np.ones((1, W)); xx = np.ones((H, 1)) * np.linspace(0, 1, W)[None, :]
base = np.stack([0.05 + 0.04 * yy, 0.04 + 0.03 * yy, 0.12 + 0.06 * yy], -1)
n1 = fbm(W, H, 2.2, 7, 1); n2 = fbm(W, H, 3.5, 6, 2); n3 = fbm(W, H, 6, 5, 3)
red = np.clip((n1 - 0.42) * 2.6, 0, 1) ** 1.4
mag = np.clip((n2 - 0.5) * 3.2, 0, 1) ** 1.3 * np.clip(1.2 - np.abs(xx - 0.62) * 2.4, 0, 1)
dust = np.clip((n3 - 0.45) * 2, 0, 1)
col = base.copy()
col += red[..., None] * np.array([0.78, 0.26, 0.16]) * (0.75 + 0.5 * dust[..., None])
col += red[..., None] ** 2 * np.array([0.35, 0.22, 0.12])
col += mag[..., None] * np.array([0.62, 0.22, 0.72])
col += (np.clip(n2 - 0.62, 0, 1) * 2)[..., None] * np.array([0.25, 0.3, 0.6])  # sedikit biru
dark = np.clip((fbm(W, H, 4, 5, 9) - 0.55) * 3, 0, 1)  # lajur debu gelap
col *= (1 - 0.45 * dark[..., None])
s = stars(W, H, 9000, 4, 0.02)
col += s[..., None] * np.array([1, 0.95, 0.9])
col = np.clip(col, 0, 1) ** 0.95
os.makedirs(os.path.join(OUT, 'istana'), exist_ok=True)
Image.fromarray((col * 255).astype(np.uint8)).save(os.path.join(OUT, 'istana', 'sky.webp'), 'WEBP', quality=86, method=6)

# ---------- Air Terjun Bulan: bima sakti transparan ----------
W, H = 784, 700
xx = np.ones((H, 1)) * np.linspace(0, 1, W)[None, :]; yy = np.linspace(0, 1, H)[:, None] * np.ones((1, W))
band = np.exp(-((yy - (0.15 + 0.55 * xx)) ** 2) / 0.02)  # pita miring
n = fbm(W, H, 4, 6, 21)
glow = band * np.clip(n - 0.25, 0, 1) * 1.4
s = stars(W, H, 3800, 22, 0.025)
a = np.clip(glow * 0.55 + s, 0, 1)
rgb = np.stack([0.78 + 0.2 * s, 0.8 + 0.15 * s, np.ones_like(s)], -1) * 0 + np.array([0.86, 0.88, 1.0])
rgb = rgb + glow[..., None] * np.array([0.05, -0.05, 0])
fade = np.clip(1 - (yy - 0.55) / 0.45, 0, 1)
img = np.dstack([np.clip(rgb, 0, 1), a * fade])
os.makedirs(os.path.join(OUT, 'airterjun'), exist_ok=True)
Image.fromarray((img * 255).astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'airterjun', 'milky.webp'), 'WEBP', quality=86, method=6)
print('ok')
