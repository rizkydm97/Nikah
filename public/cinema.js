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
    princess: { cam: [400, 610, 1.26], frame: 'arch', metal: ROSE, fill: ['rgba(255,246,250,.72)', 'rgba(255,226,238,.5)'], ink: '#a33d66', ink2: '#9b5a2a', orn: T + 'princess/orn.webp', ornB: T + 'princess/divider.webp', side: T + 'princess/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(255,244,248,.62),rgba(255,214,232,.32) 62%,rgba(140,50,90,.2))', reveal: 'bloom', pfOrn: T + 'princess/orn.webp' },
    bali: { cam: [420, 640, 1.35], frame: 'gate', metal: GOLD, fill: ['rgba(255,248,232,.74)', 'rgba(250,236,206,.5)'], ink: '#6a3a0e', ink2: '#8a5a1e', orn: T + 'bali/orn.webp', ornB: T + 'bali/divider.webp', side: T + 'bali/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(255,250,236,.6),rgba(255,236,200,.3) 60%,rgba(80,50,10,.25))', reveal: 'mist', pfOrn: T + 'bali/orn.webp' },
    emas: { cam: [430, 620, 1.4], frame: 'ogee', metal: GOLD, fill: ['rgba(46,22,4,.62)', 'rgba(24,10,2,.4)'], ink: '#f8dc96', ink2: '#f1cf86', orn: '/assets/scene/gunungan.webp', ornB: T + 'emas/divider.webp', side: T + 'emas/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(40,18,2,.55),rgba(30,12,2,.35) 60%,rgba(10,4,0,.5))', reveal: 'gold', pfOrn: '/assets/scene/gunungan.webp', dark: 1 },
    biru: { cam: [392, 600, 1.25], frame: 'oval', metal: SILVER, fill: ['rgba(10,22,60,.66)', 'rgba(6,14,44,.42)'], ink: '#ead8a6', ink2: '#dfe8ff', orn: T + 'biru/divider.webp', ornB: T + 'biru/divider.webp', side: T + 'biru/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(6,16,48,.6),rgba(6,14,44,.4) 60%,rgba(2,6,24,.6))', moon: [392, 292, 92, 'blue'], reveal: 'moon', pfOrn: T + 'biru/divider.webp', dark: 1 },
    rimba: { cam: [430, 650, 1.55], frame: 'capsule', metal: GOLD, fill: ['rgba(6,18,40,.64)', 'rgba(4,12,30,.42)'], ink: '#f5d98c', ink2: '#e8eefc', orn: T + 'rimba/divider.webp', ornB: T + 'rimba/divider.webp', side: T + 'rimba/divider.webp', veil: 'radial-gradient(ellipse at 50% 48%,rgba(4,12,34,.6),rgba(4,10,30,.38) 60%,rgba(0,4,16,.6))', moon: [475, 385, 76, 'pale'], reveal: 'firefly', pfOrn: T + 'rimba/divider.webp', dark: 1 },
    klasik: { cam: [400, 640, 1.35], frame: 'gunungan', metal: GOLD, fill: ['rgba(40,18,4,.66)', 'rgba(20,8,2,.44)'], ink: '#f2d391', ink2: '#e8c886', orn: '/assets/scene/gunungan.webp', ornB: T + 'klasik/divider.webp', side: T + 'klasik/orn.webp', veil: 'radial-gradient(ellipse at 50% 44%,rgba(40,16,2,.5),rgba(24,10,2,.36) 60%,rgba(8,3,0,.6))', reveal: 'kelir', pfOrn: '/assets/scene/gunungan.webp', dark: 1 },
    dayak: { cam: [392, 640, 1.0], frame: 'shield', metal: GOLD, fill: ['rgba(26,12,6,.62)', 'rgba(14,6,2,.4)'], ink: '#ffd98a', ink2: '#f6e6c4', orn: T + 'dayak/orn.webp', ornB: T + 'dayak/divider.webp', side: T + 'dayak/orn.webp', veil: 'radial-gradient(ellipse at 50% 46%,rgba(255,240,214,.3),rgba(80,40,10,.25) 60%,rgba(30,12,4,.45))', reveal: 'motif', pfOrn: T + 'dayak/orn.webp', noDeco: 1, dark: 1 },
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
    const veil = document.createElement('div'); veil.className = 'cin-veil'; veil.style.background = cfg.veil; cam.after(veil);
    if (!cfg.noDeco) {
      const d = document.createElement('div'); d.className = 'cin-deco';
      const t = window.PIC_THEMES[key].deco;
      d.innerHTML = `<i class="cc tl" style="background-image:url(${t.floralTop})"></i><i class="cc tr" style="background-image:url(${t.floralTop})"></i><i class="cc bl" style="background-image:url(${t.floralBottom})"></i><i class="cc br" style="background-image:url(${t.floralBottom})"></i>`;
      veil.after(d);
    }
    const f = document.createElement('div'); f.className = 'cin-frame f-' + cfg.frame + (cfg.dark ? ' dark' : '');
    f.style.cssText = `--ink:${cfg.ink};--ink2:${cfg.ink2};--m0:${cfg.metal[0]};--m1:${cfg.metal[1]};--f0:${cfg.fill[0]};--f1:${cfg.fill[1]}`;
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    f.innerHTML = `<div class="cf-glass" style="clip-path:url(#cfc-${cfg.frame})"></div>${lineSvg(cfg.frame, 'cfg-' + key)}
      <img class="cf-orn t" src="${cfg.orn}" alt=""><img class="cf-orn b" src="${cfg.ornB}" alt="">
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
    const [x, y, s] = cfg.cam, s0 = s * (key === 'dayak' ? 1.08 : 1.12);
    const later = (fn, ms) => o.later(fn, cd + ms * D);
    const from = camT(stage, x, y + 26, s0), to = camT(stage, x, y, s);
    cam.style.transform = from;
    const camAnim = cam.animate([{ transform: from }, { transform: to }], { duration: 8600 * D, delay: cd, easing: 'cubic-bezier(.33,0,.18,1)', fill: 'both' });
    const deco = $('.cin-deco', stage), moon = $('.cin-moon', stage), veil = $('.cin-veil', stage), frame = $('.cin-frame', stage);
    later(() => deco && deco.classList.add('in'), 300);
    later(() => moon && moon.classList.add('in'), 400);
    later(() => o.fire('birds'), 1800);
    later(() => o.fire('bf'), 3000);
    later(() => o.fire('petals'), 3900);
    later(() => o.fire('cx'), 4800);
    later(() => veil.classList.add('in'), 6400);
    later(() => frame.classList.add('in'), 7000);
    let ended = false;
    const end = (skip) => {
      if (ended) return; ended = true;
      if (skip) { try { camAnim.finish(); } catch (e) { /* */ } [deco, moon, veil, frame].forEach((e) => e && e.classList.add('in', 'inst')); }
      try { camAnim.commitStyles(); } catch (e) { /* */ } camAnim.cancel(); cam.style.transform = camT(stage, x, y, s);
      keep(stage); o.onEnd();
    };
    later(() => end(false), 9200);
    return { end };
  }
  // posisi akhir (pratinjau admin, tanpa animasi, tombol lewati)
  function final(stage, o) {
    if (!set(o.key)) return false;
    build(stage, o.data);
    $$('.cin-deco,.cin-moon,.cin-veil,.cin-frame', stage).forEach((e) => e.classList.add('in', 'inst'));
    $('.pcam', stage).style.transform = camT(stage, cfg.cam[0], cfg.cam[1], cfg.cam[2]);
    keep(stage); return true;
  }
  function keep(stage) { // kamera tetap di dalam adegan (bingkai lukisan tidak terlihat), ikut menyesuaikan saat ukuran layar berubah
    if (stage._keep) return; stage._keep = 1;
    addEventListener('resize', () => { const c = $('.pcam', stage); if (c && cfg) c.style.transform = camT(stage, cfg.cam[0], cfg.cam[1], cfg.cam[2]); }, { passive: true });
  }

  // ---------- bingkai foto mempelai ----------
  // side: 'l' = bunga di kiri (mempelai pria), 'r' = bunga di kanan (mempelai wanita)
  function pframe(k, photoHtml, side, flower) {
    if (!set(k)) return '';
    defs();
    const id = 'pfg' + side + k, sh = cfg.frame === 'shield' ? 'arch' : cfg.frame;
    return `<div class="pf pf-${sh} pf-${side} pf-${k}${cfg.dark ? ' dark' : ''} rv" data-a="pf" style="--m0:${cfg.metal[0]};--m1:${cfg.metal[1]}">
      <div class="pf-ph" style="clip-path:url(#cfc-${sh})"><div class="phb">${photoHtml}</div></div>${lineSvg(sh, id)}
      <img class="pf-orn" src="${cfg.pfOrn}" alt="">
      <div class="pf-fl a"><img src="${flower}" alt=""></div><div class="pf-fl b"><img src="${flower}" alt=""></div>
      <img class="pf-side" src="${cfg.side}" alt=""></div>`;
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

  window.CINEMA = { CFG, SHAPE, film, final, pframe, has: (k) => !!CFG[k] };
})();
