"""Membuat tebing & air terjun Tema 10 -> public/assets/t/ungu/{cliff,fallmask,streak}.webp"""
import base64, io, asyncio, os
from playwright.async_api import async_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'public', 'assets', 't', 'ungu')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox']); pg = await b.new_page(); await pg.goto('file://' + os.path.join(HERE, 'ungu-cliff.html'))
        r = await pg.evaluate("()=>{const t=makeCliff();return {cliff:t.cliff.toDataURL(),mask:t.mask.toDataURL(),streak:t.streak.toDataURL()}}")
        for k, n, q in (('cliff', 'cliff', 82), ('mask', 'fallmask', 80), ('streak', 'streak', 85)):
            im = Image.open(io.BytesIO(base64.b64decode(r[k].split(',')[1]))).convert('RGBA')
            if k == 'mask':  # hanya alpha yang dipakai -> simpan sebagai putih + alpha
                im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
            p_ = os.path.join(OUT, n + '.webp'); im.save(p_, 'WEBP', quality=q, method=6); print(n, im.size, os.path.getsize(p_) // 1024, 'KB')
        await b.close()
asyncio.run(main())
