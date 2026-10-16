/* Membuat aset gambar Tema 9 (Dayak) dari ilustrasi vektor di public/dayak.js.
   Pakai: jalankan server lokal yang menyajikan public/ (mis. `npx vercel dev`), lalu
   node tools/gen-dayak.js http://localhost:3000  -> PNG sementara di public/assets/t/dayak/_png/ lalu webp (hapus _png setelahnya)
   (skrip ini juga mencoba memanggil python3 + Pillow untuk konversi otomatis). */
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }
const BASE = process.argv[2] || 'http://localhost:8080', OUT = path.join(__dirname, '..', 'public', 'assets', 't', 'dayak'), PNG = path.join(OUT, '_png');
fs.mkdirSync(PNG, { recursive: true }); fs.mkdirSync(path.join(OUT, '..', 'spr'), { recursive: true });
const JOBS = {
  // [lebar, tinggi, html (fungsi di halaman), transparan?, file tujuan, ukuran akhir]
  world: [784, 1168, 'W', 0, 'world', [1568, 2336]],
  bg: [784, 1168, 'BG', 0, 'bg', [900, 907], [0, 330, 784, 790]],
  'fl-top': [1000, 700, 'FLT', 1, 'fl-top'], 'fl-bottom': [1000, 640, 'FLB', 1, 'fl-bottom'],
  'frame-arc': [1120, 600, 'ARC', 1, 'frame-arc'], 'frame-side': [120, 640, 'SIDE', 1, 'frame-side'],
  bouquet: [640, 762, 'BQ', 1, 'bouquet'], orn: [154, 141, 'ORN', 1, 'orn'], divider: [334, 125, 'DIV', 1, 'divider'], motif: [220, 220, 'MOT', 0, 'motif'],
  feather: [60, 200, 'FEA', 1, '../spr/feather'], leafj: [140, 180, 'LEAF', 1, '../spr/leafj'], orchid: [140, 140, 'ORC', 1, '../spr/orchid'], bf_rajah: [260, 234, 'BFR', 1, '../spr/bf_rajah'],
};
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
  const GEN = fs.readFileSync(path.join(__dirname, 'dayak-gen.html'), 'utf8');
  await p.route('**/__dkgen.html*', (r) => r.fulfill({ body: GEN, contentType: 'text/html' }));
  for (const [name, [w, h, fn, transp, file, size, crop]] of Object.entries(JOBS)) {
    await p.setViewportSize({ width: w, height: h });
    await p.goto(`${BASE}/__dkgen.html?j=${fn}`); await p.waitForTimeout(400);
    const png = path.join(PNG, name + '.png');
    await p.screenshot({ path: png, omitBackground: !!transp, clip: { x: 0, y: 0, width: w, height: h } });
    try { execFileSync('python3', ['-c', `
from PIL import Image
im=Image.open(${JSON.stringify(png)}).convert('RGBA' if ${transp} else 'RGB')
c=${crop ? JSON.stringify(crop) : "None"}
if c: im=im.crop((c[0]*2,c[1]*2,(c[0]+c[2])*2,(c[1]+c[3])*2))
s=${JSON.stringify(size || [w, h])}
im=im.resize((s[0],s[1]),Image.LANCZOS)
im.save(${JSON.stringify(path.join(OUT, file + '.webp'))},'WEBP',quality=88,method=6)`]); } catch (e) { console.warn('konversi webp gagal untuk', name, e.message); }
    console.log('ok', name);
  }
  await b.close();
})();
