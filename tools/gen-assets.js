// Membuat aset ilustrasi default (SVG). Jalankan: node tools/gen-assets.js
// Aset asli (PNG floral dsb.) bisa diganti lewat Admin > Adegan & Gambar.
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'public', 'assets', 'default');
fs.mkdirSync(out, { recursive: true });

let seed = 7;
const rnd = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a); };
const f = (n) => n.toFixed(1);

const RED = ['#5e0f22', '#8d1e38', '#b8334f', '#d96a7f'];
const WINE = ['#4a0a1a', '#7a1530', '#a82545', '#c9506a'];
const PINK = ['#c98a96', '#e6b5bd', '#f3d4d9', '#fff0f1'];
const GREEN = ['#6f8c6c', '#9bb396', '#c4d3b9', '#dfe8d3'];

function rose(x, y, r, pal) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rnd(0, 360))})">`;
  s += `<circle r="${f(r)}" fill="${pal[0]}"/>`;
  const rings = [[1, 9, pal[1]], [0.78, 8, pal[2]], [0.56, 7, pal[1]], [0.36, 6, pal[2]]];
  rings.forEach(([k, n, c], ri) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + rnd(-8, 8) + ri * 17;
      s += `<ellipse cx="0" cy="${f(-r * k * 0.6)}" rx="${f(r * k * 0.44)}" ry="${f(r * k * 0.5)}" transform="rotate(${f(a)})" fill="${c}" stroke="${pal[0]}" stroke-opacity=".4" stroke-width=".9"/>`;
    }
  });
  s += `<circle r="${f(r * 0.14)}" fill="${pal[3]}" opacity=".9"/></g>`;
  return s;
}
function blossom(x, y, r, c1, c2) {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rnd(0, 72))})">`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${f(-r * 0.55)}" rx="${f(r * 0.45)}" ry="${f(r * 0.6)}" transform="rotate(${i * 72})" fill="${c1}" stroke="${c2}" stroke-width=".6"/>`;
  s += `<circle r="${f(r * 0.22)}" fill="#e9c46a"/></g>`;
  return s;
}
function leaf(x, y, len, ang, col, w = 0.28) {
  const wd = len * w;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0 C ${f(wd)} ${f(-len * 0.3)}, ${f(wd)} ${f(-len * 0.75)}, 0 ${f(-len)} C ${f(-wd)} ${f(-len * 0.75)}, ${f(-wd)} ${f(-len * 0.3)}, 0 0Z" fill="${col}" stroke="#4d6a4a" stroke-opacity=".35" stroke-width=".8"/><path d="M0 0 L0 ${f(-len * 0.92)}" stroke="#4d6a4a" stroke-opacity=".4" stroke-width=".8"/></g>`;
}
function sprig(x, y, len, ang, col = '#cdb98a') {
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0 0 Q ${f(rnd(-12, 12))} ${f(-len / 2)} 0 ${f(-len)}" stroke="${col}" stroke-width="1.4" fill="none"/>`;
  for (let i = 0; i < 9; i++) {
    const t = i / 9, yy = -len * (0.25 + t * 0.75), side = i % 2 ? 1 : -1;
    s += `<path d="M0 ${f(yy)} q ${f(side * 14)} ${f(-6)} ${f(side * 22)} ${f(-14)}" stroke="${col}" stroke-width="1" fill="none"/><circle cx="${f(side * 22)}" cy="${f(yy - 14)}" r="${f(rnd(2, 3.6))}" fill="${col}"/>`;
  }
  return s + '</g>';
}
function bananaLeaf(x, y, len, ang, flip = 1) {
  const w = len * 0.34;
  let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)}) scale(${flip} 1)">`;
  s += `<path d="M0 0 C ${f(w * 1.4)} ${f(-len * 0.25)}, ${f(w * 1.3)} ${f(-len * 0.8)}, ${f(w * 0.2)} ${f(-len)} C ${f(-w * 0.9)} ${f(-len * 0.75)}, ${f(-w * 1.0)} ${f(-len * 0.3)}, 0 0Z" fill="#cfdcc2" stroke="#8ea585" stroke-width="1.2"/>`;
  s += `<path d="M0 0 Q ${f(w * 0.1)} ${f(-len * 0.5)} ${f(w * 0.2)} ${f(-len)}" stroke="#8ea585" stroke-width="2" fill="none"/>`;
  for (let i = 1; i < 14; i++) {
    const t = i / 14, yy = -len * t, xx = w * 0.2 * t;
    s += `<path d="M${f(xx)} ${f(yy)} l ${f(w * (1.05 - t * 0.5))} ${f(-w * 0.5)}" stroke="#8ea585" stroke-opacity=".55" stroke-width="1" fill="none"/>`;
    s += `<path d="M${f(xx)} ${f(yy)} l ${f(-w * (0.9 - t * 0.5))} ${f(-w * 0.45)}" stroke="#8ea585" stroke-opacity=".55" stroke-width="1" fill="none"/>`;
  }
  return s + '</g>';
}
const svg = (w, h, body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;
const write = (n, c) => fs.writeFileSync(path.join(out, n), c);

// ---------- Florals atas (kiri & kanan menjuntai) ----------
function cluster(cx, cy, spread, count, dir) {
  let s = '';
  for (let i = 0; i < 7; i++) s += leaf(cx + rnd(-spread, spread) * 0.6, cy + rnd(-spread, spread) * 0.6, rnd(70, 140), rnd(-80, 80) + (dir > 0 ? 180 : 180), GREEN[Math.floor(rnd(0, 3))]);
  for (let i = 0; i < 5; i++) s += sprig(cx + rnd(-spread, spread), cy + rnd(-spread * 0.4, spread), rnd(90, 170), rnd(-35, 35) + 180);
  for (let i = 0; i < count; i++) {
    const px = cx + rnd(-spread, spread), py = cy + rnd(-spread, spread);
    const k = rnd();
    if (k < 0.5) s += rose(px, py, rnd(26, 46), RED);
    else if (k < 0.8) s += rose(px, py, rnd(24, 40), WINE);
    else s += rose(px, py, rnd(20, 34), PINK);
  }
  for (let i = 0; i < 6; i++) s += blossom(cx + rnd(-spread, spread), cy + rnd(-spread, spread), rnd(10, 16), '#f7dfe3', '#d9a0ab');
  return s;
}
let top = '';
top += `<g class="l">` + cluster(70, 90, 70, 6, 1) + cluster(40, 250, 55, 4, 1) + cluster(95, 380, 40, 3, 1) + `</g>`;
top += `<g class="r">` + cluster(730, 80, 70, 6, -1) + cluster(765, 240, 55, 4, -1) + cluster(715, 370, 40, 3, -1) + `</g>`;
top += cluster(400, 20, 60, 2, 1).replace(/<g transform="translate\(4\d\d/g, '<g transform="translate(400');
write('floral-top.svg', svg(800, 520, top));

// ---------- Florals bawah ----------
seed = 91;
let bot = '';
for (let i = 0; i < 6; i++) bot += bananaLeaf(rnd(20, 140), 640, rnd(260, 360), rnd(-40, -5), 1);
for (let i = 0; i < 6; i++) bot += bananaLeaf(rnd(660, 780), 640, rnd(260, 360), rnd(5, 40), -1);
for (let x = -20; x < 840; x += 38) bot += leaf(x + rnd(-10, 10), 700, rnd(60, 120), rnd(-35, 35), GREEN[Math.floor(rnd(0, 3))]);
for (let i = 0; i < 12; i++) bot += sprig(rnd(0, 800), 700, rnd(120, 220), rnd(-30, 30));
const cl = [[60, 560, 60, 7], [180, 640, 70, 6], [300, 655, 70, 6], [400, 670, 60, 5], [500, 655, 70, 6], [630, 640, 70, 6], [745, 560, 60, 7]];
cl.forEach(([x, y, s, n]) => {
  for (let i = 0; i < n; i++) {
    const px = x + rnd(-s, s), py = y + rnd(-s * 0.7, s * 0.5), k = rnd();
    bot += k < 0.5 ? rose(px, py, rnd(26, 46), RED) : k < 0.75 ? rose(px, py, rnd(24, 38), WINE) : rose(px, py, rnd(22, 36), PINK);
  }
  for (let i = 0; i < 4; i++) bot += blossom(x + rnd(-s, s), y + rnd(-s, s * 0.6), rnd(10, 15), '#f7dfe3', '#d9a0ab');
});
write('floral-bottom.svg', svg(800, 700, bot));

// ---------- Rumah joglo ----------
let h = '';
const tile = (y, w, hh, c1, c2, id) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
const defs = tile(0, 0, 0, '#b4636f', '#7d3341', 'tg') + tile(0, 0, 0, '#a05561', '#6b2634', 'tg2') +
  `<linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3c"/><stop offset="1" stop-color="#5b3a1e"/></linearGradient>` +
  `<radialGradient id="gl" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#e0a23a"/></radialGradient>`;
// atap bertingkat
h += `<path d="M400 40 L520 150 L280 150Z" fill="url(#tg2)"/><path d="M400 40 L440 150" stroke="#5a1f2b" stroke-opacity=".3"/>`;
h += `<path d="M300 150 L500 150 L610 255 L190 255Z" fill="url(#tg)"/>`;
h += `<path d="M120 255 L680 255 L760 340 L40 340Z" fill="url(#tg2)"/>`;
for (let i = 0; i < 24; i++) h += `<path d="M${f(60 + i * 29)} 342 L${f(190 + i * 18)} 258" stroke="#4a1520" stroke-opacity=".25" stroke-width="1.5"/>`;
for (let i = 0; i < 12; i++) h += `<path d="M${f(220 + i * 30)} 252 L${f(330 + i * 12)} 152" stroke="#4a1520" stroke-opacity=".25" stroke-width="1.5"/>`;
h += `<rect x="40" y="338" width="720" height="12" fill="#6b2634"/><circle cx="400" cy="36" r="9" fill="#e0b25a"/>`;
// badan rumah
h += `<rect x="90" y="350" width="620" height="150" fill="url(#wd)"/>`;
for (let i = 0; i <= 8; i++) h += `<rect x="${90 + i * 77}" y="350" width="14" height="150" fill="#3d2410"/>`;
for (let i = 0; i < 8; i++) {
  const x = 104 + i * 77;
  h += `<rect x="${x + 8}" y="372" width="${i === 3 || i === 4 ? 60 : 50}" height="110" fill="url(#gl)" opacity=".95"/>`;
  for (let j = 0; j < 3; j++) h += `<rect x="${x + 8}" y="${372 + j * 37}" width="${i === 3 || i === 4 ? 60 : 50}" height="3" fill="#4a2a10" opacity=".7"/>`;
  h += `<rect x="${x + 8 + (i === 3 || i === 4 ? 29 : 24)}" y="372" width="3" height="110" fill="#4a2a10" opacity=".7"/>`;
}
h += `<rect x="90" y="498" width="620" height="10" fill="#3d2410"/>`;
// tangga
for (let i = 0; i < 5; i++) h += `<rect x="${330 - i * 14}" y="${508 + i * 9}" width="${140 + i * 28}" height="10" fill="${i % 2 ? '#bdb4b0' : '#d3cbc6'}"/>`;
write('house.svg', svg(800, 560, h, defs));

// ---------- Langit ----------
let sky = `<rect width="800" height="1400" fill="url(#g)"/>`;
for (let i = 0; i < 26; i++) sky += `<ellipse cx="${f(rnd(0, 800))}" cy="${f(rnd(0, 1100))}" rx="${f(rnd(80, 230))}" ry="${f(rnd(24, 70))}" fill="#fff" opacity="${f(rnd(0.12, 0.35))}" filter="url(#b)"/>`;
for (let i = 0; i < 40; i++) sky += `<path d="M${f(rnd(0, 800))} ${f(rnd(560, 1000))} q 30 -40 60 0" stroke="#a89a82" stroke-opacity=".08" fill="none" stroke-width="4"/>`;
write('sky.svg', svg(800, 1400, sky, `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e5d8c3"/><stop offset=".55" stop-color="#d9c9ae"/><stop offset="1" stop-color="#cfc3a6"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="14"/></filter>`));

// ---------- Tekstur marmer / kertas ----------
let paper = `<rect width="800" height="1000" fill="#f6f1ec"/>`;
for (let i = 0; i < 14; i++) paper += `<path d="M${f(rnd(-50, 800))} ${f(rnd(0, 1000))} q ${f(rnd(60, 220))} ${f(rnd(-90, 90))} ${f(rnd(200, 520))} ${f(rnd(-120, 120))}" stroke="#d8cdc4" stroke-opacity="${f(rnd(0.15, 0.4))}" stroke-width="${f(rnd(1, 3))}" fill="none"/>`;
write('paper.svg', svg(800, 1000, paper));

// ---------- Placeholder foto ----------
function photo(name, w, h, hue, kind) {
  const c1 = `hsl(${hue} 45% 28%)`, c2 = `hsl(${hue + 10} 55% 12%)`;
  let b = `<rect width="${w}" height="${h}" fill="url(#p)"/><circle cx="${w * 0.75}" cy="${h * 0.25}" r="${w * 0.35}" fill="#e8b36a" opacity=".12" filter="url(#b)"/>`;
  const person = (cx, base, s, col) => `<circle cx="${f(cx)}" cy="${f(base - s * 2.1)}" r="${f(s * 0.42)}" fill="${col}"/><path d="M${f(cx - s)} ${f(base)} q 0 ${f(-s * 1.4)} ${f(s)} ${f(-s * 1.4)} q ${f(s)} 0 ${f(s)} ${f(s * 1.4)}Z" fill="${col}"/>`;
  if (kind === 'couple') b += person(w * 0.38, h, w * 0.2, '#7a1b34') + person(w * 0.62, h, w * 0.21, '#3a2418');
  else if (kind === 'groom') b += person(w * 0.5, h, w * 0.3, '#3a2418');
  else if (kind === 'bride') b += person(w * 0.5, h, w * 0.3, '#8d1e38');
  else b += person(w * 0.4, h, w * 0.18, '#7a1b34') + person(w * 0.62, h, w * 0.19, '#4a2c1a');
  b += `<text x="${w / 2}" y="${h * 0.1}" font-family="Georgia,serif" font-size="${f(w * 0.045)}" fill="#fff" opacity=".55" text-anchor="middle">Ganti foto lewat Admin</text>`;
  write(name, svg(w, h, b, `<linearGradient id="p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="30"/></filter>`));
}
photo('cover-photo.svg', 700, 460, 345, 'couple');
photo('couple-wide.svg', 900, 1200, 350, 'couple');
photo('groom.svg', 600, 760, 20, 'groom');
photo('bride.svg', 600, 760, 345, 'bride');
photo('story-1.svg', 600, 700, 340, 'couple');
photo('story-2.svg', 600, 700, 10, 'couple');
photo('story-3.svg', 600, 700, 355, 'couple');
for (let i = 1; i <= 9; i++) photo(`gallery-${i}.svg`, 600, i % 3 === 0 ? 800 : i % 2 ? 720 : 760, 335 + i * 6, 'couple');
photo('closing.svg', 700, 560, 350, 'couple');



// ---------- Ornamen gunungan emas (ikon di atas kartu acara) ----------
{
  const g = 'url(#au)';
  let o = `<path d="M40 4 C46 20 66 28 68 56 C70 80 60 96 40 98 C20 96 10 80 12 56 C14 28 34 20 40 4Z" fill="none" stroke="${g}" stroke-width="2.4"/>`;
  o += `<path d="M40 12 C44 24 58 32 60 54 C61 74 54 88 40 90 C26 88 19 74 20 54 C22 32 36 24 40 12Z" fill="none" stroke="${g}" stroke-width="1.2" opacity=".8"/>`;
  o += `<path d="M40 22 V88" stroke="${g}" stroke-width="2"/>`;
  for (let i = 0; i < 6; i++) { const y = 34 + i * 9, w = 6 + i * 2.2; o += `<path d="M40 ${y} q ${w} -8 ${w + 4} -2 M40 ${y} q ${-w} -8 ${-w - 4} -2" fill="none" stroke="${g}" stroke-width="1.6" stroke-linecap="round"/>`; }
  o += `<path d="M30 98 V72 q 10 -12 20 0 V98" fill="${g}" opacity=".9"/><path d="M33 98 V74 q 7 -9 14 0 V98" fill="#fff" fill-opacity=".35"/>`;
  o += `<circle cx="40" cy="8" r="3" fill="${g}"/>`;
  write('ornament.svg', svg(80, 104, o, `<linearGradient id="au" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8892f"/><stop offset=".5" stop-color="#e7c66f"/><stop offset="1" stop-color="#a97b25"/></linearGradient>`));
}

// ---------- Bingkai bunga untuk kartu kapsul (diregangkan 100%x100% mengikuti bentuk kapsul) ----------
{
  seed = 33;
  const W = 600, H = 1000, R = W / 2, band = 26;
  const POS = [];
  const per = (t) => { // titik di sepanjang keliling kapsul (setengah lingkaran atas + sisi + bawah)
    const straight = H - W, L = Math.PI * R * 2 + straight * 2; let d = t * L;
    if (d < Math.PI * R) { const a = Math.PI + d / R; return [R + (R - band) * Math.cos(a), R + (R - band) * Math.sin(a)]; }
    d -= Math.PI * R; if (d < straight) return [W - band, R + d];
    d -= straight; if (d < Math.PI * R) { const a = d / R; return [R + (R - band) * Math.cos(a), H - R + (R - band) * Math.sin(a)]; }
    d -= Math.PI * R; return [band, H - R - d];
  };
  const N = 78; for (let i = 0; i < N; i++) POS.push(per(i / N));
  const sm = (x, y, r, pal) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rnd(0, 360))})"><circle r="${f(r)}" fill="${pal[0]}"/>` +
    [[1, 7, pal[1]], [0.68, 6, pal[2]], [0.4, 5, pal[1]]].map(([k, n, c], ri) => Array.from({ length: n }, (_, i) => `<ellipse cx="0" cy="${f(-r * k * 0.55)}" rx="${f(r * k * 0.42)}" ry="${f(r * k * 0.48)}" transform="rotate(${f((i / n) * 360 + ri * 21)})" fill="${c}"/>`).join('')).join('') + `<circle r="${f(r * 0.12)}" fill="${pal[3]}"/></g>`;
  let b = `<rect width="${W}" height="${H}" fill="#4f1020"/>`;
  POS.forEach(([x, y]) => { b += leaf(x + rnd(-14, 14), y + rnd(-14, 14), rnd(38, 60), rnd(0, 360), GREEN[Math.floor(rnd(0, 3))]); });
  POS.forEach(([x, y], i) => { const k = i % 5; b += sm(x + rnd(-10, 10), y + rnd(-10, 10), rnd(20, 32), k < 2 ? RED : k < 3 ? WINE : PINK); });
  POS.forEach(([x, y], i) => { if (i % 3 === 0) b += blossom(x + rnd(-18, 18), y + rnd(-18, 18), rnd(9, 13), '#fbeaec', '#d9a0ab'); });
  write('frame.svg', svg(W, H, b));
}

// ---------- Buket bunga kecil (menempel di sudut foto mempelai) ----------
{
  seed = 52;
  let b = '';
  for (let i = 0; i < 4; i++) b += leaf(150 + rnd(-30, 30), 250, rnd(90, 140), rnd(-70, 70), GREEN[Math.floor(rnd(0, 3))]);
  b += sprig(70, 240, 150, -25);
  [[120, 170, 40, WINE], [190, 130, 34, RED], [190, 200, 38, PINK], [95, 105, 30, PINK], [150, 235, 30, RED], [60, 190, 26, RED]].forEach(([x, y, r, pal]) => { b += rose(x, y, r, pal); });
  b += blossom(220, 80, 13, '#fbeaec', '#d9a0ab') + blossom(60, 60, 12, '#fbeaec', '#d9a0ab') + blossom(230, 235, 11, '#fff3c9', '#e0b95c');
  write('flowers.svg', svg(280, 290, b));
}
console.log('Aset dibuat di', out);
