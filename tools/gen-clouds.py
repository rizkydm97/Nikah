# Awan bervolume (3D semu) untuk Tema 10 & 11: gumpalan bola + detail noise, penerangan dari atas-kiri,
# bayangan berwarna di bawah, cahaya tepi, dasar memudar menjadi kabut (tidak terpotong lurus).
# Pakai: python3 tools/gen-clouds.py
import os, numpy as np
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFilter
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 't')

def fbm(w, h, seed, base=4, octs=6, pers=0.55):
    rng = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0.0
    for o in range(octs):
        s = max(2, base * 2 ** o); g = rng.random((int(s * h / w) + 2, s + 1)).astype(np.float32)
        im = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        out += im * amp; tot += amp; amp *= pers
    return out / tot

def blur(a, r):
    return gaussian_filter(a.astype(np.float32), r)

def smooth(a, e0, e1):
    t = np.clip((a - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def cloud(path, w, h, lit, shadow, rim, seed, wide=1.0, puffs=15, deep=0.0, sun=(-0.5, -0.7, 0.52)):
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # gumpalan: baris dasar besar-rata, lalu gumpalan menumpuk makin kecil ke atas (kembang kol)
    sph = []
    base_y = h * 0.70
    for i in range(puffs):
        t = (i + 0.5) / puffs
        cx = w * (0.24 + 0.52 * t) + rng.normal(0, w * 0.012)
        hump = np.sin(np.pi * t) ** 0.8
        r = h * (0.13 + 0.17 * hump) * (0.8 + rng.random() * 0.4) / max(0.6, wide ** 0.15)
        sph.append((cx, base_y - r * 0.35 * hump - rng.random() * h * 0.04, r))
    for i in range(int(puffs * 1.1)):
        b = sph[rng.integers(0, puffs)]
        a = rng.uniform(-2.5, -0.65)
        r = b[2] * rng.uniform(0.40, 0.72)
        sph.append((b[0] + np.cos(a) * b[2] * 0.62, b[1] + np.sin(a) * b[2] * 0.62, r))
    for i in range(int(puffs * 0.8)):  # gumpalan kecil di tepi bawah (dasar bergelombang)
        t = rng.random(); sph.append((w * (0.22 + 0.56 * t), base_y + h * 0.03, h * rng.uniform(0.06, 0.10)))
    K = 9.0 / (h * 0.25)
    zs = []; cov = np.zeros((h, w), np.float32)
    for cx, cy, r in sph:
        d2 = ((xx - cx) ** 2 + ((yy - cy) / 0.9) ** 2)
        z = np.sqrt(np.clip(r * r - d2, 0, None))
        zs.append(z); cov = np.maximum(cov, np.clip(1 - np.sqrt(d2) / r, 0, 1))
    zmax = np.max(zs, axis=0)
    acc = np.zeros((h, w), np.float32)
    for z in zs: acc += np.exp(K * (z - zmax)) * (z > 0)
    z = zmax + np.log(np.maximum(acc, 1e-6)) / K * (zmax > 0)     # penyatuan halus antar gumpalan
    n = fbm(w, h, seed + 7, 3, 4, 0.5); n2 = gaussian_filter(fbm(w, h, seed + 19, 14, 3, 0.5), 2.5)
    z = z * (1 + 0.10 * (n - 0.5)) * (1 + deep * 0.3)
    zb = gaussian_filter(z, 2.0)
    gy, gx = np.gradient(zb)
    nx, ny, nz = -gx * 1.05, -gy * 1.05, np.ones_like(gx)
    Ln = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / Ln, ny / Ln, nz / Ln
    sx, sy, sz = np.array(sun) / np.linalg.norm(sun)
    dif = nx * sx + ny * sy + nz * sz
    wrap = np.clip(dif * 0.55 + 0.45, 0, 1) ** 1.15
    yn = yy / h
    # lekukan di antara gumpalan lebih gelap (kedalaman), dasar awan lebih gelap
    crev = np.clip((gaussian_filter(zb, 10) - zb) / (h * 0.05), 0, 1) * (zb > 0)
    ao = 1.0 - smooth(yn, 0.50, 0.92) * 0.8
    lit_f = np.clip(wrap * (0.55 + 0.6 * ao) * (1 - 0.55 * crev) + 0.05 * (n2 - 0.5), 0, 1)
    L3, S3, R3 = (np.array(c, np.float32) for c in (lit, shadow, rim))
    col = S3 + (L3 - S3) * lit_f[..., None]
    rimk = np.clip((1 - nz) * 1.5, 0, 1) * np.clip(-(nx * sx + ny * sy) * 0.9 + 0.3, 0, 1)
    col += (rimk * 0.5)[..., None] * R3[None, None, :]
    col += (smooth(yn, 0.72, 0.96) * 0.12)[..., None] * R3[None, None, :]
    zn = z / (h * 0.28)
    a = smooth(zn, 0.0, 0.16)
    a *= 0.82 + 0.18 * smooth(n2, 0.3, 0.7) + 0.0
    a *= 1 - smooth(yn, 0.76, 0.99) * 0.97
    a = np.clip(blur(a, 1.4), 0, 1)
    img = np.dstack([np.clip(col, 0, 1), a]); out = (img * 255).astype(np.uint8)
    im = Image.fromarray(out, 'RGBA'); os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path, 'WEBP', quality=88, method=6)
    return im

if __name__ == '__main__':
    G = os.path.join(ROOT, 'istana'); A = os.path.join(ROOT, 'airterjun')
    s = 1.5
    cloud(os.path.join(G, 'cl-peach.webp'), int(620 * s), int(380 * s), (1.0, 0.95, 0.88), (0.80, 0.40, 0.58), (1.0, 0.82, 0.6), 41, puffs=16)
    cloud(os.path.join(G, 'cl-peach2.webp'), int(540 * s), int(360 * s), (1.0, 0.90, 0.92), (0.76, 0.36, 0.62), (1.0, 0.78, 0.7), 42, puffs=15)
    cloud(os.path.join(G, 'cl-purple.webp'), int(700 * s), int(420 * s), (0.80, 0.66, 1.0), (0.16, 0.08, 0.36), (0.95, 0.70, 1.0), 43, puffs=18, deep=0.3)
    cloud(os.path.join(G, 'cl-red.webp'), int(1000 * s), int(400 * s), (0.95, 0.42, 0.52), (0.20, 0.03, 0.12), (1.0, 0.65, 0.5), 44, wide=1.8, puffs=22)
    cloud(os.path.join(G, 'cl-wave.webp'), int(1000 * s), int(400 * s), (0.88, 0.93, 1.0), (0.14, 0.20, 0.52), (0.8, 0.9, 1.0), 45, wide=1.8, puffs=22)
    cloud(os.path.join(A, 'mist.webp'), int(1000 * s), int(340 * s), (0.78, 0.88, 1.0), (0.12, 0.20, 0.48), (0.85, 0.95, 1.0), 46, wide=1.8, puffs=20)
    print('ok')
