# Aset gambar Tema 10 (Air Terjun Bulan) & Tema 11 (Istana Galaksi) — semua dibuat prosedural (tanpa gambar orang lain).
# Pakai: python3 tools/gen-scenes.py   -> public/assets/t/terjun/*.webp, public/assets/t/galaksi/*.webp
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
R = np.random.default_rng(11)
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't')
W, H = 1176, 1752  # 1.5x ukuran dasar 784x1168

def noise(w, h, scale, octaves=5, seed=0, pers=0.5):
    rng = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale * 2 ** o)); g = rng.random((s, int(s * h / w) + 2)).astype(np.float32).T
        im = np.asarray(Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255
        out += im * amp; tot += amp; amp *= pers
    return out / tot
def save(a, path, q=86):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mode = 'RGBA' if a.shape[2] == 4 else 'RGB'
    Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8), mode).save(path, 'WEBP', quality=q, method=6)
def stars(img, n, seed, ymax=1.0, big=0.02):
    rng = np.random.default_rng(seed); h, w = img.shape[:2]; pil = Image.fromarray(np.clip(img * 255, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(pil)
    for i in range(n):
        x, y = rng.random() * w, (rng.random() ** 1.3) * h * ymax; b = rng.random() ** 3
        r = 0.6 + b * 1.6; c = tuple(int(v) for v in (235 + 20 * b, 235 + 20 * b, 255))
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
        if rng.random() < big:
            for L, a in [(9, 90), (5, 160)]:
                d.line([x - L, y, x + L, y], fill=c + (a,), width=1); d.line([x, y - L, x, y + L], fill=c + (a,), width=1)
    out = np.asarray(pil, np.float32) / 255
    glow = np.asarray(pil.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
    return np.clip(out + (glow - img) * 0.6, 0, 1)

# ---------------- Tema 11: langit nebula (merah-jingga, kolom magenta, biru di bawah) ----------------
def nebula():
    y, x = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None] if False else np.mgrid[0:H, 0:W]
    yy, xx = y / H, x / W
    base = np.dstack([0.05 + 0.04 * yy, 0.03 + 0.02 * yy, 0.10 + 0.08 * yy])
    n1 = noise(W, H, 3, 6, 1); n2 = noise(W, H, 5, 6, 2); n3 = noise(W, H, 8, 5, 3)
    red = np.clip((n1 - 0.38) * 2.2, 0, 1) ** 1.3 * (1 - 0.5 * yy)
    orange = np.clip((n2 - 0.5) * 3, 0, 1) * red
    col = base + red[..., None] * np.array([0.72, 0.16, 0.12]) + orange[..., None] * np.array([0.5, 0.32, 0.12])
    # kolom gas magenta-ungu bercahaya di tengah
    cx = 0.56 + (noise(W, H, 2, 3, 4) - 0.5) * 0.25
    mag = np.exp(-((xx - cx) / 0.13) ** 2) * np.clip(1.1 - np.abs(yy - 0.42) / 0.45, 0, 1) * (0.55 + 0.6 * n3)
    col += mag[..., None] * np.array([0.75, 0.18, 0.82])
    col += (mag ** 2)[..., None] * np.array([0.45, 0.25, 0.5])
    # debu gelap
    dust = np.clip((noise(W, H, 6, 5, 5) - 0.55) * 3, 0, 1) * 0.55
    col *= (1 - dust[..., None])
    # biru gelap di kanan bawah
    blue = np.clip((noise(W, H, 3, 4, 6) - 0.45) * 2, 0, 1) * np.clip((yy - 0.45) * 2, 0, 1) * np.clip((xx - 0.3) * 1.5, 0, 1)
    col += blue[..., None] * np.array([0.05, 0.12, 0.35])
    col = 1 - np.exp(-col * 1.25)  # tonemap
    col = stars(col, 2600, 7, 1.0, 0.03)
    save(col, os.path.join(ROOT, 'istana', 'sky.webp'), 84)

# ---------------- Tema 10: langit malam berbintang + bima sakti ----------------
def nightsky():
    y, x = np.mgrid[0:H, 0:W]; yy, xx = y / H, x / W
    col = np.dstack([0.02 + 0.06 * yy, 0.04 + 0.12 * yy, 0.16 + 0.22 * yy])
    band = np.exp(-(((yy - 0.12) - (xx - 0.5) * 0.55) / 0.12) ** 2)
    n = noise(W, H, 6, 6, 21)
    mw = band * (0.35 + 0.9 * np.clip(n - 0.35, 0, 1))
    col += mw[..., None] * np.array([0.32, 0.36, 0.62])
    dust = np.clip((noise(W, H, 10, 5, 22) - 0.55) * 3, 0, 1) * band * 0.5
    col *= (1 - dust[..., None])
    col = stars(col, 3400, 23, 0.75, 0.02)
    save(col, os.path.join(ROOT, 'airterjun', 'sky.webp'), 84)

# ---------------- awan bervolume (sprite): medan ketinggian dari bola-bola + noise, diterangi dari kiri atas ----------------
def cloud(path, w, h, lit, shadow, seed, rim=(0, 0, 0), dens=1.0, flat=0.62, sun=(-0.45, -0.75, 0.5)):
    rng = np.random.default_rng(seed); S = 1
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    hf = np.zeros((h, w), np.float32)
    n = int(26 * dens)
    for i in range(n):
        t = rng.uniform(0.08, 0.92); cx = t * w
        top = (1 - (2 * t - 1) ** 2) ** 0.7  # lebih tinggi di tengah
        r = rng.uniform(0.07, 0.16) * w * (0.6 + 0.6 * top)
        cy = h * flat - rng.uniform(0, 0.42) * h * top + r * 0.3
        d2 = (x - cx) ** 2 + (y - cy) ** 2
        hf = np.maximum(hf, np.sqrt(np.clip(r * r - d2, 0, None)))
    # dasar datar
    hf *= np.clip((h * (flat + 0.16) - y) / (h * 0.05), 0, 1)
    nz = noise(w, h, 5, 3, seed + 7, 0.4) - 0.5
    hf2 = hf + nz * 0.04 * w * np.clip(hf / (0.05 * w), 0, 1)
    hf2 = np.asarray(Image.fromarray(np.clip(hf2 / hf2.max() * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w * 0.012)), np.float32) * hf2.max() / 255
    a = np.clip(hf2 / (0.02 * w), 0, 1) ** 0.8
    sm = np.asarray(Image.fromarray(np.clip(hf2 / hf2.max() * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(w * 0.02)), np.float32) * hf2.max() / 255
    gy, gx = np.gradient(sm)
    nrm = np.dstack([-gx, -gy, np.full_like(gx, 2.2)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    L = np.array(sun, np.float32); L /= np.linalg.norm(L)
    lam = np.clip((nrm * L).sum(2), 0, 1)
    occ = np.clip(sm / (sm.max() + 1e-6), 0, 1) ** 0.5  # bagian tebal lebih terang di atas
    t = np.clip(0.1 + lam * 0.7 + occ * 0.3, 0, 1)[..., None] ** 1.1
    t = t * (0.94 + 0.12 * noise(w, h, 7, 4, seed + 5)[..., None])
    col = np.array(shadow) * (1 - t) + np.array(lit) * t
    edge = (a * (1 - a) * 4)[..., None]
    col = col + np.array(rim) * edge * 0.8
    a = np.clip(a * (0.96 + 0.08 * (noise(w, h, 18, 3, seed + 9) - 0.5)), 0, 1)
    save(np.dstack([np.clip(col, 0, 1), a]), path)

# ---------------- dedaunan beku kebiruan (sudut) ----------------
def foliage(path, w, h, seed, corner='tl', palette=None):
    rng = np.random.default_rng(seed); S = 2; img = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    pal = palette or [(70, 96, 150), (98, 128, 182), (140, 168, 214), (186, 206, 236), (222, 232, 248), (52, 72, 122)]
    ox, oy = (0, 0) if corner == 'tl' else (w * S, 0)
    for i in range(1500):
        # titik menyebar dari sudut, makin jauh makin jarang
        rr = (rng.random() ** 0.7) * 1.05; ang = rng.uniform(0, np.pi / 2)
        x = ox + (np.cos(ang) * rr * w * S) * (1 if corner == 'tl' else -1); y = oy + np.sin(ang) * rr * h * S
        if rr > 0.92 and rng.random() < 0.6: continue
        L = rng.uniform(10, 26) * S * (1.2 - rr * 0.5); Wd = L * rng.uniform(0.35, 0.5); rot = rng.uniform(0, 360)
        c = pal[min(len(pal) - 1, int(rng.random() ** (1.2 - rr * 0.6) * len(pal)))]
        leaf = Image.new('RGBA', (int(L * 2), int(L * 2)), (0, 0, 0, 0)); ld = ImageDraw.Draw(leaf)
        ld.ellipse([L - Wd / 2, L * 0.2, L + Wd / 2, L * 1.8], fill=c + (255,)); ld.line([L, L * 0.3, L, L * 1.7], fill=tuple(min(255, v + 40) for v in c) + (180,), width=max(1, S))
        leaf = leaf.rotate(rot, resample=Image.BICUBIC); img.alpha_composite(leaf, (int(x - L), int(y - L)))
    img = img.resize((w, h), Image.LANCZOS)
    a = np.asarray(img, np.float32) / 255; save(a, path)

# ---------------- tebing, kolam (Tema 10) ----------------
def cliffs():
    y, x = np.mgrid[0:H, 0:W]; yy, xx = y / H, x / W
    n = noise(W, H, 4, 6, 31); n2 = noise(W, H, 14, 4, 32)
    # tebing kiri & kanan membingkai air terjun (tepi bergerigi), bibir atas tempat air jatuh di y~0.40
    edgeL = 0.40 + (n[:, :1] * 0 + (noise(W, H, 3, 4, 33)[:, :1] - 0.5) * 0.08) - np.clip(0.42 - yy, 0, 1) * 0.35
    edgeR = 0.60 + (noise(W, H, 3, 4, 34)[:, :1] - 0.5) * 0.08 + np.clip(0.42 - yy, 0, 1) * 0.35
    top = 0.25 + (noise(W, H, 2, 3, 35)[:1, :] - 0.5) * 0.08 + np.abs(xx - 0.5) * 0.15
    inside = (xx < edgeL) | (xx > edgeR)
    rock = inside & (yy > top)
    ledge = (yy > 0.385 + (n2 - 0.5) * 0.02) & (yy < 0.43) & (np.abs(xx - 0.5) < 0.16)
    m = (rock | ledge).astype(np.float32)
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255
    m *= np.clip((0.86 - yy) / 0.06, 0, 1)  # bawah memudar ke kolam
    # warna batu: biru tua, permukaan bertekstur, tepi yang menghadap air terjun terkena cahaya biru
    tex = 0.55 + 0.45 * n2
    base = np.dstack([0.05 + 0.06 * tex, 0.09 + 0.10 * tex, 0.22 + 0.16 * tex])
    dist = np.abs(xx - 0.5)
    glow = np.exp(-((dist - 0.12) / 0.07) ** 2) * np.clip((yy - 0.38) * 3, 0, 1)
    base += glow[..., None] * np.array([0.12, 0.35, 0.65])
    strata = (np.sin(yy * 180 + n * 8) * 0.5 + 0.5) ** 6 * 0.12
    base += strata[..., None] * np.array([0.3, 0.45, 0.7])
    # pepohonan di atas tebing (siluet)
    trees = np.zeros_like(m)
    pil = Image.new('L', (W, H), 0); d = ImageDraw.Draw(pil)
    rng = np.random.default_rng(36)
    for i in range(70):
        side = rng.choice([0, 1]); cx = rng.uniform(0, 0.36) * W if side == 0 else rng.uniform(0.64, 1) * W
        t = float(top[0, int(np.clip(cx, 0, W - 1))]) * H; h = rng.uniform(60, 190); w = h * rng.uniform(0.28, 0.4)
        d.polygon([(cx, t - h), (cx - w, t + 6), (cx + w, t + 6)], fill=255)
    trees = np.asarray(pil.filter(ImageFilter.GaussianBlur(1.5)), np.float32) / 255
    a = np.clip(m + trees, 0, 1)
    col = base * (m[..., None] > 0) + np.array([0.04, 0.08, 0.2]) * (1 - (m[..., None] > 0))
    col = np.where(trees[..., None] > m[..., None], np.array([0.06, 0.12, 0.26]) + trees[..., None] * 0.04, col)
    save(np.dstack([np.clip(col, 0, 1), a]), os.path.join(ROOT, 'terjun', 'cliffs.webp'))
    # kolam & bebatuan depan
    pool = np.zeros((H, W, 4), np.float32)
    py = np.clip((yy - 0.66) / 0.34, 0, 1)
    pool[..., 0] = 0.03 + 0.05 * py; pool[..., 1] = 0.08 + 0.12 * (1 - py); pool[..., 2] = 0.22 + 0.2 * (1 - py)
    refl = np.exp(-((xx - 0.5) / (0.06 + 0.1 * py)) ** 2) * np.clip(1 - py * 1.2, 0, 1)
    pool[..., :3] += refl[..., None] * np.array([0.2, 0.55, 0.85])
    pool[..., 3] = np.clip((yy - 0.66) / 0.03, 0, 1)
    rocks = Image.new('L', (W, H), 0); d = ImageDraw.Draw(rocks)
    for i in range(26):
        cx = rng.uniform(0.02, 0.98) * W; cy = rng.uniform(0.74, 0.96) * H
        if abs(cx / W - 0.5) < 0.14 and cy / H < 0.82: continue
        rx = rng.uniform(25, 90) * (0.6 + (cy / H - 0.7) * 2); ry = rx * rng.uniform(0.35, 0.55)
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    rk = np.asarray(rocks.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    rcol = np.dstack([0.04 + 0.05 * n2, 0.08 + 0.08 * n2, 0.18 + 0.12 * n2]) + (np.clip(np.gradient(np.asarray(rocks.filter(ImageFilter.GaussianBlur(8)), np.float32), axis=0) * -0.05, 0, 1))[..., None] * np.array([0.3, 0.6, 0.9])
    pool[..., :3] = pool[..., :3] * (1 - rk[..., None]) + rcol * rk[..., None]; pool[..., 3] = np.maximum(pool[..., 3], rk)
    save(pool, os.path.join(ROOT, 'terjun', 'pool.webp'))

# ---------------- Tema 10: tebing batu bertekstur (diterangi cahaya biru air terjun) ----------------
def cv_blur(a, s):
    m, M = float(a.min()), float(a.max()); im = Image.fromarray(((a - m) / (M - m + 1e-6) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(s))
    return np.asarray(im, np.float32) / 255 * (M - m) + m

def rock_shade(mask, seed, light_x, rim_col, base_col, hscale=1.0):
    h, w = mask.shape
    n = noise(w, h, 4, 6, seed, 0.55); n2 = noise(w, h, 16, 3, seed + 1, 0.45)
    yy = np.linspace(0, 1, h)[:, None] * np.ones((1, w))
    strata = np.sin(yy * 90 + n * 9) * 0.5 + 0.5
    hf = (n * 0.7 + n2 * 0.12 + strata * 0.18) * hscale
    hf = hf * np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
    hf = cv_blur(hf, 2.5)
    gy, gx = np.gradient(hf * 140)
    nrm = np.dstack([-gx, -gy, np.ones_like(gx)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    xx = np.linspace(0, 1, w)[None, :] * np.ones((h, 1))
    lx = np.sign(light_x - xx); L = np.dstack([lx * 0.7, -0.3 * np.ones_like(xx), 0.55 * np.ones_like(xx)]); L /= np.linalg.norm(L, axis=2, keepdims=True)
    lam = np.clip((nrm * L).sum(2), 0, 1)
    near = np.exp(-np.abs(xx - light_x) * 3.2)
    col = np.array(base_col) * (0.5 + 0.6 * n[..., None]) + np.array(rim_col) * (lam ** 3 * (0.08 + near * 0.75))[..., None]
    col *= (0.9 + 0.2 * n2[..., None])
    return np.clip(col, 0, 1)

def terjun_cliffs():
    w, h = W, H; y, x = np.mgrid[0:h, 0:w]; yy, xx = y / h, x / w
    j = lambda s, k: (noise(w, h, s, 4, k)[:, :1] - 0.5)
    jt = lambda s, k: (noise(w, h, s, 4, k)[:1, :] - 0.5)
    # dinding belakang (tempat air terjun jatuh), atas bergerigi dengan pepohonan
    top = 0.335 + jt(6, 61) * 0.05 + np.abs(xx - 0.5) * 0.06
    back = ((yy > top) & (yy < 0.8)).astype(np.float32)
    back *= np.clip((0.8 - yy) / 0.08, 0, 1)
    # tebing depan kiri & kanan (lebih dekat, lebih terang tepinya)
    eL = 0.30 + j(5, 62) * 0.08 + np.clip(yy - 0.55, 0, 1) * 0.25
    eR = 0.70 + j(5, 63) * 0.08 - np.clip(yy - 0.55, 0, 1) * 0.25
    tF = 0.30 + jt(5, 64) * 0.05 - np.abs(xx - 0.5) * 0.08
    front = (((xx < eL) | (xx > eR)) & (yy > tF) & (yy < 0.86)).astype(np.float32)
    front *= np.clip((0.86 - yy) / 0.06, 0, 1)
    cb = rock_shade(back, 71, 0.5, (0.2, 0.5, 0.9), (0.03, 0.06, 0.16)) * 0.8
    cf = rock_shade(front, 72, 0.5, (0.35, 0.7, 1.0), (0.05, 0.09, 0.22), 1.2)
    # tepi tebing depan yang menghadap air terjun berkilau biru
    fe = cv_blur(front, 6); rimm = np.clip(fe * (1 - cv_blur(front, 22)) * 3, 0, 1) * np.exp(-np.abs(xx - 0.5) * 4)
    cf += rimm[..., None] * np.array([0.25, 0.55, 0.9])
    # cahaya biru dari air terjun di dinding belakang
    gl = np.exp(-((xx - 0.5) / 0.1) ** 2) * np.clip((yy - 0.34) * 3, 0, 1) * back
    cb += gl[..., None] * np.array([0.06, 0.22, 0.5])
    # pepohonan pinus di atas
    pil = Image.new('L', (w, h), 0); d = ImageDraw.Draw(pil); rng = np.random.default_rng(65)
    for i in range(160):
        cx = rng.random() * w; ty = float((top if rng.random() < 0.5 else tF)[0, int(cx)]) * h
        hh = rng.uniform(30, 80); ww = hh * rng.uniform(0.3, 0.42)
        for k in range(3): d.polygon([(cx, ty - hh + k * hh * 0.25), (cx - ww * (0.5 + k * 0.25), ty - hh * 0.35 + k * hh * 0.3), (cx + ww * (0.5 + k * 0.25), ty - hh * 0.35 + k * hh * 0.3)], fill=255)
    tr = np.asarray(pil.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    col = cb * back[..., None]
    a = back.copy()
    col = col * (1 - front[..., None]) + cf * front[..., None]; a = np.maximum(a, front)
    tcol = np.array([0.05, 0.1, 0.24]) + (np.exp(-((xx - 0.5) / 0.2) ** 2) * 0.12)[..., None] * np.array([0.2, 0.5, 1])
    col = col * (1 - tr[..., None]) + tcol * tr[..., None]; a = np.maximum(a, tr)
    save(np.dstack([col, a]), os.path.join(ROOT, 'airterjun', 'cliffs.webp'))
    # kolam & batu depan
    pool = np.zeros((h, w, 4), np.float32); py = np.clip((yy - 0.74) / 0.26, 0, 1)
    pool[..., :3] = np.dstack([0.03 + 0.03 * py, 0.07 + 0.1 * (1 - py), 0.2 + 0.18 * (1 - py)])
    ref = np.exp(-((xx - 0.5) / (0.05 + 0.08 * py)) ** 2) * np.clip(1 - py * 1.1, 0, 1) * (0.7 + 0.3 * np.sin(yy * 300) ** 2)
    pool[..., :3] += ref[..., None] * np.array([0.25, 0.6, 0.9])
    pool[..., 3] = np.clip((yy - 0.74) / 0.02, 0, 1)
    rk = Image.new('L', (w, h), 0); d = ImageDraw.Draw(rk)
    for i in range(30):
        cx = rng.uniform(0, 1) * w; cy = rng.uniform(0.8, 1.0) * h
        if abs(cx / w - 0.5) < 0.12 and cy / h < 0.9: continue
        rx = rng.uniform(30, 110) * (0.5 + (cy / h - 0.78) * 3); ry = rx * rng.uniform(0.35, 0.6)
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    rkm = np.asarray(rk.filter(ImageFilter.GaussianBlur(1)), np.float32) / 255
    rc = rock_shade(rkm, 73, 0.5, (0.3, 0.6, 1.0), (0.03, 0.06, 0.16), 1.0)
    top_hl = np.clip(-np.gradient(cv_blur(rkm, 5), axis=0) * 40, 0, 1)
    rc += top_hl[..., None] * np.array([0.25, 0.5, 0.8])
    pool[..., :3] = pool[..., :3] * (1 - rkm[..., None]) + rc * rkm[..., None]; pool[..., 3] = np.maximum(pool[..., 3], rkm)
    save(pool, os.path.join(ROOT, 'airterjun', 'pool.webp'))

if __name__ == '__main__':
    import sys
    if 'sky' in sys.argv: nebula(); nightsky()
    if 'cliff' in sys.argv: terjun_cliffs(); sys.exit()
    G = os.path.join(ROOT, 'istana'); T = os.path.join(ROOT, 'airterjun')
    cloud(os.path.join(G, 'cl-peach.webp'), 620, 340, (1.0, 0.9, 0.78), (0.9, 0.38, 0.4), 41, rim=(0.4, 0.25, 0.1))
    cloud(os.path.join(G, 'cl-peach2.webp'), 540, 320, (1.0, 0.84, 0.74), (0.84, 0.32, 0.44), 42, rim=(0.4, 0.22, 0.1))
    cloud(os.path.join(G, 'cl-purple.webp'), 700, 380, (0.5, 0.38, 0.72), (0.1, 0.06, 0.24), 43, rim=(0.2, 0.1, 0.3))
    cloud(os.path.join(G, 'cl-red.webp'), 1000, 360, (0.56, 0.16, 0.24), (0.14, 0.02, 0.07), 44, dens=1.8, flat=0.5)
    cloud(os.path.join(G, 'cl-wave.webp'), 1000, 360, (0.7, 0.8, 1.0), (0.1, 0.14, 0.4), 45, dens=1.8, flat=0.5)
    cloud(os.path.join(T, 'mist.webp'), 1000, 300, (0.62, 0.74, 0.95), (0.16, 0.24, 0.5), 46, dens=1.5, flat=0.5)
    print('ok')

