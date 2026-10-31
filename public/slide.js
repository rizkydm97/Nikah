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
    return `<section class="sec hero sl-open pre${tone(H)} tp-${pos(s.openPos, 'top')}" id="s-hero" style="--shd:${shade(H)};--ty:${NU(nudge(s.openNudge))}" data-two="${two ? 1 : 0}" data-dir="${dir}">
      <div class="sl-ph">${strip}</div>
      <i class="sl-sh t"></i><i class="sl-sh b"></i>
      <div class="sl-op-in">
        <div class="sl-op-k" data-ad="op.k"${tx('hero.kicker')}>${chars(H, h.kicker, 38, 1900)}</div>
        <h1 class="sl-op-n">${nameParts(H, h.groom, h.bride, 'op', 2800, 'op.n', ['hero.groom', 'hero.bride'])}</h1>
        <i class="sl-line sl-draw" style="--d:3900ms" data-ad="op.line"></i>
        ${up('sl-op-d', 4200, E(H, h.dateText), null, 'op.d', tx('hero.dateText'))}
        ${h.hashtag ? up('sl-op-t', 4300, E(H, h.hashtag), null, 'op.t', tx('hero.hashtag')) : ''}
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
      raf = 0; const vh = innerHeight, rd = [];
      els.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < -80 || r.top > vh + 80) return; rd.push([el, r]); }); // fase BACA
      rd.forEach(([el, r]) => { // fase TULIS
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh)), v = (-p * Math.min(r.height * 0.035, 34)).toFixed(1);
        if (el._py !== v) { el._py = v; el.style.setProperty('--py', v + 'px'); }
      });
    };
    const on_ = () => { if (!raf) raf = requestAnimationFrame(tick); };
    addEventListener('scroll', on_, { passive: true }); addEventListener('resize', on_); tick();
    parOff = () => { removeEventListener('scroll', on_); removeEventListener('resize', on_); };
  }
  // ---------- hitung mundur: kartu 3D, angka bergulir, garis kemajuan, denyut detik ----------
  // Sumber data tetap <b data-k> (diisi invitation.js); di atasnya digambar lapisan angka yang bergulir naik tiap berganti nilai.
  function cdFx(root, rm) {
    const box = root.querySelector('#cds'); if (!box) return;
    box.classList.add('sl-cdx');
    box.querySelectorAll('.cd').forEach((cd) => {
      const b = cd.querySelector('b[data-k]'); if (!b || cd.querySelector('.cdr')) return;
      const k = b.dataset.k, ov = document.createElement('div'), bar = document.createElement('div');
      ov.className = 'cdr'; bar.className = 'cdb'; bar.innerHTML = '<u></u>';
      ov.setAttribute('aria-hidden', 'true'); bar.setAttribute('aria-hidden', 'true'); cd.dataset.u = k;
      b.after(ov, bar);
      const u = bar.firstChild, max = { h: 24, m: 60, s: 60 }[k];
      let cur = null, last = 0, prev = null;
      const show = (t) => {
        const now = performance.now();
        if (!cur) { cur = document.createElement('i'); cur.className = 'cdn'; cur.textContent = t; ov.appendChild(cur); }
        else if (cur.textContent !== t) {
          if (rm || now - last < 160) { ov.querySelectorAll('.out').forEach((x) => x.remove()); cur.className = 'cdn'; cur.textContent = t; } // perubahan cepat (hitung naik awal): tanpa gulir
          else { const o = cur; o.className = 'cdn out'; cur = document.createElement('i'); cur.className = 'cdn in'; cur.textContent = t; ov.appendChild(cur); setTimeout(() => o.remove(), 650); }
          if (k === 's' && !rm) { cd.classList.remove('tp'); void cd.offsetWidth; cd.classList.add('tp'); }
          last = now;
        }
        const v = parseInt(t, 10) || 0;
        if (max) {
          if (k === 's' && prev !== null && v < prev) { u.style.transition = 'none'; u.style.transform = 'scaleX(0)'; void u.offsetWidth; u.style.transition = ''; }
          u.style.transform = 'scaleX(' + Math.min(1, (v + (k === 's' ? 1 : 0)) / max).toFixed(3) + ')'; prev = v;
        } else u.style.transform = 'scaleX(1)';
      };
      show(b.textContent || '00');
      new MutationObserver(() => show(b.textContent || '00')).observe(b, { childList: true, characterData: true, subtree: true });
    });
  }

  // ---------- efek tumpuk 3D (seperti smooth-scroll 21st.dev): slide berikutnya naik menutupi slide sebelumnya ----------
  // Slide yang "menempel" (sticky): pembuka, mempelai pria/wanita, akad/resepsi. Slide yang menutupinya mengirim progres 0→1
  // (--cp) ke slide di bawahnya: mengecil, menggelap, lalu disembunyikan saat tertutup penuh (hemat baterai).
  // Ayat+hitung mundur dan penutup tidak menempel, tapi "bangkit" miring→tegak saat naik (--rp).
  let stkOff = null;
  function stack(root, on) {
    if (stkOff) { stkOff(); stkOff = null; }
    root.classList.remove('stk-on');
    root.querySelectorAll('.stk-dim,.stk-cn').forEach((e) => e.remove());
    root.querySelectorAll('.stk-pin,.stk-in,.stk-grp,.stk-s,.stk-hid,.stk-rise,[data-stk]').forEach((e) => {
      e.classList.remove('stk-pin', 'stk-in', 'stk-grp', 'stk-s', 'stk-hid', 'stk-rise'); delete e.dataset.stk;
      e.style.removeProperty('--cp'); e.style.removeProperty('--rp'); e.style.transform = ''; e.classList.remove('stk-act'); if (e.classList.contains('sec')) e.style.top = '';
    });
    if (!on) return;
    const secs = [...root.children].filter((e) => e.matches('section.sec'));
    const pins = [], groups = [], rises = [];
    let prevPinned = false;
    secs.forEach((sec, i) => {
      const nxt = secs[i + 1] || null;
      const dim = (el) => { const d = document.createElement('i'); d.className = 'stk-dim'; el.appendChild(d); };
      const dimCn = (el) => { const d = document.createElement('i'); d.className = 'stk-cn'; d.setAttribute('aria-hidden', 'true'); el.appendChild(d); };
      if (sec.classList.contains('sl-open')) { sec.classList.add('stk-pin'); dim(sec); pins.push({ el: sec, dim: sec.lastChild, next: nxt, go: false }); prevPinned = true; return; }
      if (sec.classList.contains('sl-couple') || sec.classList.contains('sl-events')) {
        const cards = [...sec.children].filter((c) => c.classList.contains('sl-s'));
        if (cards.length) {
          sec.classList.add('stk-grp'); groups.push({ sec, last: cards[cards.length - 1] });
          cards.forEach((c, j) => {
            const lastC = j === cards.length - 1;
            c.dataset.stk = '1'; c.classList.add('stk-pin', 'stk-in'); if (!lastC) c.classList.add('stk-s'); dimCn(c); dim(c);
            pins.push({ el: c, dim: c.lastChild, next: lastC ? nxt : cards[j + 1], go: true });
          });
          prevPinned = true; return;
        }
      }
      if (sec.classList.contains('sl-quote') || sec.classList.contains('sl-closing')) { sec.classList.add('stk-in'); dimCn(sec); rises.push(sec); }
      else if (prevPinned) { sec.classList.add('stk-in'); dimCn(sec); }
      prevPinned = false;
    });
    if (!pins.length) return;
    root.classList.add('stk-on');
    const cl = (v, a, b) => Math.max(a, Math.min(b, v));
    const place = () => groups.forEach((g) => { // bagian berisi beberapa slide menempel saat slide TERAKHIRnya tepat di atas layar
      const x = g.sec.getBoundingClientRect().height - g.last.getBoundingClientRect().height;
      g.sec.style.top = (-Math.max(0, Math.round(x))) + 'px';
    });
    let raf = 0;
    const tick = () => {
      raf = 0; const H = innerHeight || 780;
      const rd = pins.map((p) => [p, p.next ? cl(1 - p.next.getBoundingClientRect().top / H, 0, 1) : 0, p.go ? p.el.getBoundingClientRect().top : 0]);
      const rr = rises.map((el) => [el, cl(1 - el.getBoundingClientRect().top / H, 0, 1)]);
      rd.forEach(([p, c, top]) => {
        if (p.c === undefined || Math.abs(c - p.c) > 0.002) {
          p.c = c; p.el.style.transform = c > 0.001 ? `scale(${(1 - c * 0.08).toFixed(4)})` : ''; p.dim.style.opacity = (c * 0.55).toFixed(3);
          const act = c > 0.001 && c < 1; if (act !== !!p.act) { p.act = act; p.el.classList.toggle('stk-act', act); }
        }
        const hid = c >= 1; if (hid !== !!p.hid) { p.hid = hid; p.el.classList.toggle('stk-hid', hid); }
        if (p.go) { // teks diputar ulang saat slide sudah naik ±40% layar; direset bila tertutup penuh / kembali di luar layar
          if (!p.on && top < H * 0.62 && c < 0.5) { p.on = true; p.el.classList.add('sl-go'); }
          else if (p.on && (top >= H * 0.98 || c >= 1)) { p.on = false; p.el.classList.remove('sl-go'); }
        }
      });
      rr.forEach(([el, r]) => {
        if (r > 0 && r < 1) { el.classList.add('stk-rise'); el.style.transform = `perspective(1100px) rotateX(${((1 - r) * 7).toFixed(2)}deg) scale(${(0.94 + r * 0.06).toFixed(4)})`; }
        else if (el.classList.contains('stk-rise')) { el.classList.remove('stk-rise'); el.style.transform = ''; }
      });
    };
    const on_ = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const re = () => { place(); on_(); };
    addEventListener('scroll', on_, { passive: true }); addEventListener('resize', re); addEventListener('load', re);
    const t1 = setTimeout(re, 400), t2 = setTimeout(re, 1800);
    re(); tick();
    stkOff = () => { removeEventListener('scroll', on_); removeEventListener('resize', re); removeEventListener('load', re); clearTimeout(t1); clearTimeout(t2); if (raf) cancelAnimationFrame(raf); raf = 0; };
  }
  function fx(root, cfg) {
    root = root || document.getElementById('app'); if (!root) return;
    const s = (cfg && cfg.slide) || {}, rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const de = document.documentElement;
    de.dataset.slAnim = ['mist', 'zoom', 'slide', 'fade'].includes(s.animStyle) ? s.animStyle : 'mist';
    const par = s.parallax !== false && !rm; de.dataset.slPar = par ? '1' : '0';
    de.dataset.slFont = ['cover', 'serif', 'tema'].includes(s.titleFont) ? s.titleFont : 'cover';
    de.dataset.slGal = ['flip3d', 'tilt3d', 'depth3d', 'tirai', 'zoom', 'fade', 'none'].includes(s.galleryAnim) ? s.galleryAnim : 'flip3d'; // 'zoomparallax' lama otomatis jatuh ke flip3d
    { const rt = parseFloat(s.stageRatio); de.style.setProperty('--cvh', Math.round(390 * (rt >= 1.6 && rt <= 2.4 ? rt : 2)) + 'px'); }
    parallax(par);
    root.querySelectorAll('.sl-zp').forEach((e) => e.remove());
    if (io) { io.disconnect(); io = null; }
    cdFx(root, rm);
    stack(root, s.stack !== false && !rm && 'IntersectionObserver' in window);
    const els = root.querySelectorAll('.sl-s:not([data-stk]), .sl-foot');
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
      setBox(el, a);
      setFont(el, a);
    });
  }
  // font khusus satu tulisan (a.f = nama font; kosong = ikut font bawaan bagian itu)
  const ADF_SERIF = ['Cormorant Garamond', 'Cormorant Infant', 'Cormorant SC', 'Cormorant Upright', 'Playfair Display', 'Lora', 'Cinzel', 'Cinzel Decorative', 'Marcellus', 'Libre Baskerville', 'EB Garamond', 'Bodoni Moda', 'DM Serif Display', 'Prata', 'Italiana', 'Forum', 'Crimson Text', 'Spectral', 'Abhaya Libre', 'Alice', 'Gilda Display', 'Bellefair', 'Cardo', 'Old Standard TT', 'Abril Fatface', 'Limelight'], ADF_SANS = ['Poppins', 'Montserrat', 'Josefin Sans', 'Raleway', 'Jost', 'Quicksand', 'Nunito', 'Lato', 'Open Sans', 'Inter', 'Questrial', 'Tenor Sans', 'Didact Gothic'];
  const adfStack = (f) => (f === 'Vivaldi' ? (window.VIV_FILE ? "'Vivaldi','Great Vibes','Monsieur La Doulaise',cursive" : "'Great Vibes','Monsieur La Doulaise',cursive") : `'${f}',${ADF_SERIF.includes(f) ? 'Georgia,serif' : ADF_SANS.includes(f) ? 'Arial,sans-serif' : 'cursive'}`);
  function setFont(el, a) {
    const f = a && typeof a.f === 'string' ? a.f.replace(/['"\\;{}<>]/g, '').slice(0, 60) : '';
    if (f) { el.style.setProperty('--adf', adfStack(f)); el.dataset.adf = '1'; }
    else { el.style.removeProperty('--adf'); delete el.dataset.adf; }
  }
  // lebar kotak (a.w = % lebar layar yang tampak, tidak terpengaruh ukuran tulisan; kosong / 0 = otomatis seperti bawaan). Elemen inline dijadikan inline-block supaya lebarnya bisa diatur.
  function setBox(el, a) {
    const w0 = parseFloat(a && a.w) || 0, sc = parseFloat(a && a.s) > 0 ? parseFloat(a.s) / 100 : 1, w = w0 / sc; // w = lebar tampak di layar; dibagi skala supaya mengecilkan tulisan tidak ikut mengecilkan kotak
    if (w > 0) {
      if (el.dataset.adD == null) el.dataset.adD = getComputedStyle(el).display;
      if (el.dataset.adD === 'inline') el.style.display = 'inline-block';
      el.style.width = CQ.w(w); el.style.maxWidth = 'none'; el.style.boxSizing = 'border-box';
    } else {
      el.style.width = ''; el.style.maxWidth = ''; el.style.boxSizing = '';
      if (el.dataset.adD === 'inline') el.style.display = '';
    }
  }
  // pratinjau admin: tulisan bisa ditarik langsung (geser) dan Shift + roda mouse = besar/kecil; hasil dikirim ke admin lewat done(adj)
  let editOn = false, lastDrag = 0, pickFn = null;
  function edit(getAdj, done, onText, getText, onSel) {
    if (editOn) return; editOn = true;
    document.documentElement.classList.add('sl-edit');
    // klik 2× pada tulisan = ubah teksnya langsung (Enter / klik di luar = simpan, Esc = batal; teks panjang: Enter = baris baru, Ctrl+Enter = simpan)
    const HINT0 = 'Tarik = geser (garis pink = pas/sejajar) · Titik tepi = lebar kotak · Shift + roda = ukuran tulisan · Klik 2× = ubah teks';
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
    const wrapOf = (el) => el.closest('.cover,.sl-s,.sl-open,.sl-foot,#loader');
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const ts = (a) => ({ x: parseFloat(a.x) || 0, y: parseFloat(a.y) || 0 });
    const putT = (el, x, y) => { el.style.translate = x || y ? `${CQ.w(x)} ${CQ.w(y)}` : ''; };

    // ----- lapisan bantu: garis sejajar/tengah (pink) + titik pegangan lebar & ukuran kotak yang sedang dipilih -----
    const ov = document.createElement('div'); ov.className = 'sl-ov';
    ov.innerHTML = '<b class="hd hl" data-h="l" title="Tarik = lebar kotak (klik 2× = otomatis)"></b><b class="hd hr" data-h="r" title="Tarik = lebar kotak (klik 2× = otomatis)"></b><b class="hd hs" data-h="s" title="Tarik = lebar kotak (ukuran tulisan tetap)"></b>';
    document.documentElement.appendChild(ov);
    const hL = ov.querySelector('.hl'), hR = ov.querySelector('.hr'), hS = ov.querySelector('.hs');
    let selKey = '', lastSel = null;
    const selEl = () => (selKey ? document.querySelector('[data-ad="' + selKey.replace(/"/g, '\\"') + '"]') : null);
    const place = () => {
      const el = selEl(), ok = el && el.isConnected && !el.classList.contains('sl-typing');
      ov.classList.toggle('has', !!ok);
      if (lastSel && lastSel !== el) lastSel.classList.remove('sl-sel');
      lastSel = ok ? el : null; if (ok) el.classList.add('sl-sel');
      if (ok) {
        const r = el.getBoundingClientRect(), mid = r.top + r.height / 2;
        hL.style.cssText = `left:${r.left}px;top:${mid}px`; hR.style.cssText = `left:${r.right}px;top:${mid}px`; hS.style.cssText = `left:${r.right}px;top:${r.bottom}px`;
      }
      requestAnimationFrame(place);
    };
    requestAnimationFrame(place);
    const showGuides = (list) => {
      ov.querySelectorAll('.g').forEach((g) => g.remove());
      (list || []).forEach((g) => {
        const d = document.createElement('i'); d.className = 'g ' + (g.v ? 'gv' : 'gh'); d.dataset.t = g.t || '';
        d.style.cssText = g.v ? `left:${g.p}px;top:${g.a}px;height:${g.b - g.a}px` : `top:${g.p}px;left:${g.a}px;width:${g.b - g.a}px`;
        ov.appendChild(d);
      });
    };
    // cari posisi yang "pas": tengah layar, atau sejajar tepi/tengah tulisan lain di bagian yang sama
    const SNAP = 6;
    const snap = (el, cont) => {
      const cr = cont.getBoundingClientRect(), r = el.getBoundingClientRect();
      const X = [{ p: cr.left + cr.width / 2, t: 'Tengah layar' }], Y = [{ p: cr.top + cr.height / 2, t: 'Tengah layar' }];
      cont.querySelectorAll('[data-ad]').forEach((o) => {
        if (o === el || o.contains(el) || el.contains(o)) return;
        const q = o.getBoundingClientRect(); if (q.width < 2 || q.height < 2) return;
        const cs = getComputedStyle(o); if (cs.visibility === 'hidden' || cs.display === 'none') return;
        X.push({ p: q.left, t: 'Sejajar kiri' }, { p: q.left + q.width / 2, t: 'Sejajar tengah' }, { p: q.right, t: 'Sejajar kanan' });
        Y.push({ p: q.top, t: 'Sejajar atas' }, { p: q.top + q.height / 2, t: 'Sejajar tengah' }, { p: q.bottom, t: 'Sejajar bawah' });
      });
      const best = (mine, T) => {
        let b = null;
        mine.forEach((m) => T.forEach((t) => { const d = t.p - m; if (Math.abs(d) <= SNAP && (!b || Math.abs(d) < Math.abs(b.d) - 0.01)) b = { d, p: t.p, t: t.t }; }));
        return b;
      };
      const bx = best([r.left, r.left + r.width / 2, r.right], X), by = best([r.top, r.top + r.height / 2, r.bottom], Y);
      const g = [];
      if (bx) g.push({ v: 1, p: bx.p, a: cr.top, b: cr.bottom, t: bx.t });
      if (by) g.push({ p: by.p, a: cr.left, b: cr.right, t: by.t });
      return { dx: bx ? bx.d : 0, dy: by ? by.d : 0, g };
    };

    document.addEventListener('pointerdown', (e) => {
      if (e.button > 0) return;
      if (e.target.closest && e.target.closest('.sl-ov')) return; // pegangan punya pendengar sendiri
      const el = e.target.closest && e.target.closest('[data-ad]');
      if (!el) { if (selKey) { selKey = ''; if (onSel) onSel(''); } return; }
      if (e.target.closest('.sl-typing')) return; // sedang mengetik: biarkan kursor bekerja, jangan memulai geser
      const cont = wrapOf(el); if (!cont) return;
      selKey = el.dataset.ad; if (onSel) onSel(selKey);
      const key = el.dataset.ad, w = cont.getBoundingClientRect().width || 1, adj = getAdj();
      const a0 = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {}), x0 = e.clientX, y0 = e.clientY; let moved = false;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      el.classList.add('sl-dragging');
      const mv = (ev) => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0; if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        if (!moved) return;
        let nx = (parseFloat(a0.x) || 0) + dx / w * 100, ny = (parseFloat(a0.y) || 0) + dy / w * 100;
        putT(el, nx, ny);
        let g = [];
        if (!ev.altKey) { // tahan Alt = geser bebas tanpa tarikan magnet
          const sn = snap(el, cont);
          if (sn.dx || sn.dy) { nx += sn.dx / w * 100; ny += sn.dy / w * 100; putT(el, nx, ny); }
          g = sn.g;
        }
        showGuides(g);
        adj[key] = Object.assign({}, a0, { x: +nx.toFixed(2), y: +ny.toFixed(2) });
      };
      const up = () => {
        el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('sl-dragging'); showGuides([]);
        if (moved) { lastDrag = Date.now(); done(JSON.parse(JSON.stringify(adj))); }
      };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    }, true);

    // pegangan: kiri/kanan = lebar kotak (sisi seberang tetap diam), pojok kanan-bawah = ukuran tulisan
    ov.addEventListener('pointerdown', (e) => {
      const hd = e.target.closest && e.target.closest('.hd'), el = selEl(); if (!hd || !el) return;
      const cont = wrapOf(el); if (!cont) return;
      e.preventDefault(); e.stopPropagation();
      const kind = hd.dataset.h, key = el.dataset.ad, cw = cont.getBoundingClientRect().width || 1, adj = getAdj();
      const a0 = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {}), r0 = el.getBoundingClientRect(), px0 = e.clientX, sc0 = (parseFloat(a0.s) || 100) / 100;
      let cx = parseFloat(a0.x) || 0, cy = parseFloat(a0.y) || 0, a = Object.assign({}, a0), moved = false;
      try { hd.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      hd.classList.add('on'); el.classList.add('sl-dragging');
      const mv = (ev) => {
        const dx = ev.clientX - px0; if (Math.abs(dx) > 2) moved = true; if (!moved) return;
        const nw = Math.max(r0.width * 0.1, r0.width + (kind === 'l' ? -dx : dx)); // pojok kanan-bawah ('s') = sama seperti tepi kanan
        a.w = +clamp(nw / cw * 100, 3, 100).toFixed(1); setBox(el, a); // hanya lebar kotak; ukuran tulisan tidak berubah
        const r = el.getBoundingClientRect(); cx += (kind === 'l' ? r0.right - r.right : r0.left - r.left) / cw * 100; // sisi seberang tetap
        putT(el, cx, cy); a.x = +cx.toFixed(2); a.y = +cy.toFixed(2); adj[key] = Object.assign({}, a);
      };
      const up = () => {
        hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up);
        hd.classList.remove('on'); el.classList.remove('sl-dragging');
        if (moved) { lastDrag = Date.now(); done(JSON.parse(JSON.stringify(adj))); }
      };
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
    });
    // klik 2× pada pegangan lebar = kembali ke lebar otomatis
    ov.addEventListener('dblclick', (e) => {
      const hd = e.target.closest && e.target.closest('.hd'), el = selEl(); if (!hd || !el) return;
      e.preventDefault(); e.stopPropagation();
      const adj = getAdj(), key = el.dataset.ad, a = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {}); delete a.w;
      adj[key] = a; setBox(el, a); done(JSON.parse(JSON.stringify(adj)));
    });
    // klik setelah menggeser jangan ikut menekan tombol (mis. Buka Undangan)
    document.addEventListener('click', (e) => { if (Date.now() - lastDrag < 400 && e.target.closest('[data-ad]')) { e.preventDefault(); e.stopPropagation(); } }, true);
    let wt = 0;
    pickFn = (key) => { selKey = key || ''; const el = selEl(); if (el) { try { const r = el.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 60) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (er) { /* abaikan */ } } };
    document.addEventListener('wheel', (e) => {
      if (!e.shiftKey) return;
      const el = e.target.closest && e.target.closest('[data-ad]'); if (!el) return;
      e.preventDefault();
      const key = el.dataset.ad, adj = getAdj(), a = Object.assign({ x: 0, y: 0, s: 100 }, adj[key] || {});
      a.s = Math.round(Math.min(300, Math.max(30, (parseFloat(a.s) || 100) + (e.deltaY < 0 ? 4 : -4))));
      adj[key] = a; el.style.scale = a.s === 100 ? '' : String(a.s / 100); setBox(el, a);
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
    cover, hero, couple, quote, events, story, closing, open, fx, order, chars, words, adjust, edit, toTop, pick: (k) => { if (pickFn) pickFn(k); },
    deco: M.deco || {}, colors: M.colors || {}, assets: M.assets || [],
  };
})();
