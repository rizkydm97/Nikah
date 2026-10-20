/* Dunia Hidup Tema 3-8: membuat bagian dalam undangan terasa seperti berada di dalam tema.
   - partikel kanvas berlapis kedalaman (kelopak/daun/bunga, kunang-kunang, debu emas, bara, gelembung, kilau)
   - angin berhembus berkala (kelopak melaju & berputar lebih cepat, suara angin ikut membesar)
   - partikel ikut bergeser saat scroll (parallax) & menyingkir saat disentuh/digeser jari
   - cahaya khas tema (sinar matahari, pantulan air, cahaya bulan, kedip api blencong)
   - makhluk lewat sesekali (merpati, burung, kupu-kupu, bayang wayang, bintang jatuh)
   - kupu-kupu hinggap di tepi kartu, lalu terbang lagi
   - ledakan kecil khas tema saat judul tiap bagian muncul
   Berdiri sendiri; dimatikan lewat effects.livingWorld = false. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const SP = (n) => '/assets/t/spr/' + n + '.webp';
  const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TH = {
    princess: { leaf: { imgs: ['rose1', 'rose2'], n: 9, size: [13, 23] }, glow: { n: 20, col: '255,214,236', mode: 'drift', size: [2, 4.5] }, spark: 9, light: 'pink', perch: ['bf_pink1', 'bf_pink2'], fly: ['dove', 'bf:bf_pink1'], burst: '255,226,240' },
    bali: { leaf: { imgs: ['frangi1', 'frangi2', 'leafm'], n: 9, size: [14, 24] }, glow: { n: 16, col: '255,232,160', mode: 'drift', size: [2, 4] }, light: 'sun', perch: ['bf_bali1', 'bf_bali2'], fly: ['bird_gold', 'bf:bf_bali1'], burst: '255,236,180' },
    emas: { leaf: { imgs: ['frangi1', 'leafm'], n: 5, size: [12, 20] }, glow: { n: 34, col: '255,206,110', mode: 'rise', size: [1.6, 4] }, light: 'gold', perch: ['bf_gold', 'bf_gold2'], fly: ['flock', 'bf:bf_gold'], burst: '255,214,120' },
    biru: { leaf: { imgs: ['frangi1'], n: 4, size: [10, 16] }, glow: { n: 24, col: '185,218,255', mode: 'wander', size: [1.8, 4] }, bubble: 7, star: 1, light: 'water', perch: ['bf_silver'], fly: ['bf:bf_silver', 'bf:bf_silver'], burst: '200,228,255' },
    rimba: { leaf: null, glow: { n: 34, col: '255,222,130', mode: 'wander', blink: 1, size: [2, 4.6] }, star: 1, light: 'moon', perch: ['bf_blue1', 'bf_blue2', 'bf_gold'], fly: ['bf:bf_blue1', 'bf:bf_gold'], burst: '255,226,150' },
    klasik: { leaf: { imgs: ['leafm', 'frangi1'], n: 4, size: [12, 18] }, glow: { n: 30, col: '255,150,60', mode: 'rise', ember: 1, size: [1.5, 3.4] }, light: 'candle', perch: ['bf_gold2'], fly: ['wayang', 'bf:bf_gold'], burst: '255,180,90' },
    airterjun: { leaf: { imgs: ['orchid', 'frangi1', 'orchid'], n: 8, size: [12, 20] }, glow: { n: 18, col: '226,200,255', mode: 'drift', size: [2, 4.2] }, spark: 6, light: 'sun', perch: ['bf_pink1', 'bf_blue2'], fly: ['bf:bf_pink1', 'bf:bf_blue2'], burst: '230,205,255' },
    istana: { leaf: { imgs: ['leafj', 'orchid', 'leafj'], n: 8, size: [12, 20] }, glow: { n: 18, col: '255,222,140', mode: 'drift', size: [2, 4.2] }, spark: 6, light: 'sun', perch: ['bf_gold', 'bf_gold2'], fly: ['bf:bf_gold', 'bf:bf_gold2'], burst: '255,226,150' },
    dayak: { leaf: { imgs: ['leafj', 'orchid', 'leafj', 'orchid', 'feather'], n: 9, size: [12, 20] }, glow: { n: 16, col: '255,226,150', mode: 'drift', size: [2, 4.2] }, light: 'sun', perch: ['bf_rajah'], fly: ['hornbill', 'hornbill', 'bf:bf_rajah'], burst: '255,214,120' },
  };
  let key, T, hero, cv, ctx, W = 0, H = 0, DPR = 1, parts = [], fx = [], imgs = {}, glowSpr = null, running = false, started = false, dens = 1;
  const E = (k) => { const e = window.__CFG && window.__CFG.effects; return !(e && e[k] === false); };

  // ---------- sprite ----------
  function loadImg(n) { if (imgs[n]) return imgs[n]; const im = new Image(); im.decoding = 'async'; im.src = SP(n); imgs[n] = im; return im; }
  function makeGlow(col, ember) { // titik cahaya dirender sekali, lalu hanya digambar ulang (murah)
    const c = document.createElement('canvas'), s = 64; c.width = c.height = s; const g = c.getContext('2d');
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, ember ? 'rgba(255,246,210,1)' : 'rgba(255,255,255,1)'); gr.addColorStop(0.18, `rgba(${col},1)`); gr.addColorStop(0.45, `rgba(${col},.35)`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, s, s); return c;
  }

  // ---------- angin ----------
  const wind = { base: 0.12, gust: 0, next: 0, t0: 0 };
  function windAt(t) {
    if (t > wind.next) { wind.t0 = t; wind.next = t + rnd(9, 16); wind.dir = Math.random() < 0.75 ? 1 : -1; if (t > 3) { try { window.dispatchEvent(new CustomEvent('living-gust')); } catch (e) { /* */ } } }
    const u = t - wind.t0; // naik 1.2 dtk, tahan 1.6 dtk, reda 2.4 dtk
    wind.gust = u < 1.2 ? u / 1.2 : u < 2.8 ? 1 : u < 5.2 ? 1 - (u - 2.8) / 2.4 : 0;
    wind.gust = wind.gust * wind.gust * (3 - 2 * wind.gust);
    return (wind.base + Math.sin(t * 0.23) * 0.08 + wind.gust * 1.1 * (wind.dir || 1));
  }

  // ---------- partikel ----------
  function spawnLeaf(top) {
    const L = T.leaf, z = rnd(0.55, 1.35), n = L.imgs[Math.floor(Math.random() * L.imgs.length)];
    return { k: 'leaf', im: loadImg(n), x: rnd(-20, W + 20), y: top ? rnd(-H * 0.2, -20) : rnd(-20, H), z, s: rnd(L.size[0], L.size[1]) * z, vx: 0, vy: rnd(10, 30), rot: rnd(0, 6.28), rv: rnd(-1.4, 1.4), fl: rnd(0, 6.28), fv: rnd(1.4, 3.2), ph: rnd(0, 6.28), sw: rnd(0.6, 1.3) };
  }
  function spawnGlow(any) {
    const G = T.glow, z = rnd(0.5, 1.4);
    return { k: 'glow', x: rnd(0, W), y: any ? rnd(0, H) : (G.mode === 'rise' ? H + rnd(5, 40) : rnd(0, H)), z, s: rnd(G.size[0], G.size[1]) * z * 4.2, vx: rnd(-6, 6), vy: G.mode === 'rise' ? -rnd(9, 22) * z : rnd(-6, 6), a: rnd(0, 6.28), ph: rnd(0, 6.28), f: rnd(0.5, 1.6), life: 0 };
  }
  function build() {
    parts = [];
    const d = dens * (W < 420 ? 0.85 : 1);
    // kelopak/daun jatuh saat scroll dihapus (lebih ringan); tersisa titik cahaya halus
    for (let i = 0; i < Math.round(T.glow.n * d * (matchMedia('(pointer:coarse)').matches ? 0.45 : 0.7)); i++) parts.push(spawnGlow(true));
    if (T.bubble) for (let i = 0; i < T.bubble; i++) parts.push({ k: 'bub', x: rnd(0, W), y: rnd(0, H), z: rnd(0.6, 1.3), s: rnd(3, 8), vy: -rnd(10, 22), ph: rnd(0, 6.28), vx: 0 });
  }
  const sparks = []; // kilau bintang 4 sudut (Princess) & kilau letupan
  const stars = []; // bintang jatuh
  let ptr = { x: -999, y: -999, vx: 0, vy: 0, t: 0 }, lastSY = 0, sdy = 0, t0 = 0, last = 0, visK = 0, shownK = 0;

  function resize() {
    const col = document.querySelector('#app'), cw = col ? col.getBoundingClientRect().width : innerWidth;
    W = Math.round(Math.min(innerWidth, cw || innerWidth)); H = innerHeight; DPR = Math.min(matchMedia('(pointer:coarse)').matches ? 1 : 1.5, devicePixelRatio || 1);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    if (!parts.length) build();
  }
  function push(x, y, power, rad) { // dorongan jari/klik
    for (const p of parts) {
      const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy); if (d > rad || d < 1) continue;
      const f = (1 - d / rad) * power; p.vx += dx / d * f; p.vy += dy / d * f * (p.k === 'leaf' ? 0.6 : 1);
      if (p.k === 'leaf') p.rv += rnd(-3, 3) * (1 - d / rad);
    }
  }
  function burst(x, y, big) { // ledakan khas tema
    const n = big ? 18 : 12;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, 6.283), v = rnd(40, 140) * (big ? 1.3 : 1);
      if (T.leaf && i % 3 === 0) { const p = spawnLeaf(false); p.x = x; p.y = y; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 40; p.life = 4.5; p.tmp = 1; fx.push(p); }
      else fx.push({ k: 'glow', x, y, z: 1, s: rnd(10, 20), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, a: 0, ph: 0, f: 1, life: rnd(1, 1.8), max: 1.8, tmp: 1 });
    }
    fx.push({ k: 'ring', x, y, r: 6, life: 1, max: 1 });
    if (key === 'princess') for (let i = 0; i < 6; i++) sparks.push({ x: x + rnd(-80, 80), y: y + rnd(-40, 40), s: rnd(6, 13), t: 0, d: rnd(0.8, 1.4) });
  }

  function frame(now) {
    if (!running) return; requestAnimationFrame(frame);
    if (document.hidden || window.__wlBusy) { last = now; return; } // dijeda saat kotak ucapan digulir (HP)
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
    const t = (now - t0) / 1000, w = windAt(t), g = wind.gust;
    // scroll: lapisan dekat bergeser lebih cepat dari isi, lapisan jauh lebih lambat
    const sy = scrollY; sdy = sy - lastSY; lastSY = sy; if (Math.abs(sdy) > H) sdy = 0;
    // tampil penuh setelah lewat hero, samar di atas hero
    const heroH = hero ? hero.offsetHeight : H; const target = shownK ? clamp((sy - heroH * 0.35) / (heroH * 0.5), 0.0, 1) * 0.92 + 0.08 : 0;
    visK += (target - visK) * Math.min(1, dt * 3);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, W, H);
    if (visK < 0.02) return;
    const G = T.glow, pv = now - ptr.t < 120;
    if (pv) { push(ptr.x, ptr.y, 10 + Math.min(60, Math.hypot(ptr.vx, ptr.vy) * 0.25), 90); }
    // --- kelopak / daun / bunga
    for (const p of parts) {
      if (p.k === 'leaf') {
        const tv = 16 + 20 * p.z;
        p.vy += (tv - p.vy) * dt * 1.2;
        p.vx += ((w * 90 * p.z + Math.sin(t * p.sw + p.ph) * 16 * p.z) - p.vx) * dt * 1.4;
        p.x += p.vx * dt; p.y += p.vy * dt - sdy * (p.z * 0.85 - 0.15);
        p.rot += p.rv * dt * (1 + g * 2.2); p.fl += p.fv * dt * (1 + g * 2.5); p.rv += (Math.sign(p.rv || 1) * 0.9 - p.rv) * dt * 0.5;
        if (p.y > H + 40 || p.x > W + 60 || p.x < -60 || p.y < -H * 0.6) { Object.assign(p, spawnLeaf(true)); if (p.vx === 0 && w > 0.6) p.x = rnd(-60, W * 0.5); if (sdy < -2) p.y = H + 30; }
      } else if (p.k === 'glow') {
        if (G.mode === 'rise') { p.vy += (-rnd(10, 18) * p.z - p.vy) * dt * 0.6; p.vx += ((w * 40 + Math.sin(t * p.f + p.ph) * 10) - p.vx) * dt; }
        else if (G.mode === 'wander') { p.a += rnd(-2.4, 2.4) * dt; p.vx += (Math.cos(p.a) * 14 * p.z + w * 26 - p.vx) * dt * 0.9; p.vy += (Math.sin(p.a) * 11 * p.z - p.vy) * dt * 0.9; }
        else { p.vx += ((w * 50 + Math.sin(t * 0.5 * p.f + p.ph) * 9) - p.vx) * dt; p.vy += ((Math.cos(t * 0.4 * p.f + p.ph) * 8 + 3) - p.vy) * dt; }
        p.x += p.vx * dt; p.y += p.vy * dt - sdy * (p.z * 0.8 - 0.1);
        if (p.y < -30 || p.y > H + 50 || p.x < -40 || p.x > W + 40) { const q = spawnGlow(false); if (G.mode !== 'rise') { q.y = p.y < 0 ? H + 20 : p.y > H ? -20 : rnd(0, H); q.x = p.x < 0 ? W + 20 : p.x > W ? -20 : rnd(0, W); } Object.assign(p, q); }
      } else if (p.k === 'bub') {
        p.y += p.vy * dt - sdy * 0.6; p.x += Math.sin(t * 2 + p.ph) * 12 * dt + w * 18 * dt;
        if (p.y < -20) { p.y = H + 20; p.x = rnd(0, W); } if (p.y > H + 30) p.y = -10;
      }
    }
    // --- gambar
    for (const p of parts) {
      if (p.k === 'leaf') {
        if (!p.im.complete || !p.im.naturalWidth) continue;
        const ar = p.im.naturalHeight / p.im.naturalWidth, fl = Math.cos(p.fl);
        ctx.globalAlpha = visK * clamp(0.45 + p.z * 0.45, 0, 0.95);
        ctx.setTransform(DPR, 0, 0, DPR, p.x * DPR, p.y * DPR); ctx.rotate(p.rot); ctx.scale(Math.abs(fl) < 0.12 ? 0.12 * Math.sign(fl || 1) : fl, 1);
        ctx.drawImage(p.im, -p.s / 2, -p.s * ar / 2, p.s, p.s * ar);
      }
    }
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      if (p.k === 'glow') {
        let a = G.blink ? Math.pow(Math.max(0, Math.sin(t * p.f * 1.3 + p.ph)), 3) : 0.55 + 0.45 * Math.sin(t * p.f * 2 + p.ph);
        if (G.ember) a *= 0.7 + 0.3 * Math.sin(t * 13 + p.ph * 3);
        ctx.globalAlpha = visK * a * clamp(0.35 + p.z * 0.5, 0, 1);
        ctx.drawImage(glowSpr, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      } else if (p.k === 'bub') {
        ctx.globalAlpha = visK * 0.55; ctx.strokeStyle = 'rgba(220,238,255,.9)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.z, 0, 6.283); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.22, 0, 6.283); ctx.fill();
      }
    }
    // --- letupan sementara
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i]; p.life -= dt; if (p.life <= 0) { fx.splice(i, 1); continue; }
      if (p.k === 'ring') { const u = 1 - p.life / p.max; ctx.globalAlpha = visK * (1 - u) * 0.8; ctx.strokeStyle = `rgba(${T.burst},1)`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, 10 + u * 120, 4 + u * 40, 0, 0, 6.283); ctx.stroke(); continue; }
      p.vx *= 1 - dt * 1.6; p.vy *= 1 - dt * 1.6; p.vy += (p.k === 'leaf' ? 40 : -8) * dt; p.x += p.vx * dt; p.y += p.vy * dt - sdy;
      if (p.k === 'leaf') {
        if (!p.im.complete) continue; const ar = p.im.naturalHeight / p.im.naturalWidth; p.rot += p.rv * dt * 2; p.fl += p.fv * dt * 2;
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = visK * clamp(p.life, 0, 1); ctx.setTransform(DPR, 0, 0, DPR, p.x * DPR, p.y * DPR); ctx.rotate(p.rot); ctx.scale(Math.cos(p.fl) || 0.1, 1); ctx.drawImage(p.im, -p.s / 2, -p.s * ar / 2, p.s, p.s * ar); ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalCompositeOperation = 'lighter';
      } else { ctx.globalAlpha = visK * clamp(p.life / (p.max || 1.5), 0, 1); ctx.drawImage(glowSpr, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
    }
    // --- kilau bintang (Princess)
    if (T.spark && sparks.length < 3 && Math.random() < dt * 3) sparks.push({ x: rnd(10, W - 10), y: rnd(10, H - 10), s: rnd(5, 11), t: 0, d: rnd(1, 1.8) });
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.t += dt; s.y -= sdy * 0.7; if (s.t > s.d) { sparks.splice(i, 1); continue; }
      const u = Math.sin(Math.PI * s.t / s.d), r = s.s * u;
      ctx.globalAlpha = visK * u; ctx.strokeStyle = 'rgba(255,248,230,1)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(s.x - r, s.y); ctx.lineTo(s.x + r, s.y); ctx.moveTo(s.x, s.y - r * 1.3); ctx.lineTo(s.x, s.y + r * 1.3); ctx.stroke();
      ctx.drawImage(glowSpr, s.x - r, s.y - r, r * 2, r * 2);
    }
    // --- bintang jatuh (Biru, Rimba)
    if (T.star && Math.random() < dt / 9 && stars.length < 1) { const x0 = rnd(W * 0.1, W * 0.9); stars.push({ x: x0, y: rnd(H * 0.03, H * 0.3), vx: rnd(-1, 1) < 0 ? -rnd(420, 560) : rnd(420, 560), vy: rnd(140, 220), t: 0, d: rnd(0.7, 1.1) }); }
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i]; s.t += dt; if (s.t > s.d) { stars.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt; const u = s.t / s.d, a = Math.sin(Math.PI * u), L = 0.16;
      const gr = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * L, s.y - s.vy * L); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(180,215,255,0)');
      ctx.globalAlpha = visK * a; ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * L, s.y - s.vy * L); ctx.stroke();
      ctx.drawImage(glowSpr, s.x - 7, s.y - 7, 14, 14);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  // ---------- cahaya khas tema ----------
  let light = null;
  function buildLight() {
    light = document.createElement('div'); light.className = 'lv-light lv-' + T.light; light.setAttribute('aria-hidden', 'true');
    const inner = {
      pink: '<i class="ray"></i><i class="ray b"></i><i class="bloom"></i>',
      sun: '<i class="ray"></i><i class="ray b"></i><i class="dap"></i><i class="dap b"></i>',
      gold: '<i class="ray"></i><i class="ray b"></i><i class="ray c"></i><i class="orb"></i><i class="orb b"></i><i class="orb c"></i>',
      water: '<i class="caus"></i><i class="caus b"></i><i class="beam"></i>',
      moon: '<i class="beam"></i><i class="beam b"></i><img class="mist" src="/assets/t/fx/mist.webp" alt=""><img class="mist b" src="/assets/t/fx/mist.webp" alt="">',
      candle: '<i class="warm"></i><i class="vig"></i>',
    }[T.light] || '';
    light.innerHTML = inner; document.body.appendChild(light);
  }

  // ---------- makhluk yang lewat ----------
  let crL = null;
  function rbfEl(n, size) {
    const el = document.createElement('div'); el.className = 'rbf lv-bf'; el.style.width = el.style.height = size + 'px';
    const d = rnd(0.16, 0.26).toFixed(2); el.innerHTML = `<div class="rb-in"><i class="l" style="background-image:url(${SP(n)});animation-duration:${d}s"></i><i class="r" style="background-image:url(${SP(n)});animation-duration:${d}s"></i></div>`;
    return el;
  }
  // terbang 3D: dari jauh (kecil, pucat) mendekat ke kamera (besar) atau sebaliknya, sambil berbelok
  function fly3d(el, o) {
    crL.appendChild(el);
    const away = o.away, dir = o.dir, n = 16, kf = [];
    const p0 = away ? [o.x0 != null ? o.x0 : (dir > 0 ? -0.2 : 1.2) * W, rnd(0.45, 0.75) * H] : [rnd(0.2, 0.8) * W, rnd(0.12, 0.32) * H];
    const p2 = away ? [rnd(0.3, 0.7) * W, rnd(0.1, 0.25) * H] : [(dir > 0 ? 1.25 : -0.25) * W, rnd(0.35, 0.8) * H];
    const p1 = [(p0[0] + p2[0]) / 2 + rnd(-0.25, 0.25) * W, Math.min(p0[1], p2[1]) - rnd(0.02, 0.12) * H];
    const s0 = away ? o.big : o.small, s1 = away ? o.small : o.big;
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = away ? u : u * u * 0.6 + u * 0.4, x = (1 - v) * (1 - v) * p0[0] + 2 * (1 - v) * v * p1[0] + v * v * p2[0], y = (1 - v) * (1 - v) * p0[1] + 2 * (1 - v) * v * p1[1] + v * v * p2[1];
      const sc = s0 * Math.pow(s1 / s0, v), bank = Math.sin(u * Math.PI * 2 + o.ph) * 8;
      const a = u < 0.08 ? u / 0.08 : u > 0.92 ? (1 - u) / 0.08 : 1, depth = Math.min(1, sc / o.big);
      kf.push({ transform: `translate3d(${f(x)}px,${f(y)}px,0) translate(-50%,-50%) scale(${sc.toFixed(3)}) rotate(${bank.toFixed(1)}deg) scaleX(${o.face})`, opacity: +(a * (0.45 + 0.55 * depth)).toFixed(3) });
    }
    el.animate(kf, { duration: o.dur, delay: o.delay || 0, easing: 'linear', fill: 'both' }).onfinish = () => el.remove();
  }
  const f = (v) => v.toFixed(1);
  function crossing() {
    if (!crL || document.hidden || visK < 0.5) return;
    const kind = T.fly[Math.floor(Math.random() * T.fly.length)], dir = Math.random() < 0.5 ? 1 : -1, away = Math.random() < 0.3, ph = rnd(0, 6);
    const base = (el, w, small, big, dur, face, extra) => { el.style.width = w + 'px'; fly3d(el, Object.assign({ dir, away, small, big, dur, face, ph }, extra || {})); };
    if (kind === 'dove') { const el = document.createElement('div'); el.className = 'lv-dove'; el.innerHTML = `<img src="${SP('dove1')}" alt=""><img src="${SP('dove2')}" alt="">`; base(el, 54, 0.3, 1.7, 7000, -dir); if (Math.random() < 0.6) { const e2 = el.cloneNode(true); base(e2, 54, 0.25, 1.4, 7600, -dir, { delay: 500 }); } }
    else if (kind === 'bird_gold') { for (let i = 0; i < 3; i++) { const el = document.createElement('div'); el.className = 'lv-bird'; el.innerHTML = `<img src="${SP('bird_gold')}" alt="">`; base(el, 44, 0.25, 1.6 - i * 0.25, 7600 + i * 500, -dir, { delay: i * 350 }); } }
    else if (kind === 'flock') { for (let i = 0; i < 6; i++) { const el = document.createElement('div'); el.className = 'lv-sil'; el.innerHTML = '<svg viewBox="0 0 24 12"><path d="M0 4 Q6 0 12 6 Q18 0 24 4 Q18 2.6 12 8.4 Q6 2.6 0 4Z"/></svg>'; el.firstChild.style.animationDelay = -i * 0.13 + 's'; base(el, 26, 0.3, 1.8 - (i % 3) * 0.35, 9000 + i * 300, 1, { delay: i * 220 }); } }
    else if (kind === 'hornbill' && window.DAYAK) { const n = Math.random() < 0.5 ? 1 : 2; for (let i = 0; i < n; i++) { const el = document.createElement('div'); el.className = 'lv-hb'; el.innerHTML = window.DAYAK.hornbill(); base(el, 120, 0.22, 1.9 - i * 0.3, 8000 + i * 600, dir, { delay: i * 500 }); } }
    else if (kind === 'wayang') { // bayang gunungan disapukan dalang di balik kelir
      const el = document.createElement('img'); el.className = 'lv-way'; el.src = '/assets/scene/gunungan.webp'; el.alt = ''; crL.appendChild(el);
      const s = Math.min(W * 0.7, 300), sx = dir > 0 ? -s : W, ex = dir > 0 ? W : -s;
      el.style.width = s + 'px';
      el.animate([{ transform: `translate3d(${sx}px,${H * 0.2}px,0) rotate(${-dir * 12}deg)`, opacity: 0 }, { opacity: 0.17, offset: 0.2 }, { transform: `translate3d(${(sx + ex) / 2}px,${H * 0.16}px,0) rotate(${dir * 4}deg)`, offset: 0.5 }, { opacity: 0.17, offset: 0.8 }, { transform: `translate3d(${ex}px,${H * 0.22}px,0) rotate(${dir * 14}deg)`, opacity: 0 }], { duration: 9000, easing: 'ease-in-out' }).onfinish = () => el.remove();
      if (Math.random() < 0.5) { for (let i = 0; i < 5; i++) { const b = document.createElement('div'); b.className = 'lv-sil'; b.innerHTML = '<svg viewBox="0 0 24 12"><path d="M0 4 Q6 0 12 6 Q18 0 24 4 Q18 2.6 12 8.4 Q6 2.6 0 4Z"/></svg>'; base(b, 22, 0.3, 1.5, 9000, 1, { delay: 1200 + i * 200 }); } }
    } else if (kind.startsWith('bf:')) { for (let i = 0; i < 2; i++) { const el = rbfEl(kind.slice(3), 40); fly3d(el, { dir, away, small: 0.35, big: 1.5 - i * 0.3, dur: 7800 + i * 900, face: 1, ph: ph + i, delay: i * 400 }); } }
  }

  // ---------- awan 3D di tiap bagian (di belakang isi, di atas lukisan latar) ----------
  const CLOUD = { airterjun: ['cloudw1', 'cloudw2', 'cloudw3'], istana: ['cloudw1', 'cloudw2', 'cloudw3'], princess: ['cloudp1', 'cloudp2', 'cloudp3'], bali: ['cloudw1', 'cloudw2', 'cloudw3'], emas: ['cloudw1', 'cloudw3', 'cloudw2'], biru: ['cloudb', 'cloudb', 'cloudb'], rimba: ['cloudb', 'cloudb', 'cloudb'], klasik: ['cloudw2', 'cloudw1', 'cloudw3'], dayak: ['', '', ''] };
  let skies = [];
  function addSkies() {
    if (!E('sectionClouds') || matchMedia('(pointer:coarse)').matches) return; // HP: tanpa awan per bagian (hemat)
    const set = CLOUD[key] || CLOUD.bali;
    $$('#app .sec:not(.hero)').forEach((sec, si) => {
      if (sec.querySelector(':scope>.lv-sky') || sec.classList.contains('gallery') || sec.classList.contains('bgi')) return; // jangan di belakang teks yang langsung di atas foto
      const sky = document.createElement('div'); sky.className = 'lv-sky'; sky.setAttribute('aria-hidden', 'true');
      // tiga kedalaman: jauh (kecil, pelan, samar) -> dekat (besar, cepat, jelas)
      [[0.35, 30, 140, 0.55, 4], [1, 56, 70, 0.8, 22]].forEach(([z, w, dur, op, top], i) => {
        const c = document.createElement('div'); c.className = 'lv-cl d' + i;
        const n = set[(si + i) % set.length];
        c.innerHTML = n ? `<img src="${SP(n)}" alt="">` : (window.DAYAK ? window.DAYAK.cloud(i % 2) : '');
        c.style.cssText = `top:${top + ((si * 7 + i * 11) % 12)}%;width:${w}%;--z:${z};opacity:${op};animation-duration:${dur}s;animation-delay:${-dur * (((si * 0.29) + i * 0.41) % 1)}s`;
        sky.appendChild(c);
      });
      const bg = sec.querySelector(':scope>.bgl'); if (bg) bg.after(sky); else sec.prepend(sky);
      skies.push({ sec, sky });
    });
  }
  function skyScroll() {
    for (const o of skies) { const r = o.sec.getBoundingClientRect(); if (r.bottom < -50 || r.top > H + 50) continue; o.sky.style.setProperty('--lvp', (((r.top + r.height / 2) - H / 2) / H).toFixed(3)); }
  }

  // ---------- Tema 9 Dayak: penari & enggang hinggap di dalam bagian ----------
  function dayakStages() {
    const D = window.DAYAK; if (!D || key !== 'dayak') return;
    const q = $('#app .sec.quote .q-in'); if (q && !q.querySelector('.lv-dk')) { const st = document.createElement('div'); st.className = 'lv-dk q'; st.innerHTML = `<div class="f">${D.dancerF()}</div><div class="s">${D.sapePlayer()}</div><div class="m">${D.dancerM()}</div>`; q.prepend(st); } // di atas ayat, tidak menutupi teks
    const cl = $('#app .sec.closing .stage'); if (cl && !cl.querySelector('.lv-dk')) { const st = document.createElement('div'); st.className = 'lv-dk c'; st.innerHTML = `<div class="f">${D.dancerF()}</div><div class="m">${D.dancerM()}</div>`; cl.appendChild(st); }
    const cap = $('#app .sec.events .cap'); if (cap && !cap.querySelector('.lv-hbp')) { const h = document.createElement('div'); h.className = 'lv-hbp'; h.innerHTML = D.hornbill({ perch: 1 }); cap.appendChild(h); }
  }

  // ---------- kupu-kupu hinggap di kartu ----------
  let perched = null;
  function perch() {
    if (perched || document.hidden || visK < 0.6 || !E('perchButterfly')) return;
    const app = $('#app'); if (!app) return;
    const cands = $$('#app .sec:not(.hero) :is(.cap,.gpanel,.cpanel,.tl .card,.wpanel,.rsvp .fm,.gslider,.q-in .cds)').filter((el) => { const r = el.getBoundingClientRect(); return r.top > H * 0.18 && r.top < H * 0.75 && r.width > 120; });
    if (!cands.length) return;
    const el = cands[Math.floor(Math.random() * cands.length)], r = el.getBoundingClientRect(), ar = app.getBoundingClientRect();
    const size = 38, side = Math.random() < 0.5 ? 0.16 : 0.82, px = r.left - ar.left + r.width * side - size / 2, py = r.top - ar.top - size * 0.62;
    const b = rbfEl(T.perch[Math.floor(Math.random() * T.perch.length)], size); b.classList.add('lv-perch'); app.appendChild(b);
    const from = [side < 0.5 ? -60 : ar.width + 20, py - rnd(120, 220)], mid = [(from[0] + px) / 2 + rnd(-40, 40), py - rnd(60, 120)];
    const rot = side < 0.5 ? 18 : -18;
    b.animate([{ transform: `translate(${from[0]}px,${from[1]}px) rotate(${rot * 2}deg)` }, { transform: `translate(${mid[0]}px,${mid[1]}px) rotate(${-rot}deg)`, offset: 0.55 }, { transform: `translate(${px}px,${py}px) rotate(0deg)` }], { duration: 2600, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).onfinish = () => { b.classList.add('rest'); };
    perched = b;
    const leave = () => {
      if (!b.isConnected || b.dataset.go) return; b.dataset.go = 1; b.classList.remove('rest');
      const tx = px + (side < 0.5 ? -1 : 1) * rnd(160, 260), ty = py - rnd(200, 320);
      b.animate([{ transform: `translate(${px}px,${py}px) rotate(0deg)` }, { transform: `translate(${(px + tx) / 2}px,${py - 80}px) rotate(${-rot}deg)`, offset: 0.4 }, { transform: `translate(${tx}px,${ty}px) rotate(${rot}deg)`, opacity: 0 }], { duration: 2200, easing: 'ease-in', fill: 'forwards' }).onfinish = () => { b.remove(); if (perched === b) perched = null; };
    };
    setTimeout(leave, rnd(9000, 14000));
    b.addEventListener('pointerdown', leave);
    const io = new IntersectionObserver((es) => { if (!es[0].isIntersecting) { io.disconnect(); setTimeout(leave, 400); } }); setTimeout(() => io.observe(b), 3000);
  }

  // ---------- ledakan saat judul bagian muncul ----------
  function heads() {
    if (!('IntersectionObserver' in window)) return;
    const seen = new WeakSet();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || seen.has(e.target)) return; seen.add(e.target);
      const r = e.target.getBoundingClientRect(), cr = cv.getBoundingClientRect();
      setTimeout(() => burst(r.left - cr.left + r.width / 2, r.top + r.height / 2, true), 350);
    }), { threshold: 0.6 });
    const scan = () => $$('#app .sec:not(.hero) h2, #app .sec:not(.hero) .cap h3').forEach((h) => { if (!h.dataset.lv) { h.dataset.lv = 1; io.observe(h); } });
    scan(); const app = $('#app'); if (app && window.MutationObserver) { let tt = 0; new MutationObserver(() => { clearTimeout(tt); tt = setTimeout(scan, 300); }).observe(app, { childList: true, subtree: true }); }
  }

  function start() {
    started = true; T = TH[key];
    if (reduce || !E('livingWorld')) return;
    dens = { low: 0.6, normal: 1, high: 1.45 }[(window.__CFG.effects || {}).livingDensity] || 1;
    document.body.classList.add('lv-on', 'lv-' + key);
    cv = document.createElement('canvas'); cv.className = 'lv-cv'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    ctx = cv.getContext('2d'); glowSpr = makeGlow(T.glow.col, T.glow.ember);
    crL = document.createElement('div'); crL.className = 'lv-cr'; crL.setAttribute('aria-hidden', 'true'); document.body.appendChild(crL);
    if (T.leaf) T.leaf.imgs.forEach(loadImg);
    resize(); addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 200); }, { passive: true });
    buildLight();
    // sentuhan/geser: partikel menyingkir; ketuk: hembusan kecil
    const mv = (x, y) => { if (window.__wlBusy) return; const cr = cv.getBoundingClientRect(), nx = x - cr.left, ny = y - cr.top, n = performance.now(), dt = Math.max(16, n - ptr.t); ptr.vx = (nx - ptr.x) / dt * 1000; ptr.vy = (ny - ptr.y) / dt * 1000; if (n - ptr.t > 200) { ptr.vx = ptr.vy = 0; } ptr.x = nx; ptr.y = ny; ptr.t = n; };
    addEventListener('pointermove', (e) => mv(e.clientX, e.clientY), { passive: true });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) mv(t.clientX, t.clientY); }, { passive: true });
    addEventListener('pointerdown', (e) => { if (!cv) return; const cr = cv.getBoundingClientRect(); push(e.clientX - cr.left, e.clientY - cr.top, 120, 150); }, { passive: true });
    lastSY = scrollY; t0 = performance.now(); running = true; requestAnimationFrame(frame);
    // tampil setelah film pembuka selesai
    const chk = () => { if (hero.classList.contains('shown')) { shownK = 1; document.body.classList.add('lv-live'); return true; } return false; };
    if (!chk()) { const mo = new MutationObserver(() => { if (chk()) mo.disconnect(); }); mo.observe(hero, { attributes: true, attributeFilter: ['class'] }); }
    const onScroll = () => { if (light) light.style.opacity = shownK ? clamp((scrollY - hero.offsetHeight * 0.4) / (hero.offsetHeight * 0.6), 0, 1).toFixed(3) : 0; };
    addEventListener('scroll', onScroll, { passive: true }); onScroll(); setInterval(onScroll, 1000);
    setInterval(crossing, 22000); setTimeout(crossing, 8000);
    addSkies(); dayakStages(); skyScroll(); addEventListener('scroll', () => requestAnimationFrame(skyScroll), { passive: true });
    { const app = $('#app'); if (app && window.MutationObserver) { let tt = 0; new MutationObserver(() => { clearTimeout(tt); tt = setTimeout(() => { addSkies(); dayakStages(); }, 400); }).observe(app, { childList: true }); } }
    setInterval(perch, 7000);
    // ledakan bunga saat judul muncul dihapus (lebih ringan & tidak berlebihan)
    window.__living = { burst: (x, y) => burst(x, y, true) };
  }
  const boot = setInterval(() => {
    if (started) return clearInterval(boot);
    const k = Object.keys(TH).find((x) => document.body.classList.contains('t-' + x)); hero = $('.hero.pic');
    if (k && hero && window.PIC_THEMES && window.__CFG) { key = k; clearInterval(boot); start(); }
  }, 300);
})();
