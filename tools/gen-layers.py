# Memisahkan lukisan Tema 3-8 menjadi lapisan: plat latar (objek dihapus & diisi ulang) + potongan objek
# (istana, candi, air terjun, tokoh, pohon, dst). Dipakai cinema.js untuk membangun adegan sepotong demi sepotong.
# Koordinat poligon memakai ukuran dasar lukisan 784 x 1168. Hasil: public/assets/t/<tema>/lyr/{plate.webp, <nama>.webp}
# serta public/assets/t/<tema>/lyr/layers.json (posisi & cara muncul). Jalankan: python3 tools/gen-layers.py [tema]
import json, os, sys
import numpy as np, cv2
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't')
BW, BH, S = 784, 1168, 1.5          # skala kerja 1.5x (1176 x 1752) — cukup tajam di HP, hemat memori

# (nama, poligon kasar, cara muncul, potong grabcut?) — urutan = belakang -> depan
L = {
  'princess': [
    ('castle', [(353,560),(360,480),(400,440),(427,400),(500,333),(520,320),(533,253),(544,226),(557,267),(573,320),(600,347),(627,400),(660,440),(673,533),(667,560)], 'rise', 0),
    ('garden', [(290,940),(300,700),(330,590),(420,560),(520,570),(570,640),(590,760),(600,940)], 'grow', 0),
    ('gazebo', [(573,830),(573,640),(600,600),(630,588),(655,582),(690,592),(715,622),(727,660),(727,830)], 'rise', 0),
    ('princess', [(10,1168),(15,640),(60,520),(130,400),(170,350),(200,345),(240,380),(260,450),(290,560),(340,680),(380,800),(410,920),(420,1168)], 'fade', 1),
  ],
  'bali': [
    ('mountain', [(330,520),(420,420),(482,352),(522,338),(562,350),(622,392),(702,432),(784,442),(784,540),(330,540)], 'haze', 0),
    ('terraces', [(150,790),(160,620),(250,575),(330,558),(420,600),(480,640),(490,790)], 'grow', 0),
    ('temple', [(380,650),(390,560),(410,522),(440,520),(458,450),(470,438),(490,468),(510,518),(528,470),(545,442),(560,478),(576,540),(600,560),(612,650)], 'rise', 0),
    ('waterfall', [(598,830),(600,640),(640,618),(660,598),(700,598),(722,620),(734,700),(734,830)], 'drop', 0),
    ('river', [(300,1100),(330,900),(400,820),(500,792),(600,802),(700,852),(724,1100)], 'flow', 0),
    ('bride', [(30,1110),(30,700),(50,600),(70,480),(90,428),(140,408),(190,438),(212,500),(252,560),(252,620),(312,640),(334,700),(262,760),(232,900),(204,1110)], 'fade', 1),
  ],
  'emas': [
    ('mountain', [(200,470),(300,380),(360,330),(400,318),(440,330),(500,380),(560,410),(650,420),(660,480),(200,480)], 'haze', 0),
    ('terraces', [(200,720),(230,560),(300,520),(380,560),(450,640),(472,722)], 'grow', 0),
    ('waterfall', [(540,700),(560,560),(600,488),(650,470),(700,500),(722,600),(702,700)], 'drop', 0),
    ('gazebo', [(520,870),(520,760),(540,720),(570,690),(590,650),(615,628),(640,650),(680,690),(720,720),(742,760),(742,870)], 'rise', 0),
    ('bride', [(20,1100),(30,800),(40,600),(60,470),(90,408),(150,388),(222,420),(242,480),(232,560),(262,680),(332,700),(342,800),(302,860),(262,1000),(242,1100)], 'fade', 1),
  ],
  'biru': [
    ('waterfalls', [(280,770),(290,640),(330,598),(380,560),(420,540),(480,508),(520,518),(560,560),(580,620),(560,700),(520,770)], 'drop', 0),
    ('trees_l', [(0,1000),(0,520),(40,478),(80,420),(120,440),(170,520),(230,600),(262,700),(240,780),(160,800),(100,900)], 'slide-l', 0),
    ('trees_r', [(784,1000),(784,500),(720,440),(680,470),(640,520),(600,600),(560,680),(600,760),(700,800)], 'slide-r', 0),
    ('flowers_l', [(0,1168),(0,840),(80,828),(160,880),(202,980),(182,1168)], 'grow', 0),
    ('flowers_r', [(784,1168),(784,840),(704,828),(624,880),(582,980),(602,1168)], 'grow', 0),
  ],
  'rimba': [
    ('island_l', [(238,640),(250,470),(270,420),(290,388),(304,430),(332,460),(352,520),(338,600),(310,660),(270,660)], 'rise', 0),
    ('island_r', [(420,700),(420,520),(450,468),(480,428),(512,448),(562,478),(622,518),(642,580),(602,660),(522,720),(460,710)], 'rise', 0),
    ('princess', [(60,1000),(60,700),(90,560),(120,498),(160,478),(200,520),(232,600),(262,660),(302,700),(322,760),(292,860),(252,960),(240,1000)], 'fade', 1),
    ('tiger', [(0,1168),(0,858),(40,828),(90,838),(132,900),(162,1000),(152,1168)], 'slide-l', 0),
  ],
  'klasik': [
    ('candi', [(110,565),(118,520),(140,490),(150,450),(165,420),(177,392),(190,425),(205,455),(220,490),(245,520),(255,565)], 'rise', 0),
    ('joglo', [(253,670),(260,600),(270,585),(320,560),(370,505),(410,450),(430,435),(450,450),(490,505),(530,560),(547,590),(547,670)], 'rise', 0),
    ('waterfall', [(520,790),(535,640),(560,560),(585,520),(605,530),(600,640),(590,790)], 'drop', 0),
    ('kayon', [(30,1065),(30,700),(60,640),(100,600),(150,630),(190,700),(200,850),(190,1065)], 'slide-l', 0),
    ('wayang', [(620,800),(625,600),(640,470),(670,390),(710,355),(750,370),(784,420),(784,800)], 'slide-r', 0),
    ('gamelan', [(573,935),(580,820),(620,785),(700,775),(784,780),(784,935)], 'rise', 0),
  ],
}

