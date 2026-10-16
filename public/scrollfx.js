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
    bali:     { col: '#ffe29a', mk: 'bf_bali1', bl: ['frangi1', 'frangi2', 'frangi2'], glow: ['50%', '92%', 'rgba(255,225,150,.75)'], ff: 10 },
    emas:     { col: '#ffd36a', mk: 'bf_gold', bl: ['frangi1', 'frangi2', 'frangi1'], glow: ['50%', '94%', 'rgba(255,210,110,.8)'], ff: 16 },
    biru:     { col: '#9fd0ff', mk: 'bf_silver', bl: ['frangi1', 'frangi2', 'frangi1'], glow: ['84%', '10%', 'rgba(190,220,255,.85)'], ff: 18 },
    rimba:    { col: '#c8e0ff', mk: 'bf_blue1', bl: ['frangi2', 'frangi2', 'frangi1'], glow: ['82%', '9%', 'rgba(210,230,255,.85)'], ff: 24 },
    klasik:   { col: '#ffc46e', mk: 'bf_gold2', bl: ['frangi2', 'frangi1', 'frangi2'], glow: ['50%', '94%', 'rgba(255,190,100,.85)'], ff: 14 },
    airterjun: { col: '#9fd0ff', mk: 'bf_silver', bl: ['frangi1', 'frangi2', 'frangi1'], glow: ['84%', '10%', 'rgba(190,220,255,.85)'], ff: 14 },
    istana:   { col: '#ffc2dc', mk: 'bf_pink1', bl: ['rose1', 'rose2', 'rose1'], glow: ['50%', '12%', 'rgba(255,205,230,.8)'], ff: 10 },
    dayak:    { col: '#ffcf6a', mk: 'bf_rajah', bl: ['orchid', 'feather', 'orchid'], glow: ['50%', '92%', 'rgba(255,214,130,.75)'], ff: 12 },
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
  // will-change hanya dipasang saat elemen terlihat (hemat memori GPU), dilepas saat keluar layar.
  const vis = new Set(); let tiles = [], bgs = [];
  function collect() {
    const lite = lowEnd();
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((e) => {
      const el = e.target, im = el._sxim;
      if (e.isIntersecting) { vis.add(el); if (im) im.style.willChange = 'transform'; } else { vis.delete(el); if (im) im.style.willChange = ''; }
    }), { rootMargin: '10% 0px' }) : null;
    if (E('bgParallax') && !lite) $$('.sec:not(.hero)').forEach((s) => { const im = $('.bgl img', s); if (im) { im.style.scale = '1.12'; s._sxim = im; bgs.push({ s, im, last: 1e9 }); io && io.observe(s); } });
    // efek skala foto galeri per-scroll dihapus: mengubah `scale` tiap frame membuat galeri tersendat
    if (!io) bgs.concat(tiles).forEach((o) => vis.add(o.s || o.t));
  }
  // HP kelas bawah: matikan parallax latar & efek galeri (paling berat), sisanya tetap jalan
  function lowEnd() { const m = navigator.deviceMemory, c = navigator.hardwareConcurrency; return (m && m <= 3) || (c && c <= 3); }

  // ---- 3/4/5. ornamen mekar, garis perjalanan, langit ----
  let L = {};
  function build() {
    if (E('bloomOrnament')) {
      L.bloom = make('div', 'sx-bloom');
      L.glow = make('div', 'sx-glow'); L.glow.style.cssText = `left:${T.glow[0]};top:${T.glow[1]};background:radial-gradient(circle,${T.glow[2]},transparent 65%)`;
      L.ff = Array.from({ length: lowEnd() ? Math.ceil(T.ff / 2) : T.ff }, (_, i) => { const r = (k) => (Math.sin((i + 3) * 7919 + k * 4001) + 1) / 2, d = make('i', 'ff', L.bloom); d.style.cssText = `left:${(r(1) * 94 + 3).toFixed(1)}%;top:${(r(2) * 88 + 4).toFixed(1)}%;--c:${T.col};animation-duration:${(5 + r(3) * 6).toFixed(1)}s;animation-delay:${(-r(4) * 8).toFixed(1)}s`; return d; });
    }
    if (E('skyShift')) { L.sky = make('div', 'sx-sky'); L.skyL = ['255,176,120,.15', '130,80,140,.22', '18,28,95,.3'].map((c) => { const d = make('i', '', L.sky); d.style.background = `rgba(${c})`; return d; }); }
  }
  // Sky: tiga lapisan warna statis, hanya opacity yang berubah (jalur compositor, tanpa repaint layar penuh)
  const tri = (p, a, b, c) => (p <= a || p >= c ? 0 : p < b ? (p - a) / (b - a) : 1 - (p - b) / (c - b));
  let H = innerHeight, max = 1, lastP = -1, lastY = -1, shown = false;
  const measure = () => { H = innerHeight; max = Math.max(1, document.documentElement.scrollHeight - H); lastY = -1; };

  function frame() {
    const sy = scrollY;
    if (sy === lastY) return; lastY = sy;
    const p = clamp(sy / max, 0, 1), dark = !!PT.dark;
    if (!shown) shown = !!(hero && hero.classList.contains('shown'));
    // --- fase BACA: semua getBoundingClientRect sekaligus (tanpa tulis di antaranya = tanpa layout thrash)
    const bo = [], to = [];
    for (const o of bgs) if (vis.has(o.s)) { const r = o.s.getBoundingClientRect(); bo.push([o, clamp(((r.top + r.height / 2) - H / 2) * -.1, -42, 42)]); }
    for (const o of tiles) if (vis.has(o.t)) { const r = o.t.getBoundingClientRect(); to.push([o, clamp(Math.abs(r.top + r.height / 2 - H / 2) / (H * .55), 0, 1)]); }
    // --- fase TULIS
    if (L.glow) {
      L.bloom.style.opacity = shown ? 1 : 0; L.glow.style.opacity = shown ? (.15 + p * .6).toFixed(2) : 0;
      const n = Math.floor(3 + p * (L.ff.length - 3));
      if (n !== lastP) { lastP = n; L.ff.forEach((d, i) => d.classList.toggle('on', i < n)); }
    }
    if (L.sky) {
      L.sky.style.opacity = shown ? (dark ? .6 : 1) : 0;
      L.skyL[0].style.opacity = tri(p, -.01, .4, .75).toFixed(3); L.skyL[1].style.opacity = tri(p, .4, .75, 1.01).toFixed(3); L.skyL[2].style.opacity = clamp((p - .75) / .25, 0, 1).toFixed(3);
    }
    for (const [o, off] of bo) { const v = Math.round(off * 2) / 2; if (v !== o.last) { o.last = v; o.im.style.translate = `0 ${v}px`; } }
    for (const [o, d] of to) { const v = (1 + (1 - d) * .05).toFixed(3); if (v !== o.last) { o.last = v; o.im.style.scale = v; } }
  }
  let busy = false; const sched = () => { if (!busy) { busy = true; requestAnimationFrame(() => { busy = false; frame(); }); } };

  // Animasi tak-berujung (kilau, goyang, ken-burns) dijeda untuk bagian yang jauh dari layar
  function pauseOffscreen() {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('sx-off', !e.isIntersecting)), { rootMargin: '25% 0px' });
    const scan = () => $$('.sec:not(.hero):not([data-sxo])').forEach((s) => { s.dataset.sxo = 1; io.observe(s); });
    scan(); const app = $('#app'); if (app && window.MutationObserver) { let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 300); }).observe(app, { childList: true }); }
  }
  // Decode gambar saat browser menganggur supaya tidak decode (dan patah) saat pertama kali di-scroll
  function predecode() {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const q = []; const seen = new WeakSet();
    const fill = () => $$('#app img').forEach((im) => { if (!seen.has(im) && im.decode) { seen.add(im); q.push(im); } });
    const step = () => { const im = q.shift(); if (!im) return; (im.complete || im.src ? im.decode() : Promise.resolve()).catch(() => {}).then(() => idle(step)); };
    setTimeout(() => { fill(); idle(step); }, 1200); setTimeout(() => { fill(); if (q.length) idle(step); }, 5000);
  }

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
      if (E('scrollReveal')) { splitHeads(); const app = $('#app'); if (app && window.MutationObserver) { let t = 0; new MutationObserver(() => { clearTimeout(t); t = setTimeout(splitHeads, 250); }).observe(app, { childList: true, subtree: true }); } } // bagian dirender bertahap -> pindai saat DOM berubah
      measure(); collect(); build(); frame(); pauseOffscreen(); predecode();
      if (window.MutationObserver) new MutationObserver(() => { measure(); sched(); }).observe(hero, { attributes: true, attributeFilter: ['class'] }); // hero 'shown' -> tampilkan lapisan suasana tanpa menunggu scroll
      addEventListener('scroll', sched, { passive: true });
      let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { measure(); sched(); }, 150); }, { passive: true });
      if (window.ResizeObserver) { let rt = 0; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { measure(); sched(); }, 200); }).observe(document.body); } // tinggi halaman berubah saat bagian dirender
    }
    haptics();
  }
  const boot = setInterval(() => {
    if (started) return clearInterval(boot);
    const k = Object.keys(TH).find((x) => document.body.classList.contains('t-' + x)); hero = $('.hero.pic');
    if (k && hero && window.PIC_THEMES && window.__CFG) { key = k; clearInterval(boot); start(); }
  }, 300);
})();
