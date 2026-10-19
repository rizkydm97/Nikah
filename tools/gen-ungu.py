#!/usr/bin/env python3
"""Tema 10 (Ungu Adat Jawa): membuat hiasan dalam dari gambar-gambar ungu (public/assets/t/ungu/*.webp).
Hasil: bg, fl-top, fl-bottom, frame-arc, frame-side, divider, orn, bouquet, motif (webp) di folder yang sama.
Jalankan:  python3 tools/gen-ungu.py
"""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 't', 'ungu')
L = lambda n: Image.open(os.path.join(ROOT, n + '.webp')).convert('RGBA')


def save(im, n, q=88):
    im.save(os.path.join(ROOT, n + '.webp'), 'WEBP', quality=q, method=6, exact=True)


def fit(im, w=None, h=None):
    if w is None: w = round(im.width * h / im.height)
    if h is None: h = round(im.height * w / im.width)
    return im.resize((max(1, w), max(1, h)), Image.LANCZOS)


def put(base, im, x, y, rot=0, flip=False):
    if flip: im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    base.alpha_composite(im, (int(x), int(y))) if x >= 0 and y >= 0 else base.paste(im, (int(x), int(y)), im)


def paste(base, im, x, y):
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); layer.paste(im, (int(x), int(y)))
    base.alpha_composite(layer)


def grad(w, h, stops):
    im = Image.new('RGB', (w, h))
    px = im.load()
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            a, ca = stops[i]; b, cb = stops[i + 1]
            if a <= t <= b:
                u = (t - a) / max(1e-6, b - a); c = tuple(round(ca[k] + (cb[k] - ca[k]) * u) for k in range(3)); break
        else: c = stops[-1][1]
        for x in range(w): px[x, y] = c
    return im


# ---------- bg.webp : latar section (lilac lembut, air terjun samar, pohon, padang) ----------
def make_bg():
    # latar section: lilac lembut + kabut + bayangan samar air terjun & pohon (tanpa objek besar yang melar saat di-cover)
    W, H = 900, 1300
    base = grad(W, H, [(0, (238, 228, 244)), (0.5, (226, 211, 236)), (1, (209, 190, 224))]).convert('RGBA')
    falls = fit(L('falls'), 900); falls.putalpha(falls.getchannel('A').point(lambda v: int(v * 0.16)))
    paste(base, falls, 0, 40)
    tree = fit(L('treeA'), 520); tree.putalpha(tree.getchannel('A').point(lambda v: int(v * 0.2))); paste(base, tree, 430, 480)
    tree2 = fit(L('treeC'), 380).transpose(Image.FLIP_LEFT_RIGHT); tree2.putalpha(tree2.getchannel('A').point(lambda v: int(v * 0.16))); paste(base, tree2, -120, 820)
    mist = Image.new('RGBA', (W, H), (255, 255, 255, 0)); d = ImageDraw.Draw(mist)
    for i in range(26):
        cx = random.Random(i).randint(-60, W + 60); cy = random.Random(i + 40).randint(0, H); r = random.Random(i + 9).randint(120, 260)
        d.ellipse((cx - r, cy - r * .42, cx + r, cy + r * .42), fill=(255, 255, 255, 64))
    paste(base, mist.filter(ImageFilter.GaussianBlur(44)), 0, 0)
    save(base.convert('RGB'), 'bg', 84)


# ---------- fl-top : dahan pohon ungu + bunga menjuntai dari sudut kiri atas ----------
def make_top():
    W, H = 1000, 700
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste(im, fit(L('treeD'), 760).rotate(180, resample=Image.BICUBIC).transpose(Image.FLIP_LEFT_RIGHT), -170, -330)
    paste(im, fit(L('treeB'), 520).rotate(180, resample=Image.BICUBIC), 260, -250)
    paste(im, fit(L('flR'), 190, 360), 120, 180)
    paste(im, fit(L('flL'), 150, 290).rotate(8, expand=True, resample=Image.BICUBIC), 330, 120)
    paste(im, fit(L('flR'), 120, 230).rotate(-10, expand=True, resample=Image.BICUBIC), 520, 80)
    a = im.getchannel('A'); fade = Image.new('L', (W, H), 255); px = fade.load()
    for x in range(W):
        v = 255 if x < 700 else max(0, int(255 * (1 - (x - 700) / 240)))
        for y in range(H): px[x, y] = v
    im.putalpha(ImageChops.multiply(a, fade))
    save(im, 'fl-top')


