#!/usr/bin/env python3
"""Tema 10 (v62): awan bervolume 3 lapis kedalaman + tekstur bulan baru (prosedural, palet lilac).
Tiap awan dibuat dari medan kepadatan (kumpulan gumpalan bulat) lalu diberi cahaya dari kiri-atas.
Keluaran di public/assets/t/ungu/:
  c3-{a,b,c,d}-{b,m,f}.webp   b = lapis belakang (gelap, lebar), m = badan, f = lapis depan (terang, lebih kecil)
  moon3d.webp                 bulan krem dengan lautan & kawah
Jalankan: python3 tools/gen-cloud3d.py"""
import os, random
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 't', 'ungu')
W, H = 640, 300
SHADOW, MID, LIGHT = np.array([176, 150, 204.]), np.array([240, 228, 247.]), np.array([255, 253, 255.])


def fbm(h, w, seed, octs=5):
    rng = np.random.default_rng(seed); acc = np.zeros((h, w)); amp = 1.0; tot = 0.0
    for o in range(octs):
        n = 2 ** (o + 2); g = rng.random((n + 1, max(2, int(n * w / h) + 1)))
        acc += amp * zoom(g, (h / g.shape[0], w / g.shape[1]), order=3)[:h, :w]; tot += amp; amp *= 0.55
    return acc / tot


def heightmap(seed, flat, wide=1.0):
    """Gumpalan = kubah bola (tinggi ~ sqrt(1-d^2)); awan = gabungan banyak kubah, puncak di tengah, dasar rata."""
    rnd = random.Random(seed); yy, xx = np.mgrid[0:H, 0:W]; hm = np.zeros((H, W)); n = 46
    for i in range(n):
        t = rnd.random(); arch = np.sin(t * np.pi) ** flat
        cx = W * (0.5 + (t - 0.5) * 0.86 * wide)
        r = rnd.uniform(16, 50) * (0.45 + 0.85 * arch)
        cy = H * 0.74 - rnd.random() * arch * H * 0.34 - r * 0.2
        d2 = ((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)
        hm = np.maximum(hm, np.where(d2 < 1, r * np.sqrt(np.clip(1 - d2, 0, 1)), 0))
    hm = gaussian_filter(hm, 2.4)
    hm *= np.clip((H * 0.9 - yy) / (H * 0.2), 0, 1) ** 0.8  # dasar rata & lembut
    return hm


def render(seed, flat, kind):
    hm = heightmap(seed, flat); hm = hm * (0.9 + 0.22 * fbm(H, W, seed + 7))
    alpha = np.clip((hm - 2.0) / 7.0, 0, 1)
    gy, gx = np.gradient(gaussian_filter(hm, 2.2))
    nx, ny, nz = -gx * 0.9, -gy * 0.9, np.ones_like(hm); L = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2); nx, ny, nz = nx / L, ny / L, nz / L
    lam = np.clip(nx * -0.5 + ny * -0.62 + nz * 0.6, 0, 1)         # cahaya dari kiri-atas
    lit = np.clip(0.28 + 0.9 * lam + 0.18 * np.clip(hm / 40, 0, 1) + 0.1 * (fbm(H, W, seed + 3) - 0.5), 0, 1)
    if kind == 'b':   # belakang: gelap, buram, lebih lebar
        lit = lit * 0.62; alpha = gaussian_filter(alpha, 4.5) * 0.9
    if kind == 'f':   # depan: terang, hanya puncak
        lit = np.clip(lit * 1.1 + 0.18, 0, 1); alpha = gaussian_filter(np.clip((hm - 16) / 12, 0, 1), 1.4) * 0.92
    t = lit[..., None]
    col = np.where(t < 0.55, SHADOW + (MID - SHADOW) * (t / 0.55), MID + (LIGHT - MID) * ((t - 0.55) / 0.45))
    return Image.fromarray(np.dstack([col, np.clip(alpha, 0, 1) * 255]).astype(np.uint8), 'RGBA')


def make_moon():
    S = 560; yy, xx = np.mgrid[0:S, 0:S]; r = np.hypot(xx - S / 2, yy - S / 2) / (S / 2)
    maria = gaussian_filter(fbm(S, S, 11, 4), 6); maria = np.clip((maria - 0.5) * 3.0 + 0.4, 0, 1)
    tone = 1 - 0.2 * maria
    rnd = random.Random(5); cr = np.zeros((S, S))
    for _ in range(30):
        a = rnd.uniform(0, 6.283); rr = rnd.uniform(0, 0.88) ** 0.8; cx = S / 2 + np.cos(a) * rr * S / 2; cy = S / 2 + np.sin(a) * rr * S / 2
        rad = rnd.uniform(6, 34) * (rnd.random() ** 1.8 + 0.3); dd = np.hypot(xx - cx, yy - cy) / rad
        bowl = np.where(dd < 1, -0.13 * np.clip(1 - dd ** 2, 0, 1) ** 1.2, 0)               # cekungan lembut
        rim = np.where((dd > 0.8) & (dd < 1.25), 0.05 * np.exp(-((dd - 1.0) / 0.14) ** 2), 0)  # bibir terang tipis
        cr += bowl + rim
    tone = np.clip(tone + gaussian_filter(cr, 2.2) + (fbm(S, S, 21, 6) - 0.5) * 0.16, 0.5, 1.05)
    rgb = np.dstack([250 * tone, 243 * tone, 238 * tone]); rgb[..., 0] -= 8 * maria; rgb[..., 2] += 4 * maria
    alpha = np.clip((1 - r) / 0.012, 0, 1)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n, (seed, flat) in {'a': (3, 0.9), 'b': (8, 0.7), 'c': (13, 1.1), 'd': (21, 0.8)}.items():
        for kind in 'bmf':
            render(seed, flat, kind).save(os.path.join(OUT, f'c3-{n}-{kind}.webp'), quality=82, method=6)
    make_moon().save(os.path.join(OUT, 'moon3d.webp'), quality=88, method=6)
    print('selesai')
