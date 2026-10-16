/* Sampul Tema 3-8: tampilan awal berupa benda bertema yang diketuk tamu, lalu benda itu terbuka dan kita masuk ke dunia tema.
   princess = amplop bersegel | bali = pintu kori agung | emas = kotak undangan berpita & ronce melati
   biru = kerang mutiara di air bulan | rimba = lentera kaca berisi kupu-kupu cahaya | klasik = kelir wayang, blencong & gunungan
   Dipanggil dari invitation.js (SAMPUL.cover / SAMPUL.idle / SAMPUL.open). */
(function () {
  'use strict';
  const SP = '/assets/t/spr/', T = '/assets/t/';
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const R = (i, k) => (Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2; // acak tetap (sama tiap render)
  const sfx = (key, phase) => { try { window.dispatchEvent(new CustomEvent('sampul', { detail: { key, phase } })); } catch (e) { /* */ } };

  const HINT = {
    princess: 'Ketuk segel untuk membuka amplop',
    bali: 'Ketuk pintu untuk masuk ke pura',
    emas: 'Ketuk pita untuk membuka kotak',
    biru: 'Ketuk kerang untuk membuka mutiara',
    rimba: 'Ketuk lentera untuk melepas cahaya',
    klasik: 'Ketuk gunungan untuk memulai',
    dayak: 'Ketuk tameng untuk membuka undangan',
    airterjun: '', istana: '',
  };

  // ---------- partikel CSS untuk suasana sampul ----------
  const dots = (n, cls, f) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="${f(i, (k) => R(i, k))}"></i>`).join('');
  const fallers = (n, imgs, size) => Array.from({ length: n }, (_, i) => { const r = (k) => R(i + 7, k); return `<img class="sp-fall" src="${SP + imgs[i % imgs.length]}.webp" alt="" style="left:${(r(1) * 96).toFixed(1)}%;width:${(size * (0.6 + r(2) * 0.8)).toFixed(1)}px;--x:${((r(3) - 0.5) * 40).toFixed(0)}cqw;--r:${(r(4) < 0.5 ? -1 : 1) * (200 + r(5) * 300)}deg;animation-duration:${(9 + r(6) * 8).toFixed(1)}s;animation-delay:${(-r(7) * 16).toFixed(1)}s">`; }).join('');
  const rise = (n, col, big) => dots(n, 'sp-rise', (i, r) => `left:${(r(1) * 98).toFixed(1)}%;--s:${((big || 3) * (0.6 + r(2) * 0.9)).toFixed(1)}px;--x:${((r(3) - 0.5) * 22).toFixed(1)}cqw;--c:${col};animation-duration:${(7 + r(4) * 8).toFixed(1)}s;animation-delay:${(-r(5) * 14).toFixed(1)}s`);
  const stars = (n, top) => dots(n, 'sp-star', (i, r) => `left:${(r(1) * 100).toFixed(1)}%;top:${(r(2) * (top || 45)).toFixed(1)}%;--s:${(1 + r(3) * 2.4).toFixed(1)}px;animation-duration:${(2.2 + r(4) * 4).toFixed(1)}s;animation-delay:${(-r(5) * 6).toFixed(1)}s`);
  const flies = (n, y0, y1, col) => dots(n, 'sp-ff', (i, r) => `left:${(r(1) * 94 + 3).toFixed(1)}%;top:${(y0 + r(2) * (y1 - y0)).toFixed(1)}%;--c:${col};--dx:${((r(3) - 0.5) * 30).toFixed(0)}px;--dy:${((r(4) - 0.5) * 40).toFixed(0)}px;animation-duration:${(5 + r(5) * 6).toFixed(1)}s,${(1.4 + r(6) * 2).toFixed(1)}s;animation-delay:${(-r(7) * 9).toFixed(1)}s,${(-r(8) * 3).toFixed(1)}s`);
  const bokeh = (n, col) => dots(n, 'sp-bok', (i, r) => `left:${(r(1) * 100).toFixed(1)}%;top:${(r(2) * 100).toFixed(1)}%;--s:${(18 + r(3) * 50).toFixed(0)}px;--c:${col};animation-duration:${(9 + r(4) * 9).toFixed(1)}s;animation-delay:${(-r(5) * 12).toFixed(1)}s`);
  const rays = (n) => `<div class="sp-rays">${'<i></i>'.repeat(n)}</div>`;

  // ---------- benda per tema ----------
  const grad = (id, a, b, v) => `<linearGradient id="${id}" ${v || 'x1="0" y1="0" x2="0" y2="1"'}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const GOLD = '#dfae55';
  const OBJ = {
    princess(H) {
      return `<div class="ee-env"><div class="ee-fl">
        <div class="ee-back"><svg viewBox="0 0 300 207" preserveAspectRatio="none"><defs>${grad('eeb', '#e27c9b', '#f1a0bd')}</defs><rect width="300" height="207" rx="7" fill="url(#eeb)"/></svg></div>
        <div class="ee-glow"></div>
        <div class="ee-clip"><div class="ee-card"><div class="ee-cf" style="background-image:url(${H.PT.world})"></div></div></div>
        <div class="ee-front"><svg viewBox="0 0 300 207" preserveAspectRatio="none"><defs>${grad('eel', '#f8bad2', '#ee94b6', 'x1="0" y1="0" x2="1" y2="1"')}${grad('eer', '#f8bad2', '#ee94b6', 'x1="1" y1="0" x2="0" y2="1"')}${grad('eeu', '#fcd3e3', '#f4a6c5', 'x1="0" y1="1" x2="0" y2="0"')}</defs>
          <polygon points="0,0 152,113 0,207" fill="url(#eel)"/><polygon points="300,0 148,113 300,207" fill="url(#eer)"/><polygon points="0,207 150,96 300,207" fill="url(#eeu)"/>
          <g fill="none" stroke="${GOLD}" stroke-width="1.1" stroke-linejoin="round" opacity=".9"><polyline points="0,207 150,96 300,207"/><polyline points="0,0 152,113 0,207"/><polyline points="300,0 148,113 300,207"/><rect x=".6" y=".6" width="298.8" height="205.8" rx="6.5"/></g></svg>
          <div class="ee-to"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div>
          <i class="ee-sheen"></i>
          <img class="ee-rose a" src="${SP}rose1.webp" alt=""><img class="ee-rose b" src="${SP}rose2.webp" alt=""></div>
        <div class="ee-flap"><div class="f o"><svg viewBox="0 0 300 128" preserveAspectRatio="none"><defs>${grad('eef', '#fcd0e1', '#f2a0c0')}</defs><polygon points="0,0 300,0 150,128" fill="url(#eef)" stroke="${GOLD}" stroke-width="1.2" stroke-linejoin="round"/><polyline points="16,0 150,112 284,0" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".6"/></svg></div>
          <div class="f i"><svg viewBox="0 0 300 128" preserveAspectRatio="none"><defs>${grad('eeg', '#fdeaf1', '#f6bdd2')}</defs><polygon points="0,0 300,0 150,128" fill="url(#eeg)" stroke="${GOLD}" stroke-width="1.2" stroke-linejoin="round"/></svg></div></div>
        <div class="ee-seal"><i class="sp-ping"></i><i class="sp-ping b"></i><div class="ee-wax"><b>${H.mono}</b></div></div>
      </div></div>`;
    },
    bali(H) {
      // gapura kori agung: bata merah + paras berukir, atap bertingkat, pintu merah ber-prada emas, payung tedung di kiri-kanan
      const tedung = (side) => `<div class="kb-ted ${side}"><svg viewBox="0 0 60 260"><defs>${grad('tdy' + side, '#fff4c6', '#e8b93c')}</defs><rect x="28.5" y="34" width="3" height="226" rx="1.5" fill="#6b3d17"/><path d="M4 40 Q30 2 56 40 Z" fill="url(#tdy${side})" stroke="#b07a1c" stroke-width="1"/><path d="M4 40 h52 v5 q-6 6 -8.7 0 q-4.3 6 -8.7 0 q-4.3 6 -8.7 0 q-4.3 6 -8.7 0 q-4.3 6 -8.6 0 q-2.7 6 -8.6 0Z" fill="#fff9e6" stroke="#c99a35" stroke-width=".8"/><circle cx="30" cy="10" r="3.2" fill="#e8b93c"/></svg></div>`;
      const curl = (x, y, d) => `<path d="M${x} ${y} c${-7 * d} 0 ${-11 * d} -5 ${-12 * d} -15 c${5 * d} 3 ${9 * d} 6 ${12 * d} 7z" fill="url(#kbp)" stroke="#b8a074" stroke-width=".6"/>`;
      const tier = ([cx1, cx2, cy, ch, bx1, bx2, by, bh]) => `<rect x="${bx1}" y="${by}" width="${bx2 - bx1}" height="${bh}" fill="url(#kbk)"/><rect x="${cx1}" y="${cy}" width="${cx2 - cx1}" height="${ch}" fill="url(#kbp)"/><rect x="${cx1}" y="${cy}" width="${cx2 - cx1}" height="${ch}" fill="url(#kbm)"/><path d="M${cx1} ${cy + ch}h${cx2 - cx1}" stroke="#a88c5c" stroke-width="1"/>${curl(cx1, cy + ch, 1)}${curl(cx2, cy + ch, -1)}`;
      const tower = [[50, 250, 102, 16, 60, 240, 84, 20], [66, 234, 72, 12, 76, 224, 56, 18], [86, 214, 46, 10, 96, 204, 32, 16], [108, 192, 24, 8, 118, 182, 14, 12]].map(tier).join('') + `<path d="M150 0 c5 7 9 11 9 15 h-18 c0 -4 4 -8 9 -15z" fill="url(#kbp)" stroke="#b8a074" stroke-width=".6"/><circle cx="150" cy="3" r="2.6" fill="${GOLD}"/>`;
      const wings = [1, -1].map((d) => { const x0 = d > 0 ? 18 : 238, w = 44; return `<rect x="${x0}" y="282" width="${w}" height="133" fill="url(#kbk)"/><rect x="${d > 0 ? 12 : 236}" y="270" width="52" height="12" fill="url(#kbp)"/><rect x="${d > 0 ? 12 : 236}" y="270" width="52" height="12" fill="url(#kbm)"/>${curl(d > 0 ? 12 : 288, 282, d)}<path d="M${d > 0 ? 30 : 270} 270 c3 -10 6 -14 6 -20 c0 6 3 10 6 20z" fill="url(#kbp)" stroke="#b8a074" stroke-width=".6" transform="translate(${d > 0 ? -6 : -6} 0)"/><rect x="${x0}" y="282" width="${w}" height="8" fill="url(#kbp)" opacity=".8"/>`; }).join('');
      const door = (s) => `<div class="kb-door ${s}"><div class="kb-leaf"><i class="kb-p a"><img src="${T}bali/orn.webp" alt=""></i><i class="kb-p b"><img src="${T}bali/orn.webp" alt=""></i><i class="kb-knob"></i></div><div class="kb-back"></div></div>`;
      return `<div class="kb">
        ${tedung('l')}${tedung('r')}
        <div class="kb-gate">
          <svg class="kb-arch" viewBox="0 0 300 440" preserveAspectRatio="none"><defs>
            ${grad('kbb', '#b8603d', '#8c3d24')}${grad('kbp', '#f6ead0', '#d6c29c')}
            <pattern id="kbm" width="30" height="30" patternUnits="userSpaceOnUse"><image href="${T}bali/motif.webp" width="30" height="30" opacity=".5"/></pattern>
            <pattern id="kbk" width="14" height="7" patternUnits="userSpaceOnUse"><rect width="14" height="7" fill="url(#kbb)"/><path d="M0 6.6h14M7 0v3.3M0 3.3h14M3.5 3.3v3.3M10.5 3.3v3.3" stroke="#5e2614" stroke-width=".55" opacity=".6"/></pattern></defs>
            ${wings}${tower}
            <rect x="62" y="120" width="176" height="295" fill="url(#kbk)"/>
            <rect x="62" y="120" width="18" height="295" fill="url(#kbp)"/><rect x="220" y="120" width="18" height="295" fill="url(#kbp)"/>
            <rect x="62" y="120" width="18" height="295" fill="url(#kbm)"/><rect x="220" y="120" width="18" height="295" fill="url(#kbm)"/>
            <rect x="58" y="118" width="184" height="22" fill="url(#kbp)"/><rect x="58" y="118" width="184" height="22" fill="url(#kbm)"/>
            <path d="M58 140h184M58 118h184" stroke="#a88c5c" stroke-width="1.2"/><path d="M80 140v264M220 140v264" stroke="#a88c5c" stroke-width="1.4"/>
            <image href="${T}bali/orn.webp" x="122" y="94" width="56" height="52"/>
            <path d="M52 415h196v8h-196z M40 423h220v8h-220z M28 431h244v9h-244z" fill="url(#kbp)" stroke="#b8a074" stroke-width=".8"/>
          </svg>
          <div class="kb-open"><div class="kb-glimpse" style="background-image:url(${H.PT.world})"></div><i class="kb-shine"></i></div>
          ${door('l')}${door('r')}
          <i class="kb-seam"></i>
          <div class="kb-med"><i class="sp-ping"></i><i class="sp-ping b"></i><div class="kb-medin"><b>${H.mono}</b></div></div>
          <div class="kb-lontar"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div>
          <i class="kb-smoke a"></i><i class="kb-smoke b"></i>
          <img class="kb-fr a" src="${SP}frangi1.webp" alt=""><img class="kb-fr b" src="${SP}frangi2.webp" alt=""><img class="kb-fr c" src="${SP}frangi1.webp" alt="">
        </div></div>`;
    },
    emas(H) {
      // kotak undangan (hardbox) bermotif batik emas, pita silang + pita kupu, ronce melati, label nama tamu
      // ronce melati: untaian bunga melati putih menjuntai dari pita
      const fl = (x, y, s, r) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(0)}) scale(${s})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-2.6" rx="1.7" ry="2.8" transform="rotate(${a})" fill="#fffef6" stroke="#d8d2b8" stroke-width=".3"/>`).join('')}<circle r="1.1" fill="#f3e3a0"/></g>`;
      let strand = '';
      for (let i = 1; i <= 13; i++) { const t = i / 13, x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 58 + t * t * 6, y = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * 96 + t * t * 64; strand += fl(x, y, 1.05 - t * 0.2, i * 47); }
      strand += [[4, 70], [9, 76], [2, 79]].map(([x, y], i) => fl(x, y, 0.85, i * 60)).join('') + '<path d="M6 66 q-3 10 -2 20 M6 66 q2 10 5 18" stroke="#6a8a3a" stroke-width="1.2" fill="none"/>';
      const melati = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${strand}</svg>`;
      return `<div class="kx"><div class="kx-fl">
        <div class="kx-base"><div class="kx-tray"><div class="kx-card" style="background-image:url(${H.PT.world})"></div><i class="kx-in"></i></div></div>
        <div class="kx-lid"><div class="kx-top"><i class="kx-bd"></i><img class="kx-c tl" src="${T}emas/orn.webp" alt=""><img class="kx-c tr" src="${T}emas/orn.webp" alt=""><img class="kx-c bl" src="${T}emas/orn.webp" alt=""><img class="kx-c br" src="${T}emas/orn.webp" alt="">
          <div class="kx-plate"><span>${H.esc(H.C.cover.kicker)}</span><b>${H.mono}</b></div><i class="kx-sheen"></i></div>
          <i class="kx-rib h a"></i><i class="kx-rib h b"></i>
          <div class="kx-ronce l">${melati}</div><div class="kx-ronce r">${melati}</div>
          <div class="kx-bow"><svg viewBox="0 0 120 80"><defs>${grad('kxg', '#fff0b8', '#c8901e', 'x1="0" y1="0" x2="1" y2="1"')}${grad('kxg2', '#f6d27a', '#a8741a')}</defs>
            <path d="M60 40 C40 8 6 6 8 30 C10 50 40 52 60 40Z" fill="url(#kxg)" stroke="#8a5d12" stroke-width="1.2"/><path d="M60 40 C80 8 114 6 112 30 C110 50 80 52 60 40Z" fill="url(#kxg)" stroke="#8a5d12" stroke-width="1.2"/>
            <path d="M56 44 L40 78 L48 74 L52 80 L60 46Z M64 44 L80 78 L72 74 L68 80 L60 46Z" fill="url(#kxg2)" stroke="#8a5d12" stroke-width="1"/>
            <ellipse cx="60" cy="41" rx="9" ry="8" fill="url(#kxg2)" stroke="#8a5d12" stroke-width="1.2"/><path d="M22 26 C34 22 46 30 54 38 M98 26 C86 22 74 30 66 38" stroke="#fff6d0" stroke-width="1.4" fill="none" opacity=".7"/></svg>
            <i class="sp-ping"></i><i class="sp-ping b"></i></div>
          <div class="kx-tag"><i class="kx-str"></i><div class="kx-tg"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div></div>
        </div></div><i class="kx-shadow"></i></div>`;
    },
    biru(H) {
      // kerang mutiara di permukaan air yang diterangi bulan
      const ribs = (y0, y1) => Array.from({ length: 17 }, (_, i) => `<path d="M150 ${y0} L${(-10 + i * 320 / 16).toFixed(1)} ${y1}"/>`).join('');
      const UP = `M4 104 Q10 8 150 6 Q290 8 296 104 ${'q-12 14 -24.33 0 '.repeat(12)}Z`, LO = `M4 6 ${'q12 14 24.33 0 '.repeat(12)}Q290 74 150 96 Q10 74 4 6Z`;
      return `<div class="kr"><div class="kr-fl">
        <i class="kr-halo"></i>
        <div class="kr-lo"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><defs>
          <radialGradient id="krl" cx=".5" cy=".1" r=".95"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d9e6ff"/><stop offset=".8" stop-color="#9fb8e8"/><stop offset="1" stop-color="#6f86c4"/></radialGradient>
          <clipPath id="krlc"><path d="${LO}"/></clipPath></defs>
          <path d="${LO}" fill="url(#krl)"/>
          <g clip-path="url(#krlc)" stroke="#7d8fc2" stroke-width="1.3" opacity=".55" fill="none">${ribs(150, -5)}</g>
          <path d="${LO}" fill="none" stroke="#e8eeff" stroke-width="1.6"/></svg></div>
        <div class="kr-pearl"><i></i></div>
        <div class="kr-up"><div class="kr-fc o"><svg viewBox="0 0 300 120" preserveAspectRatio="none"><defs>
          <radialGradient id="kru" cx=".45" cy=".2" r="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#e7eeff"/><stop offset=".7" stop-color="#a9bfee"/><stop offset="1" stop-color="#7189c8"/></radialGradient>
          <linearGradient id="kri" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd9f2" stop-opacity=".5"/><stop offset=".5" stop-color="#c9f1ff" stop-opacity=".0"/><stop offset="1" stop-color="#d7ccff" stop-opacity=".55"/></linearGradient>
          <clipPath id="kruc"><path d="${UP}"/></clipPath></defs>
          <path d="${UP}" fill="url(#kru)"/><path d="${UP}" fill="url(#kri)"/>
          <g clip-path="url(#kruc)" stroke="#7286c0" stroke-width="1.4" opacity=".6" fill="none">${ribs(-40, 125)}</g>
          <path d="${UP}" fill="none" stroke="#f3f6ff" stroke-width="1.8" opacity=".9"/>
          <path d="M40 40 Q90 14 150 12" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".55"/></svg></div>
          <div class="kr-fc i"><svg viewBox="0 0 300 120" preserveAspectRatio="none"><defs><radialGradient id="krn" cx=".5" cy=".7" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#ffe6f6"/><stop offset=".75" stop-color="#d6e6ff"/><stop offset="1" stop-color="#b4c6f0"/></radialGradient></defs><path d="${UP}" fill="url(#krn)" stroke="#e9efff" stroke-width="2"/></svg></div></div>
        <i class="kr-lip"></i>
        <i class="sp-ping"></i><i class="sp-ping b"></i>
      </div><div class="kr-refl"></div></div>
      <div class="kr-to"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div>`;
    },
    rimba(H) {
      // lentera kaca berisi kupu-kupu cahaya & kunang-kunang; tutup emas, pita & label nama tamu
      const ins = Array.from({ length: 7 }, (_, i) => `<i style="left:${(18 + R(i, 1) * 64).toFixed(0)}%;top:${(30 + R(i, 2) * 55).toFixed(0)}%;animation-duration:${(2.4 + R(i, 3) * 2.6).toFixed(1)}s,${(1.2 + R(i, 4)).toFixed(1)}s;animation-delay:${(-R(i, 5) * 4).toFixed(1)}s,${(-R(i, 6) * 2).toFixed(1)}s;--dx:${((R(i, 7) - 0.5) * 50).toFixed(0)}%;--dy:${((R(i, 8) - 0.5) * 60).toFixed(0)}%"></i>`).join('');
      return `<div class="lj"><div class="lj-fl">
        <i class="lj-aura"></i>
        <div class="lj-jar">
          <div class="lj-glass"><i class="lj-light"></i><div class="lj-ins">${ins}</div><div class="lj-bf"></div><i class="lj-hl a"></i><i class="lj-hl b"></i></div>
          <div class="lj-neck"></div>
          <div class="lj-rib"><svg viewBox="0 0 120 50"><path d="M60 14 C44 0 26 4 30 16 C33 24 50 22 60 14Z M60 14 C76 0 94 4 90 16 C87 24 70 22 60 14Z" fill="#2f5fa8" stroke="#e8c46a" stroke-width="1"/><path d="M56 16 L46 46 L52 42 L56 48 L60 18Z M64 16 L74 46 L68 42 L64 48 L60 18Z" fill="#244b8a" stroke="#e8c46a" stroke-width=".8"/><circle cx="60" cy="15" r="5" fill="#e8c46a"/></svg></div>
          <div class="lj-tag"><i class="lj-str"></i><div class="lj-tg"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div></div>
        </div>
        <div class="lj-lid"><i class="lj-ring"></i><i class="lj-cap"></i><i class="lj-knob"></i></div>
        <i class="sp-ping"></i><i class="sp-ping b"></i>
      </div><i class="lj-ground"></i></div>`;
    },
    klasik(H) {
      // kelir wayang: gawangan kayu, kain putih berpelangitan, blencong menyala, gunungan tertancap di gedebog
      return `<div class="kl">
        <div class="kl-frame">
          <div class="kl-scr"><i class="kl-warm"></i><img class="kl-shadow" src="/assets/scene/gunungan.webp" alt="">
            <div class="kl-txt"><span>${H.esc(H.C.cover.kicker)}</span><b>${H.names}</b></div></div>
          <i class="kl-plang"></i><i class="kl-post l"></i><i class="kl-post r"></i>
        </div>
        <div class="kl-lamp"><i class="kl-chain"></i><svg viewBox="0 0 80 46"><defs>${grad('klb', '#e7b25a', '#7a4a14')}</defs><path d="M6 20 Q4 10 14 10 Q22 10 24 18 L58 18 Q64 8 74 12 Q78 14 74 18 Q70 22 64 22 L62 30 Q40 44 18 30 Z" fill="url(#klb)" stroke="#4a2a08" stroke-width="1"/><path d="M14 10 q-6 -8 2 -10 q2 4 -2 10z" fill="#c98d30"/><ellipse cx="40" cy="22" rx="16" ry="3" fill="#3a2006" opacity=".6"/></svg><i class="kl-flame"><i></i></i><i class="kl-glow"></i></div>
        <div class="kl-gun"><i class="sp-ping"></i><i class="sp-ping b"></i><img src="/assets/scene/gunungan.webp" alt=""></div>
        <div class="kl-log"><i></i></div>
        <div class="kl-to"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div>
      </div>`;
    },
  };

  // ---------- Dayak: tameng talawang 3D ----------
  OBJ.dayak = (H) => {
    const D = window.DAYAK; if (!D) return '';
    const edge = Array.from({ length: 6 }, (_, i) => `<div class="ds-ed" style="transform:translateZ(${-(i + 1) * 1.6}px)"><svg viewBox="0 0 200 520"><path d="${D.SH}" fill="${i < 5 ? '#4a2810' : '#2a160a'}"/></svg></div>`).join('');
    const sh = D.shield({ mono: H.mono.replace(/<i>&amp;<\/i>/, '<tspan font-size="14">&amp;</tspan>') });
    return `<div class="ds"><i class="ds-aura"></i>
      <div class="ds-rot">
        <div class="ds-back">${D.shieldBack()}</div>${edge}
        <div class="ds-in"><div class="ds-peek" style="background-image:url(${H.PT.bg})"></div><i class="ds-light"></i></div>
        <div class="ds-h l">${sh}</div><div class="ds-h r">${sh}</div><i class="ds-sheen"></i><i class="ds-seam"></i>
      </div><i class="sp-ping"></i><i class="sp-ping b"></i></div>
      <div class="ds-plq"><i class="ds-str"></i><div class="ds-tg"><span>${H.esc(H.C.cover.toLabel)}</span><b>${H.esc(H.guest)}</b></div></div>`;
  };
  const AMB = {
    princess: () => `<i class="sp-light"></i>${rays(6)}${bokeh(9, '255,220,236')}${fallers(9, ['rose1', 'rose2'], 24)}${rise(16, '255,236,246', 3)}`,
    bali: () => `<i class="sp-sun"></i>${rays(7)}<img class="sp-cl a" src="${SP}cloudw1.webp" alt=""><img class="sp-cl b" src="${SP}cloudw2.webp" alt="">${fallers(8, ['frangi1', 'frangi2', 'leafm'], 22)}${rise(14, '255,232,170', 3)}`,
    emas: () => `<i class="sp-sun"></i>${rays(9)}${rise(30, '255,210,110', 3.4)}${fallers(5, ['frangi1', 'leafm'], 20)}<div class="sp-birds">${'<i><svg viewBox="0 0 24 12"><path d="M0 4 Q6 0 12 6 Q18 0 24 4 Q18 2.6 12 8.4 Q6 2.6 0 4Z"/></svg></i>'.repeat(4)}</div>`,
    biru: () => `${stars(46, 46)}<i class="sp-moon"></i><div class="sp-sea"><i class="sp-rip a"></i><i class="sp-rip b"></i><i class="sp-mref"></i></div><img class="sp-mist a" src="${T}fx/mist.webp" alt=""><img class="sp-mist b" src="${T}fx/mist.webp" alt="">${flies(12, 30, 70, '190,225,255')}`,
    rimba: () => `${stars(40, 50)}<i class="sp-moon"></i><img class="sp-mist a" src="${T}fx/mist.webp" alt=""><img class="sp-mist b" src="${T}fx/mist.webp" alt="">${flies(22, 12, 92, '255,220,130')}`,
    klasik: () => `<i class="sp-vig"></i>${rise(22, '255,150,60', 2.6)}<i class="sp-smoke a"></i><i class="sp-smoke b"></i>`,
    dayak: () => { const D = window.DAYAK; return `<i class="sp-sun"></i>${rays(8)}<img class="sp-mist a" src="${T}fx/mist.webp" alt="">${D ? `<div class="sp-bgt l">${D.batangGaring()}</div><div class="sp-bgt r">${D.batangGaring()}</div><div class="sp-hbf a">${D.hornbill()}</div><div class="sp-hbf b">${D.hornbill()}</div><div class="sp-hbf c">${D.hornbill()}</div>` : ''}${fallers(9, ['feather', 'leafj', 'orchid'], 22)}${rise(16, '255,226,150', 3)}`; },
  };

  // ---------- Tema 10 & 11: kartu sampul penuh (seperti video) yang naik ke atas saat dibuka ----------
  function fullCover(H) {
    const k = H.key, o = H.C.cover, G = window.PANGGUNG || {};
    const ph = H.photo ? `<img src="${H.esc(H.photo)}" alt="" style="object-position:50% 30%">` : '';
    const deco = k === 'airterjun'
      ? `<img class="spf-sky" src="${T}airterjun/milky.webp" alt="">${G.foliage ? `<div class="spf-c tl">${G.foliage(0)}</div><div class="spf-c tr">${G.foliage(1)}</div>` : ''}${G.flowerBed ? `<div class="spf-c bl">${G.flowerBed(0, 3)}</div><div class="spf-c br">${G.flowerBed(1, 11)}</div>` : ''}`
      : `<img class="spf-sky" src="${T}istana/sky.webp" alt="">${G.puff ? `<div class="spf-c pl">${G.puff(['#ffe0d4', '#ffb4a8', '#f0848c'], 0)}</div><div class="spf-c pr">${G.puff(['#ffe0d4', '#ffb4a8', '#f0848c'], 1)}</div>` : ''}${G.roseBush ? `<div class="spf-c bl">${G.roseBush(0, 1)}</div><div class="spf-c br">${G.roseBush(1, 3)}</div>` : ''}`;
    return `<div class="cover pic sp spf spf-${k}" id="cover"><div class="spf-card">${deco}<i class="spf-edge"></i>
      <div class="spf-in">${ph ? `<div class="spf-arch"><div class="spf-ph">${ph}</div></div>` : ''}
        <div class="spf-k">${H.esc(o.kicker)}</div><div class="spf-n">${H.names}</div>
        <div class="spf-to"><span>${H.esc(o.toLabel)}</span><b>${H.esc(H.guest)}</b></div>
        <button class="spf-btn" id="openBtn" type="button"><svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>${H.esc(o.button)}</button></div>
      </div><div class="flyers"></div><div class="sp-fx"></div></div>`;
  }
  const FULL = { airterjun: 1, istana: 1 };
  function cover(H) {
    if (FULL[H.key]) return fullCover(H);
    const k = H.key, o = H.C.cover;
    const names = H.names;
    const amb = H.reduce ? '' : AMB[k]();
    const top = k === 'klasik' ? '' : `<div class="sp-top"><div class="sp-k">${H.esc(o.kicker)}</div>${k === 'princess' ? `<img class="sp-tiara" src="${T}princess/orn.webp" alt="">` : ''}<div class="sp-n">${names}</div></div>`;
    return `<div class="cover pic sp sp-${k}" id="cover">
      <div class="sp-bg"><img src="${H.PT.bg}" alt=""></div><i class="sp-grade"></i>
      <div class="sp-amb" aria-hidden="true">${amb}</div>
      ${top}
      ${k === 'dayak' && window.DAYAK && !H.reduce ? `<div class="sp-dnc l">${window.DAYAK.dancerF()}</div><div class="sp-dnc r">${window.DAYAK.dancerM()}</div>` : ''}
      <div class="sp-mid"><div class="sp-obj" id="openBtn" role="button" tabindex="0" aria-label="${H.esc(o.button)}">${OBJ[k](H)}</div></div>
      <div class="sp-bot"><button class="sp-go" type="button"><i class="sp-hand"></i>${H.esc(o.button)}</button><div class="sp-hint">${HINT[k]}</div></div>
      <div class="flyers"></div><div class="sp-fx"></div>
    </div>`;
  }

  // gerak terus selama sampul ditampilkan (yang tidak bisa dengan CSS saja)
  function idle(cv, H) {
    if (H.reduce) return;
    if (H.key === 'rimba') { const box = $('.lj-bf', cv); if (box) { const b = H.rbf('bf_gold', 10); b.classList.add('lj-b'); box.appendChild(b); } }
  }

  // ---------- pembukaan ----------
  function open(cv, X, H) {
    const D = H.D, k = H.key, fx = $('.sp-fx', cv);
    const later = (fn, ms) => X.later(fn, ms * D);
    const an = (el, kf, o) => el && el.animate(kf, Object.assign({ fill: 'both' }, o, { duration: (o.duration || 1000) * D, delay: (o.delay || 0) * D }));
    const box = cv.getBoundingClientRect();
    const rel = (el) => { const r = el.getBoundingClientRect(); return { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, cx: r.left - box.left + r.width / 2, cy: r.top - box.top + r.height / 2 }; };
    const sparks = (n, x, y, col, spread, ms) => {
      for (let i = 0; i < n; i++) {
        const e = document.createElement('i'); e.className = 'sp-spark'; e.style.cssText = `left:${x}px;top:${y}px;--c:${col}`; fx.appendChild(e);
        const a = rnd(0, 6.283), d = (spread || 90) * rnd(0.4, 1.1);
        an(e, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(0)}px),calc(-50% + ${(Math.sin(a) * d - 20).toFixed(0)}px)) scale(${rnd(0.5, 1.4).toFixed(2)})`, opacity: 0 }], { duration: rnd(800, ms || 1500), delay: rnd(0, 200), easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => e.remove();
      }
    };
    const toss = (imgs, n, x, y, size, up) => { // kelopak/bunga terlempar lalu melayang turun
      for (let i = 0; i < n; i++) {
        const e = document.createElement('img'); e.src = SP + imgs[i % imgs.length] + '.webp'; e.alt = ''; e.className = 'sp-toss'; e.style.cssText = `left:${x}px;top:${y}px;width:${(size * rnd(0.6, 1.3)).toFixed(0)}px`; fx.appendChild(e);
        const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), d = rnd(60, up || 200), dx = Math.cos(a) * d, dy = Math.sin(a) * d;
        an(e, [{ transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 0, easing: 'cubic-bezier(.15,.8,.3,1)' },
          { transform: `translate(calc(-50% + ${dx.toFixed(0)}px),calc(-50% + ${dy.toFixed(0)}px)) scale(1) rotate(${rnd(-120, 120).toFixed(0)}deg)`, opacity: 1, offset: 0.3 },
          { transform: `translate(calc(-50% + ${(dx * 1.5).toFixed(0)}px),calc(-50% + ${(dy + rnd(160, 320)).toFixed(0)}px)) scale(.9) rotate(${rnd(200, 420).toFixed(0)}deg)`, opacity: 0 }], { duration: rnd(2200, 3200), delay: rnd(0, 250), easing: 'linear' }).onfinish = () => e.remove();
      }
    };
    const fadeUI = (ms) => $$('.sp-top,.sp-bot', cv).forEach((e) => an(e, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: ms || 500, easing: 'ease-out' }));
    // kartu (lukisan) membesar sampai persis menjadi lukisan hero
    const zoomCard = (card, at, ms) => later(() => {
      const pb = $('#s-hero .pbox'); if (!pb) return;
      const pr = rel(pb), cr = rel(card);
      const big = document.createElement('div'); big.className = 'sp-big'; big.innerHTML = '<i></i>'; fx.appendChild(big);
      big.style.cssText = `left:${pr.x}px;top:${pr.y}px;width:${pr.w}px;height:${pr.h}px;background-image:url(${H.PT.world})`;
      const s0 = cr.w / pr.w, tx = cr.cx - (pr.x + pr.w / 2), ty = cr.cy - (pr.y + pr.h / 2);
      card.style.visibility = 'hidden';
      an(big, [{ transform: `translate(${tx}px,${ty}px) scale(${s0})` }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.55,.02,.25,1)' });
      an($('i', big), [{ opacity: 1 }, { opacity: 0 }], { duration: ms * 0.8 });
    }, at);
    const flash = (cls, at, ms, peak) => later(() => { const f = document.createElement('i'); f.className = 'sp-flash ' + (cls || ''); fx.appendChild(f); an(f, [{ opacity: 0 }, { opacity: peak || 1, offset: 0.45 }, { opacity: 0 }], { duration: ms, easing: 'ease-in-out' }); }, at);
    const hand = (at, ms) => { later(() => { cv.classList.add('sp-gone'); an(cv, [{ opacity: 1 }, { opacity: 0 }], { duration: ms || 500, easing: 'ease-out' }); }, at); later(() => cv.remove(), at + (ms || 500) + 60); };
    cv.classList.add('opening');
    sfx(k, 'open');
    let ret = {};

    if (k === 'princess') {
      const env = $('.ee-env', cv), seal = $('.ee-seal', cv), flap = $('.ee-flap', cv), card = $('.ee-card', cv), glow = $('.ee-glow', cv), fl = $('.ee-fl', cv);
      fl.style.animationPlayState = 'paused';
      const sr = rel(seal);
      an(seal, [{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.18)', offset: 0.5 }, { transform: 'translate(-50%,-50%) scale(1)' }], { duration: 380, easing: 'ease-in-out' });
      later(() => { // segel lilin terbelah dua dan jatuh
        sfx(k, 'crack'); sparks(22, sr.cx, sr.cy, '255,226,150', 110); toss(['rose1', 'rose2'], 6, sr.cx, sr.cy, 22, 160);
        ['l', 'r'].forEach((s, i) => { const h = seal.cloneNode(true); h.classList.add('half', s); $$('.sp-ping', h).forEach((p) => p.remove()); h.style.left = sr.cx + 'px'; h.style.top = sr.cy + 'px'; fx.appendChild(h);
          an(h, [{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: `translate(calc(-50% + ${i ? 46 : -46}px),calc(-50% + 150px)) rotate(${i ? 70 : -70}deg)`, opacity: 0 }], { duration: 1100, easing: 'cubic-bezier(.3,.1,.7,1)' }); });
        seal.style.visibility = 'hidden';
      }, 360);
      fadeUI(600);
      an(flap, [{ transform: 'perspective(900px) rotateX(0deg)' }, { transform: 'perspective(900px) rotateX(-180deg)' }], { duration: 950, delay: 600, easing: 'cubic-bezier(.5,0,.25,1)' });
      later(() => { flap.style.zIndex = '1'; }, 1075);
      an(glow, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 800, delay: 1000, easing: 'ease-out' });
      const eh = rel(env).h, rise = card.offsetHeight * 0.98 + eh * 0.1;
      an(card, [{ transform: 'translateY(0)' }, { transform: `translateY(${-rise}px)` }], { duration: 1300, delay: 1500, easing: 'cubic-bezier(.35,.05,.2,1)' });
      an(env, [{ transform: 'none' }, { transform: `translateY(${Math.min(box.height * 0.2, eh)}px)` }], { duration: 1300, delay: 1500, easing: 'cubic-bezier(.35,.05,.2,1)' });
      later(() => { const r = rel(card); H.picFlyers(fx, 5, [r.cx, r.cy]); }, 1700);
      zoomCard(card, 2900, 1400);
      an(env, [{ opacity: 1 }, { opacity: 0 }], { duration: 800, delay: 2900, easing: 'ease-in' });
      flash('pink', 3500, 1000, 0.85);
      hand(4150, 450);
      later(() => X.fall(['rose1', 'rose2'], 14, { size: 22, dur: 7000, spread: 3500 }), 4200);
      ret = { camDelay: 4150 * D };
    }

    if (k === 'bali') {
      const gate = $('.kb', cv), med = $('.kb-med', cv), seam = $('.kb-seam', cv), dl = $('.kb-door.l', cv), dr = $('.kb-door.r', cv), op = $('.kb-open', cv), shine = $('.kb-shine', cv), lon = $('.kb-lontar', cv);
      const mr = rel(med), orr = rel(op);
      an(med, [{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.15)', offset: 0.4 }, { transform: 'translate(-50%,-50%) scale(.2) rotate(90deg)', opacity: 0 }], { duration: 700, easing: 'ease-in' });
      later(() => { sfx(k, 'crack'); sparks(18, mr.cx, mr.cy, '255,226,150', 90); }, 450);
      an(lon, [{ transform: 'translateX(-50%) rotate(0)', opacity: 1 }, { transform: 'translateX(-50%) translateY(30px) rotate(-6deg)', opacity: 0 }], { duration: 700, delay: 200, easing: 'ease-in' });
      fadeUI(600);
      an(seam, [{ opacity: 0.8, transform: 'scaleX(1)' }, { opacity: 1, transform: 'scaleX(5)' }], { duration: 600, delay: 400, easing: 'ease-in' });
      const o = { duration: 1700, delay: 750, easing: 'cubic-bezier(.62,0,.22,1)' };
      an(dl, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-108deg)' }], o);
      an(dr, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(108deg)' }], o);
      an(shine, [{ opacity: 0.2 }, { opacity: 0.7 }], { duration: 1200, delay: 800, easing: 'ease-out' });
      later(() => { sfx(k, 'swing'); toss(['frangi1', 'frangi2', 'leafm'], 10, orr.cx, orr.cy, 26, 220); }, 900);
      // kamera melangkah masuk melewati gapura
      gate.style.transformOrigin = `${(orr.cx - rel(gate).x) / rel(gate).w * 100}% ${(orr.cy - rel(gate).y) / rel(gate).h * 100}%`;
      an(gate, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: 0.35 }, { transform: 'scale(5.5)' }], { duration: 2000, delay: 1700, easing: 'cubic-bezier(.55,0,.6,1)' });
      $$('.kb-ted', cv).forEach((t, i) => an(t, [{ transform: 'none' }, { transform: `translateX(${i ? 60 : -60}vw) scale(1.6)`, opacity: 0 }], { duration: 1500, delay: 2000, easing: 'ease-in' }));
      an($('.sp-amb', cv), [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 2200 });
      flash('dawn', 2800, 1300, 1);
      hand(3450, 500);
      later(() => X.fall(['frangi1', 'frangi2', 'leafm'], 16, { size: 24, dur: 6500, spread: 2600 }), 3500);
      ret = { camDelay: 3400 * D };
    }

    if (k === 'emas') {
      const lid = $('.kx-lid', cv), bow = $('.kx-bow', cv), tag = $('.kx-tag', cv), card = $('.kx-card', cv), inn = $('.kx-in', cv), fl = $('.kx-fl', cv), sh = $('.kx-shadow', cv);
      fl.style.animationPlayState = 'paused';
      const br = rel(bow);
      an(bow, [{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.15) rotate(-4deg)', offset: 0.3 }, { transform: 'translate(-50%,-50%) translateY(60px) scale(.5) rotate(40deg)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.5,0,.7,1)' });
      later(() => { sfx(k, 'crack'); sparks(20, br.cx, br.cy, '255,214,120', 100); }, 250);
      an(tag, [{ transform: 'rotate(0)' }, { transform: 'rotate(18deg)', offset: 0.3 }, { transform: 'translateY(140px) rotate(-30deg)', opacity: 0 }], { duration: 1000, delay: 150, easing: 'ease-in' });
      $$('.kx-rib.h.a', cv).forEach((e) => an(e, [{ transform: 'none' }, { transform: 'translateX(-110%)', opacity: 0 }], { duration: 800, delay: 450, easing: 'cubic-bezier(.6,0,.6,1)' }));
      $$('.kx-rib.h.b', cv).forEach((e) => an(e, [{ transform: 'none' }, { transform: 'translateX(110%)', opacity: 0 }], { duration: 800, delay: 450, easing: 'cubic-bezier(.6,0,.6,1)' }));
      $$('.kx-ronce', cv).forEach((e, i) => an(e, [{ transform: e.dataset.t || getComputedStyle(e).transform }, { transform: `translate(${i ? 40 : -40}px,180px) rotate(${i ? 50 : -50}deg)`, opacity: 0 }], { duration: 1100, delay: 350, easing: 'cubic-bezier(.4,0,.8,1)' }));
      fadeUI(600);
      // tutup terangkat, cahaya emas memancar dari dalam
      an(lid, [{ transform: 'translateZ(1px)' }, { transform: 'translateY(-6%) translateZ(70px) rotateX(8deg)', offset: 0.35 }, { transform: 'translateY(-150%) translateZ(140px) rotateX(24deg) rotate(-7deg)', opacity: 0 }], { duration: 1500, delay: 1150, easing: 'cubic-bezier(.5,0,.5,1)' });
      an(sh, [{ opacity: 1 }, { opacity: 0.3 }], { duration: 900, delay: 1150 });
      later(() => sfx(k, 'lid'), 1200);
      an(inn, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0.4 }], { duration: 1800, delay: 1250, easing: 'ease-out' });
      later(() => { const r = rel(card); sparks(26, r.cx, r.cy, '255,226,150', 160, 1800); }, 1500);
      zoomCard(card, 2500, 1400);
      an($('.kx', cv), [{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 2600, easing: 'ease-in' });
      flash('gold', 3100, 1000, 0.8);
      hand(3750, 450);
      ret = { camDelay: 3750 * D, after: 'sun' };
    }

    if (k === 'biru') {
      const up = $('.kr-up', cv), pearl = $('.kr-pearl', cv), lip = $('.kr-lip', cv), halo = $('.kr-halo', cv), fl = $('.kr-fl', cv);
      fl.style.animationPlayState = 'paused';
      an(fl, [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px) rotate(-1deg)', offset: 0.25 }, { transform: 'translateX(3px) rotate(1deg)', offset: 0.5 }, { transform: 'translateX(-2px)', offset: 0.75 }, { transform: 'none' }], { duration: 420 });
      an(lip, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 200 });
      fadeUI(600);
      an(up, [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(146deg)' }], { duration: 1300, delay: 450, easing: 'cubic-bezier(.45,0,.2,1)' });
      later(() => sfx(k, 'crack'), 500);
      an(pearl, [{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0, filter: 'brightness(1)' }, { transform: 'translate(-50%,-80%) scale(1.25)', opacity: 1, filter: 'brightness(1.5)', offset: 0.6 }, { transform: 'translate(-50%,-90%) scale(1.4)', opacity: 1, filter: 'brightness(2.2)' }], { duration: 1500, delay: 900, easing: 'ease-out' });
      an(halo, [{ opacity: 0.4, transform: 'translate(-50%,-50%) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(2.4)' }], { duration: 1500, delay: 1000, easing: 'ease-out' });
      later(() => { const r = rel(pearl); sparks(24, r.cx, r.cy, '210,235,255', 140, 1800); H.picFlyers(fx, 4, [r.cx, r.cy]); }, 1400);
      // riak menyebar di permukaan air, lalu kita menyelam
      later(() => { const r = rel(pearl); for (let i = 0; i < 4; i++) { const g = document.createElement('i'); g.className = 'sp-ring'; g.style.cssText = `left:${r.cx}px;top:${r.cy + 30}px`; fx.appendChild(g); an(g, [{ transform: 'translate(-50%,-50%) scale(.1)', opacity: 0.95 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: 1800, delay: i * 240, easing: 'cubic-bezier(.15,.6,.3,1)' }); } }, 1700);
      later(() => {
        sfx(k, 'dive');
        const d = document.createElement('div'); d.className = 'sp-dive';
        d.innerHTML = `<div class="ev-tint"></div><div class="ev-caus"></div><div class="ev-bub">${Array.from({ length: 26 }, (_, i) => `<i style="left:${(R(i, 1) * 96 + 2).toFixed(1)}%;--s:${(4 + R(i, 2) * 16).toFixed(1)}px;--dx:${((R(i, 3) - 0.5) * 60).toFixed(0)}px;animation-duration:${(1.8 + R(i, 4) * 1.6).toFixed(2)}s;animation-delay:${(R(i, 5) * 1.2).toFixed(2)}s"></i>`).join('')}</div><div class="ev-surf"></div>`;
        fx.appendChild(d);
        an($('.ev-tint', d), [{ opacity: 0 }, { opacity: 0.95, offset: 0.35 }, { opacity: 0.95, offset: 0.7 }, { opacity: 0.6 }], { duration: 1900, easing: 'ease-in-out' });
        an($('.ev-caus', d), [{ opacity: 0 }, { opacity: 0.3, offset: 0.35 }, { opacity: 0.2 }], { duration: 1900 });
        an($('.sp-mid', cv), [{ transform: 'none' }, { transform: 'translateY(-30%) scale(2.2)', opacity: 0 }], { duration: 1200, easing: 'cubic-bezier(.5,0,.7,1)' });
        an($('.ev-surf', d), [{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'translateY(0)', offset: 0.5 }, { opacity: 0, transform: 'translateY(-60%)' }], { duration: 1200, delay: 1500, easing: 'ease-in-out' });
      }, 2300);
      hand(4300, 500);
      later(() => { const r = cv.getBoundingClientRect(); const hp = $('#s-hero .pfx'); if (hp) H.picFlyers(hp, 4, [r.width * 0.5, r.height * 0.7]); }, 4300);
      ret = { camDelay: 4200 * D };
    }

    if (k === 'rimba') {
      const lid = $('.lj-lid', cv), bfBox = $('.lj-bf', cv), ins = $('.lj-ins', cv), aura = $('.lj-aura', cv), fl = $('.lj-fl', cv), tag = $('.lj-tag', cv);
      fl.style.animationPlayState = 'paused';
      an(fl, [{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)', offset: 0.25 }, { transform: 'rotate(3deg)', offset: 0.55 }, { transform: 'rotate(-1deg)', offset: 0.8 }, { transform: 'none' }], { duration: 600 });
      fadeUI(600);
      an(tag, [{ transform: 'rotate(0)' }, { transform: 'rotate(14deg)', offset: 0.3 }, { transform: 'rotate(-8deg)', offset: 0.65 }, { transform: 'rotate(0)' }], { duration: 1400, delay: 100 });
      an(lid, [{ transform: 'translateX(-50%) translateY(0) rotate(0)' }, { transform: 'translateX(-50%) translateY(-6px) rotate(-8deg)', offset: 0.25 }, { transform: 'translateX(-50%) translateY(-40vh) rotate(-160deg) scale(.7)', opacity: 0 }], { duration: 1500, delay: 500, easing: 'cubic-bezier(.4,0,.6,1)' });
      later(() => sfx(k, 'crack'), 600);
      an(aura, [{ opacity: 0.7, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.6)' }], { duration: 900, delay: 650 });
      // kunang-kunang di dalam lentera berhamburan keluar lewat mulut lentera
      later(() => {
        const jr = rel($('.lj-glass', cv)), mx = jr.cx, my = jr.y;
        $$('i', ins).forEach((f) => f.remove());
        for (let i = 0; i < 18; i++) { const e = document.createElement('i'); e.className = 'sp-fly'; e.style.cssText = `left:${mx + rnd(-20, 20)}px;top:${my + rnd(0, 30)}px`; fx.appendChild(e); const a = rnd(-Math.PI, 0), d = rnd(90, 260); an(e, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(0)}px),calc(-50% + ${(Math.sin(a) * d - 80).toFixed(0)}px)) scale(1)`, opacity: 0.9, offset: 0.7 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * d * 1.2).toFixed(0)}px),calc(-50% + ${(Math.sin(a) * d - 150).toFixed(0)}px)) scale(.5)`, opacity: 0 }], { duration: rnd(1800, 2600), delay: rnd(0, 400), easing: 'cubic-bezier(.2,.6,.4,1)' }); }
      }, 900);
      // kupu-kupu cahaya terbang keluar, berputar, lalu terbang ke arah kita
      later(() => {
        const b = $('.lj-b', bfBox), r0 = rel(bfBox); if (b) b.remove();
        const bf = H.rbf('bf_gold', 64); bf.classList.add('pguide', 'sp-bfly'); fx.appendChild(bf);
        sfx(k, 'fly');
        const W = box.width, Hh = box.height, s = 64;
        const P = [[r0.cx, r0.cy, 0.3, 0], [r0.cx + 30, r0.cy - 120, 0.8, 20], [W * 0.78, Hh * 0.3, 1, 50], [W * 0.5, Hh * 0.16, 1, -30], [W * 0.24, Hh * 0.32, 1.1, -60], [W * 0.5, Hh * 0.45, 6, 0]];
        an(bf, P.map(([x, y, sc, r], i) => ({ transform: `translate(${(x - s / 2).toFixed(0)}px,${(y - s / 2).toFixed(0)}px) rotate(${r}deg) scale(${sc})`, opacity: i === 0 ? 0 : i === P.length - 1 ? 0.2 : 1, offset: [0, 0.14, 0.38, 0.58, 0.76, 1][i] })), { duration: 2600, easing: 'cubic-bezier(.45,.05,.55,.95)' });
        let last = 0; const t0 = performance.now(), trail = (now) => { if (!bf.isConnected || now - t0 > 2500 * D) return; requestAnimationFrame(trail); if (now - last < 50) return; last = now; const m = new DOMMatrixReadOnly(getComputedStyle(bf).transform); const d = document.createElement('i'); d.className = 'ptr'; d.style.cssText = `left:${m.e + s / 2}px;top:${m.f + s / 2}px;--s:${rnd(3, 7).toFixed(1)}px`; fx.appendChild(d); setTimeout(() => d.remove(), 1700); };
        requestAnimationFrame(trail);
      }, 1000);
      an($('.lj', cv), [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(30px) scale(.9)' }], { duration: 900, delay: 2200, easing: 'ease-in' });
      flash('moon', 3000, 1100, 1);
      hand(3550, 450);
      ret = { camDelay: 3500 * D, after: 'guide' };
    }

    if (k === 'klasik') {
      const gun = $('.kl-gun', cv), img = $('img', gun), shadow = $('.kl-shadow', cv), flame = $('.kl-flame', cv), warm = $('.kl-warm', cv), kl = $('.kl', cv);
      later(() => sfx(k, 'gong'), 0);
      fadeUI(600);
      an($('.kl-to', cv), [{ opacity: 1 }, { opacity: 0 }], { duration: 500 });
      // kayon dicabut dari gedebog, diputar (kayon "gunungan" dimainkan dalang), menyapu kelir
      const kf = [
        { transform: 'translate(-50%,0) rotateY(0deg) rotate(0deg) scale(1)' },
        { transform: 'translate(-50%,-14%) rotateY(0deg) rotate(0deg) scale(1)', offset: 0.14 },
        { transform: 'translate(-50%,-16%) rotateY(180deg) rotate(-10deg) scale(1.02)', offset: 0.28 },
        { transform: 'translate(-50%,-16%) rotateY(360deg) rotate(8deg) scale(1.02)', offset: 0.42 },
        { transform: 'translate(-110%,-18%) rotateY(360deg) rotate(-16deg) scale(1)', offset: 0.55 },
        { transform: 'translate(10%,-18%) rotateY(360deg) rotate(16deg) scale(1)', offset: 0.7 },
        { transform: 'translate(-50%,-18%) rotateY(360deg) rotate(0deg) scale(1.05)', offset: 0.8 },
        { transform: 'translate(-50%,-10%) rotateY(360deg) rotate(0deg) scale(7)', opacity: 0 }];
      an(gun, kf, { duration: 3300, delay: 150, easing: 'cubic-bezier(.45,0,.4,1)' });
      $$('.sp-ping', gun).forEach((p) => p.remove());
      an(shadow, kf.map((f) => ({ transform: f.transform.replace(/scale\(([\d.]+)\)/, (m, v) => `scale(${(+v * 1.25).toFixed(2)})`), opacity: f.opacity === 0 ? 0 : 0.5, offset: f.offset })), { duration: 3300, delay: 230, easing: 'cubic-bezier(.45,0,.4,1)' });
      an(flame, [{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.8)', offset: 0.5 }, { transform: 'translateX(-50%) scale(1.3)' }], { duration: 1600, delay: 1900 });
      an(warm, [{ opacity: 0.6 }, { opacity: 1 }], { duration: 1200, delay: 1900 });
      later(() => { const r = rel(gun); sparks(16, r.cx, r.cy, '255,170,80', 120, 1600); }, 2300);
      an(kl, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.6)' }], { duration: 1100, delay: 2800, easing: 'cubic-bezier(.5,0,.7,1)' });
      flash('ember', 3000, 1200, 1);
      hand(3650, 450);
      ret = { camDelay: 3600 * D, after: 'kelir' };
    }
    if (FULL[k]) { // kartu naik ke atas, adegan di bawahnya terlihat (seperti video)
      const card = $('.spf-card', cv);
      sfx(k, 'swing');
      an(card, [{ transform: 'translateY(0)' }, { transform: 'translateY(-104%)' }], { duration: 1500, delay: 150, easing: 'cubic-bezier(.6,0,.25,1)' });
      hand(1650, 200);
      return { camDelay: 1000 * D };
    }
    if (k === 'dayak') {
      const ds = $('.ds', cv), rot = $('.ds-rot', cv), hl = $('.ds-h.l', cv), hr = $('.ds-h.r', cv), plq = $('.ds-plq', cv), aura = $('.ds-aura', cv), seam = $('.ds-seam', cv), light = $('.ds-light', cv);
      sfx(k, 'gong'); cv.classList.add('ds-wake');
      $$('.sp-ping', ds).forEach((p) => p.remove());
      const cur = getComputedStyle(rot).transform; rot.style.animation = 'none';
      an(plq, [{ transform: 'translateX(-50%) rotate(0)', opacity: 1 }, { transform: 'translateX(-50%) rotate(12deg)', offset: 0.3 }, { transform: 'translateX(-50%) translateY(60px) rotate(-20deg)', opacity: 0 }], { duration: 900, easing: 'ease-in' });
      fadeUI(600);
      an(aura, [{ opacity: 0.6, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.5)', offset: 0.5 }, { opacity: 0.7, transform: 'translate(-50%,-50%) scale(1.2)' }], { duration: 1600 });
      // tameng berputar penuh (ketebalan kayu terlihat), lalu menghadap kita lagi
      an(rot, [{ transform: cur === 'none' ? 'none' : cur }, { transform: 'rotateY(180deg) rotateX(8deg) scale(1.08)', offset: 0.5 }, { transform: 'rotateY(360deg) rotateX(0deg) scale(1.16)' }], { duration: 1500, delay: 250, easing: 'cubic-bezier(.45,0,.3,1)' });
      later(() => sfx(k, 'crack'), 1500);
      an(seam, [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'scaleY(1)' }], { duration: 400, delay: 1650, easing: 'ease-out' });
      // terbelah dua seperti pintu, cahaya pagi Malinau di dalamnya
      const o = { duration: 1300, delay: 1950, easing: 'cubic-bezier(.6,0,.2,1)' };
      an(hl, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-118deg)' }], o);
      an(hr, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(118deg)' }], o);
      an(light, [{ opacity: 0.3 }, { opacity: 1 }], { duration: 900, delay: 1950 });
      an($('.ds-in', cv), [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 1900 }); an($('.ds-sheen', cv), [{ opacity: 1 }, { opacity: 0 }], { duration: 200, delay: 1900 });
      $$('.ds-back,.ds-ed', cv).forEach((e) => an(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: 1950 }));
      later(() => {
        sfx(k, 'swing'); const r = rel(ds); sparks(20, r.cx, r.cy, '255,214,120', 140, 1800); toss(['orchid', 'leafj', 'feather', 'orchid'], 9, r.cx, r.cy, 24, 230);
        if (window.DAYAK) for (let i = 0; i < 3; i++) { const b = document.createElement('div'); b.className = 'sp-hbo'; b.innerHTML = window.DAYAK.hornbill(); fx.appendChild(b); const dir = i === 1 ? 0 : i ? 1 : -1;
          an(b, [{ transform: `translate(${r.cx}px,${r.cy}px) translate(-50%,-50%) scale(.15) scaleX(${dir || 1})`, opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(${r.cx + dir * box.width * 0.6}px,${r.cy - box.height * (0.3 + i * 0.08)}px) translate(-50%,-50%) scale(${1.6 + i * 0.3}) scaleX(${dir || 1})`, opacity: 0.95 }], { duration: 1700, delay: i * 160, easing: 'cubic-bezier(.4,0,.7,1)' }); }
        sfx(k, 'fly');
      }, 2150);
      // kamera melangkah masuk melewati tameng
      an(ds, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.3 }, { transform: 'scale(4.5)', opacity: 0.2 }], { duration: 1500, delay: 2600, easing: 'cubic-bezier(.55,0,.6,1)' });
      $$('.sp-dnc', cv).forEach((e, i) => an(e, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${i ? 40 : -40}vw) scale(1.3)`, opacity: 0 }], { duration: 1200, delay: 2500, easing: 'ease-in' }));
      an($('.sp-amb', cv), [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 2600 });
      flash('dawn', 3100, 1200, 1);
      hand(3700, 500);
      later(() => X.fall(['orchid', 'leafj', 'orchid'], 10, { size: 22, dur: 7500, spread: 3000 }), 3700);
      ret = { camDelay: 3650 * D };
    }
    return ret;
  }

  window.SAMPUL = { cover, idle, open, keys: Object.keys(OBJ).concat(Object.keys(FULL)) };
})();
