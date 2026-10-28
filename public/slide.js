/* Tema 13 — Slide Foto: setiap bagian = satu slide layar penuh berfoto, teks & foto masuk dengan animasi.
   Alur: sampul foto/video → (buka) → pembuka otomatis (foto + teks) → mempelai pria / wanita (satu slide masing-masing)
   → ayat + hitung mundur → akad / resepsi (foto + gradasi putih di bawah agar teks jelas) → love story, galeri, live,
   gift, RSVP, ucapan memakai tampilan Tema 12 (bersih) → penutup berfoto.
   Dipakai invitation.js lewat window.SLIDE = { cover, hero, couple, quote, events, closing, open, fx, order, assets, deco, colors }. */
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
  const up = (cls, d, inner, tag) => `<${tag || 'div'} class="${cls} sl-up" style="--d:${d}ms">${inner}</${tag || 'div'}>`;

  // ---------- foto / video / YouTube ----------
  function media(H, o, k, cls) {
    const u = H.safeUrl(o && o[k]); if (!u) return '';
    const id = ytId(u);
    if (id) return `<iframe class="sl-m sl-yt ${cls || ''}" src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0&disablekb=1" allow="autoplay; encrypted-media" tabindex="-1" title="" loading="lazy"></iframe>`;
    if (VID.test(u)) return `<video class="sl-m ${cls || ''}" src="${H.esc(u)}" muted loop playsinline autoplay preload="auto" disablepictureinpicture disableremoteplayback onerror="this.remove()"></video>`;
    return `<img class="sl-m ${cls || ''}" src="${H.esc(u)}" alt="${E(H, H.alt || '')}" decoding="async" style="${H.adj(o, k)}">`;
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
        <div class="sl-cv-hd sl-fade" style="--d:300ms"><span>${E(H, C.hero.dateText)}</span><b>${E(H, lab)}</b><span class="loc">${loc ? `${H.ICON.pin}${E(H, loc)}` : ''}</span></div>
        <div class="sl-cv-k">${chars(H, o.kicker, 40, 450)}</div>
        <div class="sl-cv-sp"></div>
        <div class="sl-cv-nm">${wipe(H, o.names, 900)}</div>
        <div class="sl-cv-to">
          ${up('sl-cv-dear', 1700, E(H, o.toLabel))}
          ${up('sl-cv-g', 1900, E(H, H.guest || o.defaultGuest))}
          ${txt ? `<p class="sl-cv-tx">${words(H, txt, 28, 2300)}</p>` : ''}
        </div>
        <button class="sl-cv-btn sl-pop" id="openBtn" type="button" style="--d:2900ms">${H.icon}${E(H, o.button)}</button>
      </div></div>`;
  }

  // ---------- 2. pembuka (slide 2, tampil otomatis setelah undangan dibuka) ----------
  function hero(H) {
    const C = H.C, h = C.hero, s = sl(H);
    const a = pick(H, [[s, 'openMedia'], [C.cover, 'photo'], [s, 'coverMedia'], [C.mono || {}, 'coverMedia']]);
    const b = s.openMedia2 && H.safeUrl(s.openMedia2) ? [s, 'openMedia2'] : null;
    const nm = [h.groom, h.bride].filter(Boolean).join(' & ');
    return `<section class="sec hero sl-open pre${tone(H)}" id="s-hero" style="--shd:${shade(H)}" data-two="${b ? 1 : 0}">
      <div class="sl-ph"><div class="sl-pk a">${ph(H, a, 'sl-pm')}</div>${b ? `<div class="sl-pk b">${ph(H, b, 'sl-pm')}</div>` : ''}</div>
      <i class="sl-sh t"></i><i class="sl-sh b"></i>
      <div class="sl-op-in">
        <div class="sl-op-k">${chars(H, h.kicker, 38, 700)}</div>
        <h1 class="sl-op-n">${wipe(H, nm, 1100)}</h1>
        <i class="sl-line sl-draw" style="--d:2000ms"></i>
        ${up('sl-op-d', 2300, E(H, h.dateText))}
        ${h.hashtag ? up('sl-op-t', 2600, E(H, h.hashtag)) : ''}
      </div>
      <div class="sl-scroll" aria-hidden="true"><i></i></div></section>`;
  }

  // ---------- 3. mempelai: satu slide per orang ----------
  function person(H, o, x, side) {
    const md = x.photo && H.safeUrl(x.photo) ? media(H, x, 'photo', 'sl-pm') : '';
    const lab = side === 'g' ? (sl(H).groomLabel == null ? 'Mempelai Pria' : sl(H).groomLabel) : (sl(H).brideLabel == null ? 'Mempelai Wanita' : sl(H).brideLabel);
    const ig = H.safeUrl(x.instagram) ? `<a class="sl-ig sl-pop" style="--d:2300ms" href="${H.link(x.instagram)}" target="_blank" rel="noopener">${H.ICON.ig}<span>${E(H, o.instagramLabel)}</span></a>` : '';
    return `<div class="sl-s sl-pp ${side}${tone(H)}">
      <div class="sl-ph from-${side === 'g' ? 'l' : 'r'}"><div class="sl-pk">${md}</div></div><i class="sl-sh t"></i><i class="sl-sh w"></i>
      <div class="sl-pp-in">
        ${lab ? up('sl-pp-l', 250, E(H, lab)) : ''}
        <div class="sl-pp-n">${wipe(H, x.fullName || x.script, 500)}</div>
        <div class="sl-pp-p">${words(H, x.parents, 36, 1300)}</div>
        ${ig}
      </div></div>`;
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
        ${arabic ? `<p class="rv qar" dir="rtl" lang="ar" style="--ars:${ars}">${H.br(arabic)}</p>` : ''}
        <p class="rv qt">${H.br(text)}</p><div class="rv src">${E(H, o.source)}</div>
        <div class="rv cds" id="cds"><div class="cd"><b data-k="d">00</b><span>${E(H, l.days)}</span></div><div class="sep">:</div><div class="cd"><b data-k="h">00</b><span>${E(H, l.hours)}</span></div><div class="sep">:</div><div class="cd"><b data-k="m">00</b><span>${E(H, l.minutes)}</span></div><div class="sep">:</div><div class="cd"><b data-k="s">00</b><span>${E(H, l.seconds)}</span></div></div>
        <a class="rv btn sq up sl-save" id="saveDate" target="_blank" rel="noopener">${H.ICON.cal}${E(H, o.saveButton)}</a>
      </div>
      <div class="sl-q-ph"><div class="sl-ph"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div></div></div></section>`;
  }

  // ---------- 5. akad / resepsi: foto penuh + gradasi putih di bawah ----------
  function events(H) {
    const C = H.C, o = C.events, s = sl(H), items = o.items || [];
    const slides = items.map((e, i) => {
      const own = e && e.photo && H.safeUrl(e.photo) ? [e, 'photo'] : null;
      const alt = i === 0 ? [s, 'akadMedia'] : i === 1 ? [s, 'resepsiMedia'] : [s, 'resepsiMedia'];
      const src = own || pick(H, [alt, [o, 'bg'], [C.cover, 'photo'], [s, 'coverMedia']]);
      const side = i % 2 ? 'r' : 'l';
      return `<div class="sl-s sl-ev ${side}${tone(H)}">
        <div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh w"></i>
        <div class="sl-ev-in">
          <div class="sl-ev-t">${wipe(H, e.title, 700)}</div>
          ${up('sl-ev-d', 1300, E(H, e.date))}
          ${up('sl-ev-h', 1500, E(H, e.time))}
          <div class="sl-ev-pl sl-up" style="--d:1750ms"><b>${E(H, e.place)}</b></div>
          <p class="sl-ev-ad">${words(H, e.address, 26, 1950)}</p>
          ${H.safeUrl(e.mapUrl) ? `<a class="sl-map sl-pop" style="--d:2500ms" href="${H.link(e.mapUrl)}" target="_blank" rel="noopener">${H.ICON.map}<span>${E(H, o.mapLabel)}</span></a>` : ''}
        </div></div>`;
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
        <div class="sl-cl-k">${chars(H, o.kicker, 44, 500)}</div>
        <div class="sl-cl-n">${wipe(H, o.names, 1100)}</div>
        <div class="sl-cl-hr sl-up" style="--d:1900ms" aria-hidden="true"><i></i>${H.ICON.heart}<i></i></div>
        <p class="sl-cl-tx">${words(H, o.text, 30, 2200)}</p>
      </div>
      <div class="footer sl-cl-ft">${H.safeUrl(o.footerUrl) ? `<a href="${H.link(o.footerUrl)}" target="_blank" rel="noopener">${E(H, o.footer)}</a>` : E(H, o.footer)}</div></div></section>`;
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
  let io = null;
  function fx(root) {
    root = root || document.getElementById('app'); if (!root) return;
    if (io) { io.disconnect(); io = null; }
    const els = root.querySelectorAll('.sl-s');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) { els.forEach((e) => e.classList.add('sl-go')); return; }
    io = new IntersectionObserver((es) => es.forEach((e) => {
      const r = e.intersectionRatio, vh = innerHeight;
      if (e.isIntersecting && (r >= 0.4 || e.intersectionRect.height >= vh * 0.45)) e.target.classList.add('sl-go');
      else if (!e.isIntersecting) e.target.classList.remove('sl-go');
    }), { threshold: [0, 0.2, 0.4, 0.6] });
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

  window.SLIDE = {
    cover, hero, couple, quote, events, closing, open, fx, order, chars, words,
    deco: M.deco || {}, colors: M.colors || {}, assets: M.assets || [],
  };
})();
