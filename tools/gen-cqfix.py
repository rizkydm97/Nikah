#!/usr/bin/env python3
"""Membuat public/cqfix.css dari slide.css + landfit.css.

Masalah: Safari/WebKit menghitung satuan cqw/cqh DI DALAM elemen ber-`zoom` dengan skala ganda. Pada HP mendatar skala kanvas (--zs) hanya ±0,37,
sehingga semua ukuran huruf berbasis cqw mengecil ±0,37× lagi (nama penutup kecil, teks \"Thank you…\" hilang, nama mempelai pecah per kata).
Solusi: bila peramban terdeteksi salah menghitung (lihat skrip deteksi di lib/index.template.html -> kelas html.cq-fix), semua deklarasi
ber-cqw/cqh ditulis ulang memakai variabel --cw / --ch (px kanvas: 3,9px / 7,8px di dalam slide; 1% lebar/tinggi kolom di luar slide).
px biasa diskalakan zoom SATU kali di semua peramban, jadi hasilnya sama dengan desain.
Jalankan ulang bila slide.css / landfit.css diubah:  python3 tools/gen-cqfix.py
"""
import re, os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public')
SRC = ['slide.css', 'landfit.css']
UNIT = re.compile(r'(-?[0-9]*\.?[0-9]+)(cqw|cqh)\b')

def conv(v):
    return UNIT.sub(lambda m: 'calc(var(--cw,3.9px)*%s)' % m.group(1) if m.group(2) == 'cqw' else 'calc(var(--ch,7.8px)*%s)' % m.group(1), v)

def split_top(s, sep):
    out, d, cur = [], 0, ''
    for ch in s:
        if ch == '(':
            d += 1
        elif ch == ')':
            d -= 1
        if ch == sep and d == 0:
            out.append(cur); cur = ''
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    return out

def prefix(sel):
    sel = sel.strip()
    if sel.startswith('html'):
        return 'html.cq-fix' + sel[4:]
    if sel.startswith(':root'):
        return ':root.cq-fix' + sel[5:]
    return 'html.cq-fix ' + sel

def walk(s, ctx, out):
    i, n = 0, len(s)
    while i < n:
        j = s.find('{', i)
        if j < 0:
            break
        sel = s[i:j].strip()
        d, k = 1, j + 1
        while k < n and d:
            if s[k] == '{': d += 1
            elif s[k] == '}': d -= 1
            k += 1
        body = s[j + 1:k - 1]
        if sel.startswith('@'):
            if not re.match(r'@(font-face|keyframes|-webkit-keyframes|property)', sel):
                walk(body, ctx + [sel], out)
        else:
            alld = [x.strip() for x in split_top(body, ';') if x.strip()]
            key = re.sub(r'\s+', ' ', sel)
            decls = [x for x in alld if UNIT.search(x)]
            props = set(x.split(':')[0].strip() for x in decls)
            # deklarasi biasa (tanpa cq) pada selektor SAMA yang muncul sesudahnya harus ikut ditulis ulang, kalau tidak override ber-prefiks
            # (spesifisitas lebih tinggi) akan mengalahkannya, mis. @media (max-height) yang mengecilkan huruf cover.
            later = [x for x in alld if not UNIT.search(x) and x.split(':')[0].strip() in seen.get(key, set())]
            seen.setdefault(key, set()).update(props)
            if decls or later:
                out.append((tuple(ctx), [prefix(x) for x in split_top(sel, ',')], [conv(x) for x in decls + later]))
        i = k

rules = []
seen = {}
for f in SRC:
    txt = re.sub(r'/\*.*?\*/', '', open(os.path.join(ROOT, f), encoding='utf-8').read(), flags=re.S)
    walk(txt, [], rules)

def emit(ctx, sels, decls):
    body = ','.join(sels) + '{' + ';'.join(decls) + '}'
    for c in reversed(ctx):
        body = c + '{' + body + '}'
    return body

head = '/* cqfix.css — DIBUAT OTOMATIS oleh tools/gen-cqfix.py (jangan diedit tangan). Aktif hanya bila <html class="cq-fix">: peramban yang salah menghitung cqw/cqh di dalam zoom (Safari/iPhone mendatar). */\n'
# cqw = lebar ISI (content-box) kontainer. Kontainer ber-padding samping harus punya --cw sendiri agar sama dengan cqw asli:
#   .sl-ch-h (judul Love Story) padding 26px kiri-kanan → isi 338px dari kanvas 390px → 1cqw = 3,38px
extra = 'html.cq-fix .t-slide .sl-ch-h{--cw:3.38px}'
open(os.path.join(ROOT, 'cqfix.css'), 'w', encoding='utf-8').write(head + '\n'.join(emit(*r) for r in rules) + '\n' + extra + '\n')
print(len(rules), 'aturan ditulis ke public/cqfix.css')
