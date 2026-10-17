/* Tema 10 (Air Terjun Bulan) & Tema 11 (Adat Jawa): dunia hidup digambar vektor, berlapis, dan masuk bertahap
   mengikuti video referensi.
   Tema 10: sampul naik → menembus gapura batu → air terjun bercahaya → bulan terbit di belakang air terjun → bunga tumbuh,
            dedaunan turun, kupu-kupu → panel oval membesar dari tengah berisi nama.
   Tema 11: langit galaksi → gazebo & tangga naik dari bawah → awan pink → pilar mawar → bunga → bulan ungu →
            awan ungu → tirai merah dari samping → lampu gantung turun → nama.
   Dipakai invitation.js lewat window.LIVEW[key] = { world, start, film }. */
(function () {
  'use strict';
  const T = '/assets/t/', BW = 784, BH = 1168;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const f1 = (n) => +(+n).toFixed(1);
  const R = (i, k) => (Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2;
  let uid = 0; const U = (p) => p + (++uid);
  const P = (x, y, w, h) => `left:${(x / BW * 100).toFixed(3)}%;top:${(y / BH * 100).toFixed(3)}%;width:${(w / BW * 100).toFixed(3)}%${h ? `;height:${(h / BH * 100).toFixed(3)}%` : ''}`;
  const SV = (inner, defs, cls) => `<svg class="${cls || ''}" viewBox="0 0 ${BW} ${BH}" preserveAspectRatio="none">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
  const L = (cls, inner, z) => `<div class="pg-l ${cls}" data-z="${z || 0}">${inner}</div>`;
  const lg = (id, stops, v) => `<linearGradient id="${id}" ${v || 'x1="0" y1="0" x2="0" y2="1"'}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops, at) => `<radialGradient id="${id}" ${at || ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const stars = (n, y0, y1, seed) => Array.from({ length: n }, (_, i) => `<i class="pg-st" style="left:${(R(i + seed, 1) * 100).toFixed(1)}%;top:${(y0 + R(i + seed, 2) * (y1 - y0)).toFixed(1)}%;--s:${(1 + R(i + seed, 3) * 2.4).toFixed(1)}px;animation-duration:${(2 + R(i + seed, 4) * 4).toFixed(1)}s;animation-delay:${(-R(i + seed, 5) * 6).toFixed(1)}s"></i>`).join('');

  // ---------- bunga ----------
  function lily(s, rot, c) { // bunga bintang putih (lili/melati) dengan semburat warna
    const [a, b] = c || ['#ffffff', '#c9d8ff'], id = U('ly');
    const pet = (k) => `<path d="M0 0 C6 -10 6 -26 0 -40 C-6 -26 -6 -10 0 0Z" transform="rotate(${k * 60})" fill="url(#${id})" stroke="#9fb4e6" stroke-width=".6"/>`;
    return `<g transform="scale(${s}) rotate(${rot || 0})"><defs>${rg(id, [[0, b], [0.55, a], [1, a]], 'cx=".5" cy="1" r="1"')}</defs>${[0, 1, 2, 3, 4, 5].map(pet).join('')}<circle r="5" fill="#f4e7a8"/>${[0, 1, 2, 3, 4].map((k) => `<path d="M0 0 L${f1(Math.cos(k * 1.26) * 11)} ${f1(Math.sin(k * 1.26) * 11)}" stroke="#d9b84a" stroke-width="1"/>`).join('')}</g>`;
  }
  function bloom5(s, rot, c) { // bunga 5 kelopak (biru/ungu)
    const [a, b] = c || ['#5c7fe0', '#2a3f9a'], id = U('bl');
    return `<g transform="scale(${s}) rotate(${rot || 0})"><defs>${rg(id, [[0, '#e8eeff'], [0.35, a], [1, b]])}</defs>${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="0" cy="-14" rx="10" ry="15" transform="rotate(${k * 72})" fill="url(#${id})"/>`).join('')}<circle r="5" fill="#fff3c0"/></g>`;
  }
  function rose(s, rot, c) { // mawar berlapis spiral
    const [a, b, d] = c || ['#e0354f', '#a3122c', '#6a0a1c'], id = U('rs');
    return `<g transform="scale(${s}) rotate(${rot || 0})"><defs>${rg(id, [[0, a], [0.7, b], [1, d]])}</defs>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M0 0 C14 -6 22 -22 12 -32 C4 -38 -8 -36 -12 -28 C-18 -18 -10 -6 0 0Z" transform="rotate(${k * 72 + 18}) translate(0 6)" fill="url(#${id})" stroke="${d}" stroke-width=".8"/>`).join('')}
      <circle r="15" fill="${b}"/><path d="M-9 2 C-10 -10 4 -14 8 -5 C11 2 4 9 -2 6 C-7 4 -6 -4 0 -4 C4 -4 4 1 1 2" fill="none" stroke="${d}" stroke-width="2" stroke-linecap="round"/>
      <path d="M-14 -4 C-12 -16 6 -20 14 -8" fill="none" stroke="${a}" stroke-width="1.6" opacity=".7"/></g>`;
  }
  const leafP = (s, rot, col) => `<g transform="scale(${s}) rotate(${rot})"><path d="M0 0 C12 -10 14 -34 0 -54 C-14 -34 -12 -10 0 0Z" fill="${col}"/><path d="M0 -2 L0 -50" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/></g>`;


  // ---------- pohon bervolume: kanopi gumpalan berlapis (gelap → sedang → terang) + batang & ranting ----------
  const TPAL = {
    blossom: { lit: '#fff0f6', mid: '#ff9fc6', sh: '#9a2f66', tk: ['#8a5a78', '#3a2038'], dot: '#ffffff' },
    lav:     { lit: '#f3e8ff', mid: '#b698f2', sh: '#44248a', tk: ['#6a4a86', '#2a1448'], dot: '#f7e9ff' },
    night:   { lit: '#7fd0cc', mid: '#237a90', sh: '#07243f', tk: ['#5a78b0', '#10204a'], dot: '#d8f4ff' },
    night2:  { lit: '#8cc4f2', mid: '#2c5fae', sh: '#0a1a58', tk: ['#27407a', '#08112e'], dot: '#cfe6ff' },
  };
  function leafyTree(kind, seed, flip) {
    const c = TPAL[kind], id = U('tr');
    const defs = rg(id + 'b', [[0, c.mid], [1, c.sh]], 'cx=".4" cy=".3" r=".85"') + rg(id + 'm', [[0, c.lit], [0.5, c.mid], [1, c.sh]], 'cx=".36" cy=".28" r=".85"') + rg(id + 'f', [[0, c.lit], [1, c.mid]], 'cx=".34" cy=".26" r=".9"') + lg(id + 't', [[0, c.tk[0]], [1, c.tk[1]]], 'x1="0" y1="0" x2="1" y2="0"');
    const layer = (n, r0, r1, g, dx, dy, k) => Array.from({ length: n }, (_, i) => {
      const a = R(i + seed, k) * 6.283, d = Math.sqrt(R(i + seed, k + 1)), r = r0 + R(i + seed, k + 2) * (r1 - r0);
      const x = 160 + Math.cos(a) * d * 120 + dx, y = 168 + Math.sin(a) * d * 96 * (Math.sin(a) < 0 ? 1.05 : 0.8) + dy;
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${id}${g})"/>`;
    }).join('');
    const br = [[160, 300, 96, 226], [166, 290, 228, 214], [158, 262, 160, 190], [160, 330, 116, 262], [166, 320, 214, 258]].map(([x0, y0, x1, y1]) => `<path d="M${x0} ${y0} Q${f1((x0 + x1) / 2 + (R(x0, 3) - 0.5) * 24)} ${f1((y0 + y1) / 2 - 10)} ${x1} ${y1}" stroke="${c.tk[1]}" stroke-width="${f1(5 + R(x1, 2) * 4)}" fill="none" stroke-linecap="round"/>`).join('');
    const dots = Array.from({ length: 26 }, (_, i) => `<circle cx="${f1(60 + R(i + seed, 9) * 200)}" cy="${f1(80 + R(i + seed, 8) * 150)}" r="${f1(1.4 + R(i + seed, 7) * 2.2)}" fill="${c.dot}" opacity="${f1(0.55 + R(i, 6) * 0.4)}"/>`).join('');
    return `<svg class="tr-svg" viewBox="0 0 320 480" style="${flip ? 'transform:scaleX(-1)' : ''}"><defs>${defs}</defs>
      <ellipse cx="164" cy="476" rx="70" ry="9" fill="#000" opacity=".28"/>
      <path d="M146 478 C152 420 148 350 152 280 L176 280 C172 350 180 420 186 478Z" fill="url(#${id}t)"/><path d="M150 470 C156 420 152 350 156 285" stroke="${c.lit}" stroke-width="2.4" fill="none" opacity=".5"/>${br}
      ${layer(24, 26, 44, 'b', 8, 14, 1)}${layer(30, 19, 34, 'm', 0, 0, 11)}${layer(28, 11, 22, 'f', -16, -20, 21)}${dots}</svg>`;
  }
  function pineTree(kind, seed) {
    const c = TPAL[kind], id = U('pn'); let t = '';
    const defs = lg(id, [[0, c.lit], [0.45, c.mid], [1, c.sh]], 'x1="0" y1="0" x2="1" y2="0.3"');
    for (let i = 0; i < 7; i++) {
      const y0 = 40 + i * 58, y1 = y0 + 92, hw = 22 + i * 9 + R(i + seed, 2) * 4;
      t += `<path d="M80 ${y0} C${80 + hw * 0.5} ${y0 + 30} ${80 + hw * 0.85} ${y1 - 20} ${80 + hw} ${y1} Q${80 + hw * 0.5} ${y1 - 12} 80 ${y1 - 6} Q${80 - hw * 0.5} ${y1 - 12} ${80 - hw} ${y1} C${80 - hw * 0.85} ${y1 - 20} ${80 - hw * 0.5} ${y0 + 30} 80 ${y0}Z" fill="url(#${id})"/>`;
    }
    return `<svg class="tr-svg" viewBox="0 0 160 480"><defs>${defs}</defs><rect x="74" y="400" width="12" height="76" fill="${c.tk[1]}"/>${t}</svg>`;
  }
  const tr = (cls, st, svg, d) => `<div class="pg-o tr ${cls}" style="${st};--td:${d || 0}s">${svg}</div>`;

  // ======================= TEMA 10: AIR TERJUN BULAN =======================
  function rockPath(side) { // tebing batu kiri/kanan yang mengapit air terjun
    if (side === 'l') return 'M0 380 C40 360 80 372 120 352 C160 334 196 344 232 358 C268 372 300 392 336 410 L344 452 C330 520 336 600 320 680 C306 760 300 820 270 870 L0 900Z';
    return 'M784 360 C744 346 700 364 664 350 C628 336 590 350 556 366 C520 382 486 396 450 412 L442 452 C456 520 450 600 466 680 C480 760 486 820 514 870 L784 900Z';
  }
  function pine(x, y, h, col) { const w = h * 0.42; return `<path d="M${x} ${y - h} L${x + w * .3} ${y - h * .62} L${x + w * .18} ${y - h * .62} L${x + w * .44} ${y - h * .3} L${x + w * .26} ${y - h * .3} L${x + w * .5} ${y} L${x - w * .5} ${y} L${x - w * .26} ${y - h * .3} L${x - w * .44} ${y - h * .3} L${x - w * .18} ${y - h * .62} L${x - w * .3} ${y - h * .62}Z" fill="${col}"/>`; }
  function flowerBed(flip, seed) {
    let h = '';
    for (let i = 0; i < 9; i++) h += `<g transform="translate(${f1(20 + R(i + seed, 1) * 300)} ${f1(250 - R(i + seed, 2) * 40)})">${leafP(0.9 + R(i + seed, 3) * 0.8, -60 + R(i + seed, 4) * 120, i % 2 ? '#1d4a5a' : '#173a52')}</g>`;
    const pts = [[60, 210, 1.15], [150, 236, 1.3], [250, 214, 1.05], [110, 160, 0.8], [210, 168, 0.75], [300, 240, 0.9], [30, 250, 0.9]];
    pts.forEach(([x, y, s], i) => { h += `<g class="pg-fl" style="--d:${(i * 0.12).toFixed(2)}s;transform-origin:${x}px ${y}px"><g transform="translate(${x} ${y})">${i % 3 === 2 ? bloom5(s * 0.9, i * 20) : lily(s, i * 17)}</g></g>`; });
    return `<svg class="pg-bed" viewBox="0 0 340 270" style="${flip ? 'transform:scaleX(-1)' : ''}">${h}</svg>`;
  }
  function foliage(flip) {
    let h = '';
    for (let i = 0; i < 34; i++) { const t = R(i, 1), x = t * 250, y = (1 - t) * 170 * R(i, 2) + R(i, 5) * 30; h += `<g transform="translate(${f1(x)} ${f1(y)})">${leafP(0.7 + R(i, 3) * 0.8, 100 + R(i, 4) * 160, ['#3b5590', '#5a74b0', '#8ea4d6', '#2a3f72', '#b8c8ec'][i % 5])}</g>`; }
    h += `<path d="M0 0 C60 30 120 40 200 30" stroke="#0e2238" stroke-width="5" fill="none"/>`;
    return `<svg class="pg-fol" viewBox="0 0 260 220" style="${flip ? 'transform:scaleX(-1)' : ''}">${h}</svg>`;
  }
  function archSvg() { // gapura batu di depan (untuk menembus saat masuk)
    const id = U('ar'), blocks = [];
    for (let i = 0; i < 16; i++) { const a = Math.PI * (i / 15); blocks.push(`<path d="M${f1(392 - Math.cos(a) * 300)} ${f1(560 - Math.sin(a) * 380)} L${f1(392 - Math.cos(a) * 360)} ${f1(560 - Math.sin(a) * 440)}" stroke="#2c4a92" stroke-width="2.4"/>`); }
    for (let y = 600; y < 1168; y += 58) blocks.push(`<path d="M32 ${y} H92 M692 ${y} H752" stroke="#2c4a92" stroke-width="2.4"/>`);
    return SV(`<path fill-rule="evenodd" d="M0 0 H784 V1168 H0Z M92 1168 V560 C92 330 230 180 392 180 C554 180 692 330 692 560 V1168Z" fill="url(#${id})"/>
      <path d="M92 1168 V560 C92 330 230 180 392 180 C554 180 692 330 692 560 V1168" fill="none" stroke="#6f8fd8" stroke-width="5" opacity=".7"/>${blocks.join('')}
      <path d="M32 1168 V560 C32 290 196 120 392 120 C588 120 752 290 752 560 V1168" fill="none" stroke="#3a5aa8" stroke-width="3" opacity=".6"/>`,
    lg(id, [[0, '#1a2b66'], [0.6, '#16255a'], [1, '#0d1840']]));
  }
  function airterjunWorld() {
    uid = 0;
    const img = (n, cls) => `<img class="${cls || 'pg-img'}" src="${T}airterjun/${n}.webp" alt="" decoding="async">`;
    const rip = SV(`<g class="pg-rip" fill="none" stroke="#bfe6ff" stroke-width="1.4">${[0, 1, 2, 3].map((i) => `<ellipse cx="392" cy="${892 + i * 24}" rx="${70 + i * 50}" ry="${6 + i * 4}" style="animation-delay:${-i * 0.9}s"/>`).join('')}</g>`);
    return `<div class="pg-w at">
      ${L('sky', img('sky') + stars(26, 0, 40, 3), -1)}
      <div class="pg-l moon" data-z="-0.8"><div class="at-moon" style="${P(242, 128, 300, 300)}"><i class="h"></i><div class="m"><img src="${T}fx/moon.webp" alt=""></div><i class="s"></i></div></div>
      ${L('cliffs', img('cliffs'), -0.3)}
      ${L('wf', `<div class="at-wf" style="${P(354, 386, 76, 494)}"><i class="glow"></i><i class="core"></i><i class="st a"></i><i class="st b"></i><i class="lip"></i></div><div class="at-mist" style="${P(252, 830, 280, 100)}"></div>`, -0.2)}
      ${L('pool', img('pool') + `<div class="at-refl" style="${P(340, 878, 104, 220)}"></div>` + rip, 0)}
      ${L('trees', tr('l back', P(190, 600, 120), pineTree('night2', 3), 0.5) + tr('r back', P(474, 600, 120), pineTree('night2', 5), 0.7) + tr('l', P(-30, 500, 300), leafyTree('night', 4, 0), 0) + tr('r', P(514, 500, 300), leafyTree('night', 12, 1), 0.25), 0.3)}
      ${L('mistb', `<div class="pg-o mb1" style="${P(-80, 820, 760)}"><img class="is-cl" src="${T}airterjun/mist.webp" alt=""></div><div class="pg-o mb2" style="${P(240, 900, 700)}"><img class="is-cl" src="${T}airterjun/mist.webp" alt="" style="transform:scaleX(-1)"></div><div class="pg-o mb3" style="${P(-40, 180, 520)}"><img class="is-cl" src="${T}airterjun/mist.webp" alt="" style="opacity:.55"></div>`, 0.25)}
      ${L('bed', `<div class="pg-o bl" style="${P(-40, 930, 360)}">${flowerBed(0, 1)}</div><div class="pg-o br" style="${P(464, 930, 360)}">${flowerBed(1, 9)}</div>`, 0.45)}
      ${L('fol', `<div class="pg-o tl" style="${P(-30, -16, 340)}">${foliage(0)}</div><div class="pg-o tr" style="${P(474, -16, 340)}">${foliage(1)}</div>`, 0.6)}
      <div class="pg-l fly" data-z="0.5"></div>
      ${L('portal', archSvg(), 0.9)}
    </div>`;
  }

  // ======================= TEMA 11: ISTANA LANGIT =======================
  function gazeboSvg() {
    const cols = [-120, -60, 0, 60, 120];
    return `<svg class="is-gz" viewBox="0 0 360 330"><defs>
      ${lg('gzD', [[0, '#e9f6ff'], [0.5, '#a7d4ef'], [1, '#6aa4cc']], 'x1="0" y1="0" x2="1" y2="0"')}${lg('gzM', [[0, '#ffffff'], [0.5, '#efe7e0'], [1, '#c9bcb2']], 'x1="0" y1="0" x2="1" y2="0"')}
      ${rg('gzI', [[0, '#ff7ef2'], [0.45, '#b33ac8'], [1, '#4a1670']])}</defs>
      <path d="M180 8 l6 14 h-12z" fill="#f2e2b8"/><ellipse cx="180" cy="24" rx="10" ry="5" fill="url(#gzM)"/>
      <path d="M180 26 C110 30 70 80 66 130 H294 C290 80 250 30 180 26Z" fill="url(#gzD)" stroke="#fff" stroke-width="2"/>
      ${[-80, -40, 0, 40, 80].map((d) => `<path d="M180 28 Q${180 + d * 1.1} 80 ${180 + d * 1.42} 130" stroke="#ffffff" stroke-width="3" fill="none"/>`).join('')}
      <path d="M86 70 Q180 54 274 70 M74 100 Q180 86 286 100" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
      <rect x="56" y="128" width="248" height="22" rx="4" fill="url(#gzM)"/><path d="M56 150 h248" stroke="#b9aba0" stroke-width="2"/>
      ${Array.from({ length: 12 }, (_, i) => `<circle cx="${66 + i * 21}" cy="139" r="3" fill="#d8c6b4"/>`).join('')}
      <path d="M62 150 H298 V284 H62Z" fill="url(#gzI)"/>
      ${cols.slice(0, 4).map((c, i) => `<path d="M${180 + c + 8} 284 V196 C${180 + c + 8} 170 ${180 + c + 52} 170 ${180 + c + 52} 196 V284" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`).join('')}
      ${cols.map((c) => `<rect x="${180 + c - 8}" y="150" width="16" height="136" fill="url(#gzM)"/><rect x="${180 + c - 11}" y="150" width="22" height="8" fill="#f6efe8"/><rect x="${180 + c - 11}" y="278" width="22" height="8" fill="#f6efe8"/>`).join('')}
      <ellipse cx="180" cy="226" rx="60" ry="70" fill="#ff9cf6" opacity=".25"/>
      <rect x="40" y="284" width="280" height="18" fill="url(#gzM)"/><rect x="28" y="300" width="304" height="16" fill="url(#gzM)"/><path d="M28 316 h304" stroke="#b9aba0" stroke-width="2"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${44 + i * 20}" y="286" width="6" height="14" rx="3" fill="#d8ccc2"/>`).join('')}</svg>`;
  }
  function stairsSvg() {
    let s = '';
    const top = 0, bot = 600, n = 22;
    for (let i = 0; i <= n; i++) { const u = i / n, y = top + Math.pow(u, 1.25) * bot, hw = 120 + u * 230; s += `<path d="M${f1(392 - hw)} ${f1(y)} H${f1(392 + hw)}" stroke="#bfb0a6" stroke-width="${f1(1 + u * 2)}"/><path d="M${f1(392 - hw)} ${f1(y + 2 + u * 3)} H${f1(392 + hw)}" stroke="#fffaf6" stroke-width="${f1(0.8 + u * 1.4)}" opacity=".8"/>`; }
    const balus = (side) => { let b = ''; for (let i = 0; i <= 16; i++) { const u = i / 16, y = top + Math.pow(u, 1.25) * bot, hw = 120 + u * 230, x = 392 + side * (hw + 6 + u * 10), h = 26 + u * 46, w = 5 + u * 8; b += `<rect x="${f1(x - w / 2)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(w / 2)}" fill="url(#stM)"/>`; } const x0 = 392 + side * 126, x1 = 392 + side * (350 + 16); return `${b}<path d="M${x0} ${top - 26} L${f1(x1)} ${bot - 72} L${f1(x1 + side * 26)} ${bot - 60} L${f1(x0 + side * 12)} ${top - 30}Z" fill="url(#stM)"/><path d="M${x0} ${top + 2} L${f1(x1)} ${bot + 4}" stroke="url(#stM)" stroke-width="14"/>`; };
    return `<svg class="is-st" viewBox="0 0 784 620" preserveAspectRatio="none"><defs>${lg('stF', [[0, '#e9d6d2'], [1, '#f6ebe4']])}${lg('stSh', [[0, '#5a1a40', 0.35], [0.5, '#5a1a40', 0], [1, '#3a0a1c', 0.35]], 'x1="0" y1="0" x2="1" y2="0"')}${lg('stM', [[0, '#ffffff'], [0.5, '#ece2d8'], [1, '#c8bab0']], 'x1="0" y1="0" x2="1" y2="0"')}</defs>
      <path d="M272 0 H512 L742 600 H42Z" fill="url(#stF)"/><path d="M272 0 H512 L742 600 H42Z" fill="url(#stSh)"/>${s}${balus(-1)}${balus(1)}</svg>`;
  }
  function pillarSvg(flip) {
    let r = '';
    for (let i = 0; i < 9; i++) { const y = 60 + i * 74, x = 30 + Math.sin(i * 1.9) * 20; r += `<g transform="translate(${f1(x)} ${y})">${leafP(0.5, -50 + i * 20, '#2f5a32')}</g><g transform="translate(${f1(x + 6)} ${y + 10})">${rose(0.42 + (i % 3) * 0.08, i * 30, i % 3 === 1 ? ['#ff9fb4', '#e05a7c', '#9a2a4a'] : i % 3 === 2 ? ['#ffffff', '#f2d6d6', '#c9a0a0'] : undefined)}</g>`; }
    return `<svg class="is-pl" viewBox="0 0 80 760" preserveAspectRatio="none" style="${flip ? 'transform:scaleX(-1)' : ''}"><defs>${lg('plM' + (flip ? 1 : 0), [[0, '#c8bab0'], [0.35, '#ffffff'], [0.7, '#ece2d8'], [1, '#b8a99f']], 'x1="0" y1="0" x2="1" y2="0"')}</defs>
      <rect x="6" y="0" width="68" height="34" fill="url(#plM${flip ? 1 : 0})"/><path d="M2 34 H78 L70 50 H10Z" fill="url(#plM${flip ? 1 : 0})"/><path d="M10 16 Q24 2 38 16 M42 16 Q56 2 70 16" stroke="#b8a99f" stroke-width="3" fill="none"/>
      <rect x="14" y="50" width="52" height="660" fill="url(#plM${flip ? 1 : 0})"/>${[24, 34, 44, 54].map((x) => `<path d="M${x} 56 V704" stroke="#c8bab0" stroke-width="2" opacity=".6"/>`).join('')}
      <path d="M8 710 H72 L80 734 H0Z" fill="url(#plM${flip ? 1 : 0})"/><rect x="0" y="734" width="80" height="26" fill="url(#plM${flip ? 1 : 0})"/>${r}</svg>`;
  }
  function puff(cols, flip) { // awan bergumpal
    const [a, b, c] = cols, id = U('pf');
    const lobes = [[60, 120, 56], [120, 86, 64], [190, 100, 58], [240, 140, 50], [150, 150, 70], [80, 170, 50], [210, 180, 46]];
    return `<svg class="is-pf" viewBox="0 0 300 230" style="${flip ? 'transform:scaleX(-1)' : ''}"><defs>${rg(id, [[0, a], [0.6, b], [1, c]], 'cx=".4" cy=".3" r=".8"')}</defs>${lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`).join('')}</svg>`;
  }
  function roseBush(flip, seed) {
    let h = '';
    for (let i = 0; i < 12; i++) h += `<g transform="translate(${f1(R(i + seed, 1) * 320)} ${f1(120 + R(i + seed, 2) * 150)})">${leafP(1 + R(i + seed, 3) * 0.6, -70 + R(i + seed, 4) * 140, i % 2 ? '#2f5a32' : '#24482a')}</g>`;
    const pts = [[50, 200, 1.3], [140, 230, 1.5], [240, 210, 1.2], [100, 140, 0.9], [200, 150, 1], [300, 240, 1.1], [20, 250, 1], [170, 90, 0.75]];
    const cs = [undefined, ['#ff9fb4', '#e05a7c', '#9a2a4a'], ['#ffffff', '#f2d6d6', '#c9a0a0'], ['#ff6f7d', '#d0303f', '#7a0e1c']];
    pts.forEach(([x, y, s], i) => { h += `<g class="pg-fl" style="--d:${(i * 0.1).toFixed(2)}s;transform-origin:${x}px ${y}px"><g transform="translate(${x} ${y})">${rose(s, i * 40, cs[(i + seed) % 4])}</g></g>`; });
    return `<svg class="pg-bed" viewBox="0 0 340 280" style="${flip ? 'transform:scaleX(-1)' : ''}">${h}</svg>`;
  }
  // ---------- Tema 11: Adat Jawa (joglo, gunungan, gong, mega mendung) — lapisan dari ilustrasi, masuk bertahap ----------
  const JP = {"hill": [0.0, 647.4, 784.0, 520.6], "house": [12.2, 485.5, 759.6, 411.0], "tree": [-86.3, 561.6, 284.2, 385.3], "bush": [-50.7, 1114.7, 238.5, 95.1], "gunungan": [253.7, 932.0, 286.7, 285.9], "gongL": [58.4, 861.0, 190.3, 288.7], "gongR": [530.3, 896.5, 220.7, 252.2], "cloudL": [59.9, 443.4, 230.9, 115.7], "cloudR": [540.9, 443.4, 210.6, 108.6], "treeR": [581.0, 561.6, 284.2, 385.3], "bushR": [608.9, 1107.1, 238.5, 95.1]};
  const jo = (n, cls) => `<div class="pg-o ${cls}" style="${P(...JP[n])}"><img src="${T}jawa/${n === 'treeR' ? 'tree' : n === 'bushR' ? 'bush' : n}.webp" alt=""></div>`;
  function jawaWorld() {
    const dust = Array.from({ length: 22 }, (_, i) => `<i class="jw-d" style="left:${(6 + R(i, 1) * 88).toFixed(1)}%;--d:${(R(i, 2) * 9).toFixed(1)}s;--t:${(7 + R(i, 3) * 6).toFixed(1)}s;--x:${f1((R(i, 4) - 0.5) * 60)}px;--s:${f1(2 + R(i, 5) * 3)}px"></i>`).join('');
    const rg = (x, y, c) => `<i class="pg-o jw-rg ${c}" style="${P(x - 46, y - 46, 92, 92)}"></i>`;
    return `<div class="pg-w jw">
      ${L('sky', `<div class="pg-o jw-sun" style="${P(282, 230, 220, 220)}"><i class="rays"></i><i class="disc"></i></div>` + stars(14, 2, 34, 11), -1)}
      ${L('cloud', jo('cloudL', 'cl l') + jo('cloudR', 'cl r'), -0.8)}
      ${L('hill', jo('hill', 'hl'), -0.5)}
      ${L('house', jo('house', 'hs'), -0.35)}
      ${L('trees', jo('tree', 'tr l') + jo('treeR', 'tr r mir'), -0.2)}
      ${L('gongs', jo('gongL', 'gg l') + jo('gongR', 'gg r') + rg(155, 1023, 'a') + rg(155, 1023, 'b') + rg(627, 1010, 'c') + rg(627, 1010, 'd'), 0)}
      ${L('gun', jo('gunungan', 'gu'), 0.1)}
      ${L('bush', jo('bush', 'bs l') + jo('bushR', 'bs r mir'), 0.4)}
      <div class="pg-l dust" data-z="0.3">${dust}</div>
      <div class="pg-l fly" data-z="0.5"></div>
    </div>`;
  }

  // ---------- gerak hidup: parallax lembut (desktop), kupu-kupu ----------
  function start(stage) {
    const W = stage && stage.querySelector('.pg-w'); if (!W || W.dataset.on) return; W.dataset.on = 1;
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches; if (reduce) return;
    if (matchMedia('(pointer:fine)').matches) {
      const ls = [...W.querySelectorAll('.pg-l')].map((el) => ({ el, z: +el.dataset.z }));
      let tx = 0, ty = 0, px = 0, py = 0, t0 = performance.now();
      addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
      const tick = (now) => { if (!W.isConnected) return; requestAnimationFrame(tick); if (document.hidden || W.closest('.cin-off')) return; const t = (now - t0) / 1000; px += (tx - px) * 0.04; py += (ty - py) * 0.04; const ix = Math.sin(t * 0.2) * 0.5 + px, iy = Math.cos(t * 0.16) * 0.35 + py; for (const l of ls) l.el.style.translate = `${(-ix * l.z * 0.9).toFixed(2)}cqw ${(-iy * l.z * 0.7).toFixed(2)}cqw`; };
      requestAnimationFrame(tick);
    }
  }
  function flyers(W, sprite, n) {
    const box = W.querySelector('.fly'); if (!box) return;
    for (let i = 0; i < n; i++) {
      const b = document.createElement('div'); b.className = 'rbf pg-bf'; const d = (0.18 + Math.random() * 0.1).toFixed(2);
      b.innerHTML = `<div class="rb-in"><i class="l" style="background-image:url(${T}spr/${sprite}.webp);animation-duration:${d}s"></i><i class="r" style="background-image:url(${T}spr/${sprite}.webp);animation-duration:${d}s"></i></div>`;
      box.appendChild(b);
      let x = i % 2 ? 105 : -10, y = 40 + Math.random() * 30;
      const hop = () => { if (!b.isConnected) return; if (W.closest('.cin-off') || document.hidden) { setTimeout(hop, 1500); return; } const nx = 8 + Math.random() * 80, ny = 22 + Math.random() * 56, a = Math.atan2(ny - y, nx - x) * 57.3 + 90;
        b.animate([{ transform: `translate3d(${f1(x)}cqw,${f1(y * 1.49)}cqw,0) rotate(${f1(a)}deg)` }, { transform: `translate3d(${f1((x + nx) / 2 + (Math.random() - 0.5) * 14)}cqw,${f1(((y + ny) / 2 - 5) * 1.49)}cqw,0) rotate(${f1(a + 20)}deg)`, offset: 0.5 }, { transform: `translate3d(${f1(nx)}cqw,${f1(ny * 1.49)}cqw,0) rotate(${f1(a)}deg)` }], { duration: 3000 + Math.random() * 2200, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => setTimeout(hop, 200 + Math.random() * 1200);
        x = nx; y = ny; };
      setTimeout(hop, 200 + i * 600);
    }
  }

  // ---------- film masuk (dipanggil cinema.js) — waktu dalam ms (sudah dikali kecepatan oleh later) ----------
  function filmAt(stage, later) { // video Air Terjun: menembus gapura → air terjun → bulan terbit → kupu-kupu → bunga → dedaunan
    const W = $('.pg-w', stage); if (!W) return;
    W.classList.add('bld');
    const on = (sel, ms) => later(() => $$(sel, W).forEach((e) => e.classList.add('on')), ms);
    on('.sky,.cliffs,.wf,.pool,.portal', 0);
    later(() => W.classList.add('thru'), 500);       // kamera menembus gapura batu (±1,8 dtk)
    on('.moon', 1900); later(() => W.classList.add('rise'), 2000);  // bulan terbit perlahan dari balik air terjun
    later(() => flyers(W, 'bf_blue1', 1), 3600);
    on('.trees', 3000); on('.mistb', 3600);
    on('.bed', 4300); on('.fol', 5400);
    later(() => flyers(W, 'bf_silver', 1), 6200);
    later(() => W.classList.remove('bld'), 9000);
  }
  function filmJw(stage, later) { // mengikuti video referensi: langit → rumah naik dari bawah (besar lalu menetap) → awan dari samping → pohon → bunga/gunungan naik dari bawah → matahari terbit → gong masuk dari samping → debu emas & kupu-kupu
    const W = $('.pg-w', stage); if (!W) return;
    W.classList.add('bld');
    const on = (sel, ms) => later(() => $$(sel, W).forEach((e) => e.classList.add('on')), ms);
    on('.sky', 0);
    on('.hill', 400); on('.house', 600);          // bukit & joglo naik dari bawah layar, besar lalu mengecil dan menetap
    on('.cloud', 3000);                            // mega mendung meluncur dari kiri-kanan
    on('.trees', 3600);                            // pohon tumbuh di kedua sisi
    on('.gun', 4600); on('.bush', 5000);           // gunungan & semak naik dari bawah
    later(() => W.classList.add('rise'), 6000);    // matahari terbit
    on('.gongs', 7600); later(() => W.classList.add('ring'), 9000); // gong masuk dari samping, lalu dipukul
    on('.dust', 9400);
    later(() => flyers(W, 'bf_gold', 2), 9800);
    later(() => W.classList.remove('bld'), 11000);
  }
  function finish(stage) { const W = $('.pg-w', stage); if (!W) return; W.classList.remove('bld'); W.classList.add('thru', 'rise', 'ring'); $$('.pg-l', W).forEach((l) => l.classList.add('on')); const p = $('.props', W); if (p) p.classList.add('k-cur', 'k-ch', 'k-top', 'k-edge'); if (!$('.pg-bf', W)) flyers(W, W.classList.contains('at') ? 'bf_blue1' : 'bf_pink1', 2); }

  window.LIVEW = Object.assign(window.LIVEW || {}, {
    airterjun: { world: airterjunWorld, start, film: filmAt, finish },
    istana: { world: jawaWorld, start, film: filmJw, finish }, // Tema 11 kini Adat Jawa (kunci 'istana' dipertahankan agar pilihan lama tetap jalan)
  });
  window.PANGGUNG = { lily, bloom5, rose, puff, roseBush, flowerBed, foliage };
})();
