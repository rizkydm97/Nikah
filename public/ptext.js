/* Efek teks partikel 3D untuk PEMBUKA Tema 13 (terinspirasi particle-text-effect 21st.dev, ditulis ulang agar mulus di HP).
   Cara kerja:
   - Teks asli (kicker, nama mempelai, tanggal, hashtag) TETAP ada di HTML (bisa digeser / diedit di admin, terbaca mesin pencari).
     Posisi, ukuran, font, dan warna tiap kata dibaca langsung dari tampilan yang sebenarnya (sudah termasuk geseran & ukuran dari admin),
     jadi hasil partikel menimpa persis di tempat teks aslinya, di semua ukuran HP.
   - Titik-titik terbang dari luar layar membentuk huruf (jejak garis memendek saat melambat = kesan kedalaman 3D), lalu teks asli
     muncul halus menggantikan titik-titik.
   - Gerak dihitung dari WAKTU (bukan jumlah frame) → tidak patah walau frame turun; satu kanvas, satu RAF, berhenti total setelah selesai.
   API: PTEXT.prepare(hero) → { go(), cancel() } atau null bila tidak didukung. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, rand = Math.random;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const easeOut = (t) => { const k = 1 - t; return 1 - k * k * k * k; }; // quart: cepat lalu melambat halus
  const COARSE = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || innerWidth < 760;
  const MAXP = COARSE ? 3000 : 5200, MINSTEP = COARSE ? 1.9 : 1.5; // batas jumlah titik (hemat baterai HP)
  const CH = [246, 231, 196]; // warna jejak: sampanye lembut
  const ROOTS = ['.sl-op-k', '.sl-op-n', '.sl-op-d', '.sl-op-t'];

  function rgb(c) {
    const m = String(c || '').match(/[\d.]+/g) || [];
    const a = m[3] === undefined ? 1 : +m[3];
    return a < 0.1 ? [255, 255, 255] : [+m[0] || 0, +m[1] || 0, +m[2] || 0];
  }
  const mix = (a, b, t) => `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;

  function drawTxt(c, s, x, y, ls) {
    if (!ls) { c.fillText(s, x, y); return; }
    if ('letterSpacing' in c) { c.letterSpacing = ls + 'px'; c.fillText(s, x, y); c.letterSpacing = '0px'; return; }
    let cx = x; for (const ch of s) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + ls; } // Safari lama: spasi huruf manual
  }

  function prepare(hero) {
    if (!hero || !hero.getBoundingClientRect || !window.requestAnimationFrame) return null;
    const S = { dead: false, ready: false, go: false, done: false };
    const saved = [], roots = [];
    let wrap = null, cvs = null, ctx = null, groups = [], W = 0, H = 0, tk = 1, endAll = 0, t0 = 0, raf = 0, timer = 0;

    const save = (el) => saved.push([el, el.getAttribute('style')]);
    const revert = () => saved.forEach(([el, st]) => { if (st == null) el.removeAttribute('style'); else el.setAttribute('style', st); });
    const imp = (el, p, v) => el.style.setProperty(p, v, 'important');

    // ---- baca kata-kata beserta posisi tampak (sudah termasuk transform / zoom / geseran admin) ----
    function collect(el) {
      const toks = [], cache = new Map(), rg = document.createRange(), w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) {
        const p = n.parentElement; if (!p) continue;
        let st = cache.get(p);
        if (!st) {
          const cs = getComputedStyle(p), ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) || 0;
          st = { font: cs.fontStyle, weight: cs.fontWeight, size: parseFloat(cs.fontSize) || 16, fam: cs.fontFamily, ls, color: cs.color, tt: cs.textTransform };
          cache.set(p, st);
        }
        const txt = n.nodeValue, re = /\S+|\s+/g; let m;
        while ((m = re.exec(txt))) {
          rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
          const r = rg.getBoundingClientRect();
          if (r.width < 0.3 || r.height < 1) continue;
          const sp = /^\s/.test(m[0]);
          let s = sp ? ' ' : m[0];
          if (!sp) s = st.tt === 'uppercase' ? s.toUpperCase() : st.tt === 'lowercase' ? s.toLowerCase() : s;
          toks.push({ s, sp, r, st });
        }
      }
      return toks;
    }

    function build() {
      const hr = hero.getBoundingClientRect();
      W = Math.round(hr.width); H = Math.round(hr.height);
      if (W < 60 || H < 60) throw new Error('ukuran');
      const rs = ROOTS.map((q) => hero.querySelector(q)).filter(Boolean);
      if (!rs.length) throw new Error('kosong');
      // teks asli: keadaan akhir langsung (tanpa animasi lama) tetapi disembunyikan sampai titik-titik selesai membentuk huruf
      rs.forEach((r) => {
        save(r); roots.push(r);
        r.querySelectorAll('*').forEach((e) => { save(e); imp(e, 'animation', 'none'); imp(e, 'transform', 'none'); imp(e, 'clip-path', 'none'); imp(e, 'opacity', '1'); });
        imp(r, 'animation', 'none'); imp(r, 'transform', 'none'); imp(r, 'opacity', '0');
      });
      const specs = [], nm = hero.querySelector('.sl-op-n'), nps = nm ? [...nm.querySelectorAll('.sl-np')] : [];
      const k = hero.querySelector('.sl-op-k'), d = hero.querySelector('.sl-op-d'), t = hero.querySelector('.sl-op-t');
      if (k) specs.push({ el: k, delay: 0 });
      if (nps.length) nps.forEach((e, i) => specs.push({ el: e, delay: [520, 880, 1120][Math.min(i, 2)] })); else if (nm) specs.push({ el: nm, delay: 520 });
      if (d) specs.push({ el: d, delay: 1500 });
      if (t) specs.push({ el: t, delay: 1650 });
      tk = parseFloat(getComputedStyle(hero).getPropertyValue('--tk')) || 1;

      const mc = document.createElement('canvas').getContext('2d'), oc = document.createElement('canvas');
      oc.width = W; oc.height = H;
      const oc2 = oc.getContext('2d', { willReadFrequently: true });
      oc2.fillStyle = '#fff'; oc2.textBaseline = 'alphabetic';
      const tmp = [];
      specs.forEach((sp) => {
        const toks = collect(sp.el); if (!toks.length) return;
        oc2.clearRect(0, 0, W, H);
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, col = null;
        toks.forEach((tk_) => {
          if (tk_.sp) return;
          const st = tk_.st; mc.font = `${st.font} ${st.weight} ${st.size}px ${st.fam}`;
          const m0 = mc.measureText('Hxg'); let ratio;
          if (m0.fontBoundingBoxAscent !== undefined) ratio = tk_.r.height / (m0.fontBoundingBoxAscent + m0.fontBoundingBoxDescent);
          else { const lw = mc.measureText(tk_.s).width + st.ls * [...tk_.s].length; ratio = lw ? tk_.r.width / lw : 1; }
          if (!isFinite(ratio) || ratio <= 0) ratio = 1;
          const px = st.size * ratio; oc2.font = `${st.font} ${st.weight} ${px}px ${st.fam}`;
          const asc = oc2.measureText('Hxg').fontBoundingBoxAscent;
          const left = tk_.r.left - hr.left, top = tk_.r.top - hr.top, base = asc !== undefined ? top + asc : top + tk_.r.height * 0.78;
          drawTxt(oc2, tk_.s, left, base, st.ls * ratio);
          x0 = Math.min(x0, left); y0 = Math.min(y0, top); x1 = Math.max(x1, left + tk_.r.width); y1 = Math.max(y1, top + tk_.r.height);
          if (!col) col = rgb(st.color);
        });
        if (x1 < x0) return;
        const bx = clamp(Math.floor(x0 - 6), 0, W - 1), by = clamp(Math.floor(y0 - 8), 0, H - 1);
        const bw = clamp(Math.ceil(x1 + 6) - bx, 1, W - bx), bh = clamp(Math.ceil(y1 + 8) - by, 1, H - by);
        const img = oc2.getImageData(bx, by, bw, bh).data; let n = 0;
        for (let i = 3; i < img.length; i += 4) if (img[i] > 100) n++;
        if (n) tmp.push({ img, bx, by, bw, bh, n, col: col || [255, 255, 255], delay: sp.delay });
      });
      const N1 = tmp.reduce((s, g) => s + g.n, 0); if (!N1) throw new Error('tanpa titik');
      const step = clamp(Math.sqrt(N1 / MAXP), MINSTEP, 7); // makin kecil teks → makin rapat titiknya, dibatasi demi performa

      groups = []; endAll = 0;
      tmp.forEach((g) => {
        const tx = [], ty = [];
        for (let y = 0; y < g.bh; y += step) for (let x = 0; x < g.bw; x += step) {
          const jx = x + (rand() - 0.5) * step * 0.9, jy = y + (rand() - 0.5) * step * 0.9, ix = jx | 0, iy = jy | 0;
          if (ix < 0 || iy < 0 || ix >= g.bw || iy >= g.bh) continue;
          if (g.img[(iy * g.bw + ix) * 4 + 3] > 100) { tx.push(jx + g.bx); ty.push(jy + g.by); }
        }
        const n = tx.length; if (!n) return;
        const o = { n, col: g.col, delay: g.delay * tk, tx: Float32Array.from(tx), ty: Float32Array.from(ty), sx: new Float32Array(n), sy: new Float32Array(n), cv: new Float32Array(n), dl: new Float32Array(n), du: new Float32Array(n), sz: new Float32Array(n) };
        const base = rand() * TAU, R0 = Math.max(W, H);
        for (let i = 0; i < n; i++) { // tiap kata datang dari satu arah (berkas), dengan sebaran & lengkung halus
          const a = base + (rand() - 0.5) * 2.2, R = R0 * (0.6 + rand() * 0.6);
          o.sx[i] = W / 2 + Math.cos(a) * R; o.sy[i] = H / 2 + Math.sin(a) * R;
          o.cv[i] = (rand() - 0.5) * 0.7;
          o.dl[i] = o.delay + rand() * 420 * tk; o.du[i] = (1300 + rand() * 800) * tk;
          o.sz[i] = step * (0.95 + rand() * 0.35);
          endAll = Math.max(endAll, o.dl[i] + o.du[i]);
        }
        groups.push(o);
      });
      if (!groups.length) throw new Error('kosong');

      // kanvas tunggal menutupi seluruh slide pembuka
      wrap = document.createElement('div'); wrap.className = 'sl-ptx'; wrap.setAttribute('aria-hidden', 'true');
      cvs = document.createElement('canvas');
      const dpr = Math.min(window.devicePixelRatio || 1, COARSE ? 1.75 : 2);
      cvs.width = Math.round(W * dpr); cvs.height = Math.round(H * dpr);
      ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      wrap.appendChild(cvs); hero.appendChild(wrap);
    }

    function frame(now) {
      raf = 0;
      if (S.dead || S.done) return;
      if (!hero.isConnected) { cancel(); return; }
      const el = now - t0;
      ctx.clearRect(0, 0, W, H);
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi], n = g.n, tx = g.tx, ty = g.ty, sx = g.sx, sy = g.sy, cv = g.cv, dl = g.dl, du = g.du, sz = g.sz;
        const cb = clamp((el - g.delay) / (2200 * tk), 0, 1);
        ctx.beginPath(); // jejak garis (memendek saat melambat)
        let any = false;
        for (let i = 0; i < n; i++) {
          const t = (el - dl[i]) / du[i]; if (t <= 0 || t >= 1) continue;
          const u = easeOut(t), k1 = 1 - u, cu = cv[i] * 4 * u * k1, dx = sx[i] - tx[i], dy = sy[i] - ty[i];
          const t2 = t > 0.075 ? t - 0.075 : 0, u2 = easeOut(t2), k2 = 1 - u2, cu2 = cv[i] * 4 * u2 * k2;
          ctx.moveTo(tx[i] + dx * k2 - dy * cu2, ty[i] + dy * k2 + dx * cu2);
          ctx.lineTo(tx[i] + dx * k1 - dy * cu, ty[i] + dy * k1 + dx * cu); any = true;
        }
        if (any) { ctx.strokeStyle = `rgba(${CH[0]},${CH[1]},${CH[2]},.5)`; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.beginPath(); // titik (membesar saat mendekat = kedalaman)
        for (let i = 0; i < n; i++) {
          const t = (el - dl[i]) / du[i]; if (t <= 0) continue;
          const tt = t >= 1 ? 1 : t, u = easeOut(tt), k1 = 1 - u, cu = cv[i] * 4 * u * k1, dx = sx[i] - tx[i], dy = sy[i] - ty[i];
          const s = sz[i] * (0.4 + 0.6 * u);
          ctx.rect(tx[i] + dx * k1 - dy * cu - s / 2, ty[i] + dy * k1 + dx * cu - s / 2, s, s);
        }
        ctx.fillStyle = mix(CH, g.col, cb); ctx.fill();
      }
      if (el >= endAll + 220 * tk) { finish(); return; }
      raf = requestAnimationFrame(frame);
    }

    function finish() { // titik selesai → teks asli muncul halus, titik memudar, lalu semua dibersihkan
      if (S.done) return; S.done = true;
      roots.forEach((r) => { r.style.transition = 'opacity .9s ease'; imp(r, 'opacity', '1'); });
      if (cvs) { cvs.style.transition = 'opacity .9s ease'; cvs.style.opacity = '0'; }
      timer = setTimeout(cleanup, 1100);
    }
    function cleanup() {
      removeEventListener('resize', onResize);
      roots.forEach((r) => { r.style.transition = ''; });
      if (wrap && wrap.parentNode) wrap.remove();
      wrap = cvs = ctx = null; groups = [];
    }
    function onResize() { if (S.ready && !S.done) { if (raf) cancelAnimationFrame(raf); raf = 0; finish(); } } // layar berubah: langsung ke hasil akhir
    function cancel() { // batal / gagal: kembalikan animasi teks lama
      if (S.dead) return; S.dead = true;
      if (raf) cancelAnimationFrame(raf); clearTimeout(timer);
      removeEventListener('resize', onResize);
      if (wrap && wrap.parentNode) wrap.remove();
      if (!S.done) revert();
    }
    function start() {
      if (S.dead || S.done || raf) return;
      addEventListener('resize', onResize);
      t0 = performance.now(); raf = requestAnimationFrame(frame);
    }

    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      if (S.dead) return;
      try { build(); S.ready = true; if (S.go) start(); } catch (e) { cancel(); }
    });
    return { go() { S.go = true; if (S.ready) start(); }, cancel };
  }

  window.PTEXT = { prepare };
})();