def run(key):
    src = Image.open(os.path.join(ROOT, key, 'world.webp')).convert('RGB')
    W, H = int(BW * S), int(BH * S)
    img = np.array(src.resize((W, H), Image.LANCZOS))
    bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    items = L[key]; masks = []
    for name, poly, anim, gc in items:
        pts = (np.array(poly, np.float32) * S).astype(np.int32)
        m = np.zeros((H, W), np.uint8); cv2.fillPoly(m, [pts], 1)
        if gc:  # perhalus tepi dengan GrabCut: poligon = mungkin objek, sekitar = mungkin latar
            x, y, w, h = cv2.boundingRect(pts); pad = int(30 * S)
            x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(W, x + w + pad), min(H, y + h + pad)
            gcm = np.full((H, W), cv2.GC_BGD, np.uint8); gcm[y0:y1, x0:x1] = cv2.GC_PR_BGD
            gcm[m == 1] = cv2.GC_PR_FGD
            core = cv2.erode(m, np.ones((int(18 * S), int(18 * S)), np.uint8)); gcm[core == 1] = cv2.GC_FGD
            bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
            sub = gcm[y0:y1, x0:x1].copy()
            try:
                cv2.grabCut(bgr[y0:y1, x0:x1], sub, None, bg, fg, 4, cv2.GC_INIT_WITH_MASK)
                r = np.where((sub == cv2.GC_FGD) | (sub == cv2.GC_PR_FGD), 1, 0).astype(np.uint8)
                r = cv2.morphologyEx(r, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
                m2 = np.zeros_like(m); m2[y0:y1, x0:x1] = r
                m = (m2 & cv2.dilate(m, np.ones((int(24 * S), int(24 * S)), np.uint8))).astype(np.uint8)
            except cv2.error as e:
                print('grabcut gagal', key, name, e)
        masks.append(m.astype(np.float32))
    # objek depan menutupi objek belakang: kurangi area objek di depannya supaya tidak ikut tampil lebih dulu
    hard = [mm.copy() for mm in masks]
    for i in range(len(hard)):
        for j in range(i + 1, len(hard)): hard[i] = np.clip(hard[i] - hard[j], 0, 1)
    soft = [cv2.GaussianBlur(h, (0, 0), 5.0 * S) for h in hard]
    union = np.clip(sum(hard), 0, 1).astype(np.uint8)
    # plat latar: area objek diisi ulang (inpaint) lalu dilembutkan
    hole = cv2.dilate(union, np.ones((int(10 * S), int(10 * S)), np.uint8)).astype(np.float32)
    keep = 1 - hole
    # isi lubang dengan cara pull-push (piramida): warna sekitar menyebar halus ke seluruh lubang, tanpa noda hitam
    def pullpush(img, w):
        if min(img.shape[:2]) <= 4:
            m = (img * w[..., None]).sum((0, 1)) / max(w.sum(), 1e-3); return np.broadcast_to(m, img.shape).copy()
        h2, w2 = (img.shape[0] + 1) // 2, (img.shape[1] + 1) // 2
        dw = cv2.resize(w, (w2, h2), interpolation=cv2.INTER_AREA)
        di = cv2.resize(img * w[..., None], (w2, h2), interpolation=cv2.INTER_AREA) / np.maximum(dw[..., None], 1e-4)
        coarse = cv2.resize(pullpush(di, np.clip(dw * 4, 0, 1)), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_LINEAR)
        return img * w[..., None] + coarse * (1 - w[..., None])
    fill = pullpush(bgr.astype(np.float32), keep)
    fill = cv2.GaussianBlur(fill, (0, 0), 14 * S)
    fill = fill * 0.9 + 255 * 0.1 * np.array([1, 1, 1])  # sedikit berkabut
    hm = cv2.GaussianBlur(hole, (0, 0), 7 * S)[..., None]
    plate = np.clip(bgr * (1 - hm) + fill * hm, 0, 255).astype(np.uint8)
    out = os.path.join(ROOT, key, 'lyr'); os.makedirs(out, exist_ok=True)
    Image.fromarray(cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)).save(os.path.join(out, 'plate.webp'), 'WEBP', quality=82, method=6)
    meta = []
    for (name, poly, anim, gc), a in zip(items, soft):
        ys, xs = np.where(a > 0.02)
        if not len(xs): continue
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        rgba = np.dstack([img[y0:y1, x0:x1], (a[y0:y1, x0:x1] * 255).astype(np.uint8)])
        Image.fromarray(rgba, 'RGBA').save(os.path.join(out, name + '.webp'), 'WEBP', quality=84, method=6)
        meta.append({'n': name, 'a': anim, 'x': round(x0 / S, 1), 'y': round(y0 / S, 1), 'w': round((x1 - x0) / S, 1), 'h': round((y1 - y0) / S, 1)})
    json.dump(meta, open(os.path.join(out, 'layers.json'), 'w'))
    print(key, [m['n'] for m in meta])

for k in (sys.argv[1:] or L.keys()): run(k)
