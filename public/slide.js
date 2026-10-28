/* Tema 13 — Slide Foto: setiap bagian = satu slide layar penuh berfoto, teks & foto masuk dengan animasi.
   Alur: sampul foto/video → (buka) → pembuka otomatis (foto + teks) → mempelai pria / wanita (satu slide masing-masing)
   → ayat + hitung mundur → akad / resepsi (foto + gradasi putih di bawah agar teks jelas) → love story, galeri, live,
   gift, RSVP, ucapan memakai tampilan Tema 12 (bersih) → penutup berfoto.
   Dipakai invitation.js lewat window.SLIDE = { cover, hero, couple, quote, events, story, closing, open, fx, order, assets, deco, colors }. */
(function () {
  'use strict';
  const M = window.MONO || {};
  const VID = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
  const DEF = /\/assets\/default\//;
  const ytId = (u) => (String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1];

  // urutan tetap tema ini (sesuai alur referensi); bagian yang dimatikan di admin tetap dilewati
  const ORDER = ['hero', 'greeting', 'couple', 'quote', 'events', 'story', 'gallery', 'live', 'gift', 'rsvp', 'wishes', 'closing'];
  const order = (list) => (list || []).map((s, i) => [s, i]).sort((a, b) => {
    const x = ORDER.indexOf(a[0].id), y = ORDER.indexOf(b[0].id);
    return (x < 0 ? 99 + a[1] : x) - (y < 0 ? 99 + b[1] : y);
  }).map((p) => p[0]);

  // ---------- teks beranimasi ----------
  const E = (H, s) => H.esc(s);
  function chars(H, s, step, start) {
    let n = 0; step = step || 42; start = start || 0;
    return String(s == null ? '' : s).split(/(\s+)/).map((w) => (!w || /^\s+$/.test(w)) ? ' '
      : `<span class="sl-w">${[...w].map((c) => `<span class="sl-c" style="--d:${start + (n++) * step}ms">${E(H, c)}</span>`).join('')}</span>`).join('');
  }
  function words(H, s, step, start) {
    let n = 0; step = step || 32; start = start || 0;
    return String(s == null ? '' : s).split('\n').map((ln) => ln.split(/\s+/).filter(Boolean)
      .map((w) => `<span class="sl-wd" style="--d:${start + (n++) * step}ms">${E(H, w)}</span>`).join(' ')).join('<br>');
  }
  const wipe = (H, s, start) => `<span class="sl-wipe" style="--d:${start || 0}ms"><span>${E(H, s)}</span></span>`;
  const up = (cls, d, inner, tag, ad) => `<${tag || 'div'} class="${cls} sl-up" style="--d:${d}ms"${ad ? ` data-ad="${ad}"` : ''}>${inner}</${tag || 'div'}>`;

  // ---------- foto / video / YouTube ----------
  function media(H, o, k, cls) {
    const u = H.safeUrl(o && o[k]); if (!u) return '';
    const id = ytId(u);
    if (id) return `<iframe class="sl-m sl-yt ${cls || ''}" src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0&disablekb=1" allow="autoplay; encrypted-media" tabindex="-1" title="" loading="lazy"></iframe>`;
    if (VID.test(u)) return `<video class="sl-m ${cls || ''}" src="${H.esc(u)}" muted loop playsinline autoplay preload="auto" disablepictureinpicture disableremoteplayback onerror="this.remove()"></video>`;
    const a = H.A ? H.A(o, k) : {}, x = Math.min(100, Math.max(0, +a.x >= 0 ? +a.x : 50)), y = Math.min(100, Math.max(0, +a.y >= 0 ? +a.y : 50)), z = Math.min(4, Math.max(1, +a.z || 1));
    return `<span class="sl-zm" style="transform-origin:${x}% ${y}%;transform:scale(${z})"><img class="sl-m ${cls || ''}" src="${H.esc(u)}" alt="${E(H, H.alt || '')}" decoding="async" style="object-position:${x}% ${y}%"></span>`;
  }
  // pilih sumber foto pertama yang terisi (foto buatan sendiri didahulukan dari gambar bawaan /assets/default/)
  function pick(H, list) {
    const ok = list.filter((x) => x && H.safeUrl(x[0][x[1]]));
    return ok.find((x) => !DEF.test(x[0][x[1]])) || ok[0] || null;
  }
  const sl = (H) => H.C.slide || {};
  const coverSrc = (H) => { const C = H.C, s = sl(H), m = C.mono || {}; return pick(H, [[s, 'coverMedia'], [m, 'coverMedia'], [C.cover, 'photo']]); };
  const ph = (H, src, cls) => src ? media(H, src[0], src[1], cls) : '';
  const tone = (H) => (sl(H).grayPhoto === true ? ' gray' : '');
  const shade = (H) => { const v = parseFloat(sl(H).shade); return isFinite(v) ? Math.min(2, Math.max(0, v / 100)) : 1; };


  // ---------- tata letak: "Layar penuh" (teks menimpa foto) atau foto berbingkai rasio tetap di atas + teks di bawah ----------
  // Nilai bentuk = rasio lebar/tinggi foto (mis. 3/4). '9/19' / kosong = layar penuh. Rasio yang sama dipakai pratinjau "Atur posisi" di admin,
  // jadi yang terlihat saat menggeser foto = yang tampil di undangan (tidak ada lagi bagian yang tiba-tiba terpotong).
  const RATIO = /^\d+(\.\d+)?\/\d+(\.\d+)?$/;
  const shapeOf = (v, d) => { v = String(v == null ? '' : v); return v === 'full' || v === '9/19' ? '' : RATIO.test(v) ? v : (d || ''); };
  const rv = (sh) => { const [w, h] = sh.split('/').map(Number); return `--ratio:${w} / ${h};--rh:${(h / w).toFixed(4)}`; };
  const nudge = (v) => { v = parseFloat(v); return isFinite(v) ? Math.min(60, Math.max(-20, v)) : 0; };
  const pos = (v, d) => (v === 'top' || v === 'bottom' || v === 'middle' ? v : d);
  const ali = (v, d) => (v === 'left' || v === 'center' || v === 'right' ? v : d);

  // ---------- 1. sampul ----------
  function cover(H) {
    const C = H.C, o = C.cover, s = sl(H), src = coverSrc(H);
    let md = ph(H, src, 'sl-cv-m');
    const poster = H.safeUrl(s.coverPoster) || H.safeUrl((C.mono || {}).coverPoster);
    if (poster && /^<video /.test(md)) md = md.replace('<video ', `<video poster="${H.esc(poster)}" `);
    const lab = s.coverLabel == null ? 'Wedding Invitation' : s.coverLabel, loc = s.coverLoc == null ? '' : s.coverLoc;
    const txt = s.coverText == null ? '' : s.coverText;
    return `<div class="cover slcv${tone(H)}" id="cover" style="--shd:${shade(H)}">
      <div class="sl-cv-bg${md ? '' : ' none'}"><div class="sl-cv-kb">${md}</div></div><i class="sl-cv-sh"></i>
      <div class="sl-cv-in">
        <div class="sl-cv-hd sl-fade" style="--d:300ms" data-ad="cv.hd"><span>${E(H, C.hero.dateText)}</span><b>${E(H, lab)}</b><span class="loc">${loc ? `${H.ICON.pin}${E(H, loc)}` : ''}</span></div>
        <div class="sl-cv-k" data-ad="cv.k">${chars(H, o.kicker, 40, 450)}</div>
        <div class="sl-cv-sp"></div>
        <div class="sl-cv-nm" data-ad="cv.nm">${wipe(H, o.names, 900)}</div>
        <div class="sl-cv-to">
          ${up('sl-cv-dear', 1700, E(H, o.toLabel), null, 'cv.dear')}
          ${up('sl-cv-g', 1900, E(H, H.guest || o.defaultGuest), null, 'cv.g')}
          ${txt ? `<p class="sl-cv-tx" data-ad="cv.tx">${words(H, txt, 28, 2300)}</p>` : ''}
        </div>
        <button class="sl-cv-btn sl-pop" id="openBtn" type="button" style="--d:2900ms" data-ad="cv.btn">${H.icon}${E(H, o.button)}</button>
      </div></div>`;
  }

  // ---------- 2. pembuka (slide 2, tampil otomatis setelah undangan dibuka) ----------
  function hero(H) {
    const C = H.C, h = C.hero, s = sl(H);
    const a = pick(H, [[s, 'openMedia'], [C.cover, 'photo'], [s, 'coverMedia'], [C.mono || {}, 'coverMedia']]);
    const b = s.openMedia2 && H.safeUrl(s.openMedia2) ? [s, 'openMedia2'] : null;
    const nm = [h.groom, h.bride].filter(Boolean).join(' & ');
    return `<section class="sec hero sl-open pre${tone(H)} tp-${pos(s.openPos, 'top')}" id="s-hero" style="--shd:${shade(H)};--ty:${nudge(s.openNudge)}svh" data-two="${b ? 1 : 0}">
      <div class="sl-ph"><div class="sl-pan"><div class="sl-pk a">${ph(H, a, 'sl-pm')}</div>${b ? `<div class="sl-pk b">${ph(H, b, 'sl-pm')}</div>` : ''}</div></div>
      <i class="sl-sh t"></i><i class="sl-sh b"></i>
      <div class="sl-op-in">
        <div class="sl-op-k" data-ad="op.k">${chars(H, h.kicker, 38, 700)}</div>
        <h1 class="sl-op-n" data-ad="op.n">${wipe(H, nm, 1100)}</h1>
        <i class="sl-line sl-draw" style="--d:2000ms"></i>
        ${up('sl-op-d', 2300, E(H, h.dateText), null, 'op.d')}
        ${h.hashtag ? up('sl-op-t', 2600, E(H, h.hashtag), null, 'op.t') : ''}
      </div>
      <div class="sl-scroll" aria-hidden="true"><i></i></div></section>`;
  }

  // ---------- 3. mempelai: satu slide per orang ----------
  function person(H, o, x, side) {
    const s = sl(H), own = side === 'g' ? s.groomMedia : s.brideMedia;
    // foto khusus Tema 13 didahulukan; bila kosong memakai foto di menu Mempelai
    const src = H.safeUrl(own) ? [s, side === 'g' ? 'groomMedia' : 'brideMedia'] : (x.photo && H.safeUrl(x.photo) ? [x, 'photo'] : null);
    const md = src ? media(H, src[0], src[1], 'sl-pm') : '';
    const shape = shapeOf(s.coupleShape), tp = pos(side === 'g' ? s.groomPos : s.bridePos, 'top');
    const al = ali(s.coupleAlign, side === 'g' ? 'left' : 'right');
    const lab = side === 'g' ? (s.groomLabel == null ? 'Mempelai Pria' : s.groomLabel) : (s.brideLabel == null ? 'Mempelai Wanita' : s.brideLabel);
    const ig = H.safeUrl(x.instagram) ? `<a class="sl-ig sl-pop" style="--d:2300ms" data-ad="${side}.ig" href="${H.link(x.instagram)}" target="_blank" rel="noopener">${H.ICON.ig}<span>${E(H, o.instagramLabel)}</span></a>` : '';
    const txt = `<div class="sl-pp-in al-${al}">
        ${lab ? up('sl-pp-l', 250, E(H, lab), null, side + '.l') : ''}
        <div class="sl-pp-n" data-ad="${side}.n">${wipe(H, x.fullName || x.script, 500)}</div>
        <div class="sl-pp-p" data-ad="${side}.p">${words(H, x.parents, 36, 1300)}</div>
        ${ig}
      </div>`;
    if (shape) { // foto berbingkai rasio tetap di atas, teks di bawah (tidak menutupi wajah)
      return `<div class="sl-s sl-pp split ${side}${tone(H)}" style="${rv(shape)};--ty:${nudge(s.coupleNudge)}px">
      <div class="sl-fr"><div class="sl-ph from-${side === 'g' ? 'l' : 'r'}"><div class="sl-pk">${md}</div></div><i class="sl-sh f"></i></div>${txt}</div>`;
    }
    return `<div class="sl-s sl-pp ${side} tp-${tp}${tone(H)}" style="--ty:${nudge(s.coupleNudge)}svh">
      <div class="sl-ph from-${side === 'g' ? 'l' : 'r'}"><div class="sl-pk">${md}</div></div><i class="sl-sh ${tp === 'bottom' ? 'b' : 't'}"></i>${tp === 'bottom' ? '' : '<i class="sl-sh w"></i>'}${txt}</div>`;
  }
  function couple(H) {
    const o = H.C.couple;
    return `<section class="sec sl-couple" id="s-couple">${person(H, o, o.groom, 'g')}${person(H, o, o.bride, 'b')}</section>`;
  }

  // ---------- 4. ayat + hitung mundur ----------
  function quote(H) {
    const C = H.C, o = C.quote, l = o.labels, s = sl(H);
    const isAr = (t) => { const a = (t.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length, n = (t.match(/[A-Za-z\u0600-\u06FF\uFB50-\uFEFF]/g) || []).length; return a > 0 && a >= n * 0.5; };
    const lines = String(o.text || '').split('\n'), own = String(o.arabic || '').trim(), arabic = own || lines.filter(isAr).join('\n'), text = own ? o.text : lines.filter((t) => !isAr(t)).join('\n').trim();
    const ars = { normal: 1, large: 1.25, xl: 1.5 }[o.arabicSize] || 1.25;
    const src = pick(H, [[s, 'quoteMedia'], [o, 'bg'], [C.cover, 'photo'], [s, 'coverMedia']]);
    return `<section class="sec sl-quote" id="s-quote"><div class="sl-s sl-q${tone(H)}">
      <div class="sl-q-in">
        ${arabic ? `<p class="rv qar" dir="rtl" lang="ar" style="--ars:${ars}" data-ad="q.ar">${H.br(arabic)}</p>` : ''}
        <p class="rv qt" data-ad="q.t">${H.br(text)}</p><div class="rv src" data-ad="q.src">${E(H, o.source)}</div>
        <div class="rv cds" id="cds" data-ad="q.cd"><div class="cd"><b data-k="d">00</b><span>${E(H, l.days)}</span></div><div class="sep">:</div><div class="cd"><b data-k="h">00</b><span>${E(H, l.hours)}</span></div><div class="sep">:</div><div class="cd"><b data-k="m">00</b><span>${E(H, l.minutes)}</span></div><div class="sep">:</div><div class="cd"><b data-k="s">00</b><span>${E(H, l.seconds)}</span></div></div>
        <a class="rv btn sq up sl-save" id="saveDate" data-ad="q.btn" target="_blank" rel="noopener">${H.ICON.cal}${E(H, o.saveButton)}</a>
      </div>
      <div class="sl-q-ph"><div class="sl-ph"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div></div></div></section>`;
  }

  // ---------- 5. akad / resepsi ----------
  function events(H) {
    const C = H.C, o = C.events, s = sl(H), items = o.items || [];
    const slides = items.map((e, i) => {
      const own = e && e.photo && H.safeUrl(e.photo) ? [e, 'photo'] : null;
      const alt = i === 0 ? [s, 'akadMedia'] : [s, 'resepsiMedia'];
      const src = own || pick(H, [alt, [o, 'bg'], [C.cover, 'photo'], [s, 'coverMedia']]);
      const side = i % 2 ? 'r' : 'l';
      const shape = shapeOf(e.shape, shapeOf(s.eventShape)), tp = pos(s.eventPos, 'bottom') === 'top' ? 'top' : 'bottom';
      const al = ali(s.eventAlign, side === 'r' ? 'right' : 'left');
      const inner = `<div class="sl-ev-in al-${al}">
          <div class="sl-ev-t" data-ad="e${i}.t">${wipe(H, e.title, 700)}</div>
          ${up('sl-ev-d', 1300, E(H, e.date), null, 'e' + i + '.d')}
          ${up('sl-ev-h', 1500, E(H, e.time), null, 'e' + i + '.h')}
          <div class="sl-ev-pl sl-up" style="--d:1750ms" data-ad="e${i}.pl"><b>${E(H, e.place)}</b></div>
          <p class="sl-ev-ad" data-ad="e${i}.ad">${words(H, e.address, 26, 1950)}</p>
          ${H.safeUrl(e.mapUrl) ? `<a class="sl-map sl-pop" style="--d:2500ms" data-ad="e${i}.map" href="${H.link(e.mapUrl)}" target="_blank" rel="noopener">${H.ICON.map}<span>${E(H, o.mapLabel)}</span></a>` : ''}
        </div>`;
      if (shape) return `<div class="sl-s sl-ev split ${side}${tone(H)}" style="${rv(shape)};--ty:${nudge(s.eventNudge)}px">
        <div class="sl-fr"><div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh f"></i></div>${inner}</div>`;
      return `<div class="sl-s sl-ev ${side} tp-${tp}${tone(H)}" style="--ty:${nudge(s.eventNudge)}svh;--fade:${Math.min(90, Math.max(20, parseFloat(s.eventFade) || 74))}%">
        <div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh w"></i>${inner}</div>`;
    }).join('');
    return `<section class="sec sl-events" id="s-events">${slides}</section>`;
  }

  // ---------- 6. penutup berfoto ----------
  function closing(H) {
    const C = H.C, o = C.closing, s = sl(H);
    const src = pick(H, [[s, 'closingMedia'], [o, 'bg'], [o, 'photo'], [C.cover, 'photo'], [s, 'coverMedia']]);
    return `<section class="sec sl-closing" id="s-closing" style="--shd:${shade(H)}"><div class="sl-s sl-cl${tone(H)}">
      <div class="sl-ph"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh c"></i>
      <div class="sl-cl-in">
        <div class="sl-cl-k" data-ad="cl.k">${chars(H, o.kicker, 44, 500)}</div>
        <div class="sl-cl-n" data-ad="cl.n">${wipe(H, o.names, 1100)}</div>
        <div class="sl-cl-hr sl-up" style="--d:1900ms" aria-hidden="true" data-ad="cl.hr"><i></i>${H.ICON.heart}<i></i></div>
        <p class="sl-cl-tx" data-ad="cl.tx">${words(H, o.text, 30, 2200)}</p>
      </div>
      <div class="footer sl-cl-ft">${H.safeUrl(o.footerUrl) ? `<a href="${H.link(o.footerUrl)}" target="_blank" rel="noopener">${E(H, o.footer)}</a>` : E(H, o.footer)}</div></div></section>`;
  }

  // ---------- 7. love story: judul → foto lebar penuh (kabut di tepi) → cerita + tahun, dipisah garis vertikal tipis ----------
  function story(H) {
    const o = H.C.story || {}, s = sl(H), items = o.items || [], dflt = shapeOf(s.storyShape, '4/5') || '4/5';
    const head = `<div class="sl-s sl-ch-h"><div class="sl-ch-ht" data-ad="st.h">${chars(H, o.title, 38, 100)}</div><i class="sl-vl sl-draw" style="--d:900ms"></i></div>`;
    const chs = items.map((e, i) => {
      const sh = shapeOf(e.shape, dflt) || dflt, side = i % 2 ? 'r' : 'l';
      const src = e.image && H.safeUrl(e.image) ? [e, 'image'] : null;
      return `<div class="sl-s sl-ch${tone(H)}" style="${rv(sh)}">
        <div class="sl-ch-t" data-ad="ch.t">${wipe(H, e.title, 150)}</div>
        <div class="sl-fr"><div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh f2"></i><i class="sl-sh f"></i></div>
        <div class="sl-ch-b"><p class="sl-ch-tx" data-ad="ch.tx">${words(H, e.text, 22, 700)}</p>${e.year ? up('sl-ch-y', 1500, E(H, e.year), null, 'ch.y') : ''}</div>
        ${i < items.length - 1 ? '<i class="sl-vl sl-draw sl-vl-e" style="--d:1900ms"></i>' : ''}</div>`;
    }).join('');
    return `<section class="sec sl-story" id="s-story">${head}${chs}</section>`;
  }

  // ---------- buka undangan: sampul naik, pembuka (slide 2) langsung tampil otomatis ----------
  function open(X) {
    const { cover: cv, hero: hr, D, instant, unlock, finish, later } = X;
    const play = () => { hr.classList.remove('pre'); hr.classList.add('play'); };
    if (instant || !cv) { if (cv) cv.remove(); hr.classList.add('instant'); play(); hr.classList.add('done', 'shown'); unlock(); finish(); return; }
    cv.classList.add('sl-out'); cv.style.setProperty('--mo', (1.2 * D).toFixed(2) + 's');
    later(play, 380 * D);
    unlock();
    later(() => { cv.remove(); hr.classList.add('done', 'shown'); finish(); }, 1300 * D);
  }

  // ---------- teks & foto tiap slide diputar ulang setiap kali slide masuk layar ----------
  let io = null, parOff = null;
  function parallax(on) {
    if (parOff) { parOff(); parOff = null; }
    if (!on) return;
    const els = [...document.querySelectorAll('#app .sl-s .sl-pk, #app .sl-open .sl-pk')]; if (!els.length) return;
    let raf = 0;
    const tick = () => {
      raf = 0; const vh = innerHeight;
      els.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        el.style.setProperty('--py', (-p * Math.min(r.height * 0.035, 34)).toFixed(1) + 'px');
      });
    };
    const on_ = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener('scroll', on_, { passive: true }); addEventListener('resize', on_); tick();
    parOff = () => { removeEventListener('scroll', on_); removeEventListener('resize', on_); };
  }
  function fx(root, cfg) {
    root = root || document.getElementById('app'); if (!root) return;
    const s = (cfg && cfg.slide) || {}, rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const de = document.documentElement;
    de.dataset.slAnim = ['mist', 'zoom', 'slide', 'fade'].includes(s.animStyle) ? s.animStyle : 'mist';
    const par = s.parallax !== false && !rm; de.dataset.slPar = par ? '1' : '0';
    parallax(par);
    if (io) { io.disconnect(); io = null; }
    const els = root.querySelectorAll('.sl-s');
    if (!('IntersectionObserver' in window) || rm) { els.forEach((e) => e.classList.add('sl-go')); return; }
    io = new IntersectionObserver((es) => es.forEach((e) => {
      const r = e.intersectionRatio, vh = innerHeight;
      if (e.isIntersecting && (r >= 0.35 || e.intersectionRect.height >= vh * 0.45)) e.target.classList.add('sl-go');
      else if (!e.isIntersecting) e.target.classList.remove('sl-go');
    }), { threshold: [0, 0.2, 0.35, 0.6] });
    els.forEach((e) => io.observe(e));
  }

  // pembuka dengan 2 foto: bergantian otomatis (hanya saat slide tampil)
  let tm = null;
  function two(hero) {
    clearInterval(tm);
    if (!hero || hero.dataset.two !== '1') return;
    let k = 0; const a = hero.querySelector('.sl-pk.a'), b = hero.querySelector('.sl-pk.b'); if (!a || !b) return;
    tm = setInterval(() => { if (!hero.classList.contains('play')) return; k ^= 1; hero.classList.toggle('alt', !!k); }, 5200);
  }
  if (window.MutationObserver && document.body) {
    new MutationObserver((ms) => ms.forEach((m) => {
      const t = m.target; if (!t || t.id !== 's-hero' || !t.classList || !t.classList.contains('sl-open')) return;
      const on = t.classList.contains('play');
      if (on && !t._pl) { t._pl = true; two(t); } else if (!on && t._pl) { t._pl = false; clearInterval(tm); t.classList.remove('alt'); }
    })).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }

  // ---------- posisi & ukuran tulisan (diatur di admin: slide.adj = { "cv.nm": {x, y, s} }) ----------
  // x, y = geser dalam % lebar layar (satuan cqw, jadi sama persis di HP kecil maupun besar); s = ukuran dalam % (100 = bawaan).
  // Memakai properti `translate` & `scale` (terpisah dari `transform`) agar tidak bentrok dengan animasi teks masuk.
  function adjust(cfg) {
    const adj = (cfg && cfg.slide && cfg.slide.adj) || {};
    document.querySelectorAll('[data-ad]').forEach((el) => {
      const a = adj[el.dataset.ad] || {}, x = parseFloat(a.x) || 0, y = parseFloat(a.y) || 0, sc = parseFloat(a.s) > 0 ? parseFloat(a.s) / 100 : 1;
      el.style.translate = x || y ? `${x}cqw ${y}cqw` : '';
      el.style.scale = sc !== 1 ? String(sc) : '';
    });
  }
  // pratinjau admin: tulisan bisa ditarik langsung (geser) dan Shift + roda mouse = besar/kecil; hasil dikirim ke admin lewat done(adj)
  let editOn = false, lastDrag = 0;
  function edit(getAdj, done) {
    if (editOn) return; editOn = true;
    document.documentElement.classList.add('sl-edit');
    const wrapOf = (el) => el.closest('.cover,.sl-s,.sl-open');
    document.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      const el = e.target.closest && e.target.closest('[data-ad]'); if (!el) return;
      const cont = wrapOf(el); if (!cont) return;
      const key = el.dataset.ad, w = cont.getBoundingClientRect().width || 1, adj = getAdj();
      const a0 = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {}), x0 = e.clientX, y0 = e.clientY; let moved = false;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      el.classList.add('sl-dragging');
      const mv = (ev) => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        const n = { x: +((parseFloat(a0.x) || 0) + dx / w * 100).toFixed(2), y: +((parseFloat(a0.y) || 0) + dy / w * 100).toFixed(2), s: a0.s };
        adj[key] = n; el.style.translate = `${n.x}cqw ${n.y}cqw`;
      };
      const up = () => {
        el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('sl-dragging');
        if (moved) { lastDrag = Date.now(); done(JSON.parse(JSON.stringify(adj))); }
      };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    }, true);
    // klik setelah menggeser jangan ikut menekan tombol (mis. Buka Undangan)
    document.addEventListener('click', (e) => { if (Date.now() - lastDrag < 400 && e.target.closest('[data-ad]')) { e.preventDefault(); e.stopPropagation(); } }, true);
    let wt = 0;
    document.addEventListener('wheel', (e) => {
      if (!e.shiftKey) return;
      const el = e.target.closest && e.target.closest('[data-ad]'); if (!el) return;
      e.preventDefault();
      const key = el.dataset.ad, adj = getAdj(), a = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {});
      a.s = Math.round(Math.min(300, Math.max(30, (parseFloat(a.s) || 100) + (e.deltaY < 0 ? 4 : -4))));
      adj[key] = a; el.style.scale = a.s === 100 ? '' : String(a.s / 100);
      clearTimeout(wt); wt = setTimeout(() => done(JSON.parse(JSON.stringify(adj))), 350);
    }, { passive: false });
  }

  // ---------- tombol ke atas (muncul setelah menggulir ke bawah) ----------
  function toTop(on) {
    let b = document.getElementById('slTop');
    if (!on) { if (b) b.remove(); return; }
    if (b) return;
    const host = document.getElementById('fixwrap') || document.body;
    b = document.createElement('button'); b.id = 'slTop'; b.type = 'button'; b.className = 'sl-top'; b.setAttribute('aria-label', 'Kembali ke atas');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 6.5l-7 7 1.4 1.4L12 9.3l5.6 5.6L19 13.5z" fill="currentColor"/></svg>';
    b.addEventListener('click', () => { scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); });
    host.appendChild(b);
    let raf = 0;
    const chk = () => { raf = 0; b.classList.toggle('on', scrollY > innerHeight * 1.1 && !document.body.classList.contains('locked')); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(chk); }, { passive: true }); chk();
  }

  window.SLIDE = {
    cover, hero, couple, quote, events, story, closing, open, fx, order, chars, words, adjust, edit, toTop,
    deco: M.deco || {}, colors: M.colors || {}, assets: M.assets || [],
  };
})();
