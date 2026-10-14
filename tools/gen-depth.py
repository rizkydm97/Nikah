# Membuat peta kedalaman (depth map) kasar untuk tiap lukisan tema 3-8.
# Putih = dekat kamera, hitam = jauh. Dipakai shader parallax di invitation.js
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os
W, H = 392, 584
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't')

def new(base_top=0.04, base_bot=0.3, y0=0.0, y1=1.0):
    g = np.linspace(base_top, base_bot, H)[:, None] * np.ones((1, W))
    return Image.fromarray((g * 255).astype('uint8'), 'L')

def P(pts): return [(x * W, y * H) for x, y in pts]
def poly(im, pts, v, blur=0):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(P(pts), fill=255)
    if blur: m = m.filter(ImageFilter.GaussianBlur(blur))
    im.paste(Image.new('L', (W, H), int(v * 255)), (0, 0), m)
def ellipse(im, cx, cy, rx, ry, v, blur=6):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse([(cx - rx) * W, (cy - ry) * H, (cx + rx) * W, (cy + ry) * H], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(blur)); im.paste(Image.new('L', (W, H), int(v * 255)), (0, 0), m)
def band(im, y0, y1, v0, v1, x0=0, x1=1):
    a = np.array(im).astype(float)
    ys = np.arange(H)[:, None] / H; xs = np.arange(W)[None, :] / W
    t = np.clip((ys - y0) / (y1 - y0), 0, 1); val = (v0 + (v1 - v0) * t) * 255
    m = ((ys >= y0) & (ys <= y1) & (xs >= x0) & (xs <= x1))
    a = np.where(m, np.maximum(a, val) if v1 >= v0 else a, a)
    a = np.where(m, np.maximum(a, val), a)
    return Image.fromarray(a.astype('uint8'), 'L')
def frame(im, box, r, v=0.95, w_blur=4):
    v = .5 + (v - .5) * .82
    # semua di luar jendela (rounded rect) = bingkai dekat
    inner = Image.new('L', (W, H), 0)
    ImageDraw.Draw(inner).rounded_rectangle([box[0] * W, box[1] * H, box[2] * W, box[3] * H], radius=r * W, fill=255)
    m = inner.point(lambda p: 255 - p).filter(ImageFilter.GaussianBlur(w_blur))
    im.paste(Image.new('L', (W, H), int(v * 255)), (0, 0), m)
