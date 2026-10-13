(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s) => esc(s).replace(/\n/g, '<br>');
  const safeUrl = (u) => { u = String(u || '').trim(); return /^(https?:\/\/|\/(?!\/)|tel:|mailto:)/i.test(u) ? u : ''; };
  const cssUrl = (u) => { u = safeUrl(u); return u ? `url('${u.replace(/['"\\\n\r]/g, '')}')` : 'none'; };
  const q = new URLSearchParams(location.search);
  const guest = (q.get('to') || '').trim().slice(0, 80);
  const SPEED = { slow: 1.5, normal: 1, fast: 0.65 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // font -> [bobot, punya-italic]. Hanya yang punya italic asli diminta italic (hindari italic palsu).
  const FONTS = { 'Cormorant Infant': ['400;500;600;700', 1], 'Cormorant Garamond': ['400;500;600;700', 1], 'Playfair Display': ['400;500;600;700', 1], 'Lora': ['400;500;600;700', 1], 'Poppins': ['400;500;600;700', 0], 'Libre Baskerville': ['400;700', 1], 'EB Garamond': ['400;500;600;700', 1], 'Marcellus': ['', 0], 'Cinzel': ['400;500;600;700', 0], 'Great Vibes': ['', 0], 'Allura': ['', 0], 'Parisienne': ['', 0], 'Pinyon Script': ['', 0], 'Dancing Script': ['400;500;600;700', 0], 'Alice': ['', 0], 'Abhaya Libre': ['400;500;600;700', 0], 'Montserrat': ['400;500;600;700', 1], 'Josefin Sans': ['400;500;600;700', 1] };
  const CLOUDS = ['/assets/scene/cloud1.webp', '/assets/scene/cloud2.webp', '/assets/scene/cloud3.webp', '/assets/scene/cloud4.webp'];

  const ICON = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.3 1.1 4 2.3h4C14.7 6.1 16 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" transform="translate(0 -1)"/></svg>',
    pin: '<svg class="pin" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zM17.3 5.7a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1z"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm-2 8h14v10H5V10z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4.1c1.7.7 2.4.8 3.3.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>',
    gift: '<svg class="gifticon" viewBox="0 0 24 24"><path d="M3 8h18v4H3z"/><path d="M4 13h16v8H4z"/><path d="M12 8c-1-4-6-4-6-1.5S10 8 12 8zm0 0c1-4 6-4 6-1.5S14 8 12 8z"/><path d="M11 8h2v13h-2z" fill="#fff" opacity=".85"/></svg>',
    cam: '<svg viewBox="0 0 24 24"><path d="M4 5h11a2 2 0 0 1 2 2v1.5l4-2.5v12l-4-2.5V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/></svg>',
  };
  const img = (src, alt = '', cls = '') => safeUrl(src) ? `<img${cls ? ` class="${cls}"` : ''} src="${esc(safeUrl(src))}" alt="${esc(alt)}" decoding="async">` : '';
  const link = (u) => esc(safeUrl(u) || '#');
  const pad = (n) => String(n).padStart(2, '0');

  // ---------- posisi / zoom foto (diatur dari admin: <field>Adj = {x,y,z,fit,o}) ----------
  const ADJ0 = { x: 50, y: 50, z: 1, fit: 'cover', o: 100 };
  const adj = (o, k) => Object.assign({}, ADJ0, (o && o[k + 'Adj']) || {});
  const num = (v, d, lo, hi) => { v = +v; return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d; };
  function adjStyle(a, withScale = true) {
    const x = num(a.x, 50, 0, 100), y = num(a.y, 50, 0, 100), z = num(a.z, 1, 1, 4);
    return `object-position:${x}% ${y}%;transform-origin:${x}% ${y}%${withScale && z !== 1 ? `;transform:scale(${z})` : ''}`;
  }
  // foto di dalam bingkai (bingkai menentukan ukuran; foto mengikuti posisi/zoom)
  function photo(o, k, alt = '', src) {
    const u = safeUrl(src !== undefined ? src : o && o[k]); if (!u) return '';
    const a = adj(o, k);
    if (a.fit === 'contain') return `<span class="bfill" style="background-image:${cssUrl(u)}"></span><img class="pimg contain" src="${esc(u)}" alt="${esc(alt)}" decoding="async" style="${adjStyle(a)}">`;
    return `<img class="pimg" src="${esc(u)}" alt="${esc(alt)}" decoding="async" style="${adjStyle(a)}">`;
  }
  // foto latar section
  function bgl(o, k, src) {
    const u = safeUrl(src !== undefined ? src : o && o[k]); if (!u) return '';
    const a = adj(o, k);
    if (a.fit === 'contain') return `<div class="bgl"><span class="bfill" style="background-image:${cssUrl(u)}"></span><img class="pimg contain" src="${esc(u)}" alt="" decoding="async" style="${adjStyle(a)}"></div>`;
    return `<div class="bgl"><img class="pimg" src="${esc(u)}" alt="" decoding="async" style="${adjStyle(a)}"></div>`;
  }
  const ov = (o, k) => `--ov:${num(adj(o, k).o, 100, 0, 100) / 100}`;
  const pick = (...a) => a.find((u) => safeUrl(u)) || '';

  let C = null, opened = false, AC = null, sp = 1;
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

  const PREVIEW = q.has('preview');
  let pc = null;
  if (PREVIEW) { try { pc = JSON.parse(sessionStorage.getItem('pvCfg')); } catch (e) { /* abaikan */ } }
  if (PREVIEW) {
    addEventListener('message', (e) => {
      if (e.origin !== location.origin || !e.data) return;
      if (e.data.type === 'cfg') {
        try { const nx = JSON.stringify(e.data.cfg); if (nx === sessionStorage.getItem('pvCfg') && C) return; sessionStorage.setItem('pvCfg', nx); } catch (er) { /* */ }
        if (!C) { init(e.data.cfg); return; }
        const y = scrollY; render(e.data.cfg); if (opened) { reveal(); requestAnimationFrame(() => scrollTo(0, y)); }
      }
      if (e.data.type === 'goto') gotoSection(e.data.id);
    });
  }
  (pc ? Promise.resolve(pc) : fetch('/api/config', { cache: 'no-cache' }).then((r) => r.json())).then(init).catch((e) => { console.error(e); document.body.innerHTML = '<p style="padding:30px;font-family:sans-serif">Gagal memuat undangan.</p>'; });

  let inited = false;
  function init(cfg) {
    if (inited) return; inited = true;
    render(cfg);
    if (PREVIEW) {
      $('#loader').classList.add('off');
      if (q.has('cover')) { $('#cover').classList.add('play', 'shown', 'instant'); return; }
      openInvitation(true); return;
    }
    intro();
  }

  // ---------- intro: monogram + muat gambar dulu supaya animasi mulus ----------
  function intro() {
    const ld = $('#loader'), c = C;
    const names = String(c.cover.names || '').split('&').map((s) => s.trim()).filter(Boolean);
    const mono = names.length >= 2 ? `${esc(names[0][0])}<i>&amp;</i>${esc(names[1][0])}` : esc((names[0] || '♥')[0]);
    if (c.effects.intro !== false) ld.innerHTML = `<div class="ld-in"><div class="ld-ring"></div><div class="ld-mono">${mono}</div><div class="ld-k">${esc(c.cover.kicker)}</div><div class="ld-bar"><span id="ldBar"></span></div></div>`;
    ld.classList.add('ready');
    const s = c.scene;
    const urls = [s.sky, s.house, s.treeline, s.floralTop, s.floralBottom, s.column, c.effects.showTree !== false ? s.tree : '', c.cover.photo, c.cover.bg, ...CLOUDS].map(safeUrl).filter(Boolean);
    let done = 0; const bar = $('#ldBar');
    const one = (u) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => { done++; if (bar) bar.style.width = Math.round(done / urls.length * 100) + '%'; (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(res); }; im.src = u; });
    const minShow = new Promise((r) => setTimeout(r, c.effects.intro !== false ? 1400 : 0));
    const cap = new Promise((r) => setTimeout(r, 7000)); // jangan menunggu selamanya di jaringan lambat
    Promise.all([Promise.race([Promise.all(urls.map(one)), cap]), minShow]).then(() => {
      ld.classList.add('off');
      const cv = $('#cover');
      if (cv) { later(() => cv.classList.add('play'), 250); later(() => cv.classList.add('shown'), 250 + 1500 * sp); }
    });
  }

  // ---------- tema & font ----------
  function applyTheme(c) {
    const t = c.theme, r = document.documentElement.style;
    ['primary', 'accent', 'rose', 'gold', 'paper', 'ink', 'body', 'sideBg'].forEach((k) => { if (t[k]) r.setProperty('--' + k, t[k]); });
    const ff = (n, fb) => `'${String(n).replace(/'/g, '')}',${fb}`;
    r.setProperty('--fDisplay', ff(t.fontDisplay, 'Georgia,serif'));
    r.setProperty('--fHeading', ff(t.fontHeading, 'Georgia,serif'));
    r.setProperty('--fBody', ff(t.fontBody, 'Georgia,serif'));
    r.setProperty('--fScript', ff(t.fontScript, 'cursive'));
    r.setProperty('--col', (+t.colWidth || 480) + 'px');
    sp = reduce ? 0.01 : (SPEED[c.effects.animSpeed] || 1);
    r.setProperty('--dur', sp + 's');
    r.setProperty('--cloudK', String({ slow: 1.6, normal: 1, fast: 0.55 }[c.effects.cloudSpeed] || 1));
    const fams = [...new Set([t.fontDisplay, t.fontHeading, t.fontBody, t.fontScript, 'Poppins', 'Lora'])].filter(Boolean).map((n) => {
      const [w, it] = FONTS[n] || ['', 0], nm = encodeURIComponent(n).replace(/%20/g, '+');
      if (!w) return 'family=' + nm;
      const ws = w.split(';');
      return 'family=' + nm + (it ? ':ital,wght@' + ws.map((x) => '0,' + x).concat(ws.map((x) => '1,' + x)).join(';') : ':wght@' + w);
    });
    let l = $('#gfonts'); if (!l) { l = document.createElement('link'); l.id = 'gfonts'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    const href = 'https://fonts.googleapis.com/css2?' + fams.join('&') + '&display=swap'; if (l.href !== href) l.href = href;
    r.setProperty('--arc', cssUrl(c.scene.frameArc)); r.setProperty('--side', cssUrl(c.scene.frameSide));
    document.title = c.general.title || document.title;
    const b = document.body.classList;
    b.toggle('nosway', !c.effects.sway); b.toggle('noglow', !c.effects.glow); b.toggle('noclouds', c.effects.clouds === false);
  }

  // ---------- adegan: langit, awan bergerak, pepohonan, rumah ----------
  function clouds() {
    // posisi & kecepatan berbeda tiap awan; delay negatif = awan sudah tersebar sejak awal
    const L = [[6, 70, 120, 0.95, 0], [17, 52, 95, 0.85, 1], [28, 64, 140, 0.9, 2], [40, 46, 105, 0.75, 3], [12, 40, 160, 0.6, 1], [48, 58, 125, 0.8, 0]];
    return `<div class="ly clouds">${L.map(([top, w, dur, op, i], n) => `<img class="cl" src="${CLOUDS[i]}" alt="" style="top:${top}%;width:${w}%;opacity:${op};animation-duration:calc(${dur}s * var(--cloudK,1));animation-delay:calc(${-(dur * ((n * 0.37) % 1)).toFixed(1)}s * var(--cloudK,1))">`).join('')}</div>`;
  }
  // titik cahaya keemasan yang berkelip & melayang pelan
  const sparkles = (n) => `<div class="sparkles" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const r = (k) => ((Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2); return `<i style="left:${(r(1) * 96 + 2).toFixed(1)}%;top:${(r(2) * 80 + 8).toFixed(1)}%;--s:${(2 + r(3) * 4).toFixed(1)}px;animation-duration:${(5 + r(4) * 6).toFixed(1)}s;animation-delay:${(-r(5) * 10).toFixed(1)}s"></i>`; }).join('')}</div>`;
  const halves = (src) => safeUrl(src) ? `<div class="half l">${img(src)}</div><div class="half r">${img(src)}</div>` : '';
  function scene(c) {
    const s = c.scene;
    return `<div class="scene">
      <div class="cam">
        <div class="ly sky" style="background-image:${cssUrl(s.sky)}"></div>
        ${clouds()}
        ${safeUrl(s.treeline) ? `<div class="ly trees">${img(s.treeline)}</div>` : ''}
        ${c.effects.showTree !== false && safeUrl(s.tree) ? `<div class="ly tree"><div class="tree-in">${img(s.tree)}<i class="lamp"></i></div></div>` : ''}
        <div class="ly hs"><div class="hs-in">${img(s.house)}<div class="glow"></div></div></div>
        <div class="haze"></div>
      </div>
      ${safeUrl(s.column) ? `<div class="ly cols"><div class="colc l">${img(s.column)}</div><div class="colc r">${img(s.column)}</div></div>` : ''}
      ${safeUrl(s.column) ? '' : `<div class="ly ft sway-t">${halves(s.floralTop)}</div>`}
      <div class="ly fb sway-b">${halves(s.floralBottom)}</div>
      ${sparkles(16)}
      <div class="flyers"></div>
    </div>`;
  }

  // ---------- render section ----------
  const splitTitle = (t) => { t = String(t || '').trim(); const i = t.indexOf(' '); return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i + 1)]; };
  const hasWA = (c) => !!String(c.general.whatsapp || '').replace(/\D/g, '');
  const heartDiv = `<div class="divider">${ICON.heart}</div>`;
  // kartu kapsul berbingkai bunga: lengkung atas/bawah + sisi yang diulang (tidak pernah melar)
  const capsule = (cls, inner) => `<div class="rv cap ${cls}"><div class="fr-side"></div><img class="fr-arc t" src="${link(C.scene.frameArc)}" alt=""><img class="fr-arc b" src="${link(C.scene.frameArc)}" alt=""><div class="cap-in ${cls === 'rosecap' ? 'gf' : 'ev'}">${inner}</div></div>`;

  const R = {
    hero(c) {
      const h = c.hero;
      return `<section class="sec hero pre" id="s-hero">${scene(c)}
        <div class="hero-text"><div class="rv kick">${esc(h.kicker)}</div>
        <h1 class="names"><span class="rv nm">${esc(h.groom)}</span><i class="rv amp">&amp;</i><span class="rv nm">${esc(h.bride)}</span></h1>
        <div class="rv date">${esc(h.dateText)}</div><div class="rv tag">${esc(h.hashtag)}</div></div>
        <div class="scroll-hint"></div></section>`;
    },
    quote(c) {
      const o = c.quote, l = o.labels;
      return `<section class="sec bgi quote" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.cover.photo))}<div class="q-in">
        <p class="rv qt">${br(o.text)}</p><div class="rv src">${esc(o.source)}</div>
        <div class="rv cds" id="cds"><div class="cd"><b data-k="d">00</b><span>${esc(l.days)}</span></div><div class="sep">:</div><div class="cd"><b data-k="h">00</b><span>${esc(l.hours)}</span></div><div class="sep">:</div><div class="cd"><b data-k="m">00</b><span>${esc(l.minutes)}</span></div><div class="sep">:</div><div class="cd"><b data-k="s">00</b><span>${esc(l.seconds)}</span></div></div>
        <a class="rv btn sq up" id="saveDate" target="_blank" rel="noopener">${ICON.cal}${esc(o.saveButton)}</a></div></section>`;
    },
    greeting(c) {
      const o = c.greeting, useOwn = !!safeUrl(o.bg);
      return `<section class="sec paperbg greeting">${useOwn ? bgl(o, 'bg') : bgl(c.couple, 'bg')}
        <div class="rv gpanel"><p>${br(o.text)}</p>${safeUrl(o.photo) ? `<div class="circ"><div class="phb">${photo(o, 'photo')}</div></div>` : ''}</div></section>`;
    },
    couple(c) {
      const o = c.couple;
      const p = (x) => `<div class="person"><div class="pho-w"><div class="rv pho" data-a="zoom-in" style="--i:2"><div class="phb">${photo(x, 'photo', x.fullName)}</div></div>${safeUrl(o.flower) ? `<img class="rv fl-acc" data-a="bloom" style="--i:4" src="${link(o.flower)}" alt="">` : ''}</div>
        <div class="rv script" data-a="soft" style="--i:6">${esc(x.script)}</div><div class="rv fn" data-a="soft" style="--i:7">${esc(x.fullName)}</div><div class="rv par" data-a="soft" style="--i:8">${esc(x.parents)}</div>${safeUrl(x.instagram) ? `<a class="rv btn pill" data-a="soft" style="--i:9" href="${link(x.instagram)}" target="_blank" rel="noopener">${ICON.ig}${esc(o.instagramLabel)}</a>` : ''}</div>`;
      return `<section class="sec paperbg couple">${bgl(o, 'bg')}<div class="rv cpanel" data-a="soft" style="--i:0">${p(o.groom)}<div class="rv amp" data-a="zoom-in" style="--i:2">${esc(o.connector)}</div>${p(o.bride)}</div></section>`;
    },
    events(c) {
      const o = c.events, orn = safeUrl(c.scene.ornament);
      const cards = (o.items || []).map((e) => capsule('evcap', `${orn ? `<img class="orn" src="${link(orn)}" alt="">` : ''}<h3>${esc(e.title)}</h3>
        ${heartDiv}<div class="date">${esc(e.date)}</div><div class="time">${esc(e.time)}</div>${ICON.pin}
        <div class="place">${esc(e.place)}</div><div class="addr">${br(e.address)}</div>
        ${safeUrl(e.mapUrl) ? `<a class="btn pill" href="${link(e.mapUrl)}" target="_blank" rel="noopener">${ICON.map}${esc(o.mapLabel)}</a>` : ''}`)).join('');
      return `<section class="sec bgi events" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg, c.cover.photo))}<h2 class="rv h-head">${esc(o.title)}</h2><p class="rv lead">${br(o.intro)}</p>${cards}</section>`;
    },
    live(c) {
      const o = c.live;
      return `<section class="sec bgi live" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg))}<div class="live-in"><h2 class="rv h-display">${esc(o.title)}</h2><p class="rv">${br(o.text)}</p>
        <a class="rv btn sq dark up" href="${link(o.url)}" target="_blank" rel="noopener">${ICON.cam}${esc(o.button)}</a></div></section>`;
    },
    gallery(c) {
      const o = c.gallery, s = c.scene;
      const edge = (pos, src) => `<div class="edge ${pos} ${pos === 'top' ? 'sway-t' : 'sway-b'}"><div class="half l rv" data-a="${pos === 'top' ? 'bloom-l' : 'bloom-ul'}" style="--i:0">${img(src)}</div><div class="half r rv" data-a="${pos === 'top' ? 'bloom-r' : 'bloom-ur'}" style="--i:1">${img(src)}</div></div>`;
      return `<section class="sec paperbg gallery">${bgl(o, 'bg', pick(o.bg, s.paper))}${edge('top', s.floralTop)}${edge('bottom', s.floralBottom)}<h2 class="rv h-display" data-a="soft">${esc(o.title)}</h2>
        ${videoEmbed(o.video)}
        <div class="grid">${(o.items || []).map((g, i) => `<div class="rv gi" data-i="${i}" data-a="zoom-in" style="--i:${i % 3}"><div class="phb">${photo(g, 'image')}</div></div>`).join('')}</div></section>`;
    },
    story(c) {
      const o = c.story;
      return `<section class="sec story" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.scene.sky))}<h2 class="rv script-h">${esc(o.title)}</h2>
        <div class="tl">${(o.items || []).map((s) => `<div class="rv card" data-a="soft"><span class="mk">${ICON.heart}</span><div class="im"><div class="phb">${photo(s, 'image', s.title)}</div></div><div class="tx"><h4>${esc(s.title)}</h4><p>${br(s.text)}</p></div></div>`).join('')}</div>
        <div class="fl sway-b"><div class="half l rv" data-a="bloom-ul" style="--i:0">${img(c.scene.floralBottom)}</div><div class="half r rv" data-a="bloom-ur" style="--i:1">${img(c.scene.floralBottom)}</div></div>${sparkles(10)}</section>`;
    },
    gift(c) {
      const o = c.gift, wa = hasWA(c) && o.sendWhatsapp;
      const [t1, t2] = splitTitle(o.title), [f1, f2] = splitTitle(o.formTitle);
      const banks = (o.banks || []).map((b, i) => `${i ? heartDiv : ''}<div class="bank"><div>${esc(b.bank)}</div><div>No. Rekening ${esc(b.number)}</div><div>a.n <b>${esc(b.name)}</b></div><button class="btn pill rose" data-copy="${esc(b.number)}">${esc(o.copyBank)} ${ICON.copy}</button></div>`).join('');
      const addr = o.address ? `${heartDiv}${ICON.gift}<div class="bank"><div>${esc(o.addressTitle)}</div><div class="gap"><b>${esc(o.addressName)}</b></div><div>${br(o.address)}</div><button class="btn pill rose" data-copy="${esc(o.addressName + ' - ' + o.address)}">${esc(o.copyAddress)} ${ICON.copy}</button></div>` : '';
      const main = capsule('rosecap', `<h3 class="gt"><span class="s" style="--n:${Math.max(t1.length, 6)}">${esc(t1)}</span><span class="d" style="--n:${Math.max(t2.length, 6)}">${esc(t2)}</span></h3><p class="gi">${br(o.intro)}</p>${banks}${addr}`);
      const form = o.formEnabled ? capsule('rosecap', `<h3 class="gt"><span class="s" style="--n:${Math.max(f1.length, 6)}">${esc(f1)}</span><span class="d" style="--n:${Math.max(f2.length, 6)}">${esc(f2)}</span></h3><p class="gi">${br(o.formText)}</p>
        <form class="fm" id="giftForm"><label>Nama :</label><input name="name" required maxlength="80" value="${esc(guest)}" placeholder="Nama"><label>Nama Bank :</label><input name="bank" maxlength="60" placeholder="Nama Bank"><label>Nominal :</label><input name="amount" maxlength="40" inputmode="numeric" placeholder="Nominal"><label>Ucapan :</label><input name="message" maxlength="500" placeholder="Ucapan"><label>Bukti TF :</label><input type="file" name="proof" accept="image/png,image/jpeg,image/webp"><button class="btn sq full" type="submit">${wa ? ICON.wa : ICON.send}${esc(o.formButton)}</button><div class="msg" id="giftMsg"></div></form>`) : '';
      return `<section class="sec bgi gift" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg))}${main}${form}</section>`;
    },
    rsvp(c) {
      const o = c.rsvp, n = Math.max(1, +o.maxGuests || 1), wa = hasWA(c) && o.sendWhatsapp;
      const t = String(o.title || 'RSVP').trim(), k = Math.ceil(t.length / 2);
      return `<section class="sec bgi rsvp" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg))}<div class="rsvp-head"><h2 class="rv big"><span>${esc(t.slice(0, k))}</span><span>${esc(t.slice(k))}</span></h2>${safeUrl(o.photo) ? `<div class="rv ph"><div class="phb">${photo(o, 'photo')}</div></div>` : ''}</div>
        ${o.text ? `<p class="rv sub">${br(o.text)}</p>` : ''}
        <form class="rv fm" id="rsvpForm"><label>Nama *</label><input name="name" required maxlength="80" value="${esc(guest)}" placeholder="Nama"><label>Konfirmasi Kehadiran *</label>
        <select name="status"><option value="hadir">Hadir</option><option value="tidak">Tidak Hadir</option><option value="ragu">Masih Ragu</option></select>
        <div id="cntWrap"><label>Jumlah *</label><select name="count">${Array.from({ length: n }, (_, i) => `<option value="${i + 1}">${i + 1} Orang</option>`).join('')}</select></div>
        <button class="btn sq ghostw" type="submit">${wa ? ICON.wa : ICON.send}${esc(o.button)}</button><div class="msg" id="rsvpMsg"></div></form></section>`;
    },
    wishes(c) {
      const o = c.wishes;
      return `<section class="sec bgi wishes" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg, c.cover.photo))}${o.title ? `<h2 class="rv h-display">${esc(o.title)}</h2>` : ''}
        <div class="rv wpanel"><p class="wtxt">${br(o.text)}</p>
        <div class="stats"><div><b id="stH">0</b><span>Hadir</span></div><div><b id="stT">0</b><span>Tidak Hadir</span></div></div>
        <form class="wbox fm" id="wishForm"><input name="name" required maxlength="80" value="${esc(guest)}" placeholder="Nama"><textarea name="message" required minlength="2" maxlength="600" placeholder="Ucapan"></textarea><button class="btn sq" type="submit">${ICON.send}${esc(o.button)}</button><div class="msg" id="wishMsg"></div></form>
        <div class="wl-list" id="wishList"></div><div style="text-align:center"><button class="more" id="wishMore" hidden>Muat lebih banyak</button></div></div></section>`;
    },
    closing(c) {
      const o = c.closing, s = c.scene;
      const half = (src, i) => `<div class="half l rv" data-a="bloom-l" style="--i:${i}">${img(src)}</div><div class="half r rv" data-a="bloom-r" style="--i:${i}">${img(src)}</div>`;
      return `<section class="sec closing"><div class="stage">${safeUrl(o.bg) ? bgl(o, 'bg') : `<div class="sk" style="background-image:${cssUrl(s.sky)}"></div>`}
        <div class="ft sway-t">${half(s.floralTop, 0)}</div><div class="fb sway-b">${half(s.floralBottom, 2)}</div>
        <div class="rv panel" data-a="soft" style="--i:5"></div>${sparkles(10)}
        <div class="cl-in"><div class="rv cpho" data-a="zoom-in" style="--i:8"><div class="phb">${photo(o, 'photo')}</div></div><div class="rv kick" data-a="soft" style="--i:10">${esc(o.kicker)}</div><div class="rv names" data-a="soft" style="--i:11">${esc(o.names)}</div><p class="rv txt" data-a="soft" style="--i:12">${br(o.text)}</p></div></div>
        <div class="footer">${safeUrl(o.footerUrl) ? `<a href="${link(o.footerUrl)}" target="_blank" rel="noopener">${esc(o.footer)}</a>` : esc(o.footer)}</div></section>`;
    },
  };

  const MUTE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><path class="x" d="M23 9l-6 6M17 9l6 6"/><path class="w" d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>';
  function videoEmbed(u) {
    u = String(u || '').trim(); if (!u) return '';
    const btn = `<button type="button" class="vmute" aria-label="Suara video">${MUTE_ICON}</button>`;
    const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/.exec(u);
    if (m) return `<div class="rv vid clean" data-a="soft" data-yt="${m[1]}"><div class="vcurtain"></div><div class="vshield"></div>${btn}</div>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u) && safeUrl(u)) return `<div class="rv vid clean" data-a="soft"><video src="${link(u)}" muted loop playsinline autoplay disablepictureinpicture disableremoteplayback preload="auto"></video><div class="vshield"></div>${btn}</div>`;
    return '';
  }

  function coverHtml(c) {
    const o = c.cover, ratio = /^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(o.photoRatio || '') ? o.photoRatio : '16/9';
    return `<div class="cover" id="cover">
      ${safeUrl(o.bg) ? `<div class="cv-bg">${bgl(o, 'bg')}</div>` : ''}
      <div class="cv-veil"></div>
      ${safeUrl(c.scene.column) ? `<div class="cv-col l">${img(c.scene.column)}</div><div class="cv-col r">${img(c.scene.column)}</div>` : ''}
      <div class="arch"><div class="arch-in">
        ${safeUrl(o.photo) ? `<div class="cbox"><div class="cp" style="aspect-ratio:${ratio}"><div class="phb">${photo(o, 'photo', o.names)}</div></div>` : '<div class="cbox nophoto">'}
        <div class="ttl"><div class="k">${esc(o.kicker)}</div><div class="n">${esc(o.names)}</div></div></div>
        <div class="guest"><div class="to">${esc(o.toLabel)}</div><div class="g">${esc(guest || o.defaultGuest)}</div><div class="pl">${esc(o.placeText)}</div>
        <button class="btn sq shine" id="openBtn">${ICON.mail}${esc(o.button)}</button></div></div></div>
      <div class="cv-fb">${halves(c.scene.floralBottom)}</div>
      ${sparkles(12)}<div class="flyers"></div></div>`;
  }

  // ---------- render (dipakai juga oleh pratinjau admin tanpa reload) ----------
  let observers = [], cdsTimer = null;
  function render(cfg) {
    C = cfg;
    if (AC) AC.abort(); AC = new AbortController();
    observers.forEach((o) => o.disconnect()); observers = [];
    clearInterval(cdsTimer);
    applyTheme(cfg);
    const order = (cfg.sections || []).filter((s) => s.enabled && R[s.id]);
    $('#app').innerHTML = order.map((s) => R[s.id](cfg).replace('<section ', `<section data-sid="${s.id}" `)).join('');
    $$('#app section').forEach((sec, idx) => {
      if (!sec.id) sec.id = 's-' + order[idx].id;
      const anim = order[idx] && order[idx].anim || 'fade-up';
      $$('.rv', sec).forEach((el, i) => { if (!el.dataset.a) el.dataset.a = anim; if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 5)); });
    });
    if (!opened || q.has('cover')) {
      $('#coverRoot').innerHTML = coverHtml(cfg);
      $('#openBtn').addEventListener('click', () => openInvitation(false), { signal: AC.signal });
      setupButterflies($('#cover .flyers'));
      if (PREVIEW && q.has('cover') && inited) $('#cover').classList.add('play', 'shown', 'instant');
    }
    bind(cfg);
    if (opened) { startObserver(); const hero = $('#s-hero'); if (hero) { hero.classList.remove('pre'); hero.classList.add('play', 'done', 'instant'); setupButterflies($('.flyers', hero), { sweep: true }); } }
  }

  // ---------- buka undangan: kamera menembus bunga -> mendekat ke pintu rumah -> mundur perlahan ----------
  function openInvitation(instant) {
    if (opened) return; opened = true;
    const cover = $('#cover'), hero = $('#s-hero');
    startMusic();
    const unlock = () => { document.documentElement.classList.remove('locked'); document.body.classList.remove('locked'); window.scrollTo(0, 0); };
    const heroIn = () => { if (hero) { hero.classList.remove('pre'); hero.classList.add('play'); setupButterflies($('.flyers', hero), { sweep: true }); } };
    const finish = () => { startObserver(); parallax(); petals(); };
    if (instant || !C.effects.openZoom || reduce || !hero) {
      unlock(); if (cover) { cover.classList.add('gone'); later(() => cover.remove(), 900); }
      heroIn(); if (hero) hero.classList.add('done'); finish(); return;
    }
    const D = sp; // pengali kecepatan
    cover.classList.add('opening');
    // titik fokus = pintu rumah
    const cam = $('.cam', hero), house = $('.hs img', hero);
    const cr = cam.getBoundingClientRect(), hr = house.getBoundingClientRect();
    const ox = ((hr.left + hr.width * 0.5 - cr.left) / cr.width * 100).toFixed(2), oy = ((hr.top + hr.height * 0.66 - cr.top) / cr.height * 100).toFixed(2);
    cam.style.transformOrigin = `${ox}% ${oy}%`;
    const zin = 1900 * D, zout = 4200 * D, peak = 2.35;
    const anim = cam.animate([
      { transform: 'scale(1)', easing: 'cubic-bezier(.55,.05,.45,1)' },
      { transform: `scale(${peak})`, offset: zin / (zin + zout), easing: 'cubic-bezier(.42,0,.18,1)' },
      { transform: 'scale(1)' },
    ], { duration: zin + zout, fill: 'both' });
    hero.classList.add('flying');
    later(() => { cover.classList.add('gone'); }, zin * 0.82);
    later(() => { cover.remove(); unlock(); }, zin + 300);
    later(heroIn, zin + zout * 0.45);
    anim.onfinish = () => { hero.classList.remove('flying'); hero.classList.add('done'); try { anim.commitStyles(); anim.cancel(); } catch (e) { /* */ } cam.style.transform = ''; };
    later(finish, zin + 400);
  }

  function gotoSection(id) {
    const map = { scene: 'hero', effects: 'hero', theme: 'hero', general: 'hero', sections: 'hero', 'd-wishes': 'wishes', 'd-rsvp': 'rsvp', 'd-gifts': 'gift' };
    const el = $('#s-' + (map[id] || id)); if (!el) return;
    const y = el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.max(0, y - 6), behavior: 'smooth' });
    $$('.rv', el).forEach((r) => r.classList.add('in'));
  }

  function vidCtl(el, on) {
    const yt = el.dataset.yt;
    if (yt) {
      let f = $('iframe', el);
      if (!f) {
        if (!on) return;
        f = document.createElement('iframe');
        f.allow = 'autoplay;encrypted-media'; f.title = 'Video'; f.setAttribute('tabindex', '-1');
        f.src = `https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&playsinline=1&controls=0&disablekb=1&fs=0&rel=0&iv_load_policy=3&cc_load_policy=0&modestbranding=1&enablejsapi=1`;
        el.insertBefore(f, el.firstChild);
        const cu = $('.vcurtain', el); if (cu) setTimeout(() => cu.classList.add('off'), 4200);
        return;
      }
      try { f.contentWindow.postMessage(JSON.stringify({ event: 'command', func: on ? 'playVideo' : 'pauseVideo', args: [] }), '*'); } catch (e) { /* abaikan */ }
      return;
    }
    const v = $('video', el); if (!v) return;
    if (on) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
  }
  // tombol suara video: nyalakan/matikan suara (musik latar dijeda saat video bersuara)
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('.vmute'); if (!b) return;
    const el = b.closest('.vid'), unmute = !b.classList.contains('on');
    b.classList.toggle('on', unmute);
    const yf = $('iframe', el), v = $('video', el);
    if (yf) { try { yf.contentWindow.postMessage(JSON.stringify({ event: 'command', func: unmute ? 'unMute' : 'mute', args: [] }), '*'); if (unmute) yf.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*'); } catch (x) { /* abaikan */ } }
    if (v) { v.muted = !unmute; if (unmute) v.play().catch(() => {}); }
    const mb = $('#musicBtn'); if (unmute && mb && mb.classList.contains('on')) { mb.click(); el.dataset.pausedBgm = '1'; } else if (!unmute && el.dataset.pausedBgm && mb && !mb.classList.contains('on')) { mb.click(); delete el.dataset.pausedBgm; }
  });

  let cdsRun = null;
  function startObserver() {
    // elemen yang digeser keluar layar (bunga) tidak bisa dideteksi sendiri -> amati wadah induknya
    const groups = new Map();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const on = e.isIntersecting;
      (groups.get(e.target) || []).forEach((t) => {
        t.classList.toggle('in', on);
        if (on && t.id === 'cds' && cdsRun) cdsRun();
        if (t.classList.contains('vid')) vidCtl(t, on);
      });
    }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
    observers.push(io);
    $$('#app .rv').forEach((el) => {
      const tgt = /^bloom/.test(el.dataset.a || '') && el.parentElement ? el.parentElement : el;
      if (!groups.has(tgt)) { groups.set(tgt, []); io.observe(tgt); }
      groups.get(tgt).push(el);
    });
    // hero: bunga masuk lagi setiap kali kembali ke atas
    const hero = $('#s-hero');
    if (hero) {
      const ho = new IntersectionObserver((es) => es.forEach((e) => {
        if (hero.classList.contains('flying')) return;
        if (e.isIntersecting) { hero.classList.remove('pre'); hero.classList.add('play'); } else { hero.classList.remove('play'); hero.classList.add('pre'); }
      }), { threshold: 0.4 });
      ho.observe(hero); observers.push(ho);
    }
  }
  function reveal() { $$('#app .rv').forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('in'); }); }

  let parOn = false;
  function parallax() {
    if (!C.effects.parallax || parOn) return; parOn = true;
    let tk = false;
    addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { const y = scrollY, h = $('.hero .scene'); if (h && y < innerHeight * 1.3) h.style.setProperty('--py', y); tk = false; }); }, { passive: true });
  }

  // ---------- kupu-kupu & kelopak ----------
  function bfSvg(c1, c2) {
    return `<svg viewBox="0 0 40 40"><g class="wl"><path d="M20 20 C12 4 0 6 3 16 C5 24 12 24 20 21Z" fill="${c1}"/><path d="M20 21 C10 24 6 34 12 35 C17 35 20 28 20 21Z" fill="${c2}"/></g><g class="wr"><path d="M20 20 C28 4 40 6 37 16 C35 24 28 24 20 21Z" fill="${c1}"/><path d="M20 21 C30 24 34 34 28 35 C23 35 20 28 20 21Z" fill="${c2}"/></g><rect x="19" y="12" width="2" height="18" rx="1" fill="#3a1520"/></svg>`;
  }
  function setupButterflies(box, opt = {}) {
    if (!box || !C.effects.butterflies || reduce || box.dataset.on) return;
    box.dataset.on = '1';
    const sweep = !!opt.sweep;
    const n = Math.min(Math.max(+C.effects.butterflyCount || 0, 0), 12);
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div'); el.className = 'bf';
      const s = 22 + Math.random() * 20; el.style.width = el.style.height = s + 'px';
      el.innerHTML = bfSvg(C.scene.butterflyColor1, C.scene.butterflyColor2);
      el.querySelectorAll('.wl,.wr').forEach((w) => { w.style.animationDuration = (0.16 + Math.random() * 0.14) + 's'; });
      const W0 = box.clientWidth || 400, H0 = box.clientHeight || 700;
      let x = sweep ? (i % 2 ? W0 + 30 : -s - 30) : (i % 2 ? W0 + 30 : -s - 30);
      let y = H0 * (0.12 + Math.random() * 0.45);
      el.style.transform = `translate(${x}px,${y}px)`; el.style.opacity = '0'; el.style.transition = 'opacity .6s';
      box.appendChild(el);
      let first = true;
      const go = () => {
        if (!el.isConnected) return;
        const W = box.clientWidth || 400, H = box.clientHeight || 700;
        const nx = x < W / 2 ? W * (0.5 + Math.random() * 0.45) - s : W * (0.02 + Math.random() * 0.42);
        const ny = H * (0.08 + Math.random() * 0.6);
        if (first) { el.style.opacity = '1'; first = false; }
        const ang = Math.atan2(ny - y, nx - x) * 180 / Math.PI + 90;
        const dist = Math.hypot(nx - x, ny - y), dur = Math.max(2600, dist * (15 + Math.random() * 12));
        const mx = (x + nx) / 2 + (Math.random() - 0.5) * 120, my = (y + ny) / 2 + (Math.random() - 0.5) * 140;
        const a = el.animate([
          { transform: `translate(${x}px,${y}px) rotate(${ang}deg)` },
          { transform: `translate(${mx}px,${my}px) rotate(${ang + (Math.random() - 0.5) * 40}deg)`, offset: 0.5 },
          { transform: `translate(${nx}px,${ny}px) rotate(${ang}deg)` },
        ], { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
        x = nx; y = ny; a.onfinish = () => setTimeout(go, Math.random() * 600);
      };
      setTimeout(go, (sweep ? 1200 : 2200) * sp + i * 420 + Math.random() * 300);
    }
  }
  let petalsOn = false;
  function petals() {
    if (!C.effects.petals || reduce || petalsOn) return; petalsOn = true;
    const box = $('#petals'), cols = [C.theme.primary, '#d96a7f', '#f3b8c2', '#e8909f'];
    box.style.opacity = '0'; setTimeout(() => (box.style.opacity = ''), 2600 * sp);
    const hide = () => box.classList.toggle('off', scrollY > innerHeight * 0.85); hide();
    addEventListener('scroll', hide, { passive: true });
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('i'); p.className = 'petal';
      const s = 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s * 1.3}px;background:${cols[i % cols.length]};animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s;opacity:${0.55 + Math.random() * 0.35}`;
      box.appendChild(p);
    }
  }

  // ---------- musik ----------
  function startMusic() {
    const url = PREVIEW ? '' : safeUrl(C.general.musicUrl), btn = $('#musicBtn'), au = $('#bgm');
    if (!url) return;
    au.src = url; btn.hidden = false;
    const set = (on) => btn.classList.toggle('on', on);
    au.play().then(() => set(true)).catch(() => set(false));
    btn.onclick = () => { if (au.paused) { au.play(); set(true); } else { au.pause(); set(false); } };
    document.addEventListener('visibilitychange', () => { if (document.hidden) au.pause(); else if (btn.classList.contains('on')) au.play().catch(() => {}); });
  }

  function popup(title, text) {
    const old = $('#pop'); if (old) old.remove();
    const d = document.createElement('div'); d.id = 'pop'; d.className = 'pop';
    d.innerHTML = `<div class="pop-card"><div class="pop-ic"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3>${esc(title)}</h3><p>${br(text)}</p><div class="pop-names">${esc(C.cover.names)}</div><button type="button" class="pop-x">Tutup</button></div>`;
    document.body.appendChild(d); requestAnimationFrame(() => d.classList.add('show'));
    const close = () => { d.classList.remove('show'); setTimeout(() => d.remove(), 350); };
    d.addEventListener('click', (e) => { if (e.target === d || e.target.classList.contains('pop-x')) close(); });
  }
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); }

  // copy (sekali saja untuk seluruh halaman)
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest && ev.target.closest('[data-copy]'); if (!b) return;
    const txt = b.dataset.copy;
    const ok = () => toast('Berhasil disalin ✓');
    const fb = () => { const t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = 0; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Gagal menyalin'); } t.remove(); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, fb); else fb();
  });
  // lightbox
  let lbItems = [], lbCur = 0;
  const lb = $('#lightbox'), lim = $('img', lb);
  const lbShow = (i) => { if (!lbItems.length) return; lbCur = (i + lbItems.length) % lbItems.length; lim.src = lbItems[lbCur]; lb.hidden = false; };
  $('.lb-x', lb).onclick = () => (lb.hidden = true);
  $('.lb-p', lb).onclick = () => lbShow(lbCur - 1); $('.lb-n', lb).onclick = () => lbShow(lbCur + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.hidden = true; });
  addEventListener('keydown', (e) => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') lbShow(lbCur - 1); if (e.key === 'ArrowRight') lbShow(lbCur + 1); });
  let lsx = 0; lb.addEventListener('touchstart', (e) => (lsx = e.touches[0].clientX), { passive: true });
  lb.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - lsx; if (Math.abs(dx) > 50) lbShow(lbCur + (dx < 0 ? 1 : -1)); });

  // ---------- interaksi per render ----------
  function bind(c) {
    const sig = { signal: AC.signal };
    // countdown
    const target = new Date(c.general.eventDate).getTime();
    const box = $('#cds'); cdsRun = null;
    if (box && !isNaN(target)) {
      const last = {}; let counting = false;
      const calc = () => { const d = Math.max(0, target - Date.now()); return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 }; };
      const put = (k, n, tick) => { const el = $(`[data-k=${k}]`, box); const t = k === 'd' ? String(n) : pad(n); if (last[k] !== t) { el.textContent = t; if (tick && last[k] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } last[k] = t; } };
      const upd = () => { if (counting) return; const v = calc(); for (const k in v) put(k, v[k], true); };
      cdsRun = () => { // hitung naik cepat dari 0 sampai nilai sebenarnya
        counting = true; const t0 = performance.now(), D = 1700;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3), v = calc();
          for (const k in v) put(k, Math.round(v[k] * e), false);
          if (p < 1) requestAnimationFrame(step); else { counting = false; upd(); }
        };
        requestAnimationFrame(step);
      };
      upd(); cdsTimer = setInterval(upd, 1000);
    }
    // save the date
    const sd = $('#saveDate');
    if (sd) {
      const fmt = (s) => { const d = new Date(s); if (isNaN(d)) return ''; return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`; };
      const s = fmt(c.general.eventDate), e = fmt(c.general.eventEnd) || s;
      sd.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.general.calendarTitle)}&dates=${s}/${e}&location=${encodeURIComponent(c.general.eventLocation)}&details=${encodeURIComponent(c.general.description)}`;
    }
    // lightbox
    lbItems = (c.gallery.items || []).map((g) => safeUrl(g.image)).filter(Boolean);
    $$('.gi').forEach((g) => g.addEventListener('click', () => lbShow(+g.dataset.i), sig));

    // RSVP
    const rf = $('#rsvpForm');
    if (rf) {
      rf.status.addEventListener('change', () => ($('#cntWrap').style.display = rf.status.value === 'hadir' ? '' : 'none'), sig);
      rf.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = $('#rsvpMsg'); m.className = 'msg'; m.textContent = 'Mengirim…';
        const body = { name: rf.name.value, status: rf.status.value, count: rf.count.value };
        const r = await post('/api/rsvp', body);
        if (r.ok) {
          m.className = 'msg'; m.textContent = ''; popup('Terima kasih, ' + body.name + '!', c.rsvp.thanks); loadWishes(true);
          const wa = String(c.general.whatsapp || '').replace(/\D/g, '');
          if (c.rsvp.sendWhatsapp && wa) { const st = { hadir: `akan hadir (${body.count} orang)`, tidak: 'tidak dapat hadir', ragu: 'masih ragu untuk hadir' }[body.status]; window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya ${body.name} ${st} di acara pernikahan ${c.general.calendarTitle || ''}.`)}`, '_blank'); }
        } else { m.className = 'msg err'; m.textContent = r.error || 'Gagal mengirim'; }
      }, sig);
    }
    // gift confirm
    const gf = $('#giftForm');
    if (gf) gf.addEventListener('submit', async (e) => {
      e.preventDefault(); const m = $('#giftMsg'); m.className = 'msg'; m.textContent = 'Mengirim…';
      const f = gf.proof.files[0]; let proofData = '';
      if (f) { if (f.size > 2.5e6) { m.className = 'msg err'; m.textContent = 'Bukti maksimal 2,5MB'; return; } proofData = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(f); }); }
      const r = await post('/api/gift', { name: gf.name.value, bank: gf.bank.value, amount: gf.amount.value, message: gf.message.value, proofData });
      if (r.ok) {
        m.className = 'msg'; m.textContent = ''; popup('Terima kasih, ' + gf.name.value + '!', 'Konfirmasi gift Anda telah kami terima.');
        const wa = String(c.general.whatsapp || '').replace(/\D/g, '');
        if (c.gift.sendWhatsapp && wa) window.open(`https://wa.me/${wa}?text=${encodeURIComponent(`Halo, saya ${gf.name.value} sudah mengirim gift${gf.amount.value ? ' sebesar ' + gf.amount.value : ''}${gf.bank.value ? ' via ' + gf.bank.value : ''}. ${gf.message.value || ''}`.trim())}`, '_blank');
        gf.reset();
      } else { m.className = 'msg err'; m.textContent = r.error || 'Gagal mengirim'; }
    }, sig);
    // wishes
    const wf = $('#wishForm');
    if (wf) {
      wf.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = $('#wishMsg'); m.className = 'msg'; m.textContent = 'Mengirim…';
        const r = await post('/api/wishes', { name: wf.name.value, message: wf.message.value });
        if (r.ok) { m.className = 'msg'; m.textContent = ''; popup('Terima kasih, ' + wf.name.value + '!', 'Ucapan dan doa Anda telah kami terima.'); wf.message.value = ''; loadWishes(true); } else { m.className = 'msg err'; m.textContent = r.error || 'Gagal mengirim'; }
      }, sig);
      $('#wishMore').onclick = () => loadWishes(false);
      loadWishes(true);
    }
  }
  let wOff = 0;
  async function loadWishes(reset) {
    const list = $('#wishList'); if (!list) return;
    if (reset) wOff = 0;
    const d = await fetch(`/api/wishes?limit=10&offset=${wOff}`).then((r) => r.json()).catch(() => null); if (!d || !d.items) return;
    if (reset) list.innerHTML = '';
    $('#stH').textContent = d.hadir; $('#stT').textContent = d.tidak;
    list.insertAdjacentHTML('beforeend', d.items.map((w, i) => `<div class="wl-item" style="animation-delay:${i * 0.06}s"><b>${esc(w.name)}</b><small>${esc(new Date(w.ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))}</small><p>${esc(w.message)}</p></div>`).join(''));
    wOff += d.items.length; $('#wishMore').hidden = wOff >= d.total;
  }
  async function post(url, body) {
    try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return await r.json(); } catch (e) { return { error: 'Koneksi bermasalah' }; }
  }
})();
