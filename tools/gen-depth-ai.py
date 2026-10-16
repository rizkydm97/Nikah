# Peta kedalaman akurat untuk lukisan Tema 3-8 memakai MiDaS v2.1 small (ONNX, OpenCV DNN).
# Model: https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx
# Pakai: python3 tools/gen-depth-ai.py <path-model.onnx>   -> public/assets/t/<tema>/depth.png (putih = dekat)
import sys, os, numpy as np, cv2
from PIL import Image
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 't')
net = cv2.dnn.readNet(sys.argv[1] if len(sys.argv) > 1 else 'model-small.onnx')
MEAN = np.array([0.485, 0.456, 0.406], np.float32); STD = np.array([0.229, 0.224, 0.225], np.float32)
def run(rgb):
    x = cv2.resize(rgb, (256, 256), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    net.setInput(x); return net.forward()[0].astype(np.float32)
def depth(img):
    h, w = img.shape[:2]
    full = cv2.resize(run(img), (w, h), interpolation=cv2.INTER_CUBIC)
    full = (full + cv2.flip(cv2.resize(run(cv2.flip(img, 1)), (w, h), interpolation=cv2.INTER_CUBIC), 1)) / 2
    acc = full.copy(); cnt = np.ones((h, w), np.float32)
    # potongan bertumpuk untuk detail; tiap potongan disesuaikan (skala+geser) ke hasil gambar utuh agar tanpa sambungan
    for y0, y1 in [(0, int(h * .56)), (int(h * .22), int(h * .78)), (int(h * .44), h)]:
        c = cv2.resize(run(img[y0:y1]), (w, y1 - y0), interpolation=cv2.INTER_CUBIC)
        ref = full[y0:y1]; A = np.stack([c.ravel(), np.ones(c.size)], 1); k, b0 = np.linalg.lstsq(A, ref.ravel(), rcond=None)[0]
        c = c * k + b0
        ramp = np.ones(y1 - y0, np.float32); r = int((y1 - y0) * .2)
        if y0 > 0: ramp[:r] = np.linspace(0, 1, r)
        if y1 < h: ramp[-r:] = np.linspace(1, 0, r)
        acc[y0:y1] += c * ramp[:, None]; cnt[y0:y1] += ramp[:, None]
    d = acc / cnt
    return np.clip((d - np.percentile(d, 1)) / (np.percentile(d, 99) - np.percentile(d, 1) + 1e-6), 0, 1)
for k in ['princess', 'bali', 'emas', 'biru', 'rimba', 'klasik']:
    src = np.array(Image.open(os.path.join(ROOT, k, 'world.webp')).convert('RGB').resize((784, 1168)))
    d = depth(src)
    # gabung dengan anggapan alami "makin bawah makin dekat"; Biru (langit polos) butuh bobot anggapan lebih besar
    yy = np.linspace(0, 1, d.shape[0])[:, None] * np.ones((1, d.shape[1]))
    prior = np.clip((yy - 0.25) / 0.75, 0, 1) ** 1.3
    wp = {'biru': 0.75, 'rimba': 0.35, 'klasik': 0.3}.get(k, 0.22)
    d = (1 - wp) * d + wp * prior
    # haluskan tapi pertahankan tepi objek (guided/bilateral) supaya tidak "penyok"
    d8 = (np.clip(d, 0, 1) * 255).astype(np.uint8)
    d8 = cv2.bilateralFilter(d8, 9, 40, 9)
    d8 = cv2.GaussianBlur(d8, (0, 0), 2.2)
    Image.fromarray(d8).resize((392, 584), Image.LANCZOS).save(os.path.join(ROOT, k, 'depth.png'))
    print('ok', k)