def ring(im, outer, inner, ro, ri, v=0.9):
    v = .5 + (v - .5) * .82
    o = Image.new('L', (W, H), 0); ImageDraw.Draw(o).rounded_rectangle([outer[0]*W, outer[1]*H, outer[2]*W, outer[3]*H], radius=ro*W, fill=255)
    i = Image.new('L', (W, H), 0); ImageDraw.Draw(i).rounded_rectangle([inner[0]*W, inner[1]*H, inner[2]*W, inner[3]*H], radius=ri*W, fill=255)
    m = Image.fromarray(np.clip(np.array(o).astype(int) - np.array(i).astype(int), 0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
    im.paste(Image.new('L', (W, H), int(v * 255)), (0, 0), m)
def save(im, name):
    im = im.filter(ImageFilter.GaussianBlur(3.2))
    im.save(os.path.join(OUT, name, 'depth.png'), optimize=True)

# ---- bali ----
im = new(0.02, 0.2)
poly(im, [(0, .38), (.5, .34), (1, .36), (1, .5), (0, .5)], .12, 6)           # gunung & kabut
band(im, .5, .78, .3, .55)                                                   # sawah -> sungai
poly(im, [(.5, .38), (.72, .38), (.74, .56), (.5, .58)], .3, 3)              # candi
poly(im, [(.84, .52), (.95, .5), (.95, .7), (.84, .72)], .38, 3)             # air terjun
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
poly(im, [(.1, .38), (.16, .36), (.27, .38), (.29, .5), (.31, .62), (.37, .68), (.37, .76), (.32, .9), (.15, .91), (.09, .7)], .78, 2)  # penari
poly(im, [(.55, .72), (.95, .7), (.95, .92), (.5, .92)], .62, 5)             # tanaman depan
frame(im, (.06, .045, .94, .93), .1, .96); save(im, 'bali')

# ---- emas ----
im = new(0.03, 0.2)
poly(im, [(0, .33), (1, .33), (1, .5), (0, .5)], .12, 6)
band(im, .5, .8, .3, .55)
poly(im, [(.78, .4), (.9, .4), (.9, .62), (.78, .62)], .35, 3)
poly(im, [(.68, .55), (.94, .55), (.94, .74), (.68, .74)], .55, 3)
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
poly(im, [(.12, .3), (.18, .29), (.28, .31), (.31, .44), (.34, .56), (.42, .62), (.46, .74), (.38, .83), (.2, .83), (.1, .72), (.1, .5)], .78, 2)
frame(im, (.12, .07, .9, .9), .08, .96); save(im, 'emas')

# ---- princess ----
im = new(0.03, 0.22)
poly(im, [(.45, .22), (.82, .22), (.82, .5), (.45, .5)], .22, 3)             # kastil
band(im, .45, .82, .28, .6)                                                  # taman & jalan
poly(im, [(.74, .5), (.95, .5), (.95, .78), (.74, .78)], .55, 3)             # gazebo
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
poly(im, [(0, .35), (.08, .3), (.2, .3), (.27, .4), (.3, .55), (.4, .7), (.52, .84), (.5, .93), (0, .95)], .78, 2)  # putri
ellipse(im, .85, .9, .17, .12, .92); ellipse(im, .05, .92, .15, .12, .92)    # mawar sudut
frame(im, (.07, .07, .93, .9), .1, .95); save(im, 'princess')

# ---- biru ----
im = new(0.02, 0.2)
poly(im, [(.1, .3), (.9, .3), (.9, .55), (.1, .55)], .2, 5)
poly(im, [(.55, .4), (.85, .4), (.85, .55), (.55, .55)], .32, 3)
band(im, .58, .86, .35, .6)
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
ellipse(im, .12, .8, .12, .1, .9); ellipse(im, .9, .8, .12, .1, .9)           # bunga sudut
ring(im, (.065, .04, .945, .93), (.13, .1, .88, .87), .1, .08, .92); save(im, 'biru')

# ---- rimba ----
im = new(0.02, 0.05)
poly(im, [(.1, .28), (.88, .28), (.88, .72), (.1, .72)], .22, 5)             # pulau & bulan
poly(im, [(.1, .5), (.88, .5), (.88, .8), (.1, .8)], .42, 6)                 # danau
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
poly(im, [(.04, .42), (.12, .4), (.2, .42), (.25, .52), (.3, .66), (.38, .8), (.1, .82), (.04, .7)], .78, 2)  # putri
poly(im, [(0, .72), (.1, .7), (.2, .78), (.22, .9), (0, .93)], .92, 2)       # harimau
ring(im, (.055, .22, .935, .845), (.11, .28, .88, .79), .1, .08, .9); save(im, 'rimba')

# ---- klasik ----
im = new(0.03, 0.15)
poly(im, [(.08, .3), (.25, .3), (.25, .5), (.08, .5)], .22, 3)               # candi
poly(im, [(.3, .38), (.65, .38), (.65, .6), (.3, .6)], .34, 3)               # joglo
poly(im, [(.66, .44), (.76, .44), (.76, .66), (.66, .66)], .36, 3)           # air terjun
band(im, .6, .92, .4, .62)                                                   # lantai
im = im.filter(ImageFilter.GaussianBlur(11))  # lembutkan lapisan tengah
poly(im, [(.78, .3), (.9, .3), (.92, .62), (.78, .66)], .72, 3)              # patung kanan
poly(im, [(.02, .5), (.2, .5), (.24, .72), (.04, .76)], .82, 3)              # topeng kiri
poly(im, [(.8, .68), (.96, .68), (.96, .82), (.8, .82)], .88, 3)             # gong
frame(im, (.1, .05, .9, .88), .12, .95); save(im, 'klasik')
print('ok')