# ---------- fl-bottom : vas bunga + melati + palem (tepi bawah) ----------
def make_bottom():
    W, H = 1000, 640
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste(im, fit(L('palm2'), 330), 560, 190)
    paste(im, fit(L('potB'), 470), -40, 215)
    paste(im, fit(L('potP2'), 440), 230, 300)
    paste(im, fit(L('jasL'), 300), 560, 330)
    paste(im, fit(L('jasR'), 280), 760, 360)
    paste(im, fit(L('potB'), 340).transpose(Image.FLIP_LEFT_RIGHT), 690, 430)
    save(im, 'fl-bottom')


# ---------- orn : gunungan ungu ----------
def make_orn():
    g = L('gunA'); g = fit(g, h=230); im = Image.new('RGBA', (240, 239), (0, 0, 0, 0))
    paste(im, g, (240 - g.width) // 2, 4); save(im, 'orn')


# ---------- divider : garis dengan permata + gunungan kecil ----------
def make_divider():
    W, H = 389, 128
    im = Image.new('RGBA', (W * 2, H * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = (150, 110, 185, 255); cy = H
    d.line((10, cy, W - 70, cy), fill=col, width=3); d.line((W + 70, cy, 2 * W - 10, cy), fill=col, width=3)
    for x, s in ((50, 10), (110, 16), (170, 10), (2 * W - 50, 10), (2 * W - 110, 16), (2 * W - 170, 10)):
        d.polygon([(x, cy - s), (x + s * .6, cy), (x, cy + s), (x - s * .6, cy)], fill=col)
    g = fit(L('gunA'), h=2 * H - 8); paste(im, g, W - g.width // 2, 4)
    save(im.resize((W, H), Image.LANCZOS), 'divider')


# ---------- frame-arc / frame-side : bingkai kapsul bertitik ungu ----------
def make_frame():
    W, H = 1120, 600; S = 2
    im = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cx, cy, r = W * S / 2, H * S - 8, W * S / 2 - 40
    n = 150
    for i in range(n + 1):
        a = math.pi * i / n; x = cx - math.cos(a) * r; y = cy - math.sin(a) * r * (H * S - 70) / r * 0.0 - math.sin(a) * (H * S - 90)
        big = i % 5 == 0; rr = (9 if big else 5) * S / 2
        col = (150, 110, 185, 255) if big else (186, 160, 210, 235)
        d.polygon([(x, y - rr * 1.6), (x + rr, y), (x, y + rr * 1.6), (x - rr, y)], fill=col) if big else d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=col)
    g = fit(L('gunA'), h=118 * S); paste(im, g, int(cx - g.width / 2), 0)
    save(im.resize((W, H), Image.LANCZOS), 'frame-arc')
    W2, H2 = 120, 640
    im = Image.new('RGBA', (W2 * 4, H2 * 4), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k in range(5):
        cx2, cy2 = W2 * 2, (k + .5) * H2 * 4 / 5
        for p in range(5):
            a = p * 2 * math.pi / 5 - math.pi / 2; px, py = cx2 + math.cos(a) * 34, cy2 + math.sin(a) * 34
            d.ellipse((px - 26, py - 26, px + 26, py + 26), fill=(176, 140, 208, 255))
        d.ellipse((cx2 - 17, cy2 - 17, cx2 + 17, cy2 + 17), fill=(244, 222, 140, 255))
    save(im.resize((W2, H2), Image.LANCZOS), 'frame-side')


def make_bouquet():
    W, H = 520, 518; im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    paste(im, fit(L('jasR'), 330), 0, 90); paste(im, fit(L('jasL'), 330), 190, 110)
    paste(im, fit(L('flL'), 120, 230).rotate(14, expand=True, resample=Image.BICUBIC), 90, -10)
    save(im, 'bouquet')


# ---------- motif : kawung halus lilac ----------
def make_motif():
    S = 220; im = Image.new('RGB', (S * 2, S * 2), (246, 240, 250)); d = ImageDraw.Draw(im)
    col = (205, 184, 226); step = S * 2 / 4
    for i in range(-1, 5):
        for j in range(-1, 5):
            cx, cy = i * step + step / 2, j * step + step / 2
            d.ellipse((cx - step / 2, cy - step / 2, cx + step / 2, cy + step / 2), outline=col, width=3)
            d.ellipse((cx - step / 2 + step / 2, cy - step / 2 + step / 2, cx + step / 2 + step / 2, cy + step / 2 + step / 2), outline=col, width=3)
    save(im.resize((S, S), Image.LANCZOS), 'motif', 90)


if __name__ == '__main__':
    make_bg(); make_top(); make_bottom(); make_orn(); make_divider(); make_frame(); make_bouquet(); make_motif()
    print('selesai')


# ---------- wreath : karangan bunga melingkar mengelilingi panel nama (hero Tema 10) ----------
def make_wreath():
    W, H = 900, 1440; cx, cy, rx, ry = W / 2, H / 2, 372, 596
    rnd = random.Random(7)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))

    def ring(sprite_names, n, hmin, hmax, off, rmul=1.0, start=0, alpha=1.0):
        for i in range(n):
            t = start + 2 * math.pi * i / n + rnd.uniform(-.05, .05)
            x = cx + math.cos(t) * rx * rmul; y = cy + math.sin(t) * ry * rmul
            # arah tangen (searah jarum jam) sebagai 'atas' gambar
            tx, ty = -math.sin(t) * rx, math.cos(t) * ry
            ang = -math.degrees(math.atan2(ty, tx)) - 90 if rnd.random() < .5 else -math.degrees(math.atan2(-ty, -tx)) - 90
            sp = L(rnd.choice(sprite_names)); h = rnd.randint(hmin, hmax)
            sp = fit(sp, h=h)
            if rnd.random() < .5: sp = sp.transpose(Image.FLIP_LEFT_RIGHT)
            if alpha < 1: sp.putalpha(sp.getchannel('A').point(lambda v: int(v * alpha)))
            sp = sp.rotate(ang, expand=True, resample=Image.BICUBIC)
            im.alpha_composite(sp, (int(x - sp.width / 2 + rnd.uniform(-off, off)), int(y - sp.height / 2 + rnd.uniform(-off, off))))
    ring(['treeE', 'treeC'], 20, 150, 220, 14, 1.0)           # dedaunan dasar
    ring(['jasL', 'jasR'], 14, 190, 250, 12, 1.02, .15)       # melati
    ring(['flL', 'flR'], 16, 200, 270, 12, 1.0, .3)           # bunga ungu cat air
    ring(['jasL', 'jasR'], 8, 120, 160, 10, .97, .5)          # isian kecil
    # tebal di atas & bawah (seperti contoh): rumpun tambahan
    for sx, sy, nm, h in ((cx, 20, 'bouquet', 230), (cx, H - 30, 'bouquet', 230)):
        sp = fit(L(nm), h=h)
        if sy > cy: sp = sp.rotate(180, resample=Image.BICUBIC)
        im.alpha_composite(sp, (int(sx - sp.width / 2), int(sy - sp.height / 2)))
    save(im, 'wreath', 86)
    print('wreath ok')


if __name__ == '__main__' and os.environ.get('WREATH'):
    make_wreath()
