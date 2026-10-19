"""Membuat pohon bunga lilac Tema 10 (batang + 3 gugus tajuk) lewat Chromium headless.
Pakai: python3 tools/gen-ungu-trees.py [preset ...]   -> public/assets/t/ungu/tree-<preset>-{trunk,c0,c1,c2}.webp"""
import sys, base64, io, asyncio, os, json
from playwright.async_api import async_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'public', 'assets', 't', 'ungu')
names = sys.argv[1:] or ['big', 'big2', 'mid']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(); await pg.goto('file://' + os.path.join(HERE, 'ungu-tree.html'))
        meta = {}
        for n in names:
            r = await pg.evaluate("""(n)=>{const t=makeTree(PRESETS[n]);return {trunk:t.trunk.toDataURL('image/png'),c:t.crowns.map(c=>c.toDataURL('image/png')),w:t.w,h:t.h,base:t.base,pivot:t.pivot,tips:t.tipsN,leaves:t.leavesN}}""", n)
            def save(url, name, scale=1.0):
                im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA')
                if scale != 1: im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
                im.save(os.path.join(OUT, name), 'WEBP', quality=84, method=6)
                return os.path.getsize(os.path.join(OUT, name)) // 1024
            sz = [save(r['trunk'], f'tree-{n}-trunk.webp')] + [save(c, f'tree-{n}-c{i}.webp') for i, c in enumerate(r['c'])]
            meta[n] = {k: r[k] for k in ('w', 'h', 'base', 'pivot', 'tips', 'leaves')}; print(n, sz, 'KB', meta[n])
        json.dump(meta, open(os.path.join(HERE, '..', 'tools', 'ungu-trees.json'), 'w'))
        await b.close()
asyncio.run(main())
