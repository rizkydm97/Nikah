/* Tema 10 — Ungu Adat Jawa (kunci 'airterjun' dipertahankan agar pilihan tema lama tetap jalan).
   v58: kamera 3D sungguhan. Dunia disusun dalam 8 bidang kedalaman (translateZ + perspektif) di dalam satu kamera:
   kamera mundur (dolly) sambil mengorbit pelan → paralaks nyata antar bidang; benda-benda "berdiri/mekar" dari tanah
   seperti pop-up book (pohon, joglo, palem, gunungan, bunga), penjor menjuntai dari atas, kabut & air terjun menyingkap.
   Hemat memori HP: hanya 8 bidang layar (bukan 17), aset diperkecil, tanpa filter/blend berat di layar sentuh,
   dan mode LITE otomatis bila halaman pernah crash saat dimuat (atau ?lite=1).
   Dipakai invitation.js lewat window.LIVEW.airterjun = { world, start, film, finish }. */
(function () {
  'use strict';
  const PG = window.PANGGUNG || {};
  const T = '/assets/t/', UG = T + 'ungu/', BW = 784, BH = 1168, PZ = 110; // PZ = jarak perspektif (cqw)
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const f1 = (n) => +(+n).toFixed(1);
  const R = (i, k) => (Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2;
  const P = (x, y, w) => `left:${(x / BW * 100).toFixed(3)}%;top:${(y / BH * 100).toFixed(3)}%;width:${(w / BW * 100).toFixed(3)}%`;

  // ---------- mode LITE: pengaman bila perangkat kehabisan memori ----------
  // Bila pemuatan sebelumnya tidak selesai (tab crash → penanda tidak sempat dihapus), muat versi ringan tanpa 3D berat.
  let LITE = false;
  try {
    const q = new URLSearchParams(location.search), K = 'ungu-boot', last = +localStorage.getItem(K) || 0;
    LITE = q.has('lite') ? q.get('lite') !== '0' : (!q.has('full') && Date.now() - last < 40000);
    localStorage.setItem(K, String(Date.now()));
    const clr = () => { try { localStorage.removeItem(K); } catch (e) { /* */ } };
    setTimeout(clr, 20000); addEventListener('pagehide', clr); document.addEventListener('visibilitychange', () => { if (document.hidden) clr(); });
  } catch (e) { /* */ }
  if (LITE) document.documentElement.classList.add('ug-lite');

  const L = (cls, inner) => `<div class="pg-l ${cls} on">${inner}</div>`;
  // bidang kedalaman: z > 0 mendekati kamera. Skala --k mengimbangi perspektif sehingga posisi diam sama persis dengan desain 2D.
  const G = (n, z, inner) => `<div class="ug-g g-${n}" style="--z:${z};--k:${((PZ - z) / PZ).toFixed(4)}">${inner}</div>`;
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
    const dust = Array.from({ length: LITE ? 10 : 24 }, (_, i) => `<i class="jw-d" style="left:${(6 + R(i, 1) * 88).toFixed(1)}%;--d:${(R(i, 2) * 9).toFixed(1)}s;--t:${(7 + R(i, 3) * 6).toFixed(1)}s;--x:${f1((R(i, 4) - 0.5) * 60)}px;--s:${f1(2 + R(i, 5) * 3)}px"></i>`).join('');
    const SP = ['orchid', 'frangi1', 'leafj', 'orchid', 'frangi1', 'orchid', 'leafj', 'frangi1', 'orchid', 'frangi1', 'orchid', 'frangi1'];
    const petals = SP.slice(0, LITE ? 5 : 12).map((n, i) => `<i class="ug-pt" style="left:${(4 + R(i, 7) * 90).toFixed(1)}%;--im:url(${T}spr/${n}.webp);--w:${f1(2.2 + R(i, 8) * 2.2)}cqw;--d:${(-R(i, 9) * 16).toFixed(1)}s;--t:${(13 + R(i, 10) * 9).toFixed(1)}s;--x:${f1((R(i, 11) - 0.5) * 18)}cqw"></i>`).join('');
    const cd = (n, cls, x, y, w, o, fl) => im(n, 'ucd ' + cls, x, y, w, ';opacity:' + o, fl);
    const cliffBox = P(-78, 150, 940);
    return `<div class="pg-w ug ring${cover ? ' cvr' : ' pre'}"><div class="ug-persp"><div class="ug-cam">
      ${G('a', -60, L('sky', '<i class="ug-sky"></i><i class="ug-sun"></i>' + Array.from({ length: 5 }, (_, i) => `<i class="ug-cl c${i}"></i>`).join('')) + L('clouds', cd('cl1', 'a', -70, 20, 430, .9) + cd('cl2', 'b', 400, 95, 380, .8) + cd('cl3', 'c', 30, 215, 330, .7) + cd('cl1', 'd', 440, 250, 340, .6, 1)))}
      ${G('b', -44, L('hz', im('hz', 'hz a', -110, 700, 1000, ';opacity:.7') + im('hz', 'hz b', -200, 790, 900, ';opacity:.6', 1)) + L('cliff', `<div class="pg-o cf" style="${cliffBox}"><img src="${UG}cliff.webp" alt="" decoding="async"><i class="ug-wt a"><b></b></i><i class="ug-wt b"><b></b></i></div>`) + L('mistb', mist('mb1', -120, 560, 840, 0, .7) + mist('mb2', 160, 640, 760, 1, 0.8) + mist('mb3', -60, 300, 620, 0, 0.35)))}
      ${G('c', -24, L('field', im('field', 'fd', -130, 850, 1044)) + L('trees', tree('mid', 'tm', 400, 790, 190) + tree('big', 'tl', 140, 935, 430) + tree('big2', 'tr', 655, 935, 440)) + L('house', im('house', 'hs', 40, 640, 590)) + L('glow', '<i class="ug-hg" style="left:34%;top:76%;width:26%"></i><i class="ug-hg b" style="left:14%;top:80%;width:14%"></i>'))}
      ${G('d', -8, L('penjor', `<div class="pg-o pj l" style="${P(16, 480, 240)}">${penjor(0, 1)}</div><div class="pg-o pj r" style="${P(528, 490, 240)}">${penjor(1, 7)}</div>`) + L('palms', im('palm1', 'pm l', -70, 760, 290) + im('palm2', 'pm r', 640, 760, 190)))}
      ${G('e', 8, L('gun', im('gunA', 'gu l', -22, 770, 230) + im('gunB', 'gu r', 524, 760, 252)) + L('flw', im('flL', 'fw a', 420, 770, 150) + im('flR', 'fw b', 130, 820, 128) + im('flL', 'fw c', -10, 840, 96) + im('flR', 'fw d', 560, 780, 110) + im('flL', 'fw e', 250, 860, 100)))}
      ${G('f', 20, L('bank', im('bank', 'bk', -100, 720, 984)) + L('jas', im('jasL', 'js l', -56, 850, 330) + im('jasR', 'js r', 530, 830, 320)))}
      ${G('g', 30, L('pots', im('potB', 'pt a', -120, 985, 420) + im('potP', 'pt b', 180, 1000, 400) + im('potB', 'pt c', 440, 985, 400) + im('potP2', 'pt d', 610, 1005, 360)) + L('canopy', im('ctopL', 'ucp l', -14, -26, 290) + im('ctopL', 'ucp r', 508, -26, 290, '', 1)))}
      ${G('h', 34, `<div class="pg-l petals on">${petals}</div><div class="pg-l dust on">${dust}</div><div class="pg-l birds on"></div><div class="pg-l fly on"></div>`)}
    </div></div></div>`;
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


  // ---------- kamera 3D ----------
  // pose awal (kamera dekat & miring sedikit) = pose sampul; film menarik kamera mundur ke pose diam sambil mengorbit.
  const POSE0 = 'translate3d(0,-1cqw,16cqw) rotateX(2.6deg) rotateY(-5.5deg)', POSE1 = 'translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';
  const INTRO_MS = 7600;

  function start(stage) {
    const W = stage && stage.querySelector('.pg-w'); if (!W || W.dataset.on) return; W.dataset.on = 1;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { W.classList.add('settled', 'idle'); W.classList.remove('pre'); return; }
    birds(W);
    const cam = $('.ug-cam', W), fine = matchMedia('(pointer:fine)').matches;
    let tx = 0, ty = 0, px = 0, py = 0;
    if (fine) addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
    // gerak idle halus: kamera bergoyang-orbit kecil + 'napas' dolly; fase dimulai 0 saat intro selesai agar tidak melompat
    const tick = (now) => {
      if (!W.isConnected) return; requestAnimationFrame(tick);
      if (document.hidden || W.closest('.cin-off') || LITE) return;
      const t0 = W._idle0; if (!t0 || now < t0) return;
      const u = (now - t0) / 1000, a = Math.min(1, u / 3); px += (tx - px) * 0.05; py += (ty - py) * 0.05;
      const k = a * a * (3 - 2 * a), s = Math.sin(u * 0.21), c = Math.sin(u * 0.16 + 0.8) - Math.sin(0.8);
      cam.style.transform = `translate3d(${f1((s * 2.0 + px * 2.2) * k)}cqw,${f1((c * 1.1 + py * 1.2) * k)}cqw,${f1(Math.sin(u * 0.13) * 3.2 * k)}cqw) rotateX(${f1((c * 1.4 - py * 1.2) * k)}deg) rotateY(${f1((s * 3.2 + px * 2.6) * k)}deg)`;
    };
    requestAnimationFrame(tick);
    // jaring pengaman: bila film tidak pernah berjalan setelah sampul dibuka, dunia tetap ditampilkan utuh
    const iv = setInterval(() => { if (!W.isConnected) return clearInterval(iv); if (!document.body.classList.contains('locked') && !W.dataset.film) { clearInterval(iv); settle(W); } }, 700);
  }
  function settle(W) {
    W.classList.add('settled'); W.classList.remove('pre');
    $$('.pg-o,.ug-cam', W).forEach((l) => l.getAnimations().forEach((a) => { if (!('animationName' in a) && !('transitionProperty' in a)) a.cancel(); }));
    W._idle0 = performance.now();
  }

  // ---------- film masuk (dipanggil cinema.js) ----------
  const EZ = 'cubic-bezier(.2,.85,.25,1)', EZB = 'cubic-bezier(.25,1.2,.4,1)';
  const PSP = 'perspective(80cqw)';
  function film(stage, later) {
    const W = $('.pg-w', stage); if (!W) return; W.dataset.film = 1;
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { finish(stage); return; }
    const cam = $('.ug-cam', W);
    const run = (el, kf, o) => el && el.animate(kf, Object.assign({ fill: 'backwards', easing: EZ }, o));
    // pose awal tertahan (CSS .pre / :not(.settled)) → mulai animasi kamera & menyingkap benda
    later(() => {
      if (LITE) { $$('.pg-o', W).forEach((e) => run(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 1400 })); W.classList.remove('pre'); W.classList.add('settled'); W._idle0 = performance.now(); return; }
      const t0 = performance.now(); W._idle0 = t0 + INTRO_MS;
      cam.animate([{ transform: POSE0 }, { transform: 'translate3d(0,.3cqw,5cqw) rotateX(1deg) rotateY(-1.8deg)', offset: .62 }, { transform: POSE1 }], { duration: INTRO_MS, easing: 'cubic-bezier(.25,.6,.3,1)', fill: 'backwards' });
      W.classList.add('go');
      const objs = (sel) => $$(sel + ' .pg-o', W);
      // 1) tebing & air terjun menyingkap, kabut mengalir masuk
      objs('.cliff').forEach((e) => run(e, [{ opacity: 0, transform: `translateY(3cqw) scale(1.08)` }, { opacity: 1, transform: 'none' }], { duration: 2600, delay: 0 }));
      objs('.mistb').forEach((e, i) => run(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 3000, delay: 500 + i * 400 }));
      // 2) berdiri dari tanah seperti pop-up book: joglo → pohon tengah → pohon kiri → pohon kanan
      const stand = (el, delay, o) => run(el, [
        { opacity: 0, transform: `${PSP} translateY(${o.dy || 3}cqw) rotateX(${o.rx || 82}deg) scale(${o.s || 0.7})` },
        { opacity: 1, offset: 0.3 },
        { opacity: 1, transform: `${PSP} translateY(0) rotateX(-${o.over || 4}deg) scale(1)`, offset: 0.8 },
        { opacity: 1, transform: `${PSP} translateY(0) rotateX(0deg) scale(1)` }], { duration: o.dur || 2300, delay, easing: o.ez || EZB });
      $$('.pg-l.house .pg-o,.pg-l.trees .pg-o,.pg-l.palms .pg-o,.pg-l.gun .pg-o', W).forEach((e) => { e.style.transformOrigin = '50% 100%'; });
      objs('.house').forEach((e) => stand(e, 700, { dur: 2600, rx: 88, dy: 5, s: 0.82 }));
      objs('.trees').forEach((e, i) => stand(e, [1100, 1500, 1900][i] || 1500, { dur: 2700, rx: 85, s: 0.55, dy: 4 }));
      // 3) penjor menjuntai dari atas (engsel di atas lalu berayun)
      objs('.penjor').forEach((e, i) => { e.style.transformOrigin = '50% 0'; run(e, [{ opacity: 0, transform: `${PSP} rotateX(-72deg) scale(.8)` }, { opacity: 1, offset: 0.3 }, { opacity: 1, transform: `${PSP} rotateX(6deg) scale(1.01)`, offset: 0.78 }, { opacity: 1, transform: `${PSP} rotateX(0deg) scale(1)` }], { duration: 2800, delay: 2100 + i * 600, easing: EZB }); });
      // 4) palem → gunungan naik berurutan
      objs('.palms').forEach((e, i) => stand(e, 2500 + i * 500, { dur: 2400, rx: 78, s: 0.7, dy: 3 }));
      objs('.gun').forEach((e, i) => stand(e, 3000 + i * 550, { dur: 2600, rx: 70, s: 0.6, dy: 6, over: 7 }));
      // 5) bunga mekar dari pangkal (skala + engsel) bergantian
      objs('.flw').forEach((e, i) => { e.style.transformOrigin = '50% 100%'; run(e, [{ opacity: 0, transform: `${PSP} rotateX(60deg) scale(.2)` }, { opacity: 1, offset: 0.35 }, { opacity: 1, transform: `${PSP} rotateX(-3deg) scale(1.08)`, offset: 0.75 }, { opacity: 1, transform: `${PSP} rotateX(0deg) scale(1)` }], { duration: 2200, delay: 3300 + i * 280, easing: EZB }); });
      // 6) cahaya hangat rumah menyala
      objs('.glow').forEach((e) => run(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 2200, delay: 3000 }));
      $$('.pg-l.glow .ug-hg', W).forEach((e) => run(e, [{ opacity: 0 }, { opacity: 0 }, { opacity: 0.55 }], { duration: 3200, delay: 2600 }));
      // 7) bunga & vas di depan 'bernapas' sekali saat kamera lewat (rasa volume)
      objs('.pots').forEach((e, i) => { e.style.transformOrigin = '50% 100%'; run(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.045) translateY(-.6cqw)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 3600, delay: 700 + i * 260, easing: 'ease-in-out', fill: 'none' }); });
      requestAnimationFrame(() => W.classList.remove('pre'));
    }, 0);
    later(() => PG.flyers && PG.flyers(W, 'bf_pink1', 2), 2200);
    later(() => birds(W), 2600);
    later(() => PG.flyers && PG.flyers(W, 'bf_blue2', 2), 4200);
    later(() => PG.flyers && PG.flyers(W, 'bf_pink2', 1), 5600);
  }
  function finish(stage) {
    const W = $('.pg-w', stage); if (!W) return;
    W.classList.add('ring'); settle(W);
    if (!$('.pg-bf', W) && PG.flyers) PG.flyers(W, 'bf_pink1', 2);
    birds(W);
  }
  window.LIVEW = Object.assign(window.LIVEW || {}, { airterjun: { world, start, film, finish } });
  window.UNGU = { penjor, im, UG, lite: LITE };
})();
