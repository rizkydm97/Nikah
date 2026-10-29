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
  const ZOOMOK = !!(window.CSS && CSS.supports && CSS.supports('zoom', '1')); // kanvas tetap: nilai geser vertikal = persen tinggi kanvas, bukan tinggi layar
  const CQ = window.CQ || { w: (n) => n + 'cqw', h: (n) => n + 'cqh' };  const U = (window.CSS && CSS.supports && CSS.supports('height', '1svh')) ? 'svh' : 'vh';
  const NU = (n) => (ZOOMOK ? `calc(var(--cvh,780px)*${(n / 100).toFixed(4)})` : n + U);
  const E = (H, s) => H.esc(s);
  function chars(H, s, step, start) {
    let n = 0; step = step || 42; start = start || 0;
    return String(s == null ? '' : s).split(/\r?\n/).map((ln) => ln.split(/(\s+)/).map((w) => (!w || /^\s+$/.test(w)) ? ' '
      : `<span class="sl-w">${[...w].map((c) => `<span class="sl-c" style="--d:${start + (n++) * step}ms">${E(H, c)}</span>`).join('')}</span>`).join('')).join('<br>');
  }
  function words(H, s, step, start) {
    let n = 0; step = step || 32; start = start || 0;
    return String(s == null ? '' : s).split('\n').map((ln) => ln.split(/\s+/).filter(Boolean)
      .map((w) => `<span class="sl-wd" style="--d:${start + (n++) * step}ms">${E(H, w)}</span>`).join(' ')).join('<br>');
  }
  const wipe = (H, s, start) => `<span class="sl-wipe" style="--d:${start || 0}ms"><span>${E(H, s).replace(/\r?\n/g, '<br>')}</span></span>`;
  const up = (cls, d, inner, tag, ad, extra) => `<${tag || 'div'} class="${cls} sl-up" style="--d:${d}ms"${ad ? ` data-ad="${ad}"` : ''}${extra || ''}>${String(inner).replace(/\r?\n/g, '<br>')}</${tag || 'div'}>`;
  // data-tx = alamat teks di konfigurasi (dipakai pratinjau admin: klik 2× pada tulisan untuk mengubah teksnya langsung)
  const tx = (path, ml) => ` data-tx="${path}"${ml ? ' data-ml="1"' : ''}`;

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


  // ---------- nama mempelai = 3 bagian terpisah (nama 1, "&", nama 2), masing-masing bisa digeser/diperbesar sendiri di admin ----------
  // key = awalan kunci data-ad (mis. "cv" -> cv.n1, cv.n2, cv.n3); start = jeda animasi bagian pertama (ms); legacy = kunci lama satu blok nama
  function nameParts(H, a, b, key, start, legacy, txs) {
    const out = [];
    const add = (txt, i, d) => out.push(`<span class="sl-np n${i}" data-ad="${key}.n${i}"${txs && i !== 2 && txs[i === 3 ? 1 : 0] ? tx(txs[i === 3 ? 1 : 0]) : ''}>${wipe(H, txt, d)}</span>`);
    a = String(a == null ? '' : a).trim(); b = String(b == null ? '' : b).trim();
    if (a && b) { add(a, 1, start); add('&', 2, start + 380); add(b, 3, start + 700); }
    else if (a || b) add(a || b, 1, start);
    return `<span class="sl-nm3" data-adg="${legacy}">${out.join('')}</span>`;
  }
  const splitNames = (v) => { // "Adi & Debby" -> ['Adi', 'Debby'] (hanya & pertama yang memisah)
    const t = String(v == null ? '' : v), i = t.indexOf('&');
    return i < 0 ? [t.trim(), ''] : [t.slice(0, i).trim(), t.slice(i + 1).trim()];
  };

  // ---------- 1. sampul ----------
  function cover(H) {
    const C = H.C, o = C.cover, s = sl(H), src = coverSrc(H);
    let md = ph(H, src, 'sl-cv-m');
    const poster = H.safeUrl(s.coverPoster) || H.safeUrl((C.mono || {}).coverPoster);
    if (poster && /^<video /.test(md)) md = md.replace('<video ', `<video poster="${H.esc(poster)}" `);
    const lab = s.coverLabel == null ? 'Wedding Invitation' : s.coverLabel, loc = s.coverLoc == null ? '' : s.coverLoc;
    const txt = s.coverText == null ? '' : s.coverText, nm = splitNames(o.names);
    return `<div class="cover slcv${tone(H)}" id="cover" style="--shd:${shade(H)}">
      <div class="sl-cv-bg${md ? '' : ' none'}"><div class="sl-cv-kb">${md}</div></div><i class="sl-cv-sh"></i>
      <div class="sl-cv-in">
        <div class="sl-cv-hd sl-fade" style="--d:300ms" data-ad="cv.hd"><span>${E(H, C.hero.dateText)}</span><b>${E(H, lab)}</b><span class="loc">${loc ? `${H.ICON.pin}${E(H, loc)}` : ''}</span></div>
        <div class="sl-cv-k" data-ad="cv.k"${tx('cover.kicker')}>${words(H, o.kicker, 90, 450)}</div>
        <div class="sl-cv-sp"></div>
        <div class="sl-cv-nm">${nameParts(H, nm[0], nm[1], 'cv', 900, 'cv.nm', ['cover.names#0', 'cover.names#1'])}</div>
        <div class="sl-cv-to">
          ${up('sl-cv-dear', 2000, E(H, o.toLabel), null, 'cv.dear', tx('cover.toLabel'))}
          ${up('sl-cv-g', 2200, E(H, H.guest || o.defaultGuest), null, 'cv.g')}
          ${txt ? `<p class="sl-cv-tx" data-ad="cv.tx"${tx('slide.coverText', true)}>${words(H, txt, 28, 2600)}</p>` : ''}
        </div>
        <button class="sl-cv-btn sl-pop" id="openBtn" type="button" style="--d:3200ms" data-ad="cv.btn">${H.icon}${E(H, o.button)}</button>
      </div></div>`;
  }

  // ---------- 2. pembuka (slide 2, tampil otomatis setelah undangan dibuka) ----------
  function hero(H) {
    const C = H.C, h = C.hero, s = sl(H);
    const a = pick(H, [[s, 'openMedia'], [C.cover, 'photo'], [s, 'coverMedia'], [C.mono || {}, 'coverMedia']]);
    // foto ke-2: isian "Foto pembuka 2"; bila kosong dicarikan foto lain (cover / mempelai) yang berbeda dari foto 1
    const b = pick(H, [[s, 'openMedia2'], [s, 'coverMedia'], [C.mono || {}, 'coverMedia'], [s, 'groomMedia'], [s, 'brideMedia'], [C.cover, 'photo']].filter((x) => !a || H.safeUrl(x[0][x[1]]) !== H.safeUrl(a[0][a[1]])));
    const two = !!(a && b && !DEF.test(b[0][b[1]] || ''));
    const dir = s.openDir === 'left' ? 'l' : 'r';
    // deretan 2 foto bersisian; seluruh deretan bergeser pelan ke kanan (kamera menyapu dari foto 1 ke foto 2)
    const strip = two
      ? `<div class="sl-strip dir-${dir}"><div class="sl-tile"><div class="sl-pk a">${ph(H, a, 'sl-pm')}</div></div><div class="sl-tile"><div class="sl-pk b">${ph(H, b, 'sl-pm')}</div></div></div>`
      : `<div class="sl-pan"><div class="sl-pk a">${ph(H, a, 'sl-pm')}</div></div>`;
    return `<section class="sec hero sl-open pre${tone(H)} tp-${pos(s.openPos, 'top')}" id="s-hero" style="--shd:${shade(H)};--ty:${NU(nudge(s.openNudge))}" data-two="${two ? 1 : 0}">
      <div class="sl-ph">${strip}</div>
      <i class="sl-sh t"></i><i class="sl-sh b"></i>
      <div class="sl-op-in">
        <div class="sl-op-k" data-ad="op.k"${tx('hero.kicker')}>${chars(H, h.kicker, 38, 1500)}</div>
        <h1 class="sl-op-n">${nameParts(H, h.groom, h.bride, 'op', 1900, 'op.n', ['hero.groom', 'hero.bride'])}</h1>
        <i class="sl-line sl-draw" style="--d:3200ms" data-ad="op.line"></i>
        ${up('sl-op-d', 3500, E(H, h.dateText), null, 'op.d', tx('hero.dateText'))}
        ${h.hashtag ? up('sl-op-t', 3800, E(H, h.hashtag), null, 'op.t', tx('hero.hashtag')) : ''}
      </div>
      <div class="sl-scroll" aria-hidden="true" data-ad="op.sc"><i></i></div></section>`;
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
        ${lab ? up('sl-pp-l', 250, E(H, lab), null, side + '.l', tx(side === 'g' ? 'slide.groomLabel' : 'slide.brideLabel')) : ''}
        <div class="sl-pp-n" data-ad="${side}.n"${tx('couple.' + (side === 'g' ? 'groom' : 'bride') + '.fullName')}>${wipe(H, x.fullName || x.script, 500)}</div>
        <div class="sl-pp-p" data-ad="${side}.p"${tx('couple.' + (side === 'g' ? 'groom' : 'bride') + '.parents', true)}>${words(H, x.parents, 36, 1300)}</div>
        ${ig}
      </div>`;
    if (shape) { // foto berbingkai rasio tetap di atas, teks di bawah (tidak menutupi wajah)
      return `<div class="sl-s sl-pp split ${side}${tone(H)}" style="${rv(shape)};--ty:${nudge(s.coupleNudge)}px">
      <div class="sl-fr"><div class="sl-ph from-${side === 'g' ? 'l' : 'r'}"><div class="sl-pk">${md}</div></div><i class="sl-sh f"></i></div>${txt}</div>`;
    }
    return `<div class="sl-s sl-pp ${side} tp-${tp}${tone(H)}" style="--ty:${NU(nudge(s.coupleNudge))}">
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
    const src = pick(H, [[s, 'quoteMedia'], [o, 'bg'], [C.cover, 'photo'], [s, 'coverMedia']]), srcOwn = src && !DEF.test(src[0][src[1]]) ? src : null; // tanpa foto sendiri: foto bawaan tidak ditampilkan
    const cd0 = (arabic ? 1100 : 500) + Math.min(60, String(text).split(/\s+/).filter(Boolean).length) * 30 + 700;
    return `<section class="sec sl-quote" id="s-quote"><div class="sl-s sl-q${tone(H)}">
      <div class="sl-q-in">
        <div class="sl-sorn sl-q-orn" aria-hidden="true"><i></i><em></em><i></i></div>
        ${arabic ? `<p class="qar sl-ar" dir="rtl" lang="ar" style="--ars:${ars}" data-ad="q.ar"${own ? tx('quote.arabic', true) : ''}>${H.br(arabic)}</p>` : ''}
        <p class="qt" data-mnx="x" data-ad="q.t"${own ? tx('quote.text', true) : ''}>${words(H, text, 30, arabic ? 1100 : 500)}</p>
        <div class="src sl-up" data-mnx="x" style="--d:${(arabic ? 1100 : 500) + Math.min(60, String(text).split(/\s+/).filter(Boolean).length) * 30 + 250}ms" data-ad="q.src"${tx('quote.source')}>${E(H, o.source).replace(/\r?\n/g, '<br>')}</div>
        <div class="cds" id="cds" data-ad="q.cd">${[['d', l.days], ['h', l.hours], ['m', l.minutes], ['s', l.seconds]].map((c, k) => `${k ? `<div class="sep sl-fade" style="--d:${cd0 + k * 170 - 60}ms">:</div>` : ''}<div class="cd sl-pop" style="--d:${cd0 + k * 170}ms"><b data-k="${c[0]}">00</b><span>${E(H, c[1])}</span></div>`).join('')}</div>
        <a class="btn sq up sl-save sl-pop" id="saveDate" data-ad="q.btn" style="--d:${cd0 + 800}ms" target="_blank" rel="noopener">${H.ICON.cal}${E(H, o.saveButton)}</a>
      </div>
      ${srcOwn ? `<div class="sl-q-ph"><div class="sl-ph"><div class="sl-pk">${ph(H, srcOwn, 'sl-pm')}</div></div></div>` : ''}</div></section>`;
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
          <div class="sl-ev-t" data-ad="e${i}.t"${tx('events.items.' + i + '.title')}>${wipe(H, e.title, 700)}</div>
          ${up('sl-ev-d', 1300, E(H, e.date), null, 'e' + i + '.d', tx('events.items.' + i + '.date'))}
          ${up('sl-ev-h', 1500, E(H, e.time), null, 'e' + i + '.h', tx('events.items.' + i + '.time'))}
          <div class="sl-ev-pl sl-up" style="--d:1750ms" data-ad="e${i}.pl"${tx('events.items.' + i + '.place')}><b>${E(H, e.place).replace(/\r?\n/g, '<br>')}</b></div>
          <p class="sl-ev-ad" data-ad="e${i}.ad"${tx('events.items.' + i + '.address', true)}>${words(H, e.address, 26, 1950)}</p>
          ${H.safeUrl(e.mapUrl) ? `<a class="sl-map sl-pop" style="--d:2500ms" data-ad="e${i}.map" href="${H.link(e.mapUrl)}" target="_blank" rel="noopener">${H.ICON.map}<span>${E(H, o.mapLabel)}</span></a>` : ''}
        </div>`;
      if (shape) return `<div class="sl-s sl-ev split ${side}${tone(H)}" style="${rv(shape)};--ty:${nudge(s.eventNudge)}px">
        <div class="sl-fr"><div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh f"></i></div>${inner}</div>`;
      return `<div class="sl-s sl-ev ${side} tp-${tp}${tone(H)}" style="--ty:${NU(nudge(s.eventNudge))};--fade:${Math.min(90, Math.max(20, parseFloat(s.eventFade) || 74))}%">
        <div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh w"></i>${inner}</div>`;
    }).join('');
    return `<section class="sec sl-events" id="s-events">${slides}</section>`;
  }

  // ---------- 6. penutup berfoto (mewah): tirai iris terbuka → bingkai garis menggambar diri → nama berkilau → kilau melayang ----------
  function closing(H) {
    const C = H.C, o = C.closing, s = sl(H);
    const src = pick(H, [[s, 'closingMedia'], [o, 'bg'], [o, 'photo'], [C.cover, 'photo'], [s, 'coverMedia']]);
    const spark = [[8, 12, 0, 7], [19, 38, 1.4, 9], [31, 6, 2.8, 8], [44, 52, 0.7, 10], [57, 20, 3.6, 7.5], [68, 44, 2.1, 9.5], [79, 10, 4.4, 8], [90, 34, 1.1, 10], [14, 64, 3.1, 11], [36, 72, 4.8, 8.5], [62, 68, 0.3, 10.5], [85, 60, 2.6, 9], [50, 30, 5.2, 12], [25, 24, 3.9, 11], [74, 26, 1.8, 12]]
      .map((q) => `<b style="left:${q[0]}%;bottom:${q[1]}%;--sd:${q[2]}s;--sp:${q[3]}s"></b>`).join('');
    const nmc = splitNames(o.names);
    const ft = String(o.footer == null ? '' : o.footer).trim();
    const m = /^([\s\S]*?)[\s·|,–—-]*((?:19|20)\d{2})$/.exec(ft);
    const fn = m ? m[1].trim() : ft, fy = m ? m[2] : '';
    const fin = `<i class="sl-ft-div sl-draw" style="--d:100ms" data-ad="cl.fd" aria-hidden="true"></i><div class="sl-ft-n" data-ad="cl.ft"${tx('closing.footer')}>${chars(H, fn, 55, 350)}</div>`
      + (fy ? `<div class="sl-ft-y sl-up" style="--d:1100ms" data-ad="cl.fy"><i></i><span>${E(H, fy)}</span><i></i></div>` : '');
    const ftHtml = H.safeUrl(o.footerUrl) ? `<a href="${H.link(o.footerUrl)}" target="_blank" rel="noopener">${fin}</a>` : fin;
    return `<section class="sec sl-closing" id="s-closing" style="--shd:${shade(H)}"><div class="sl-s sl-cl${tone(H)}">
      <div class="sl-ph"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh c"></i><i class="sl-vg"></i>
      <div class="sl-cl-fx" aria-hidden="true">${spark}<u></u></div>
      <div class="sl-cl-fr" aria-hidden="true"><i class="t"></i><i class="b"></i><i class="l"></i><i class="r"></i><em class="a"></em><em class="b"></em><em class="c"></em><em class="d"></em></div>
      <div class="sl-cl-in">
        <div class="sl-cl-orn sl-draw" style="--d:1500ms" aria-hidden="true" data-ad="cl.orn"><i></i><em></em><i></i></div>
        <div class="sl-cl-k" data-ad="cl.k"${tx('closing.kicker')}>${chars(H, o.kicker, 44, 1700)}</div>
        <div class="sl-cl-n">${nameParts(H, nmc[0], nmc[1], 'cl', 2500, 'cl.n', ['closing.names#0', 'closing.names#1'])}</div>
        <div class="sl-cl-hr sl-up" style="--d:3500ms" aria-hidden="true" data-ad="cl.hr"><i></i>${H.ICON.heart}<i></i></div>
        <p class="sl-cl-tx" data-ad="cl.tx"${tx('closing.text', true)}>${words(H, o.text, 30, 3800)}</p>
      </div>
      </div><div class="footer sl-foot">${ftHtml}</div></section>`;
  }

  // ---------- 7. love story: judul → foto lebar penuh (kabut di tepi) → cerita + tahun, dipisah garis vertikal tipis ----------
  function story(H) {
    const o = H.C.story || {}, s = sl(H), items = o.items || [], dflt = shapeOf(s.storyShape, '4/5') || '4/5';
    const head = `<div class="sl-s sl-ch-h"><div class="sl-ch-ht" data-ad="st.h"${tx('story.title')}>${chars(H, o.title, 38, 100)}</div><i class="sl-vl sl-draw" style="--d:900ms"></i></div>`;
    const chs = items.map((e, i) => {
      const sh = shapeOf(e.shape, dflt) || dflt, side = i % 2 ? 'r' : 'l';
      const src = e.image && H.safeUrl(e.image) ? [e, 'image'] : null;
      return `<div class="sl-s sl-ch${tone(H)}" style="${rv(sh)}">
        <div class="sl-ch-t" data-ad="ch.t"${tx('story.items.' + i + '.title')}>${wipe(H, e.title, 150)}</div>
        <div class="sl-fr"><div class="sl-ph from-${side}"><div class="sl-pk">${ph(H, src, 'sl-pm')}</div></div><i class="sl-sh f2"></i><i class="sl-sh f"></i></div>
        <div class="sl-ch-b"><p class="sl-ch-tx" data-ad="ch.tx"${tx('story.items.' + i + '.text', true)}>${words(H, e.text, 22, 700)}</p>${e.year ? up('sl-ch-y', 1500, E(H, e.year), null, 'ch.y', tx('story.items.' + i + '.year')) : ''}</div>
        ${i < items.length - 1 ? '<i class="sl-vl sl-draw sl-vl-e" style="--d:1900ms"></i>' : ''}</div>`;
    }).join('');
    return `<section class="sec sl-story" id="s-story">${head}${chs}</section>`;
  }

  // ---------- buka undangan: sampul naik, pembuka (slide 2) langsung tampil otomatis ----------
  function open(X) {
    const { cover: cv, hero: hr, D, instant, unlock, finish, later } = X;
    const play = () => { hr.classList.remove('pre'); hr.classList.add('play'); };
    if (instant || !cv) { if (cv) cv.remove(); hr.classList.add('instant'); play(); hr.classList.add('done', 'shown'); unlock(); finish(); return; }
    // seperti referensi: teks cover memudar naik → layar gelap sejenak → foto pembuka muncul dari bawah (kecil → membesar) → deretan foto bergeser
    cv.classList.add('sl-out'); cv.style.setProperty('--mo', (0.9 * D).toFixed(2) + 's');
    unlock();
    later(() => cv.classList.add('sl-out2'), 750 * D);
    later(play, 1050 * D);
    later(() => { cv.remove(); hr.classList.add('done', 'shown'); finish(); }, 2100 * D);
  }

  // ---------- teks & foto tiap slide diputar ulang setiap kali slide masuk layar ----------
  let io = null, io2 = null, parOff = null;
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
  // ---------- galeri: foto bergeser sedikit lebih lambat daripada bingkainya saat menggulir (parallax tipis di dalam bingkai) ----------
  let gOff = null;
  function galleryPar(root, on) {
    if (gOff) { gOff(); gOff = null; }
    if (!on) return;
    const imgs = [...root.querySelectorAll('.gallery .gi img')]; if (!imgs.length) return;
    let raf = 0;
    const tick = () => {
      raf = 0; const vh = innerHeight;
      imgs.forEach((im) => {
        const f = im.closest('.gi'); if (!f) return;
        const r = f.getBoundingClientRect(); if (r.bottom < -60 || r.top > vh + 60) return;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        im.style.setProperty('--gpy', (-p * Math.min(r.height * 0.05, 22)).toFixed(1) + 'px');
      });
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick); tick();
    gOff = () => { removeEventListener('scroll', kick); removeEventListener('resize', kick); cancelAnimationFrame(raf); };
  }
  // ---------- galeri: zoom-parallax (foto-foto tersusun lalu membesar satu per satu saat digulir, seperti komponen ZoomParallax) ----------
  // tata letak = kotak kecil (lebar/tinggi/geser dalam % lebar & tinggi layar kerja) di sekitar kotak tengah; tiap foto punya skala akhir berbeda
  const ZP = [[25, 25, 0, 0, 4], [35, 30, 5, -30, 5], [20, 45, -25, -10, 6], [25, 25, 27.5, 0, 5], [20, 25, 5, 27.5, 6], [30, 25, -22.5, 27.5, 8], [15, 15, 25, 22.5, 9]];
  let zpOff = null;
  function zoomPar(root, cfg, on) {
    if (zpOff) { zpOff(); zpOff = null; }
    root.querySelectorAll('.sl-zp').forEach((e) => e.remove());
    if (!on) return;
    const g = root.querySelector('.gallery'), h2 = g && g.querySelector('h2'); if (!g || !h2) return;
    const items = ((cfg && cfg.gallery && cfg.gallery.items) || []).map((x) => x && x.image).filter((u) => u && !DEF.test(u) && /^(https?:\/\/|\/(?!\/))/i.test(String(u)) && !VID.test(u)).slice(0, 7);
    if (items.length < 3) return; // butuh minimal 3 foto sendiri agar susunannya terlihat bagus
    const wrap = document.createElement('div'); wrap.className = 'sl-zp';
    // foto dirender di ukuran AKHIR (besar) lalu diperkecil di awal — bukan kotak kecil yang ditarik membesar — agar tetap tajam saat zoom
    const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    wrap.innerHTML = '<div class="sl-zp-st">' + items.map((u, i) => { const z = ZP[i], k = z[4];
      return `<div class="sl-zp-i" data-k="${k}" style="width:${k * 100}%;height:${k * 100}%;left:${50 - k * 50}%;top:${50 - k * 50}%;transform:scale(${(1 / k).toFixed(4)})"><div class="sl-zp-b" style="width:${z[0]}%;height:${z[1]}%;left:${z[2]}%;top:${z[3]}%"><img src="${esc(u)}" alt="" decoding="async" draggable="false"></div></div>`; }).join('') + '</div>';
    h2.insertAdjacentElement('afterend', wrap);
    const els = [...wrap.querySelectorAll('.sl-zp-i')]; let raf = 0;
    const tick = () => {
      raf = 0; const r = wrap.getBoundingClientRect(), span = r.height - innerHeight; if (span <= 0) return;
      const p = Math.min(1, Math.max(0, -r.top / span) / 0.84); // 84% gulir pertama = zoom, sisanya jeda di foto penuh
      els.forEach((el) => { const k = +el.dataset.k; el.style.transform = `scale(${((1 + (k - 1) * p) / k).toFixed(4)})`; });
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick); tick();
    zpOff = () => { removeEventListener('scroll', kick); removeEventListener('resize', kick); cancelAnimationFrame(raf); };
  }
  function fx(root, cfg) {
    root = root || document.getElementById('app'); if (!root) return;
    const s = (cfg && cfg.slide) || {}, rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const de = document.documentElement;
    de.dataset.slAnim = ['mist', 'zoom', 'slide', 'fade'].includes(s.animStyle) ? s.animStyle : 'mist';
    const par = s.parallax !== false && !rm; de.dataset.slPar = par ? '1' : '0';
    de.dataset.slFont = ['cover', 'serif', 'tema'].includes(s.titleFont) ? s.titleFont : 'cover';
    de.dataset.slGal = ['tirai', 'zoom', 'fade', 'zoomparallax', 'none'].includes(s.galleryAnim) ? s.galleryAnim : 'tirai';
    { const rt = parseFloat(s.stageRatio); de.style.setProperty('--cvh', Math.round(390 * (rt >= 1.6 && rt <= 2.4 ? rt : 2)) + 'px'); }
    parallax(par); galleryPar(root, par && de.dataset.slGal !== 'none');
    zoomPar(root, cfg, de.dataset.slGal === 'zoomparallax' && !rm);
    if (io) { io.disconnect(); io = null; }
    const els = root.querySelectorAll('.sl-s, .sl-foot');
    // bagian bawaan Tema 12 (galeri, live, gift, RSVP, ucapan): hiasan garis–berlian di atas tiap judul, ikut diputar ulang saat masuk layar
    root.querySelectorAll('[data-sid="gallery"],[data-sid="live"],[data-sid="gift"],[data-sid="rsvp"],[data-sid="wishes"]').forEach((sec) => {
      sec.querySelectorAll('h2, h3.gt').forEach((t) => {
        if (!t.parentNode || (t.previousElementSibling && t.previousElementSibling.classList.contains('sl-sorn'))) return;
        const o = document.createElement('div'); o.className = 'sl-sorn'; o.setAttribute('aria-hidden', 'true'); o.innerHTML = '<i></i><em></em><i></i>';
        t.parentNode.insertBefore(o, t);
      });
    });
    const orns = root.querySelectorAll('.sl-sorn:not(.sl-q-orn)');
    if (io2) { io2.disconnect(); io2 = null; }
    if (!('IntersectionObserver' in window) || rm) orns.forEach((e) => e.classList.add('on'));
    else { io2 = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting && e.intersectionRatio >= 0.6)), { threshold: [0, 0.6, 1] }); orns.forEach((e) => io2.observe(e)); }
    if (!('IntersectionObserver' in window) || rm) { els.forEach((e) => e.classList.add('sl-go')); return; }
    io = new IntersectionObserver((es) => es.forEach((e) => {
      const r = e.intersectionRatio, vh = innerHeight;
      if (e.isIntersecting && (r >= 0.35 || e.intersectionRect.height >= vh * 0.45)) e.target.classList.add('sl-go');
      else if (!e.isIntersecting) e.target.classList.remove('sl-go');
    }), { threshold: [0, 0.2, 0.35, 0.6] });
    els.forEach((e) => io.observe(e));
  }

  // ---------- posisi & ukuran tulisan (diatur di admin: slide.adj = { "cv.nm": {x, y, s} }) ----------
  // x, y = geser dalam % lebar layar (satuan cqw, jadi sama persis di HP kecil maupun besar); s = ukuran dalam % (100 = bawaan).
  // Memakai properti `translate` & `scale` (terpisah dari `transform`) agar tidak bentrok dengan animasi teks masuk.
  function adjust(cfg) {
    const adj = (cfg && cfg.slide && cfg.slide.adj) || {};
    // [data-adg] = pengaturan lama satu blok nama (cv.nm / op.n): tetap berlaku bagi yang sudah pernah menggeser nama
    document.querySelectorAll('[data-ad],[data-adg]').forEach((el) => {
      const a = adj[el.dataset.ad || el.dataset.adg] || {}, x = parseFloat(a.x) || 0, y = parseFloat(a.y) || 0, sc = parseFloat(a.s) > 0 ? parseFloat(a.s) / 100 : 1;
      el.style.translate = x || y ? `${CQ.w(x)} ${CQ.w(y)}` : '';
      el.style.scale = sc !== 1 ? String(sc) : '';
    });
  }
  // pratinjau admin: tulisan bisa ditarik langsung (geser) dan Shift + roda mouse = besar/kecil; hasil dikirim ke admin lewat done(adj)
  let editOn = false, lastDrag = 0;
  function edit(getAdj, done, onText, getText) {
    if (editOn) return; editOn = true;
    document.documentElement.classList.add('sl-edit');
    // klik 2× pada tulisan = ubah teksnya langsung (Enter / klik di luar = simpan, Esc = batal; teks panjang: Enter = baris baru, Ctrl+Enter = simpan)
    const HINT0 = 'Tarik = geser · Klik 2× = ubah teks · Enter = baris baru · Shift + roda = ukuran';
    let showHint = () => {};
    if (onText && getText) {
      const begin = (el) => {
        const path = el.dataset.tx, ml = el.dataset.ml === '1', old = String(getText(path) == null ? '' : getText(path)), html = el.innerHTML;
        el.classList.add('sl-typing'); el.textContent = old; showHint('Enter = baris baru · Ctrl+Enter / klik di luar = simpan · Esc = batal', true);
        try { el.contentEditable = 'plaintext-only'; } catch (er) { /* abaikan */ }
        if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
        el.focus();
        try { const r = document.createRange(); r.selectNodeContents(el); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } catch (er) { /* abaikan */ }
        let cancel = false;
        const key = (ev) => {
          if (ev.key === 'Escape') { cancel = true; el.blur(); }
          else if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); el.blur(); }
        };
        const end = () => {
          el.removeEventListener('blur', end); el.removeEventListener('keydown', key);
          let v = String(el.innerText || '').replace(/\u00a0/g, ' ').replace(/\r/g, '');
          v = v.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
          el.removeAttribute('contenteditable'); el.classList.remove('sl-typing'); showHint(HINT0, false);
          if (cancel || v === old.trim()) { el.innerHTML = html; return; }
          onText(path, v);
        };
        el.addEventListener('blur', end); el.addEventListener('keydown', key);
      };
      document.addEventListener('dblclick', (e) => {
        const el = e.target.closest && e.target.closest('[data-tx]'); if (!el || el.classList.contains('sl-typing')) return;
        e.preventDefault(); begin(el);
      }, true);
      document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-tx]') && e.target.closest('a')) e.preventDefault(); }, true);
      const hint = document.createElement('div'); hint.className = 'sl-hint'; hint.textContent = HINT0;
      document.body.appendChild(hint); let hT = setTimeout(() => hint.classList.add('off'), 7000);
      showHint = (t, on) => { hint.textContent = t; hint.classList.remove('off'); clearTimeout(hT); if (!on) hT = setTimeout(() => hint.classList.add('off'), 3500); };
    }
    const wrapOf = (el) => el.closest('.cover,.sl-s,.sl-open,.sl-foot');
    document.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      const el = e.target.closest && e.target.closest('[data-ad]'); if (!el) return;
      if (e.target.closest('.sl-typing')) return; // sedang mengetik: biarkan kursor bekerja, jangan memulai geser
      const cont = wrapOf(el); if (!cont) return;
      const key = el.dataset.ad, w = cont.getBoundingClientRect().width || 1, adj = getAdj();
      const a0 = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {}), x0 = e.clientX, y0 = e.clientY; let moved = false;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      el.classList.add('sl-dragging');
      const mv = (ev) => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        const n = { x: +((parseFloat(a0.x) || 0) + dx / w * 100).toFixed(2), y: +((parseFloat(a0.y) || 0) + dy / w * 100).toFixed(2), s: a0.s };
        adj[key] = n; el.style.translate = `${CQ.w(n.x)} ${CQ.w(n.y)}`;
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
