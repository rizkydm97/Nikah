/* Efek scroll Tema 3-8: judul muncul per kata, parallax latar, ornamen mekar, garis perjalanan, langit berubah,
   galeri sinematik, hitung mundur membalik, ucapan melayang, getar halus. Tiap efek bisa dimatikan dari admin (effects.*). */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const SP = (n) => '/assets/t/spr/' + n + '.webp';
  const E = (k) => { const e = window.__CFG && window.__CFG.effects; return !(e && (e[k] === false || (k !== 'haptic' && e.scrollFx === false))); };
  const TH = {
    princess: { col: '#ffc2dc', mk: 'bf_pink1', bl: ['rose1', 'rose2', 'rose1'], glow: ['18%', '14%', 'rgba(255,205,230,.8)'], ff: 12 },
    bali:     { col: '#ffe29a', mk: 'bf_bali1', bl: ['frangi1', 'frangi2', 'leafm'], glow: ['50%', '92%', 'rgba(255,225,150,.75)'], ff: 10 },
    emas:     { col: '#ffd36a', mk: 'bf_gold', bl: ['frangi1', 'leafm', 'frangi1'], glow: ['50%', '94%', 'rgba(255,210,110,.8)'], ff: 16 },
    biru:     { col: '#9fd0ff', mk: 'bf_silver', bl: ['frangi1', 'leafm', 'frangi1'], glow: ['84%', '10%', 'rgba(190,220,255,.85)'], ff: 18 },
    rimba:    { col: '#c8e0ff', mk: 'bf_blue1', bl: ['leafm', 'leafm', 'frangi1'], glow: ['82%', '9%', 'rgba(210,230,255,.85)'], ff: 24 },
    klasik:   { col: '#ffc46e', mk: 'bf_gold2', bl: ['leafm', 'frangi1', 'leafm'], glow: ['50%', '94%', 'rgba(255,190,100,.85)'], ff: 14 },
  };
  let key, T, PT, hero, started = false;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
  const make = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; (parent || document.body).appendChild(e); return e; };

  window.__vib = (ms) => { if (E('haptic') && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* */ } } };

  // ---- 1. judul muncul kata per kata ----
  function splitHeads() {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .45 }) : null;
    $$('.sec:not(.hero) h2').forEach((h) => {
      if (h.dataset.sx || h.children.length || !h.textContent.trim()) return; h.dataset.sx = 1;
      h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="sw" style="--w:${i}">${w.replace(/[<>&]/g, '')}</span>`).join(' ');
      h.classList.add('swx'); if (io) io.observe(h); else h.classList.add('in');
    });
  }

  // ---- sorotan elemen bergantung scroll ----
  const vis = new Set(); let tiles = [], bgs = [];
  function collect() {
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); }), { rootMargin: '10% 0px' }) : null;
    if (E('bgParallax')) $$('.sec:not(.hero)').forEach((s) => { const im = $('.bgl img', s); if (im) { bgs.push({ s, im }); io && io.observe(s); } });
    if (E('galleryFx')) $$('.gallery .mi, .gallery .gi').forEach((t) => { const im = $('img', t); if (im) { tiles.push({ t, im }); io && io.observe(t); } });
    if (!io) bgs.concat(tiles).forEach((o) => vis.add(o.s || o.t));
  }

  // ---- 3/4/5. ornamen mekar, garis perjalanan, langit ----
  let L = {};
  function build() {
    if (E('bloomOrnament')) {
      L.bloom = make('div', 'sx-bloom');
      L.glow = make('div', 'sx-glow'); L.glow.style.cssText = `left:${T.glow[0]};top:${T.glow[1]};background:radial-gradient(circle,${T.glow[2]},transparent 65%)`;
      L.ff = Array.from({ length: T.ff }, (_, i) => { const r = (k) => (Math.sin((i + 3) * 7919 + k * 4001) + 1) / 2, d = make('i', 'ff', L.bloom); d.style.cssText = `left:${(r(1) * 94 + 3).toFixed(1)}%;top:${(r(2) * 88 + 4).toFixed(1)}%;--c:${T.col};animation-duration:${(5 + r(3) * 6).toFixed(1)}s;animation-delay:${(-r(4) * 8).toFixed(1)}s`; return d; });
    }
    if (E('journeyLine')) {
      L.jr = make('div', 'sx-jr'); L.jf = make('i', 'jf', L.jr); L.jf.style.setProperty('--c', T.col);
      const m = make('img', 'jm', L.jr); m.src = SP(T.mk); m.alt = ''; L.jm = m;
    }
    if (E('skyShift')) L.sky = make('div', 'sx-sky');
  }
  const STOPS = [[0, [255, 255, 255, 0]], [.4, [255, 176, 120, .15]], [.75, [130, 80, 140, .22]], [1, [18, 28, 95, .3]]];
  function skyAt(p) { let i = 0; while (i < STOPS.length - 2 && p > STOPS[i + 1][0]) i++; const [a, A] = STOPS[i], [b, B] = STOPS[i + 1], t = clamp((p - a) / (b - a), 0, 1); return A.map((v, k) => lerp(v, B[k], t)); }

  function frame() {
    const H = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - H), sy = scrollY, p = clamp(sy / max, 0, 1), dark = !!PT.dark;
    if (L.glow) {
      const sh0 = hero && hero.classList.contains('shown'); L.bloom.style.opacity = sh0 ? 1 : 0; L.glow.style.opacity = sh0 ? (.15 + p * .6).toFixed(2) : 0; const n = Math.floor(3 + p * (L.ff.length - 3)); L.ff.forEach((d, i) => d.classList.toggle('on', i < n)); }
    if (L.jr) { const sh = hero && hero.classList.contains('shown') && sy > H * .3; L.jr.classList.toggle('on', !!sh); L.jf.style.height = (p * 100).toFixed(1) + '%'; L.jm.style.top = (p * 100).toFixed(1) + '%'; }
    if (L.sky) { const c = skyAt(p), a = c[3] * (dark ? .6 : 1); L.sky.style.background = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`; L.sky.style.opacity = hero && hero.classList.contains('shown') ? 1 : 0; }
    bgs.forEach(({ s, im }) => { if (!vis.has(s)) return; const r = s.getBoundingClientRect(), off = clamp(((r.top + r.height / 2) - H / 2) * -.1, -42, 42); im.style.scale = '1.12'; im.style.translate = `0 ${off.toFixed(1)}px`; });
    tiles.forEach(({ t, im }) => { if (!vis.has(t)) return; const r = t.getBoundingClientRect(), d = clamp(Math.abs(r.top + r.height / 2 - H / 2) / (H * .55), 0, 1); im.style.scale = (1 + (1 - d) * .06).toFixed(3); im.style.filter = `brightness(${(.8 + .2 * (1 - d)).toFixed(3)}) saturate(${(.9 + .15 * (1 - d)).toFixed(2)})`; });
  }
  let busy = false; const sched = () => { if (!busy) { busy = true; requestAnimationFrame(() => { busy = false; frame(); }); } };

  function haptics() {
    if (!E('haptic') || !('IntersectionObserver' in window)) return;
    const ev = $('.sec.events'); if (ev) { const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { window.__vib([14, 40, 14]); io.disconnect(); } }, { threshold: .4 }); io.observe(ev); }
    addEventListener('pointerdown', (e) => { if (e.target.closest && e.target.closest('form button[type=submit], form .btn, .pc-btn')) window.__vib(12); }, { passive: true });
  }

  function start() {
    started = true; T = TH[key]; PT = window.PIC_THEMES[key];
    document.body.classList.toggle('sx-cd', E('countdownFlip')); document.body.classList.toggle('sx-wish', E('wishFloat'));
    document.body.style.setProperty('--sxc', T.col);
    if (!reduce) {
      if (E('scrollReveal')) { splitHeads(); setInterval(splitHeads, 2500); } // bagian dirender bertahap -> pindai ulang
      collect(); build(); frame();
      addEventListener('scroll', sched, { passive: true }); addEventListener('resize', sched, { passive: true });
    }
    haptics();
  }
  const boot = setInterval(() => {
    if (started) return clearInterval(boot);
    const k = Object.keys(TH).find((x) => document.body.classList.contains('t-' + x)); hero = $('.hero.pic');
    if (k && hero && window.PIC_THEMES && window.__CFG) { key = k; clearInterval(boot); start(); }
  }, 300);
})();
