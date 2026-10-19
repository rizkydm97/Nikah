/* Tema 10 — Ungu Adat Jawa (kunci 'airterjun' dipertahankan agar pilihan tema lama tetap jalan).
   Dunia hidup berlapis dari gambar ungu (assets/t/ungu/*.webp) yang masuk bertahap seperti video referensi:
   langit lilac & padang → air terjun berkabut → pohon tumbuh → joglo naik → palem → gunungan → bunga & melati →
   vas bunga → penjor pink menjuntai → kupu-kupu & burung → panel lengkung putih berisi nama (dari cinema.js).
   Dipakai invitation.js lewat window.LIVEW.airterjun = { world, start, film, finish }. */
(function () {
  'use strict';
  const PG = window.PANGGUNG || {};
  const T = '/assets/t/', UG = T + 'ungu/', BW = 784, BH = 1168;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const f1 = (n) => +(+n).toFixed(1);
  const R = (i, k) => (Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2;
  const P = (x, y, w) => `left:${(x / BW * 100).toFixed(3)}%;top:${(y / BH * 100).toFixed(3)}%;width:${(w / BW * 100).toFixed(3)}%`;
  const S0 = { sky: 1.02, moon: 1.04, clouds: 1.05, hz: 1.08, cliff: 1.12, mistb: 1.15, field: 1.2, trees: 1.3, house: 1.25, glow: 1.25, penjor: 1.35, palms: 1.45, gun: 1.45, flw: 1.55, bank: 1.6, jas: 1.6, pots: 1.7, canopy: 1.5, rays: 1.1, petals: 1 }; // skala awal per lapisan (dijaga kecil agar ringan di HP)
  const L = (cls, inner, z) => `<div class="pg-l ${cls} on" data-z="${z || 0}" style="--s0:${S0[cls] || 1}">${inner}</div>`;
  const im = (n, cls, x, y, w, st, fl) => `<div class="pg-o ${cls}" style="${P(x, y, w)}${st || ''}"><img src="${UG}${n}.webp" alt="" decoding="async"${fl ? ' style="transform:scaleX(-1)"' : ''}></div>`;

  // ---------- penjor pink: lengkung bambu + untaian manik menjuntai berujung lampion ----------
  function penjor(flip, seed) {
    const W = 300, H = 400;
    const bz = (t) => { const p = [[24, 392], [8, 120], [96, 18], [150, 18]], q = [[150, 18], [204, 18], [292, 120], [276, 392]], s = t < 0.5 ? p : q, u = t < 0.5 ? t * 2 : (t - 0.5) * 2, m = 1 - u;
      return [m * m * m * s[0][0] + 3 * m * m * u * s[1][0] + 3 * m * u * u * s[2][0] + u * u * u * s[3][0], m * m * m * s[0][1] + 3 * m * m * u * s[1][1] + 3 * m * u * u * s[2][1] + u * u * u * s[3][1]]; };
    const ts = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84];
    const strands = ts.map((t, i) => {
      const [x, y] = bz(t), len = 70 + Math.sin(t * Math.PI) * 190 * (0.72 + R(i + seed, 3) * 0.32), n = Math.floor(len / 10);
      let b = '';
      for (let k = 1; k <= n; k++) b += `<circle cx="0" cy="${k * 10}" r="${k % 4 === 0 ? 4.2 : 3.1}" fill="${k % 4 === 0 ? '#ffe6ea' : k % 2 ? '#f6a9bb' : '#fbcfd8'}" stroke="#d8758f" stroke-width=".6"/>`;
      const e = n * 10 + 16, lan = i % 2 === 0
        ? `<g transform="translate(0 ${e})"><path d="M-3 -10 H3 L4 -6 H-4Z" fill="#e0a24a"/><path d="M-9 -6 C-13 8 -8 20 0 26 C8 20 13 8 9 -6Z" fill="url(#pjl${seed})" stroke="#d8758f" stroke-width=".8"/><path d="M-4 -4 C-6 6 -3 16 0 20" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7"/><path d="M0 26 V40 M-3 26 L-5 38 M3 26 L5 38" stroke="#f0b4c4" stroke-width="1.4"/></g>`
        : `<g transform="translate(0 ${e - 4})"><circle r="7" fill="#ffd9e0" stroke="#d8758f" stroke-width=".8"/>${[0, 1, 2, 3, 4].map((q) => `<ellipse cx="0" cy="-8" rx="3.6" ry="6" transform="rotate(${q * 72})" fill="#fbb5c6" stroke="#d8758f" stroke-width=".5"/>`).join('')}<circle r="3" fill="#ffe9a8"/></g>`;
      return `<g class="pj-s" style="--d:${(-R(i + seed, 5) * 5).toFixed(1)}s;--a:${f1(2 + R(i + seed, 6) * 2)}deg;transform-origin:${f1(x)}px ${f1(y)}px"><g transform="translate(${f1(x)} ${f1(y)})"><path d="M0 0 V${e}" stroke="#e7a3b4" stroke-width="1"/>${b}${lan}</g></g>`;
    }).join('');
    let dots = ''; for (let i = 0; i <= 26; i++) { const [x, y] = bz(i / 26); dots += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 3.4 : 5.2}" fill="${i % 2 ? '#fff0f3' : '#f08fa6'}" stroke="#c9607c" stroke-width=".7"/>`; }
    return `<svg class="ug-pj" viewBox="0 0 ${W} ${H + 60}" style="${flip ? 'transform:scaleX(-1)' : ''}"><defs><linearGradient id="pjl${seed}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd3de"/><stop offset=".6" stop-color="#f48fab"/><stop offset="1" stop-color="#d2557a"/></linearGradient>
      <linearGradient id="pjs${seed}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6b9c6"/><stop offset=".5" stop-color="#ffe3e8"/><stop offset="1" stop-color="#e58aa2"/></linearGradient></defs>
      <path d="M24 392 C8 120 96 18 150 18 C204 18 292 120 276 392" fill="none" stroke="url(#pjs${seed})" stroke-width="9" stroke-linecap="round"/>${dots}${strands}</svg>`;
  }

  // ---------- pohon bunga lilac: batang + 3 lapis tajuk (bergoyang dengan fase berbeda) ----------
  const TR = { big: { w: 1300, h: 1520, bx: 598, px: 598, py: 1098 }, big2: { w: 1300, h: 1520, bx: 702, px: 702, py: 1082 }, mid: { w: 900, h: 1100, bx: 450, px: 450, py: 806 } };
  function tree(n, cls, baseX, baseY, w, flip) {
    const m = TR[n], h = w * m.h / m.w, fx = flip ? 1 - m.bx / m.w : m.bx / m.w, left = baseX - fx * w, top = baseY - h;
    const img = (k) => `<img class="${k === 'trunk' ? 'tk' : 'cr c' + k}" src="${UG}tree-${n}-${k === 'trunk' ? 'trunk' : 'c' + k}.webp" alt="" decoding="async">`;
    return `<div class="pg-o tree ${cls}" style="${P(left, top, w)};--px:${(m.px / m.w * 100).toFixed(1)}%;--py:${(m.py / m.h * 100).toFixed(1)}%;${flip ? 'transform:scaleX(-1)' : ''}">${img('trunk')}${img(0)}${img(1)}${img(2)}</div>`;
  }

  // ---------- dunia ----------
  function world(cover) {
    const mist = (cls, x, y, w, flip, o) => `<div class="pg-o ${cls}" style="${P(x, y, w)}"><img class="is-cl" src="${UG}mist.webp" alt="" style="${flip ? 'transform:scaleX(-1);' : ''}${o ? `opacity:${o}` : ''}"></div>`;
    const dust = Array.from({ length: 32 }, (_, i) => `<i class="jw-d" style="left:${(6 + R(i, 1) * 88).toFixed(1)}%;--d:${(R(i, 2) * 9).toFixed(1)}s;--t:${(7 + R(i, 3) * 6).toFixed(1)}s;--x:${f1((R(i, 4) - 0.5) * 60)}px;--s:${f1(2 + R(i, 5) * 3)}px\"></i>`).join('');
    const SP = ['orchid', 'frangi1', 'leafj', 'orchid', 'frangi1', 'orchid', 'leafj', 'frangi1', 'orchid', 'frangi1', 'orchid', 'frangi1'];
    const petals = SP.map((n, i) => `<i class="ug-pt" style="left:${(4 + R(i, 7) * 90).toFixed(1)}%;--im:url(${T}spr/${n}.webp);--w:${f1(2.2 + R(i, 8) * 2.2)}cqw;--d:${(-R(i, 9) * 16).toFixed(1)}s;--t:${(13 + R(i, 10) * 9).toFixed(1)}s;--x:${f1((R(i, 11) - 0.5) * 18)}cqw"></i>`).join('');
    const cd = (n, cls, x, y, w, o, fl) => im(n, 'ucd ' + cls, x, y, w, ';opacity:' + o, fl);
    const cliffBox = P(-78, 150, 940), cH = 940 * 1100 / 1400;
    return `<div class="pg-w ug ring${cover ? ' cvr' : ''}">
      ${L('sky', '<i class="ug-sky"></i><i class="ug-sun"></i>' + Array.from({ length: 5 }, (_, i) => `<i class="ug-cl c${i}"></i>`).join(''), -1)}
      ${L('clouds', cd('cl1', 'a', -70, 20, 430, .9) + cd('cl2', 'b', 400, 95, 380, .8) + cd('cl3', 'c', 30, 215, 330, .7) + cd('cl1', 'd', 440, 250, 340, .6, 1), -0.9)}
      ${L('moon', `<i class="ug-moonhalo"></i><div class="pg-o mn" style="${P(292, 96, 200)}"><img src="${UG}moon.webp" alt="" decoding="async"></div>`, -0.8)}
      ${L('hz', im('hz', 'hz a', -110, 700, 1000, ';opacity:.7') + im('hz', 'hz b', -200, 790, 900, ';opacity:.6', 1), -0.7)}
      ${L('cliff', `<div class="pg-o cf" style="${cliffBox}"><img src="${UG}cliff.webp" alt="" decoding="async"><i class="ug-wt a"></i><i class="ug-wt b"></i></div>`, -0.55)}
      ${L('mistb', mist('mb1', -120, 560, 840, 0, .7) + mist('mb2', 160, 640, 760, 1, 0.8) + mist('mb3', -60, 300, 620, 0, 0.35), -0.45)}
      ${L('field', im('field', 'fd', -130, 850, 1044), -0.4)}
      ${L('trees', tree('mid', 'tm', 400, 790, 190) + tree('big', 'tl', 140, 935, 430) + tree('big2', 'tr', 655, 935, 440), -0.3)}
      ${L('house', im('house', 'hs', 40, 640, 590), -0.2)}
      ${L('glow', '<i class="ug-hg" style="left:34%;top:76%;width:26%"></i><i class="ug-hg b" style="left:14%;top:80%;width:14%"></i>', -0.2)}
      ${L('penjor', `<div class="pg-o pj l" style="${P(16, 480, 240)}">${penjor(0, 1)}</div><div class="pg-o pj r" style="${P(528, 490, 240)}">${penjor(1, 7)}</div>`, 0)}
      ${L('palms', im('palm1', 'pm l', -70, 760, 290) + im('palm2', 'pm r', 640, 760, 190), 0.15)}
      ${L('gun', im('gunA', 'gu l', -22, 770, 230) + im('gunB', 'gu r', 524, 760, 252), 0.25)}
      ${L('flw', im('flL', 'fw a', 420, 770, 150) + im('flR', 'fw b', 130, 820, 128) + im('flL', 'fw c', -10, 840, 96) + im('flR', 'fw d', 560, 780, 110) + im('flL', 'fw e', 250, 860, 100), 0.3)}
      ${L('bank', im('bank', 'bk', -100, 720, 984), 0.4)}
      ${L('jas', im('jasL', 'js l', -56, 850, 330) + im('jasR', 'js r', 530, 830, 320), 0.4)}
      ${L('pots', im('potB', 'pt a', -120, 985, 420) + im('potP', 'pt b', 180, 1000, 400) + im('potB', 'pt c', 440, 985, 400) + im('potP2', 'pt d', 610, 1005, 360), 0.5)}
      ${L('canopy', im('ctopL', 'ucp l', -14, -26, 290) + im('ctopL', 'ucp r', 508, -26, 290, '', 1), 0.45)}
      ${L('rays', '<i class="ug-ray a"></i><i class="ug-ray b"></i><i class="ug-ray c"></i><i class="ug-fg"></i>', 0.05)}
      <div class="pg-l petals on" data-z="0.3">${petals}</div>
      <div class="pg-l dust on" data-z="0.3">${dust}</div>
      <div class="pg-l birds on" data-z="-0.3"></div>
      <div class="pg-l fly on" data-z="0.5"></div>
      <i class="ug-dim"></i>
      <i class="ug-vig"></i>
    </div>`;
  }

  // ---------- burung kecil di langit ----------
  function birds(W) {
    const box = $('.birds', W); if (!box || box.dataset.on) return; box.dataset.on = 1;
    for (let i = 0; i < 7; i++) {
      const b = document.createElement('i'); b.className = 'ug-bird';
      b.innerHTML = '<svg viewBox="0 0 24 10"><path d="M1 8 Q6 -1 12 6 Q18 -1 23 8" fill="none" stroke="#7a5a92" stroke-width="1.6" stroke-linecap="round"/></svg>';
      const y = 3 + R(i, 1) * 17, sc = 0.7 + R(i, 2) * 0.7, dur = 28000 + R(i, 3) * 20000;
      b.style.cssText = `top:${y.toFixed(1)}%;width:${(2.6 * sc).toFixed(2)}cqw`;
      box.appendChild(b);
      const go = () => { if (!b.isConnected) return; b.animate([{ transform: 'translate3d(112cqw,0,0)' }, { transform: `translate3d(-18cqw,${f1((R(i, 4) - 0.5) * 8)}cqw,0)` }], { duration: dur, easing: 'linear', delay: i * 1800 }).onfinish = go; };
      go();
    }
  }

  // gerak kamera halus terus-menerus (parallax kedalaman) — juga di HP; di desktop ikut gerak mouse
  function start(stage) {
    const W = stage && stage.querySelector('.pg-w'); if (!W || W.dataset.on) return; W.dataset.on = 1;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    birds(W);
    const fine = matchMedia('(pointer:fine)').matches, ls = $$('.pg-l', W).map((el) => ({ el, z: +el.dataset.z })).filter((l) => l.z);
    let tx = 0, ty = 0, px = 0, py = 0; const t0 = performance.now();
    if (fine) addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
    if (!fine) addEventListener('deviceorientation', (e) => { if (e.gamma == null) return; tx = Math.max(-1, Math.min(1, e.gamma / 22)); ty = Math.max(-1, Math.min(1, ((e.beta || 50) - 50) / 22)); }, { passive: true });
    const tick = (now) => { if (!W.isConnected) return; requestAnimationFrame(tick); if (document.hidden || W.closest('.cin-off')) return;
      const t = (now - t0) / 1000; px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      const ix = Math.sin(t * 0.22) * 0.9 + px, iy = Math.cos(t * 0.17) * 0.5 + py, K = 3.4;
      for (const l of ls) l.el.style.translate = `${(-ix * l.z * K).toFixed(2)}cqw ${(-iy * l.z * K * 0.7).toFixed(2)}cqw`; };
    requestAnimationFrame(tick);
    // jaring pengaman: bila film tidak pernah dijalankan, dunia tetap ditampilkan utuh
    const iv = setInterval(() => { if (!W.isConnected) return clearInterval(iv); if (!document.body.classList.contains('locked')) clearInterval(iv); }, 600);
  }

  // ---------- film masuk (dipanggil cinema.js) ----------
  // Semua lapisan sudah tampil sejak awal (tidak ada yang muncul tiba-tiba). Kamera hanya mundur halus: lapisan dekat bergerak sedikit lebih jauh (parallax).
  function film(stage, later) {
    const W = $('.pg-w', stage); if (!W) return;
    // Urutan tertata (seperti video): gerbang terbuka -> kamera masuk -> bulan terbit -> pepohonan meluncur dari sisi -> bunga naik dari bawah -> kartu nama.
    // Semua gerak hanya transform/opacity (ringan untuk HP); fill 'backwards' = tidak ada sisa animasi setelah selesai.
    const EZ = 'cubic-bezier(.22,.7,.2,1)';
    const from = (sel, tr, delay, dur, o) => later(() => $$(sel, W).forEach((el) => el.animate([{ transform: tr, opacity: o === undefined ? 1 : o }, { transform: 'none', opacity: 1 }], { duration: dur, easing: EZ, fill: 'backwards' })), delay);
    // 1. kamera terbang masuk (parallax: lapisan dekat bergerak lebih jauh)
    later(() => $$('.pg-l', W).forEach((l) => { const s0 = parseFloat(getComputedStyle(l).getPropertyValue('--s0')) || 1; if (s0 !== 1) l.animate([{ scale: s0 }, { scale: 1 }], { duration: 7400, easing: 'cubic-bezier(.3,.05,.2,1)', fill: 'both' }); }), 0);
    // 2. dari senja gelap menuju terang
    later(() => { const d = $('.ug-dim', W); if (d) d.animate([{ opacity: 0.62 }, { opacity: 0.2, offset: 0.55 }, { opacity: 0 }], { duration: 5200, easing: 'ease-out', fill: 'both' }); }, 0);
    // 3. bulan terbit di balik tebing
    later(() => { const m = $('.pg-l.moon .mn', W), h = $('.ug-moonhalo', W); if (m) m.animate([{ transform: 'translateY(34cqw)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }], { duration: 5600, easing: 'cubic-bezier(.25,.5,.25,1)', fill: 'both' }); if (h) h.animate([{ opacity: 0, scale: .6 }, { opacity: 1, scale: 1 }], { duration: 6000, easing: 'ease-out', fill: 'both' }); }, 500);
    // 4. pohon besar meluncur dari kiri & kanan, pohon kecil naik dari belakang
    from('.pg-o.tree.tm', 'translateY(16cqw)', 1200, 2800, 0);
    from('.pg-o.tree.tl', 'translateX(-34cqw)', 1700, 3400);
    from('.pg-o.tree.tr', 'translateX(34cqw)', 2000, 3400);
    // rumah muncul perlahan dari kabut setelah pemandangan terbuka
    from('.pg-l.house,.pg-l.glow', 'translateY(7cqw)', 1500, 3000, 0);
    // 5. kanopi bunga turun dari atas, penjor menjuntai
    from('.pg-l.canopy', 'translateY(-26cqw)', 2600, 2800);
    from('.pg-l.penjor', 'translateY(-40cqw)', 3200, 2600, 0);
    // 6. palem & gunungan menyusul dari bawah, bunga depan naik berurutan
    from('.pg-l.palms', 'translateY(24cqw)', 3000, 2600);
    from('.pg-l.gun', 'translateY(26cqw)', 3200, 2600);
    from('.pg-l.flw', 'translateY(34cqw)', 3300, 2800);
    from('.pg-l.jas', 'translateY(40cqw)', 3500, 2800);
    from('.pg-l.bank', 'translateY(44cqw)', 3700, 2800);
    from('.pg-l.pots', 'translateY(52cqw)', 3900, 2800);
    // 7. makhluk hidup menyusul
    later(() => PG.flyers && PG.flyers(W, 'bf_pink1', 2), 3600);
    later(() => birds(W), 3000);
    later(() => PG.flyers && PG.flyers(W, 'bf_blue2', 2), 5000);
    later(() => PG.flyers && PG.flyers(W, 'bf_pink2', 1), 6300);
  }
  function finish(stage) {
    const W = $('.pg-w', stage); if (!W) return;
    W.classList.add('ring', 'settled'); $$('.pg-l', W).forEach((l) => { l.getAnimations().forEach((a) => a.cancel()); });
    if (!$('.pg-bf', W) && PG.flyers) PG.flyers(W, 'bf_pink1', 2);
    birds(W);
  }
  window.LIVEW = Object.assign(window.LIVEW || {}, { airterjun: { world, start, film, finish } });
  window.UNGU = { penjor, im, UG };
})();
