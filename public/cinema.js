/* Sinema hero Tema 3-9 (mengikuti video referensi):
   - kamera tenang: satu gerakan mundur pelan, tetap di dalam adegan sehingga bingkai lukisan TIDAK terlihat selama animasi
   - adegan tersusun bertahap: dedaunan turun dari sudut atas, bunga naik dari bawah, bulan realistis terbit & berputar,
     burung/kupu-kupu terbang, lalu momen khas tema
   - di akhir adegan meredup dan bingkai khas tema digambar garis demi garis berisi nama — adegan di belakang tetap hidup
   - bingkai foto mempelai khas tema: bunga di kiri untuk mempelai pria, di kanan untuk mempelai wanita (dicerminkan) + ornamen tema
   - scroll halus di desktop (roda mouse), di HP tetap scroll asli yang sudah halus */
(function () {
  'use strict';
  const BW = 784, BH = 1168, T = '/assets/t/';
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  // bentuk bingkai dalam kotak 100 x 160
  const SHAPE = {
    arch: 'M6 157 L6 52 C6 22 26 4 50 4 C74 4 94 22 94 52 L94 157 Z',
    oval: 'M50 3 C80 3 96 38 96 80 C96 122 80 157 50 157 C20 157 4 122 4 80 C4 38 20 3 50 3 Z',
    gate: 'M6 157 V60 H14 V48 H23 V37 H32 V26 H40 V15 L50 4 L60 15 V26 H68 V37 H77 V48 H86 V60 H94 V157 Z',
    ogee: 'M6 157 V64 C6 42 20 33 33 27 C44 22 48 15 50 4 C52 15 56 22 67 27 C80 33 94 42 94 64 V157 Z',
    gunungan: 'M8 157 V98 C8 62 22 36 38 18 C44 11 48 7 50 3 C52 7 56 11 62 18 C78 36 92 62 92 98 V157 Z',
    capsule: 'M6 52 C6 22 26 4 50 4 C74 4 94 22 94 52 V108 C94 138 74 156 50 156 C26 156 6 138 6 108 Z',
    shield: 'M50 3 L94 34 V126 L50 157 L6 126 V34 Z',
  };
  const GOLD = ['#fbe7b0', '#c9963e'], SILVER = ['#f4f7ff', '#9fb2d8'], ROSE = ['#ffe3cf', '#d29a6a'];
  const CFG = {
    princess: { cam: [400, 610, 1.26], frame: 'arch', metal: ROSE, fill: ['rgba(255,246,250,.72)', 'rgba(255,226,238,.5)'], ink: '#a33d66', ink2: '#9b5a2a', orn: T + 'princess/orn.webp', ornB: T + 'princess/divider.webp', side: T + 'princess/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(255,244,248,.62),rgba(255,214,232,.32) 62%,rgba(140,50,90,.2))', reveal: 'bloom', noFog: 1, noCx: 1, pfOrn: T + 'princess/orn.webp' },
    bali: { cam: [420, 640, 1.35], frame: 'gate', metal: GOLD, fill: ['rgba(255,248,232,.74)', 'rgba(250,236,206,.5)'], ink: '#6a3a0e', ink2: '#8a5a1e', orn: T + 'bali/orn.webp', ornB: T + 'bali/divider.webp', side: T + 'bali/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(255,250,236,.6),rgba(255,236,200,.3) 60%,rgba(80,50,10,.25))', reveal: 'mist', pfOrn: T + 'bali/orn.webp' },
    emas: { cam: [430, 620, 1.4], frame: 'arch', metal: GOLD, fill: ['rgba(46,22,4,.62)', 'rgba(24,10,2,.4)'], ink: '#f8dc96', ink2: '#f1cf86', orn: '/assets/scene/gunungan.webp', ornB: T + 'emas/divider.webp', side: T + 'emas/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(40,18,2,.55),rgba(30,12,2,.35) 60%,rgba(10,4,0,.5))', reveal: 'gold', noFog: 1, pfOrn: '/assets/scene/gunungan.webp', dark: 1 },
    biru: { cam: [392, 600, 1.25], frame: 'oval', metal: SILVER, fill: ['rgba(10,22,60,.66)', 'rgba(6,14,44,.42)'], ink: '#ead8a6', ink2: '#dfe8ff', orn: T + 'biru/divider.webp', ornB: T + 'biru/divider.webp', side: T + 'biru/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(6,16,48,.6),rgba(6,14,44,.4) 60%,rgba(2,6,24,.6))', moon: [392, 418, 82, 'blue'], reveal: 'moon', pfOrn: T + 'biru/divider.webp', dark: 1 },
    rimba: { cam: [430, 650, 1.55], frame: 'capsule', metal: GOLD, fill: ['rgba(6,18,40,.64)', 'rgba(4,12,30,.42)'], ink: '#f5d98c', ink2: '#e8eefc', orn: T + 'rimba/divider.webp', ornB: T + 'rimba/divider.webp', side: T + 'rimba/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(4,12,34,.6),rgba(4,10,30,.38) 60%,rgba(0,4,16,.6))', reveal: 'firefly', pfOrn: T + 'rimba/divider.webp', dark: 1 },
    klasik: { cam: [400, 640, 1.35], frame: 'gunungan', metal: GOLD, fill: ['rgba(40,18,4,.66)', 'rgba(20,8,2,.44)'], ink: '#f2d391', ink2: '#e8c886', orn: '/assets/scene/gunungan.webp', ornB: T + 'klasik/divider.webp', side: T + 'klasik/orn.webp', veil: 'radial-gradient(ellipse at 50% 44%,rgba(40,16,2,.5),rgba(24,10,2,.36) 60%,rgba(8,3,0,.6))', reveal: 'kelir', pfOrn: '/assets/scene/gunungan.webp', dark: 1 },
    airterjun: { cam: [392, 584, 1], frame: 'oval', grow: 1, metal: SILVER, fill: ['rgba(10,18,58,.88)', 'rgba(8,14,46,.8)'], ink: '#e8c27a', ink2: '#dfe6ff', orn: 'fili', ornB: 'fili', veil: 'radial-gradient(ellipse at 50% 50%,rgba(6,12,40,.35),rgba(4,8,30,.55))', pfOrn: T + 'biru/divider.webp', noDeco: 1, dark: 1, t: [7800, 8000, 13000], pfShape: 'oval' },
    istana: { cam: [392, 584, 1], frame: 'none', metal: GOLD, fill: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)'], ink: '#fff2f6', ink2: '#ffe6ee', orn: '', ornB: '', veil: 'linear-gradient(180deg,rgba(60,6,24,.25),rgba(80,10,34,.55) 40%,rgba(60,6,24,.6))', pfOrn: T + 'princess/orn.webp', noDeco: 1, dark: 1, t: [11000, 11400, 14200], pfShape: 'capsule' },
    dayak: { cam: [392, 640, 1.0], frame: 'shield', metal: GOLD, fill: ['rgba(26,12,6,.62)', 'rgba(14,6,2,.4)'], ink: '#ffd98a', ink2: '#f6e6c4', orn: T + 'dayak/orn.webp', ornB: T + 'dayak/divider.webp', side: T + 'dayak/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(255,240,214,.3),rgba(80,40,10,.25) 60%,rgba(30,12,4,.45))', reveal: 'motif', pfOrn: T + 'dayak/orn.webp', noDeco: 1, dark: 1 , t: [9000, 9400, 11600] },
  };
  // properti panggung ala video: tirai dari samping, lampu gantung turun, pilar naik — gaya & warna khas tiap tema
  const PROPS = {
    princess: { cur: ['#f6b9cf', '#d97a9f', '#9c3f66'], trim: '#e9c46a', chand: 'crystal', pil: ['#fff7f2', '#e9d6cf', '#c9a9a0'], vine: 'rose' },
    bali: { cur: ['#f3d27a', '#c9952e', '#7a5214'], trim: '#fff0b8', chand: 'lantern', pil: ['#efe0c4', '#c9ac80', '#8a6a40'], vine: 'frangi' },
    emas: { cur: ['#e9b85a', '#a8741a', '#5c3a08'], trim: '#fff0b8', chand: 'robyong', pil: ['#f1d58a', '#b8862c', '#6a4a10'], vine: 'jasmine' },
    biru: { cur: ['#5f86d8', '#2c4a9a', '#13245a'], trim: '#dfe8ff', chand: '', pil: ['#f4f7ff', '#b9c6e6', '#7286b8'], vine: 'white' },
    rimba: { cur: ['#2f8a86', '#165a5c', '#0a2e34'], trim: '#e8c46a', chand: 'lantern', pil: ['#e8d29a', '#a8843a', '#5a4214'], vine: 'vine' },
    klasik: { cur: ['#8a1f14', '#5a1008', '#2a0604'], trim: '#e2b552', chand: 'robyong', pil: ['#8a5428', '#5a3416', '#2e1a08'], vine: '' },
  };
  let key = null, cfg = null;
  const set = (k) => { key = k; cfg = CFG[k] || null; return cfg; };

  // ---------- definisi clip-path (objectBoundingBox) untuk foto & kaca bingkai ----------
  function defs() {
    if ($('#cin-defs')) return;
    const toBox = (d) => d.replace(/([MLCVHZQ])|(-?[\d.]+)/g, (m, c, n) => c || m); // dipakai apa adanya; skala via transform
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'cin-defs'; s.setAttribute('width', 0); s.setAttribute('height', 0); s.style.position = 'absolute';
    s.innerHTML = '<defs>' + Object.keys(SHAPE).map((k) => `<clipPath id="cfc-${k}" clipPathUnits="objectBoundingBox"><path transform="scale(.01 .00625)" d="${toBox(SHAPE[k])}"/></clipPath>`).join('') + '</defs>';
    document.body.appendChild(s);
  }
  const fili = (flip) => `<svg class="cf-orn ${flip ? 'b' : 't'} fili" viewBox="0 0 200 60"><defs><linearGradient id="fg${flip ? 'b' : 't'}" x1="0" x2="1"><stop offset="0" stop-color="#9fb2d8"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#9fb2d8"/></linearGradient></defs><g fill="none" stroke="url(#fg${flip ? 'b' : 't'})" stroke-width="1.6" stroke-linecap="round" transform="${flip ? 'translate(0 60) scale(1 -1)' : ''}">
    ${[1, -1].map((d) => `<g transform="translate(100 30) scale(${d} 1)"><path d="M8 0 C20 -14 40 -14 46 -4 C50 4 42 10 36 6 C32 3 36 -2 39 0"/><path d="M14 4 C30 16 56 14 70 4 C80 -2 90 -2 96 4"/><path d="M46 -4 C56 -18 74 -18 80 -10"/><circle cx="96" cy="4" r="2" fill="#fff"/><path d="M22 -8 C26 -18 34 -20 38 -16"/></g>`).join('')}
    <path d="M100 18 L106 30 L100 42 L94 30Z" fill="#fff" stroke="none"/></g></svg>`;
  const inner = (d) => `<path class="cf-l i" pathLength="1" d="${d}" transform="translate(50 80) scale(.925 .955) translate(-50 -80)"/>`;
  const lineSvg = (shape, id) => `<svg class="cf-svg" viewBox="-2 -2 104 164"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cfg.metal[0]}"/><stop offset=".5" stop-color="${cfg.metal[1]}"/><stop offset="1" stop-color="${cfg.metal[0]}"/></linearGradient></defs>
    <g fill="none" stroke="url(#${id})"><path class="cf-l o" pathLength="1" d="${SHAPE[shape]}"/>${inner(SHAPE[shape])}</g></svg>`;

  // ---------- kamera ----------
  function camT(stage, x, y, s) {
    const box = $('.pbox', stage), vw = stage.clientWidth, vh = stage.clientHeight, bw = box.offsetWidth, bh = box.offsetHeight;
    let dx = x / BW * bw - bw / 2, dy = y / BH * bh - bh / 2;
    const mx = Math.max(0, bw / 2 - vw / (2 * s)), my = Math.max(0, bh / 2 - vh / (2 * s));
    dx = Math.max(-mx, Math.min(mx, dx)); dy = Math.max(-my, Math.min(my, dy));
    return `translate(${(-s * dx).toFixed(1)}px,${(-s * dy).toFixed(1)}px) scale(${s})`;
  }

  // ---------- gambar properti panggung (SVG) ----------
  function curtainSvg(P, id) {
    const [a, b, c] = P.cur;
    const folds = Array.from({ length: 7 }, (_, i) => { const x0 = 14 + i * 26, x1 = 8 + i * 9, x2 = 20 + i * 20; return `<path d="M${x0} 40 C${x0} 300 ${x1} 520 ${x1 + 4} 640 C${x1 + 8} 760 ${x2} 900 ${x2 + 6} 1000" stroke="${c}" stroke-width="${i % 2 ? 7 : 4}" opacity=".35" fill="none"/>`; }).join('');
    return `<svg class="cp-cur" viewBox="0 0 220 1000" preserveAspectRatio="none"><defs>
      <linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${b}"/><stop offset=".25" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset=".75" stop-color="${a}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>
      <path d="M0 0 H210 C206 200 150 420 70 620 C120 720 170 860 190 1000 H0Z" fill="url(#${id})"/>${folds}
      <path d="M0 0 H210 C206 200 150 420 70 620 C120 720 170 860 190 1000 H0Z" fill="url(#${id}v)"/>
      <path d="M210 0 C206 200 150 420 70 620 C120 720 170 860 190 1000" stroke="${P.trim}" stroke-width="5" fill="none"/>
      <path d="M0 0 H220 V46 C190 70 150 70 110 52 C70 70 30 70 0 46Z" fill="${b}"/><path d="M0 46 C30 70 70 70 110 52 C150 70 190 70 220 46" stroke="${P.trim}" stroke-width="4" fill="none"/>
      ${Array.from({ length: 11 }, (_, i) => `<circle cx="${10 + i * 20}" cy="${58 + Math.abs(5 - i) * 0.8}" r="3.2" fill="${P.trim}"/>`).join('')}
      <path d="M40 606 Q80 590 100 626 Q80 650 40 640Z" fill="${P.trim}"/><path d="M96 622 L104 700 L88 700Z" fill="${P.trim}"/>${[0, 1, 2, 3].map((i) => `<path d="M${90 + i * 4} 700 V${740 + (i % 2) * 8}" stroke="${P.trim}" stroke-width="2"/>`).join('')}</svg>`;
  }
  function chandSvg(P, id) {
    const g = P.trim, glow = `<radialGradient id="${id}g"><stop offset="0" stop-color="#fff8d8" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd890" stop-opacity=".35"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>`;
    const flame = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="7" fill="#fff4c0"/><ellipse cx="${x}" cy="${y + 1}" rx="2" ry="4" fill="#ffb84a"/>`;
    if (P.chand === 'lantern') return `<svg class="cp-ch" viewBox="0 0 200 300"><defs>${glow}</defs><circle cx="100" cy="200" r="95" fill="url(#${id}g)"/>
      <path d="M100 0 V120" stroke="${g}" stroke-width="2.4"/><path d="M70 120 H130 L120 140 H80Z" fill="${g}"/>
      <path d="M72 140 C60 180 60 230 76 262 H124 C140 230 140 180 128 140Z" fill="${P.cur[1]}" opacity=".85" stroke="${g}" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${84 + i * 11} 142 C${80 + i * 13} 190 ${80 + i * 13} 230 ${86 + i * 10} 260" stroke="${g}" stroke-width="1.6" fill="none" opacity=".8"/>`).join('')}
      <ellipse cx="100" cy="200" rx="22" ry="34" fill="#fff0b8" opacity=".85"/>${flame(100, 200)}<path d="M80 262 H120 L110 280 H90Z" fill="${g}"/><path d="M100 280 V300" stroke="${g}" stroke-width="2"/><circle cx="100" cy="300" r="4" fill="${P.cur[0]}"/></svg>`;
    const crystal = P.chand === 'crystal';
    const drops = (cx, cy, n, r) => Array.from({ length: n }, (_, i) => { const a = Math.PI * (i / (n - 1)), x = cx - Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.32; return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} v8" stroke="${crystal ? '#e8f2ff' : g}" stroke-width="1"/><path d="M${x.toFixed(1)} ${(y + 8).toFixed(1)} l3 5 l-3 5 l-3 -5z" fill="${crystal ? '#ffffff' : g}" opacity=".95"/>`; }).join('');
    return `<svg class="cp-ch" viewBox="0 0 200 240"><defs>${glow}</defs><circle cx="100" cy="150" r="100" fill="url(#${id}g)"/>
      <path d="M100 0 V96" stroke="${g}" stroke-width="2.6"/><circle cx="100" cy="96" r="8" fill="${g}"/>
      <path d="M100 104 C60 104 30 120 26 146 M100 104 C140 104 170 120 174 146 M100 104 C76 110 60 124 58 142 M100 104 C124 110 140 124 142 142" stroke="${g}" stroke-width="3" fill="none"/>
      <path d="M40 150 Q100 182 160 150" stroke="${g}" stroke-width="3.4" fill="none"/>${drops(100, 150, 15, 64)}${drops(100, 128, 9, 38)}
      ${[26, 58, 100, 142, 174].map((x, i) => `<rect x="${x - 3}" y="${i % 2 ? 128 : 132}" width="6" height="16" fill="#fff8e6"/>${flame(x, i % 2 ? 120 : 124)}`).join('')}
      <path d="M100 110 V196" stroke="${g}" stroke-width="5"/><path d="M86 196 Q100 222 114 196Z" fill="${g}"/>${P.chand === 'robyong' ? `<path d="M100 196 l10 14 l-10 14 l-10 -14z" fill="${P.cur[0]}" stroke="${g}"/>` : `<path d="M100 214 l6 9 l-6 9 l-6 -9z" fill="#fff"/>`}</svg>`;
  }
  function pillarSvg(P, id) {
    const [a, b, c] = P.pil;
    const vine = P.vine === 'rose' ? ['#f39ab8', '#c94a76'] : P.vine === 'frangi' || P.vine === 'jasmine' || P.vine === 'white' ? ['#fffaf0', '#e8c46a'] : P.vine === 'vine' ? ['#ffd86a', '#2f6a3a'] : null;
    const flowers = vine ? Array.from({ length: 9 }, (_, i) => { const y = 120 + i * 92, x = 40 + Math.sin(i * 1.7) * 22; return `<path d="M40 ${y - 46} Q${x + 10} ${y - 20} ${x} ${y}" stroke="#3f6f32" stroke-width="2.4" fill="none"/><ellipse cx="${x - 9}" cy="${y - 10}" rx="7" ry="3.4" fill="#4f8a45" transform="rotate(-30 ${x - 9} ${y - 10})"/><circle cx="${x}" cy="${y}" r="${7 + (i % 3)}" fill="${vine[0]}"/><circle cx="${x}" cy="${y}" r="3" fill="${vine[1]}"/>`; }).join('') : '';
    return `<svg class="cp-pil" viewBox="0 0 80 1000" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${c}"/><stop offset=".3" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
      <rect x="2" y="0" width="76" height="40" fill="url(#${id})"/><path d="M0 40 H80 L72 60 H8Z" fill="url(#${id})"/><path d="M6 20 Q20 4 34 20 M46 20 Q60 4 74 20" stroke="${c}" stroke-width="3" fill="none"/>
      <rect x="12" y="60" width="56" height="880" fill="url(#${id})"/>${[22, 33, 44, 55].map((x) => `<path d="M${x} 66 V934" stroke="${c}" stroke-width="2" opacity=".45"/>`).join('')}
      <path d="M8 940 H72 L80 966 H0Z" fill="url(#${id})"/><rect x="0" y="966" width="80" height="34" fill="url(#${id})"/>${flowers}</svg>`;
  }
  // ---------- bangun lapisan sinema di panggung hero ----------
  function build(stage, data) {
    if ($('.cin-veil', stage)) return;
    defs();
    const hero = stage.closest('.hero'); hero.classList.add('cine', 'cine-' + key);
    const pbox = $('.pbox', stage), cam = $('.pcam', stage);
    if (cfg.moon) {
      const [x, y, r, tint] = cfg.moon, m = document.createElement('div'); m.className = 'cin-moon ' + tint;
      m.style.cssText = `left:${((x - r) / BW * 100).toFixed(3)}%;top:${((y - r) / BH * 100).toFixed(3)}%;width:${(r * 2 / BW * 100).toFixed(3)}%`;
      m.innerHTML = '<i class="mh"></i><div class="mt"><img src="' + T + 'fx/moon.webp" alt=""></div><i class="ms"></i>';
      const fx = $('.pfxl', pbox); (fx || pbox).prepend(m);
    }
    // air terjun bercahaya (lebih cerah, berpendar)
    const pt = window.PIC_THEMES[key];
    if (pt && pt.wf && pt.wf.length) {
      const wl = document.createElement('div'); wl.className = 'cin-wfl' + (key === 'biru' || key === 'rimba' ? ' night' : '');
      wl.innerHTML = pt.wf.map(([x, y, w, h]) => `<div class="cin-wf" style="left:${(x / BW * 100).toFixed(3)}%;top:${(y / BH * 100).toFixed(3)}%;width:${(w / BW * 100).toFixed(3)}%;height:${(h / BH * 100).toFixed(3)}%"><i class="g"></i><i class="s"></i><i class="s b"></i><i class="m"></i></div>`).join('');
      const fx = $('.pfxl', pbox); if (fx) fx.after(wl); else pbox.appendChild(wl);
    }
    const veil = document.createElement('div'); veil.className = 'cin-veil'; veil.style.background = cfg.veil; cam.after(veil);
    const P = PROPS[key];
    if (P) {
      const pr = document.createElement('div'); pr.className = 'cin-props';
      pr.innerHTML = `<div class="cpz pil l">${pillarSvg(P, 'cpp1' + key)}</div><div class="cpz pil r">${pillarSvg(P, 'cpp2' + key)}</div>
        <div class="cpz cur l">${curtainSvg(P, 'cpc1' + key)}</div><div class="cpz cur r">${curtainSvg(P, 'cpc2' + key)}</div>
        ${P.chand ? `<div class="cpz ch"><div class="cp-sw">${chandSvg(P, 'cpch' + key)}</div></div>` : ''}`;
      veil.after(pr);
    }
    if (!cfg.noDeco) {
      const d = document.createElement('div'); d.className = 'cin-deco';
      const t = window.PIC_THEMES[key].deco;
      d.innerHTML = `<i class="cc dtl" style="background-image:url(${t.floralTop})"></i><i class="cc dtr" style="background-image:url(${t.floralTop})"></i><i class="cc dbl" style="background-image:url(${t.floralBottom})"></i><i class="cc dbr" style="background-image:url(${t.floralBottom})"></i>`;
      ($('.cin-props', stage) || veil).after(d);
    }
    const f = document.createElement('div'); f.className = 'cin-frame f-' + cfg.frame + (cfg.dark ? ' dark' : '') + (cfg.grow ? ' grow' : '');
    f.style.cssText = `--ink:${cfg.ink};--ink2:${cfg.ink2};--m0:${cfg.metal[0]};--m1:${cfg.metal[1]};--f0:${cfg.fill[0]};--f1:${cfg.fill[1]}`;
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    f.innerHTML = `${cfg.frame === 'none' ? '' : `<div class="cf-glass" style="clip-path:url(#cfc-${cfg.frame})"></div>${lineSvg(cfg.frame, 'cfg-' + key)}`}
      ${cfg.orn === 'fili' ? fili(0) + fili(1) : cfg.orn ? `<img class="cf-orn t" src="${cfg.orn}" alt=""><img class="cf-orn b" src="${cfg.ornB}" alt="">` : ''}
      <div class="cf-in"><div class="cf-k">${esc(data.kicker)}</div><div class="cf-n"><span>${esc(data.groom)}</span><i>&amp;</i><span>${esc(data.bride)}</span></div>
        <div class="cf-d">${esc(data.date)}</div><div class="cf-h">${esc(data.hashtag)}</div>${data.guest ? `<div class="cf-g"><span>${esc(data.toLabel)}</span><b>${esc(data.guest)}</b></div>` : ''}</div>`;
    ($('.cin-deco', stage) || veil).after(f);
    const fit = () => { const vw = stage.clientWidth, vh = stage.clientHeight, w = Math.min(vw * 0.8, vh * 0.66 / 1.6, 400); f.style.width = w + 'px'; f.style.height = w * 1.6 + 'px'; };
    fit(); addEventListener('resize', fit, { passive: true });
  }

  // ---------- film ----------
  function film(stage, o) {
    if (!set(o.key)) return false;
    build(stage, o.data);
    const D = o.D, cd = o.cd || 0, cam = $('.pcam', stage), hero = stage.closest('.hero');
    const LW = window.LIVEW && window.LIVEW[key], own = !!(LW && LW.film), TT = cfg.t || [9300, 9600, 11900];
    const [x, y, s] = cfg.cam, s0 = own ? s : s * (key === 'dayak' ? 1.08 : 1.12);
    const later = (fn, ms) => o.later(fn, cd + ms * D);
    const from = camT(stage, x, y + 26, s0), to = camT(stage, x, y, s);
    cam.style.transform = from;
    const camAnim = cam.animate([{ transform: from }, { transform: to }], { duration: 8600 * D, delay: cd, easing: 'cubic-bezier(.33,0,.18,1)', fill: 'both' });
    const deco = $('.cin-deco', stage), moon = $('.cin-moon', stage), veil = $('.cin-veil', stage), frame = $('.cin-frame', stage);
    const props = $('.cin-props', stage);
    if (own) LW.film(stage, later);
    if (key === 'dayak') { // dunia vektor: tiap lapisan muncul bergantian (langit, awan, gunung, bukit, sungai, pohon, lamin, penari, semak)
      const w = $('.dk-w', stage), ls = w ? $$('.dk-l', w).filter((l) => !/fly/.test(l.className)) : [];
      if (w) { w.classList.add('bld'); ls.forEach((l, i) => later(() => l.classList.add('on'), 150 + i * 520)); later(() => w.classList.remove('bld'), 150 + ls.length * 520 + 2600); }
    }
    // adegan muncul alami: kabut tersingkap dari jauh ke dekat (mengikuti peta kedalaman) sambil kamera bergeser 3D
    const G = window.__picG, pt = window.PIC_THEMES[key], fogMs = 5000 * D, noFog = !!cfg.noFog;
    if (G && !pt.live) {
      G.fog = noFog ? -1 : 1.2; G.A = 0.17; G.orb = [-0.03, 0.012];
      const t0 = performance.now() + cd, total = 9000 * D;
      const ez = (u) => 1 - Math.pow(1 - u, 3);
      const step = (now) => {
        const u = Math.max(0, (now - t0) / total), f = Math.min(1, Math.max(0, (now - t0) / fogMs));
        G.fog = noFog || f >= 1 ? -1 : 1.2 - 1.45 * (f * f * (3 - 2 * f));
        G.A = 0.17 - (0.17 - 0.05) * ez(Math.min(1, u)); const o = 1 - ez(Math.min(1, u));
        G.orb = [-0.03 * o, 0.012 * o];
        if (u < 1 && !stage._cinStop) requestAnimationFrame(step); else { G.fog = -1; G.A = 0.05; G.orb = [0, 0]; }
      };
      requestAnimationFrame(step);
      // tanpa WebGL: kabut biasa yang memudar
      if (!noFog) later(() => { if (!G.ok) { const f = document.createElement('div'); f.className = 'cin-fogcss' + (pt.dark ? ' dark' : ''); $('.pbox', stage).appendChild(f); requestAnimationFrame(() => f.classList.add('go')); setTimeout(() => f.remove(), 7000 * D); } }, 0);
    }
    // urutan bertahap (tidak bersamaan): 1) adegan tersusun & hidup  2) bunga sudut  3) pilar → tirai → lampu gantung  4) bingkai nama
    later(() => { const w = $('.cin-wfl', stage); if (w) w.classList.add('in'); }, 4200);
    later(() => moon && moon.classList.add('in'), 400);
    if (!own) { later(() => o.fire('birds'), 1500); later(() => o.fire('bf'), 2700); later(() => o.fire('petals'), 3500); if (!cfg.noCx) later(() => o.fire('cx'), 4300); }
    const PS = cfg.ps || [5000, 5800, 6800, 7800];
    later(() => deco && deco.classList.add('in'), PS[0]);
    later(() => props && props.classList.add('p1'), PS[1]);
    later(() => props && props.classList.add('p2'), PS[2]);
    later(() => props && props.classList.add('p3'), PS[3]);
    later(() => veil.classList.add('in'), TT[0]);
    later(() => frame.classList.add('in'), TT[1]);
    let ended = false;
    const end = (skip) => {
      if (ended) return; ended = true;
      if (skip) { const dw = $('.dk-w', stage); if (dw) dw.classList.remove('bld'); try { camAnim.finish(); } catch (e) { /* */ } [deco, moon, veil, frame].forEach((e) => e && e.classList.add('in', 'inst')); if (props) props.classList.add('p1', 'p2', 'p3', 'inst'); stage._cinStop = 1; const G2 = window.__picG; if (G2) { G2.fog = -1; G2.A = 0.05; G2.orb = [0, 0]; } const w = $('.cin-wfl', stage); if (w) w.classList.add('in'); }
      if (skip && own && LW.finish) LW.finish(stage);
      try { camAnim.commitStyles(); } catch (e) { /* */ } camAnim.cancel(); cam.style.transform = camT(stage, x, y, s);
      keep(stage); o.onEnd();
    };
    later(() => end(false), TT[2]);
    return { end };
  }
  // posisi akhir (pratinjau admin, tanpa animasi, tombol lewati)
  function final(stage, o) {
    if (!set(o.key)) return false;
    stage.dataset.cinFinal = 1;
    build(stage, o.data);
    $$('.cin-deco,.cin-moon,.cin-veil,.cin-frame', stage).forEach((e) => e.classList.add('in', 'inst'));
    $$('.cin-props', stage).forEach((e) => e.classList.add('p1', 'p2', 'p3', 'inst')); $$('.cin-wfl', stage).forEach((e) => e.classList.add('in'));
    $('.pcam', stage).style.transform = camT(stage, cfg.cam[0], cfg.cam[1], cfg.cam[2]);
    const LW = window.LIVEW && window.LIVEW[key]; if (LW && LW.finish) LW.finish(stage);
    keep(stage); return true;
  }
  function keep(stage) {
    // hemat HP: semua animasi di hero dijeda saat hero tidak terlihat
    if ('IntersectionObserver' in window && !stage._io) { const h = stage.closest('.hero'); stage._io = new IntersectionObserver((e) => h.classList.toggle('cin-off', !e[0].isIntersecting)); stage._io.observe(h); } // kamera tetap di dalam adegan (bingkai lukisan tidak terlihat), ikut menyesuaikan saat ukuran layar berubah
    if (stage._keep) return; stage._keep = 1;
    addEventListener('resize', () => { const c = $('.pcam', stage); if (c && cfg) c.style.transform = camT(stage, cfg.cam[0], cfg.cam[1], cfg.cam[2]); }, { passive: true });
  }

  // ---------- bingkai foto mempelai ----------
  // side: 'l' = bunga di kiri (mempelai pria), 'r' = bunga di kanan (mempelai wanita)
  function pframe(k, photoHtml, side, flower) {
    if (!set(k)) return '';
    defs();
    // bingkai sederhana seperti contoh: kapsul/lengkung garis emas tipis, ukuran mengikuti foto, bunga kecil di sisi luar
    const sh = cfg.pfShape || { biru: 'oval', emas: 'capsule', rimba: 'capsule' }[k] || 'arch', id = 'pfg' + side + k;
    const svg = `<svg class="pf-svg" viewBox="-2 -2 104 164" preserveAspectRatio="none"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cfg.metal[0]}"/><stop offset=".5" stop-color="${cfg.metal[1]}"/><stop offset="1" stop-color="${cfg.metal[0]}"/></linearGradient></defs>
      <g fill="none" stroke="url(#${id})" vector-effect="non-scaling-stroke"><path d="${SHAPE[sh]}" stroke-width="2.2" vector-effect="non-scaling-stroke"/><path d="${SHAPE[sh]}" transform="translate(50 80) scale(.94 .965) translate(-50 -80)" stroke-width="1" vector-effect="non-scaling-stroke" opacity=".8"/></g></svg>`;
    return `<div class="pf pf-${sh} pf-${side} pf-${k}${cfg.dark ? ' dark' : ''} rv" data-a="pf" style="--m0:${cfg.metal[0]};--m1:${cfg.metal[1]}">
      <div class="pf-ph" style="clip-path:url(#cfc-${sh})"><div class="phb">${photoHtml}</div></div>${svg}
      <img class="pf-orn" src="${cfg.pfOrn}" alt="">
      <div class="pf-fl a"><img src="${flower}" alt=""></div><div class="pf-fl b"><img src="${flower}" alt=""></div></div>`;
  }

  // ---------- scroll halus (desktop, roda mouse) ----------
  (function smooth() {
    if (reduce || !matchMedia('(pointer:fine)').matches) return;
    let target = scrollY, cur = scrollY, raf = 0, mine = false;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const step = () => {
      cur += (target - cur) * 0.09;
      if (Math.abs(target - cur) < 0.4) cur = target;
      mine = true; scrollTo(0, cur);
      raf = cur !== target ? requestAnimationFrame(step) : 0;
    };
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || document.body.classList.contains('locked') || document.documentElement.classList.contains('locked')) return;
      if (e.target.closest && e.target.closest('textarea,select,.lb:not([hidden]),.gslider,iframe')) return;
      const lb = document.getElementById('lightbox'); if (lb && !lb.hidden) return;
      e.preventDefault();
      if (!raf) cur = target = scrollY;
      target = Math.max(0, Math.min(max(), target + e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1)));
      if (!raf) raf = requestAnimationFrame(step);
    }, { passive: false });
    addEventListener('scroll', () => { if (mine) { mine = false; return; } if (!raf) cur = target = scrollY; }, { passive: true });
  })();

  window.CINEMA = { CFG, SHAPE, film, final, pframe, svg: { curtainSvg, chandSvg }, prep: () => {}, has: (k) => !!CFG[k] };
})();
