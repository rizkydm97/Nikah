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
  // kecepatan animasi teks masuk per bagian (cover / pembuka / penutup); kosong = ikut pengaturan umum
  const TSPD = { vslow: 2.2, slow: 1.5, normal: 1, fast: 0.65, vfast: 0.4 };
  const MEDIA_SEL = 'img,svg,canvas,video,picture,iframe';
  function textSpeedFor(root, v) {
    if (!root) return;
    $$('[data-ts]', root).forEach((e) => { e.style.removeProperty('--dur'); e.style.removeProperty('--tk'); e.removeAttribute('data-ts'); });
    root.style.removeProperty('--tk'); root.removeAttribute('data-ts');
    const m = TSPD[v]; if (!m || reduce) return;
    const mark = (e) => { if (e.dataset.ts) return; e.dataset.ts = '1'; e.style.setProperty('--dur', m + 's'); e.style.setProperty('--tk', String(m)); };
    if (root.classList.contains('mono') || root.classList.contains('mono-hero') || root.classList.contains('mn-closing')) { mark(root); return; } // Tema 12: seluruh teks diatur lewat --tk
    const own = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    $$('*', root).forEach((e) => {
      if (/^(SCRIPT|STYLE)$/.test(e.tagName) || !own(e)) return;
      mark(e);
      for (let p = e.parentElement; p && p !== root; p = p.parentElement) { if (p.querySelector(MEDIA_SEL)) break; mark(p); } // pembungkus teks murni ikut
    });
  }
  function applyTextSpeed() {
    if (!C) return;
    textSpeedFor($('#cover'), C.cover && C.cover.textSpeed);
    const secSpd = (id) => ((C.sections || []).find((x) => x.id === id) || {}).speed;
    textSpeedFor($('#s-hero'), (C.hero && C.hero.textSpeed) || secSpd('hero'));
    textSpeedFor($('#s-closing'), (C.closing && C.closing.textSpeed) || secSpd('closing'));
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // font -> [bobot, punya-italic]. Hanya yang punya italic asli diminta italic (hindari italic palsu).
  const FONTS = { 'Cormorant Infant': ['400;500;600;700', 1], 'Cormorant Garamond': ['400;500;600;700', 1], 'Playfair Display': ['400;500;600;700', 1], 'Lora': ['400;500;600;700', 1], 'Poppins': ['400;500;600;700', 0], 'Libre Baskerville': ['400;700', 1], 'EB Garamond': ['400;500;600;700', 1], 'Marcellus': ['', 0], 'Cinzel': ['400;500;600;700', 0], 'Great Vibes': ['', 0], 'Allura': ['', 0], 'Parisienne': ['', 0], 'Pinyon Script': ['', 0], 'Dancing Script': ['400;500;600;700', 0], 'Alice': ['', 0], 'Abhaya Libre': ['400;500;600;700', 0], 'Montserrat': ['400;500;600;700', 1], 'Amiri': ['400;700', 0], 'Josefin Sans': ['400;500;600;700', 1] };
  const CLOUD_SETS = { jawa: [1, 2, 3, 4].map((i) => `/assets/scene/cloud${i}.webp`), rose: [1, 2, 3, 4].map((i) => `/assets/rose/rose-cloud${i}.webp`) };
  let CLOUDS = CLOUD_SETS.jawa, THEME = 'jawa';
  // tema aktif: gambar dekorasi tema 2 disimpan terpisah (scene2) supaya pindah tema tidak menimpa gambar tema 1
  // tema warna: bunga bawaan diganti versi warna lain (gambar yang diunggah sendiri tidak disentuh)
  const PAL_HUE = { maroon: 0.985, pink: 0.95, lilac: 0.78, blue: 0.6, peach: 0.045, champagne: 0.1 };
  const NATIVE = { jawa: 'maroon', rose: 'pink' };
  const DEF_FL = {
    jawa: { floralTop: '/assets/scene/floral-top-v2.webp', floralBottom: '/assets/scene/floral-bottom-v2.webp', column: '/assets/scene/column.webp', frameArc: '/assets/scene/frame-arc.webp', frameSide: '/assets/scene/frame-side.webp', flowers: '/assets/scene/bouquet.webp' },
    rose: { floralTop: '/assets/rose/rose-top.webp', floralBottom: '/assets/rose/rose-bottom.webp', column: '/assets/rose/rose-column.webp', frameArc: '/assets/rose/rose-frame-arc.webp', frameSide: '/assets/rose/rose-frame-side.webp', flowers: '/assets/rose/rose-bouquet.webp' },
  };
  const FL_FILE = { floralTop: 'top', floralBottom: 'bottom', column: 'column', frameArc: 'frame-arc', frameSide: 'frame-side', flowers: 'bouquet' };
  let PAL = 'auto', PT = null, PICT = null, MN = false; // PT = data tema bergambar (Tema 3-8)
  function effective(cfg) {
    const pre = cfg.theme && cfg.theme.preset;
    PT = (window.PIC_THEMES && window.PIC_THEMES[pre]) || null; PICT = PT ? pre : null; MN = !!(window.MONO && pre === 'mono');
    THEME = PT ? PT.base : pre === 'rose' ? 'rose' : 'jawa';
    CLOUDS = CLOUD_SETS[THEME];
    const out = THEME === 'rose' ? Object.assign({}, cfg, { scene: Object.assign({}, cfg.scene, cfg.scene2 || {}) }) : Object.assign({}, cfg, { scene: Object.assign({}, cfg.scene) });
    PAL = PAL_HUE[cfg.theme && cfg.theme.palette] !== undefined ? cfg.theme.palette : 'auto';
    if (PT && PAL === 'auto') PAL = PT.pal;
    if (MN) PAL = 'auto';
    // konfigurasi lama yang masih memakai warna bawaan Tema 1/2 pada tema bergambar -> pakai warna bawaan tema itu
    if (PT && PT.colors && (!cfg.theme.palette || cfg.theme.palette === 'auto') && ['#A00818', '#B4536D'].includes(String(cfg.theme.primary || '').toUpperCase())) out.theme = Object.assign({}, cfg.theme, PT.colors);
    if (PT) {
      out.scene.palace = PT.bg; out.scene.sky = PT.bg;
      // hiasan dalam milik tema (hanya mengganti gambar bawaan; gambar yang diunggah sendiri tetap dipakai)
      const D0 = Object.assign({}, DEF_FL.jawa, { ornament: '/assets/default/ornament.svg' }), D1 = DEF_FL.rose;
      for (const k in PT.deco) { const v = out.scene[k]; if (!v || v === D0[k] || v === D1[k] || /\/assets\/(pal|default)\//.test(v)) out.scene[k] = PT.deco[k]; }
      if (out.couple && (!out.couple.flower || out.couple.flower === DEF_FL.jawa.flowers || out.couple.flower === DEF_FL.rose.flowers)) out.couple = Object.assign({}, out.couple, { flower: PT.deco.flowers });
    }
    if (MN) { // Tema 12 Monokrom: hitam putih, bersih — tanpa kupu-kupu, kelopak, awan, burung, gerak dedaunan
      out.effects = Object.assign({}, out.effects, { butterflies: false, petals: false, javaFx: false, clouds: false, birds: false, particles: false, sway: false, glow: false, parallax: false, bgParallax: false, skyShift: false, nightMode: false });
      if (['#A00818', '#B4536D'].includes(String(cfg.theme.primary || '').toUpperCase())) out.theme = Object.assign({}, cfg.theme, window.MONO.colors);
      else { // warna sisa tema lain (marun, pink, krem, emas) -> ganti ke warna hitam putih Tema 12
        const gr = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || '').trim()); if (!m) return false; const n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return Math.max(r, g, b) - Math.min(r, g, b) <= 8; };
        const fix = {}; ['primary', 'accent', 'rose', 'gold', 'paper', 'ink', 'body', 'sideBg'].forEach((k) => { if (!gr(out.theme[k])) fix[k] = window.MONO.colors[k]; });
        if (Object.keys(fix).length) out.theme = Object.assign({}, out.theme, fix);
      }
      const MD = window.MONO.deco, D0 = Object.assign({}, DEF_FL.jawa, { ornament: '/assets/default/ornament.svg' }), D1 = DEF_FL.rose;
      for (const k in MD) { const v = out.scene[k]; if (!v || v === D0[k] || v === D1[k] || /\/assets\/(pal|default|scene|rose)\//.test(v) || /\/assets\/mono\/(rose-a|rose-b|sprig-tall)\.webp/.test(v)) out.scene[k] = MD[k]; }
      if (out.couple && (!out.couple.flower || out.couple.flower === DEF_FL.jawa.flowers || out.couple.flower === DEF_FL.rose.flowers)) out.couple = Object.assign({}, out.couple, { flower: MD.flowers });
    }
    if (!PT && !MN && PAL !== 'auto' && PAL !== NATIVE[THEME]) {
      for (const k in FL_FILE) if (out.scene[k] === DEF_FL[THEME][k]) out.scene[k] = `/assets/pal/${PAL}/${THEME}-${FL_FILE[k]}.webp`;
      if (THEME === 'rose') {
        const RS = { sky: 'rose-sky.jpg', treeline: 'rose-trees.webp', house: 'rose-pavilion.webp', curtain: 'rose-curtain.webp', palace: 'rose-palace.jpg' };
        for (const k in RS) if (out.scene[k] === '/assets/rose/' + RS[k]) out.scene[k] = `/assets/pal/${PAL}/${RS[k]}`;
        CLOUDS = [1, 2, 3, 4].map((i) => `/assets/pal/${PAL}/rose-cloud${i}.webp`);
      }
      if (THEME === 'jawa' && out.couple && out.couple.flower === DEF_FL.jawa.flowers) out.couple = Object.assign({}, out.couple, { flower: out.scene.flowers });
    }
    return out;
  }

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
  // Tema 2: latar kosong / foto contoh bawaan diganti lukisan istana & taman
  const PLACEHOLDER = ['/assets/default/couple-wide.svg', '/assets/default/paper.svg', '/assets/default/sky.svg', '/assets/scene/sky-v2.jpg'];
  function bgl(o, k, src) {
    let u = safeUrl(src !== undefined ? src : o && o[k]);
    if ((THEME === 'rose' || PT) && C && safeUrl(C.scene.palace) && (!u || PLACEHOLDER.includes(u) || (PT && u === C.scene.sky && !src))) return `<div class="bgl palace"><img class="pimg" src="${esc(C.scene.palace)}" alt="" decoding="async"></div>`;
    if (!u) return '';
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
      if (e.data.type === 'replay') replaySection(e.data.id);
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

  // ---------- pembuka layar penuh: foto / video (cover.loaderMedia; Tema 12 otomatis memakai media cover) ----------
  function loaderMedia(c) {
    const m = c.mono || {};
    const u = safeUrl(c.cover.loaderMedia) || (MN ? (safeUrl(m.coverMedia) || (safeUrl(c.cover.photo) && !/\/assets\/default\//.test(c.cover.photo) ? safeUrl(c.cover.photo) : '')) : '');
    if (!u) return '';
    const yt = (String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1];
    let el;
    if (yt) el = `<iframe src="https://www.youtube.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0&playsinline=1&modestbranding=1&rel=0" allow="autoplay; encrypted-media" tabindex="-1" title=""></iframe>`;
    else if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u)) el = ''; // video TIDAK diputar di loader: sampul sudah memuat video yang sama -> cukup diunduh sekali (dulu 2x, bikin lambat & patah-patah)
    else el = `<img src="${esc(u)}" alt="" decoding="async">`;
    return `<div class="ld-bg">${el}</div>`;
  }

  // ---------- intro: monogram + muat gambar dulu supaya animasi mulus ----------
  function intro() {
    const ld = $('#loader'), c = C;
    const names = String(c.cover.names || '').split('&').map((s) => s.trim()).filter(Boolean);
    const mono = names.length >= 2 ? `${esc(names[0][0])}<i>&amp;</i>${esc(names[1][0])}` : esc((names[0] || '♥')[0]);
    const lm = loaderMedia(c);
    if (c.effects.intro !== false) ld.innerHTML = `${lm}<div class="ld-in"><div class="ld-ring"></div><div class="ld-mono">${mono}</div><div class="ld-k">${esc(c.cover.kicker)}</div><div class="ld-bar"><span id="ldBar"></span></div></div>`;
    ld.classList.toggle('has-media', !!lm); ld.classList.add('ready');
    const s = c.scene;
    const urls = PT && PT.live ? [PT.bg, ...(PT.preload || ['bf_rajah', 'feather', 'leafj', 'orchid', 'cloudw1']).map((n) => /\//.test(n) ? n : PT.spr + n + '.webp')] : PT ? [PT.world, PT.spr.replace('spr/', PICT + '/ctitle.webp'), PT.spr.replace('spr/', PICT + '/cbtn.webp'), PT.spr.replace('spr/', PICT + '/depth.png'), ...(PT.entry === 'doors' ? [PT.cover] : []), ...PT.bf.map((n) => PT.spr + n + '.webp'), ...(spOn() ? [PT.bg, ...({ princess: ['princess/orn', 'spr/rose1', 'spr/rose2'], bali: ['bali/motif', 'bali/orn', 'spr/frangi1', 'spr/cloudw1'], emas: ['emas/motif', 'emas/orn'], biru: ['fx/ripple', 'fx/mist'], rimba: ['fx/mist', 'spr/bf_gold'], klasik: [] }[PICT] || []).map((n) => '/assets/t/' + n + '.webp'), ...(PICT === 'klasik' ? [GUN] : [])] : [])].map(safeUrl) : [s.sky, s.house, s.curtain, s.treeline, s.floralTop, s.floralBottom, s.column, c.effects.showTree !== false ? s.tree : '', c.cover.photo, c.cover.bg, ...CLOUDS, ...(THEME !== 'rose' && c.effects.javaFx !== false ? [GUN, ...LEAF_IMG.slice(0, 3), ...LEAVES.map((l) => `/assets/scene/leaf-${l[0]}.webp`)] : [])].map(safeUrl).filter(Boolean);
    // video sampul (+ video bingkai) ikut ditunggu: loader baru hilang setelah video punya cukup data untuk diputar mulus
    const vids = [...$$('#cover video'), ...$$('#s-hero video')];
    const vidReady = (v, need) => new Promise((res) => {
      let fin = false; const end = () => { if (fin) return; fin = true; clearInterval(iv); ['canplay', 'canplaythrough', 'loadeddata', 'error', 'progress'].forEach((e) => v.removeEventListener(e, chk)); res(); };
      const ahead = () => { try { const b = v.buffered, t = v.currentTime || 0; for (let i = 0; i < b.length; i++) if (b.start(i) <= t + 0.5 && b.end(i) >= t) return b.end(i) - t; } catch (e) { /* abaikan */ } return 0; };
      const chk = () => { if (v.error || !v.isConnected) return end(); const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : need; if (v.readyState >= 3 && (ahead() >= Math.min(need, dur * 0.9) || v.readyState >= 4)) end(); };
      const iv = setInterval(chk, 250); ['canplay', 'canplaythrough', 'loadeddata', 'error', 'progress'].forEach((e) => v.addEventListener(e, chk)); chk();
    });
    let done = 0; const bar = $('#ldBar');
    const one = (u) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => { done++; if (bar) bar.style.width = Math.round(done / urls.length * 100) + '%'; (im.decode ? im.decode().catch(() => {}) : Promise.resolve()).then(res); }; im.src = u; });
    const minShow = new Promise((r) => setTimeout(r, c.effects.intro !== false ? 1400 : 0));
    const cap = new Promise((r) => setTimeout(r, 7000)); // jangan menunggu selamanya di jaringan lambat
    // video: sampul didahulukan (harus siap ~3 dtk di buffer), video bingkai menyusul (tidak berebut bandwidth); batas tunggu 12 dtk
    const coverV = vids.filter((v) => v.closest('#cover')), frameV = vids.filter((v) => !v.closest('#cover'));
    const poster = safeUrl((c.mono || {}).coverPoster);
    if (poster) urls.push(poster);
    // ada poster -> cukup tunggu video ≤2,5 dtk (poster sudah tampil bagus); tanpa poster tunggu ≤8 dtk agar sampul tidak hitam
    const vcap = new Promise((r) => setTimeout(r, poster ? 2500 : 8000));
    const vwork = coverV.length ? Promise.all(coverV.map((v) => vidReady(v, 3))).then(() => { frameV.forEach((v) => { try { v.preload = 'auto'; v.load(); } catch (e) { /* abaikan */ } }); return Promise.race([Promise.all(frameV.map((v) => vidReady(v, 2))), new Promise((r) => setTimeout(r, 3500))]); }) : Promise.resolve();
    Promise.all([Promise.race([Promise.all(urls.map(one)), cap]), Promise.race([vwork, vcap]), minShow]).then(() => {
      ld.classList.add('off');
      const cv = $('#cover');
      if (cv) { later(() => cv.classList.add('play'), 250); later(() => cv.classList.add('shown'), 250 + 1500 * (TSPD[C.cover.textSpeed] || sp)); }
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
    r.setProperty('--dur', sp + 's'); r.setProperty('--tk', String(sp));
    r.setProperty('--cloudK', String({ slow: 1.6, normal: 1, fast: 0.55 }[c.effects.cloudSpeed] || 1));
    const fams = [...new Set([t.fontDisplay, t.fontHeading, t.fontBody, t.fontScript, 'Poppins', 'Lora', 'Amiri'])].filter(Boolean).map((n) => {
      const [w, it] = FONTS[n] || ['', 0], nm = encodeURIComponent(n).replace(/%20/g, '+');
      if (!w) return 'family=' + nm;
      const ws = w.split(';');
      return 'family=' + nm + (it ? ':ital,wght@' + ws.map((x) => '0,' + x).concat(ws.map((x) => '1,' + x)).join(';') : ':wght@' + w);
    });
    let l = $('#gfonts'); if (!l) { l = document.createElement('link'); l.id = 'gfonts'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    const href = 'https://fonts.googleapis.com/css2?' + fams.join('&') + '&display=swap'; if (l.href !== href) l.href = href;
    r.setProperty('--arc', cssUrl(c.scene.frameArc)); r.setProperty('--side', cssUrl(c.scene.frameSide)); r.setProperty('--div', PT ? cssUrl(PT.divider) : 'none'); r.setProperty('--motif', PT && PT.motif ? cssUrl(PT.motif) : 'none');
    document.title = c.general.title || document.title;
    { // warna bilah browser (iOS/Android) mengikuti tema, bukan krem bawaan
      let m = document.querySelector('meta[name="theme-color"]'); if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; document.head.appendChild(m); }
      m.content = MN ? (t.paper || '#ffffff') : (t.primary || m.content); }
    const b = document.body.classList;
    { // putaran warna gambar tema bergambar: relatif terhadap palet asli tema itu (0 = tidak diputar)
      const nat = PT ? PT.pal : THEME === 'rose' ? 'pink' : 'maroon';
      let d = PAL === 'auto' || PAL === nat || PAL_HUE[PAL] === undefined ? 0 : (PAL_HUE[PAL] - PAL_HUE[nat]) * 360; d = ((d + 540) % 360) - 180;
      r.setProperty('--hr', d.toFixed(1) + 'deg'); r.setProperty('--hs', d !== 0 && PAL === 'champagne' ? '.5' : '1');
      document.body.classList.toggle('hued', !!PT && d !== 0); }
    b.toggle('t-rose', THEME === 'rose'); b.toggle('t-jawa', THEME !== 'rose'); b.toggle('t-pic', !!PT); b.toggle('t-mono', MN); b.toggle('mono-gray', MN && !!(c.mono && c.mono.grayPhoto === true)); b.toggle('t-dark', !!(PT && PT.dark)); Object.keys(window.PIC_THEMES || {}).forEach((k) => b.toggle('t-' + k, PICT === k));
    b.toggle('nosway', !c.effects.sway); b.toggle('noglow', !c.effects.glow); b.toggle('noclouds', c.effects.clouds === false);
    // saklar animasi (admin → Animasi & Efek); kosong/true = menyala
    ['birds', 'particles', 'lights'].forEach((k) => b.toggle('no' + k, c.effects[k] === false));
    b.toggle('norv', c.effects.revealAnim === false); b.toggle('nobfly', c.effects.butterflies === false); b.toggle('nopetal', c.effects.petals === false); b.toggle('nopar', c.effects.parallax === false);
  }

  // ---------- adegan: langit, awan bergerak, pepohonan, rumah ----------
  function clouds() {
    // posisi & kecepatan berbeda tiap awan; delay negatif = awan sudah tersebar sejak awal
    const L = [[6, 70, 120, 0.95, 0], [17, 52, 95, 0.85, 1], [28, 64, 140, 0.9, 2], [40, 46, 105, 0.75, 3], [12, 40, 160, 0.6, 1], [48, 58, 125, 0.8, 0]];
    return `<div class="ly clouds">${L.map(([top, w, dur, op, i], n) => `<img class="cl" src="${CLOUDS[i]}" alt="" style="top:${top}%;width:${w}%;opacity:${op};animation-duration:calc(${dur}s * var(--cloudK,1));animation-delay:calc(${-(dur * ((n * 0.37) % 1)).toFixed(1)}s * var(--cloudK,1))">`).join('')}</div>`;
  }
  // titik cahaya keemasan yang berkelip & melayang pelan
  const sparkles = (n) => `<div class="sparkles" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const r = (k) => ((Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2); return `<i style="left:${(r(1) * 96 + 2).toFixed(1)}%;top:${(r(2) * 80 + 8).toFixed(1)}%;--s:${(2 + r(3) * 4).toFixed(1)}px;animation-duration:${(5 + r(4) * 6).toFixed(1)}s;animation-delay:${(-r(5) * 10).toFixed(1)}s"></i>`; }).join('')}</div>`;
  // daun pisang dipisah dari bunga -> tiap daun bergoyang sendiri (poros di pangkal daun)
  // [nama, left%, top%, width%, originX%, originY%, amplitudo deg, durasi s]
  const LEAVES = [['g', 0, 62.66, 9.3, 26.9, 90.8, 3.2, 5.4], ['a', 0, 24.06, 11.5, 43.5, 100, 2.1, 6.6], ['b', 4.7, 47.03, 11.9, 63, 84, 3, 5.1], ['e', 22.9, 72.5, 19.8, 35.9, 41, 2.6, 4.7], ['d', 22.8, 54.06, 16.3, 20.9, 67.5, -2.8, 5.8], ['f', 15.5, 73.28, 14, 42.9, 58.2, 2.4, 4.4], ['c', 13.1, 42.97, 16.1, 30.4, 92.3, -2.2, 6.2]];
  const leafSplit = (u) => /\/assets\/scene\/floral-bottom-v2\.webp$/.test(u) ? u.replace('floral-bottom-v2', 'floral-bottom-nl') : /\/assets\/pal\/\w+\/jawa-bottom\.webp$/.test(u) ? u.replace('jawa-bottom.webp', 'jawa-bottom-nl.webp') : '';
  const leafHtml = () => `<div class="lfg" aria-hidden="true"><div class="lfm">${LEAVES.map(([n, l, t, w, ox, oy, a, d], i) => `<i class="lf" style="left:${l}%;top:${t}%;width:${w}%;transform-origin:${ox}% ${oy}%;--a:${a}deg;--d:${d}s;--dl:${(-i * 1.37).toFixed(2)}s"><img src="/assets/scene/leaf-${n}.webp" alt="" decoding="async"></i>`).join('')}</div></div>`;
  const fimg = (src) => { const u = safeUrl(src), nl = u && C && C.effects.sway !== false && !reduce ? leafSplit(u) : ''; return nl ? `${leafHtml()}<img class="fln" src="${esc(nl)}" alt="" decoding="async">` : img(src); };
  const halves = (src) => safeUrl(src) ? `<div class="half l">${fimg(src)}</div><div class="half r">${fimg(src)}</div>` : '';
  // ---------- nuansa Jawa: burung, kunang-kunang, sinar matahari, batik, gunungan ----------
  const JFX = () => THEME !== 'rose' && C && C.effects.javaFx !== false && !reduce && (!PT || ['klasik', 'emas', 'bali'].includes(PICT));
  const BIRD = '<svg viewBox="0 0 24 12"><path d="M0 4 Q6 0 12 6 Q18 0 24 4 Q18 2.6 12 8.4 Q6 2.6 0 4Z"/></svg>';
  const birds = () => `<div class="ly birds" aria-hidden="true">${[[14, 46, 0, 4], [22, 58, -21, 3], [9, 38, -37, 2]].map(([top, dur, dl, n], f) => `<div class="flock" style="top:${top}%;animation-duration:${dur}s;animation-delay:${dl}s">${Array.from({ length: n }, (_, i) => `<i class="bd" style="left:${i * 17 + (i % 2) * 6}px;top:${(i % 2) * 9 + i * 3}px;--fl:${(0.42 + ((i + f) % 3) * 0.07).toFixed(2)}s;--sz:${(f === 2 ? 13 : 17) - i}px">${BIRD}</i>`).join('')}</div>`).join('')}</div>`;
  const fireflies = (n) => `<div class="ffs" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const r = (k) => ((Math.sin((i + 3) * 7919 + k * 3571) + 1) / 2); return `<i class="ff v${i % 3}" style="left:${(r(1) * 92 + 4).toFixed(1)}%;bottom:${(6 + r(2) * 30).toFixed(1)}%;animation-duration:${(7 + r(3) * 7).toFixed(1)}s,${(1.6 + r(4) * 2.2).toFixed(1)}s;animation-delay:${(-r(5) * 12).toFixed(1)}s,${(-r(6) * 3).toFixed(1)}s"></i>`; }).join('')}</div>`;
  const GUN = '/assets/scene/gunungan.webp';
  function scene(c) {
    const s = c.scene;
    return `<div class="scene">
      <div class="cam">
        <div class="ly sky" style="background-image:${cssUrl(s.sky)}"></div>
        ${clouds()}
        ${JFX() ? birds() : ''}
        ${safeUrl(s.treeline) ? `<div class="ly trees">${img(s.treeline)}</div>` : ''}
        ${c.effects.showTree !== false && safeUrl(s.tree) ? `<div class="ly tree"><div class="tree-in">${img(s.tree)}<i class="lamp"></i></div></div>` : ''}
        <div class="ly hs"><div class="hs-in">${img(s.house)}${safeUrl(s.curtain) ? `<div class="curt l">${img(s.curtain)}</div><div class="curt r">${img(s.curtain)}</div>` : ''}<div class="glow"></div></div></div>
        ${JFX() ? `<div class="rays" aria-hidden="true"><i></i><i></i><i></i><i></i></div>${fireflies(14)}` : ''}
        <div class="haze"></div>
      </div>
      <div class="flash"></div>
      ${safeUrl(s.column) ? `<div class="ly cols"><div class="colc l">${img(s.column)}</div><div class="colc r">${img(s.column)}</div></div>` : ''}
      ${safeUrl(s.column) && THEME !== 'rose' ? '' : `<div class="ly ft sway-t">${halves(s.floralTop)}</div>`}
      <div class="ly fb sway-b">${halves(s.floralBottom)}</div>
      ${sparkles(16)}
      <div class="flyers"></div>
    </div>`;
  }

  // ================= Tema bergambar (3-8): cover = lukisan, "film" pembuka bertahap, efek hidup =================
  const BW = 784, BH = 1168;
  const px = (v) => +(v / BW * 100).toFixed(3); // koordinat dasar -> % lebar gambar
  const py = (v) => +(v / BH * 100).toFixed(3);
  const rectStyle = (r) => `left:${px(r[0])}%;top:${py(r[1])}%;width:${px(r[2])}%;height:${py(r[3])}%`;
  const sprite = (n) => PT.spr + n + '.webp';
  // partikel cahaya yang naik pelan (debu emas, bara, gelembung, serbuk sari) — membuat adegan terus hidup
  function motes(m) {
    let h = '<div class="pmo">';
    for (let i = 0; i < m.n; i++) {
      const r = (k) => ((Math.sin((i + 2) * 8123 + k * 4421) + 1) / 2), sz = (m.ember ? 2 : 2.5) + r(3) * (m.ember ? 3 : 4);
      h += `<i style="left:${(r(1) * 96 + 2).toFixed(1)}%;--s:${sz.toFixed(1)}px;--x:${((r(6) - 0.5) * 18).toFixed(1)}cqw;animation-duration:${(9 + r(4) * 9).toFixed(1)}s;animation-delay:${(-r(5) * 16).toFixed(1)}s;background:radial-gradient(circle,rgba(${m.c},1) 0,rgba(${m.c},.55) 40%,rgba(${m.c},0) 72%);box-shadow:0 0 ${(sz * 2).toFixed(0)}px ${(sz * 0.6).toFixed(0)}px rgba(${m.c},.45)"></i>`;
    }
    return h + '</div>';
  }
  function picLayers() {
    const t = PT; let h = '';
    t.glow.forEach(([x, y, r, col], i) => { h += `<i class="pglow${t.lamp && i === 0 ? ' lamp' : ''}" style="left:${px(x - r)}%;top:${py(y - r)}%;width:${px(r * 2)}%;background:radial-gradient(circle,${col},transparent 68%);animation-delay:${-i * 1.7}s"></i>`; });
    if (t.rays) h += `<div class="prays" style="left:${px(t.rays[0])}%;top:${py(t.rays[1])}%">${'<i></i>'.repeat(7)}</div>`;
    t.clouds.forEach((n, i) => { const y = t.cloudBand[0] + (t.cloudBand[1] - t.cloudBand[0]) * ((i * 0.53) % 1); const d = 70 + i * 23; h += `<img class="pcl" src="${sprite(n)}" alt="" style="top:${py(y)}%;width:${15 + (i % 2) * 6}%;animation-duration:${d}s;animation-delay:${-d * ((i * 0.41 + 0.2) % 1)}s">`; });
    t.wf.forEach(([x, y, w, hh]) => { h += `<div class="pwf" style="${rectStyle([x, y, w, hh])}"><i></i><i></i></div>`; });
    t.wf.forEach(([x, y, w, hh], i) => { for (let k = 0; k < 4; k++) h += `<i class="psp" style="left:${px(x + w / 2 + (k - 1.5) * w * 0.35)}%;top:${py(y + hh - 6)}%;width:${px(w * 1.1)}%;animation-delay:${-(k * 0.8 + i * 0.4).toFixed(1)}s"></i>`; });
    t.water.forEach((r, i) => { h += `<div class="pwt" style="${rectStyle(r)}"><i style="animation-delay:${-i * 3}s"></i></div>`; });
    t.mist.forEach(([x, y, w, hh, slow], i) => { h += `<img class="pms${slow ? ' slow' : ''}" src="/assets/t/fx/mist.webp" alt="" style="${rectStyle([x, y, w, hh])};animation-delay:${-i * 2.3}s">`; });
    if (t.sparkle) h += sparkles(t.sparkle);
    if (t.flies) { const [x0, y0, x1, y1] = t.flies; h += `<div class="pff" style="${rectStyle([x0, y0, x1 - x0, y1 - y0])}">${fireflies(16)}</div>`; }
    if (t.motes) h += motes(t.motes);
    h += '<div class="pbirds"></div>';
    h += '<i class="plsw"></i>';
    if (t.carriage) h += `<div class="pcar"><i class="pcglow"></i><img class="pcc b1" src="${sprite('cloudp2')}" alt=""><img class="pcc b2" src="${sprite('cloudp3')}" alt=""><div class="pcw"><img class="pcg" src="${sprite('carriage')}" alt=""></div><img class="pcc f1" src="${sprite('cloudp1')}" alt=""><img class="pcc f2" src="${sprite('cloudp3')}" alt=""><img class="pcc f3" src="${sprite('cloudp2')}" alt=""></div>`;

    return h;
  }
  const ctStyle = (r) => `left:${(r[0] / 1568 * 100).toFixed(3)}%;top:${(r[1] / 2336 * 100).toFixed(3)}%;width:${(r[2] / 1568 * 100).toFixed(3)}%`;
  function picHero(c) {
    const h = c.hero, t = PT, [bx, by, bx2, by2, br] = t.btn, [tx, ty, tx2, ty2] = t.title;
    return `<section class="sec hero pic pre" id="s-hero"><div class="pstage">
      <div class="pcam"><div class="pbox">
        ${t.live && liveW() ? liveW().world() : `<img class="pw" src="${t.world}" alt="" decoding="async">
        <canvas class="pgl" aria-hidden="true"></canvas>`}
        <div class="pfxl">${picLayers()}</div>
        <div class="pent"></div>
        ${t.live ? '' : `<img class="pcv pl" src="${t.spr.replace('spr/', t.key + '/ctitle.webp')}" alt="" decoding="async" style="${ctStyle(t.ct)}">
        <img class="pcv pl" src="${t.spr.replace('spr/', t.key + '/cbtn.webp')}" alt="" decoding="async" style="${ctStyle(t.cb)}">`}
        <div class="ptext" style="${rectStyle([tx, ty, tx2 - tx, ty2 - ty])};--tc:${t.text};--tg:${t.glowText}">
          <div class="pk">${esc(h.kicker)}</div><h1 class="pn"><span>${esc(h.groom)}</span><i>&amp;</i><span>${esc(h.bride)}</span></h1></div>
        <div class="pplate" style="${rectStyle([bx, by, bx2 - bx, by2 - by])};--br:${px(br)}cqw"><b>${esc(h.dateText)}</b><span>${esc(h.hashtag)}</span></div>
      </div></div>
      <div class="pfx"></div><div class="pbars"><i></i><i></i></div>
      <button class="pskip" type="button" hidden>Lewati &rsaquo;</button>
      <div class="scroll-hint"></div></div></section>`;
  }
  // data untuk sampul bertema (sampul.js)
  const liveW = () => (PT && window.LIVEW && window.LIVEW[PICT]) || null;
  const spOn = () => !!(window.SAMPUL && PT && C && (C.effects.themedCover !== false || PT.live) && window.SAMPUL.keys.includes(PICT));
  function spH() {
    const n = String(C.cover.names || '').split('&').map((x) => x.trim()).filter(Boolean);
    return { key: PICT, PT, C, esc, reduce, D: sp, rbf, picFlyers, photo: safeUrl(C.cover.photo), guest: guest || C.cover.defaultGuest, mono: mono2(), names: n.length >= 2 ? `${esc(n[0])}<i>&amp;</i>${esc(n[1])}` : esc(C.cover.names) };
  }
  function picCover(c) {
    if (spOn()) return window.SAMPUL.cover(spH());
    const o = c.cover, t = PT, [bx, by, bx2, by2, br] = t.btn;
    return `<div class="cover pic" id="cover"><div class="pbox ui">
      <div class="pc-names" style="top:${py(t.namesY)}%;--tc:${t.text};--tg:${t.glowText}">${esc(o.names)}</div>
      <div class="pc-guest" style="top:${py(t.guestY)}%"><span>${esc(o.toLabel)}</span><b>${esc(guest || o.defaultGuest)}</b></div>
      <button class="pc-btn" id="openBtn" aria-label="${esc(o.button)}" style="${rectStyle([bx, by, bx2 - bx, by2 - by])};border-radius:${px(br)}cqw"></button>
    </div><div class="flyers"></div></div>`;
  }
  // kupu-kupu dari lembar aset: sayap kiri & kanan mengepak 3D
  function rbf(n, size) {
    const el = document.createElement('div'); el.className = 'rbf';
    el.style.width = size + 'px'; el.style.height = size + 'px';
    const u = sprite(n), d = (0.16 + Math.random() * 0.1).toFixed(2);
    el.innerHTML = `<div class="rb-in"><i class="l" style="background-image:url(${u});animation-duration:${d}s"></i><i class="r" style="background-image:url(${u});animation-duration:${d}s"></i></div>`;
    return el;
  }
  function picFlyers(box, n, from) {
    if (!box || !C.effects.butterflies || reduce || !PT.bf.length) return;
    const W0 = box.clientWidth || 400, H0 = box.clientHeight || 700;
    for (let i = 0; i < n; i++) {
      const s = 30 + Math.random() * 26, el = rbf(PT.bf[i % PT.bf.length], s);
      box.appendChild(el);
      let x = from ? from[0] - s / 2 : (i % 2 ? W0 + 40 : -s - 40), y = from ? from[1] - s / 2 : H0 * (0.15 + Math.random() * 0.5);
      el.style.transform = `translate(${x}px,${y}px) scale(${from ? 0.2 : 1})`;
      let first = !!from, rot = 0;
      const go = () => {
        if (!el.isConnected) return;
        if (box.closest('.cin-off') || document.hidden) { setTimeout(go, 1500); return; } // hero tidak terlihat: kupu-kupu istirahat (hemat HP)
        const W = box.clientWidth || 400, H = box.clientHeight || 700;
        let nx, ny;
        if (first) { const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, r = Math.min(W, H) * (0.25 + Math.random() * 0.3); nx = x + Math.cos(a) * r; ny = y + Math.sin(a) * r * 0.8 - 40; }
        else { nx = x < W / 2 ? W * (0.5 + Math.random() * 0.42) - s : W * (0.04 + Math.random() * 0.42); ny = H * (0.08 + Math.random() * 0.62); }
        const ang0 = Math.atan2(ny - y, nx - x) * 180 / Math.PI + 90, dist = Math.hypot(nx - x, ny - y);
        const dA = ((ang0 - rot + 540) % 360) - 180, r0 = rot, r1 = rot + dA * 0.5, r2 = rot + dA; rot = r2;
        const dur = first ? 1800 + Math.random() * 600 : Math.max(2600, dist * (15 + Math.random() * 10));
        const mx = (x + nx) / 2 + (Math.random() - 0.5) * 110, my = (y + ny) / 2 + (Math.random() - 0.5) * 120;
        el.animate([
          { transform: `translate(${x}px,${y}px) rotate(${r0}deg) scale(${first ? 0.2 : 1})`, opacity: first ? 0 : 1 },
          { transform: `translate(${mx}px,${my}px) rotate(${r1}deg) scale(1)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${nx}px,${ny}px) rotate(${r2}deg) scale(1)`, opacity: 1 },
        ], { duration: dur, easing: 'cubic-bezier(.4,.1,.6,.9)', fill: 'forwards' }).onfinish = () => setTimeout(go, 60 + Math.random() * 260);
        x = nx; y = ny; first = false;
      };
      setTimeout(go, from ? i * 90 : 800 + i * 500);
    }
  }
  // burung terbang melintasi langit lukisan
  const SVGBIRD = '<svg viewBox="0 0 24 12"><path d="M0 4 Q6 0 12 6 Q18 0 24 4 Q18 2.6 12 8.4 Q6 2.6 0 4Z"/></svg>';
  function picBirds(stage) {
    const box = $('.pbirds', stage); if (!box || !PT.birds || reduce || C.effects.birds === false) return;
    const [y0, y1] = PT.cloudBand[1] ? PT.cloudBand : [380, 470];
    const n = PT.birds === 'svg' ? 5 : 3, dir = Math.random() < 0.5 ? 1 : -1, y = y0 + Math.random() * (y1 - y0);
    const flip = PT.birds === 'svg' ? 1 : -1; // sprite burung menghadap kiri, jadi dibalik saat terbang ke kanan
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i'); el.className = 'pbd' + (PT.birds === 'svg' ? ' svg' : '');
      el.innerHTML = PT.birds === 'svg' ? SVGBIRD : `<img src="${sprite(PT.birds)}" alt="">`;
      el.style.width = (PT.birds === 'svg' ? 2.6 : 5.2) - i * 0.5 + '%';
      box.appendChild(el);
      const sx = dir > 0 ? -12 : 108, ex = dir > 0 ? 112 : -14, yy = px(y) + i * 2.2 - (i % 2) * 3;
      const a = el.animate([
        { transform: `translate(${sx - i * 4}cqw,${yy}cqw) scaleX(${dir * flip})` },
        { transform: `translate(${(sx + ex) / 2}cqw,${yy - 4}cqw) scaleX(${dir * flip})`, offset: 0.5 },
        { transform: `translate(${ex - i * 4}cqw,${yy - 1}cqw) scaleX(${dir * flip})` },
      ], { duration: 9000 + i * 400, delay: i * 260, easing: 'linear', fill: 'both' });
      a.onfinish = () => el.remove();
    }
  }
  // kereta kencana dibawa awan: melayang di langit, turun mengikuti jalan emas, lalu masuk gerbang kastil
  function picCarriage(stage) {
    const el = $('.pcar', stage); if (!el || reduce) return;
    const par = el.parentElement, dur = 10800 * sp;
    // titik kendali [x, y, skala, miring] dalam koordinat gambar dasar; dihaluskan dengan kurva Catmull-Rom
    const K = [[-120, 392, 1.0, 5], [-120, 392, 1.0, 5], [90, 322, 1.0, 3], [250, 300, .97, 0], [390, 352, .9, -2], [462, 452, .72, -3], [486, 536, .52, 0], [490, 586, .36, 0], [490, 590, .3, 0], [490, 590, .3, 0]];
    const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
    const pos = (u) => {
      const n = K.length - 3, f = Math.min(Math.max(u, 0), 0.9999) * n, i = Math.floor(f), t = f - i, o = [];
      for (let k = 0; k < 4; k++) o.push(0); const r = [0, 0, 0, 0];
      for (let k = 0; k < 4; k++) r[k] = cr(K[i][k], K[i + 1][k], K[i + 2][k], K[i + 3][k], t);
      const bob = Math.sin(u * 38) * 3.2 * (1 - u * 0.6);
      return { x: r[0], y: r[1] + bob, s: r[2], r: r[3] + Math.sin(u * 30 + 1) * 1.2 };
    };
    const ez = (u) => u * u * (3 - 2 * u) * 0.35 + u * 0.65; // gerak mengalir, pelan di awal & akhir
    const N = 150, kf = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = pos(ez(u)), a = Math.min(1, u / 0.07) * Math.min(1, (1 - u) / 0.1);
      kf.push({ transform: `translate3d(${px(p.x)}cqw,${px(p.y)}cqw,0) translate(-50%,-72%) rotate(${p.r.toFixed(2)}deg) scale(${p.s.toFixed(3)})`, opacity: +a.toFixed(3), offset: u });
    }
    const t0 = performance.now(); let lastSp = 0;
    el.animate(kf, { duration: dur, easing: 'linear', fill: 'both' });
    const trail = () => {
      const u = (performance.now() - t0) / dur; if (u >= 1 || !el.isConnected) return;
      if (u > 0.05 && u < 0.93 && performance.now() - lastSp > 85) {
        lastSp = performance.now();
        const p = pos(ez(u)), i = document.createElement('i'); i.className = 'pcs' + (Math.random() < 0.4 ? ' g' : '');
        const sz = 0.9 + Math.random() * 1.6;
        i.style.cssText = `left:${px(p.x - 58 * p.s + (Math.random() - 0.5) * 50)}%;top:${py(p.y + 10 + (Math.random() - 0.5) * 36)}%;width:${sz}cqw;--dx:${(-6 - Math.random() * 10).toFixed(1)}cqw;--dy:${(2 + Math.random() * 6).toFixed(1)}cqw`;
        par.appendChild(i); i.addEventListener('animationend', () => i.remove());
      }
      requestAnimationFrame(trail);
    };
    requestAnimationFrame(trail);
    setTimeout(() => { // cahaya menyambut di gerbang kastil
      if (!par.isConnected) return;
      const g = document.createElement('i'); g.className = 'pcb'; g.style.cssText = `left:${px(490 - 120)}%;top:${py(588 - 120)}%;width:${px(240)}%`;
      par.appendChild(g); g.animate([{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)', offset: 0.35 }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 2400, easing: 'ease-out' }).onfinish = () => g.remove();
    }, dur * 0.9);
  }
  let picAmb = null;
  function picAmbient(stage) { // efek yang terus hidup: burung sesekali lewat
    clearInterval(picAmb); if (reduce || C.effects.birds === false) return;
    picAmb = setInterval(() => { if (document.hidden || scrollY > innerHeight) return; picBirds(stage); }, 16000);
  }

  // ---------- parallax 3D + air hidup: lukisan + peta kedalaman. Air/air terjun/kabut dianimasikan langsung di shader ----------
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;varying vec2 v;
    uniform sampler2D uW,uC,uD;
    uniform vec2 uF,uSw,uAsp;
    uniform float uS,uT,uMix,uNWt,uNWf,uWtI,uWfI,uHz,uA,uFog;
    uniform vec3 uFogC;
    uniform vec4 uWt[4],uWf[3],uTr,uHzR;
    uniform vec3 uTint;
    const float PK=.012;
    float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x),f.y);}
    vec3 S(vec2 u){
      vec3 W=texture2D(uW,u).rgb;
      if(uTr.x<.5){ if(uMix>.999) return W; return mix(texture2D(uC,u).rgb,W,uMix); }
      vec2 d=(u-uTr.zw)*uAsp; float r=length(d), R=uTr.y*2.1, rip=uTr.x<1.5?1.:0.;
      float fr=exp(-pow((r-R)/(.06+.03*rip),2.));
      vec2 uc=u+normalize(d+vec2(1e-4))*sin(r*90.-uTr.y*34.)*fr*(rip*.016+.003);
      float soft=.05+.06*rip;
      float k=1.-smoothstep(R-soft,R,r);
      vec3 o=mix(texture2D(uC,uc).rgb,W,k);
      float pulse=.35+.65*sin(3.14159*clamp(uTr.y,0.,1.));
      o+=fr*mix(vec3(.95,.97,1.),vec3(.35,.55,.8),rip)*pulse*(.55+.35*rip);
      return o;
    }
    void main(){
      vec2 uv=v;
      for(int i=0;i<2;i++){
        float k=(texture2D(uD,uv).r-.5)*2.;
        float sd=1.+(uS-1.)*(1.+uA*k);
        uv=uF+(v-uF)*uS/sd+((uF-.5)*PK+uSw)*k;
      }
      float wm=0.,fm=0.;
      for(int i=0;i<4;i++){
        if(float(i)>=uNWt) break;
        vec4 r=uWt[i]; vec2 c=r.xy+r.zw*.5;
        float m=1.-smoothstep(.45,1.,length((uv-c)/(r.zw*.5)));
        float a=sin(uv.y*260.+uT*1.7+vn(uv*50.+vec2(uT*.3,0.))*5.)*.0011;
        float b=sin(uv.x*190.-uT*1.3+vn(uv*30.-vec2(0.,uT*.22))*4.)*.0008;
        uv+=m*uWtI*vec2(a,b); wm=max(wm,m);
      }
      for(int i=0;i<3;i++){
        if(float(i)>=uNWf) break;
        vec4 r=uWf[i]; vec2 q=(uv-r.xy)/r.zw;
        float m=smoothstep(0.,.28,q.x)*smoothstep(1.,.72,q.x)*smoothstep(0.,.1,q.y)*smoothstep(1.,.8,q.y);
        fm=max(fm,m);
      }
      vec3 col;
      if(fm>.002){
        float ph=fract(uT*.42+vn(uv*7.)*.35);
        vec2 o=vec2(0.,.045);
        vec3 a=S(uv-o*ph), b=S(uv-o*fract(ph+.5));
        vec3 fl=mix(a,b,abs(2.*ph-1.));
        float n=vn(vec2(uv.x*320.,uv.y*20.-uT*3.4))*vn(vec2(uv.x*640.+7.,uv.y*55.-uT*5.6));
        float n2=vn(vec2(uv.x*150.+3.,uv.y*9.-uT*2.2));
        fl+=uTint*(n*.55+n2*.12)*uWfI;
        fl*=1.+(vn(vec2(uv.x*90.,uv.y*6.-uT*1.6))-.5)*.28*uWfI;
        col=mix(S(uv),fl,fm);
      } else col=S(uv);
      if(wm>.002){
        float g=vn(vec2(uv.x*300.,uv.y*620.)+vec2(uT*.6,-uT*.2));
        g=smoothstep(.8,1.,g)*wm*.8;
        float g2=vn(vec2(uv.x*210.-uT*.4,uv.y*500.));
        col+=uTint*(g*.5+smoothstep(.9,1.,g2)*wm*.25)*uWtI;
        col*=1.+(vn(vec2(uv.x*40.+uT*.1,uv.y*120.))-.5)*.14*wm*uWtI;
      }
      if(uHz>0.){ // kabut/awan tipis bergeser di langit
        vec4 hr=uHzR; float hy=smoothstep(hr.y,hr.y+.04,uv.y)*smoothstep(hr.y+hr.w,hr.y+hr.w-.12,uv.y);
        float c=vn(uv*vec2(3.2,5.)+vec2(uT*.012,0.))*.6+vn(uv*vec2(7.,11.)+vec2(uT*.02,3.))*.4;
        c=smoothstep(.42,.85,c);
        col=mix(col,mix(col,uTint,.55)+.06,c*hy*uHz);
      }
      if(uFog>-.5){ // kabut tersingkap dari jauh ke dekat mengikuti kedalaman (adegan muncul alami, tanpa potongan)
        float dist=1.-texture2D(uD,uv).r;
        float n=vn(uv*vec2(4.,6.)+vec2(uT*.06,uT*.02))*.6+vn(uv*vec2(10.,14.)-vec2(uT*.05,0.))*.4;
        float r=uFog+(n-.5)*.3;
        float vis=smoothstep(r-.34,r+.08,dist);
        vec3 fc=uFogC*(.9+.2*n);
        col=mix(fc,col,vis);
        col+=uFogC*.18*(1.-abs(vis*2.-1.)); // tepi kabut berkilau lembut
      }
      gl_FragColor=vec4(col,1.);
    }`;
  let glRaf = 0, glPtr = [0, 0], glTgt = [0, 0];
  const G = { mix: 1, trm: 0, trp: 0, trc: [0.5, 0.5], ok: false, A: 0.035, fog: -1, orb: [0, 0] }; window.__picG = G; // keadaan transisi cover -> dunia (dibaca tiap frame)
  function picGL(stage) {
    cancelAnimationFrame(glRaf); G.ok = false;
    const cv = stage && $('.pgl', stage); if (!cv || reduce || !PT || PT.live) return;
    const box = cv.parentElement, cam = $('.pcam', stage), hero = stage.closest('.hero');
    let gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false }); } catch (e) { /* */ }
    if (!gl) { cv.remove(); return; }
    const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS), pr = gl.createProgram();
    if (!vs || !fs) { cv.remove(); return; }
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const tex = (unit, im) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([a, b]) => gl.texParameteri(gl.TEXTURE_2D, a, b));
    };
    const load = (u) => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = u; });
    const key = PICT, coarse = matchMedia('(pointer:coarse)').matches;
    Promise.all([load(PT.world), load('/assets/t/' + key + '/depth.png')]).then(([w, d]) => {
      const cvr = w; // cover = dunia hidup; tekstur kedua hanya pengisi (tidak dipakai saat G.mix = 1)
      if (!cv.isConnected) return;
      const cw = Math.min(window.__PIC_GLW || (coarse ? Math.min(1024, Math.round(innerWidth * Math.min(devicePixelRatio || 1, 2.5))) : 1568), w.naturalWidth || 1568);
      cv.width = cw; cv.height = Math.round(cw * BH / BW); gl.viewport(0, 0, cv.width, cv.height);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      tex(0, w); tex(1, d); // tekstur sampul = tekstur dunia (unit 0): hemat memori GPU di HP
      gl.uniform1i(U('uW'), 0); gl.uniform1i(U('uD'), 1); gl.uniform1i(U('uC'), 0);
      const uF = U('uF'), uS = U('uS'), uSw = U('uSw'), uT = U('uT'), uMix = U('uMix'), uTr = U('uTr'), uA = U('uA'), uFog = U('uFog');
      { const t = PT.tint || [1, 1, 1]; gl.uniform3fv(U('uFogC'), PT.dark ? t.map((v) => v * 0.42) : t.map((v) => 0.55 + v * 0.42)); }
      const rects = (arr, n) => { const o = new Float32Array(n * 4); (arr || []).slice(0, n).forEach((r, i) => { o[i * 4] = r[0] / BW; o[i * 4 + 1] = r[1] / BH; o[i * 4 + 2] = r[2] / BW; o[i * 4 + 3] = r[3] / BH; }); return o; };
      gl.uniform4fv(U('uWt[0]'), rects(PT.water, 4)); gl.uniform1f(U('uNWt'), Math.min((PT.water || []).length, 4));
      gl.uniform4fv(U('uWf[0]'), rects(PT.wf, 3)); gl.uniform1f(U('uNWf'), Math.min((PT.wf || []).length, 3));
      gl.uniform1f(U('uWtI'), 1); gl.uniform1f(U('uWfI'), PT.dark ? 0.9 : 1);
      gl.uniform3fv(U('uTint'), PT.tint || [1, 1, 1]);
      gl.uniform2f(U('uAsp'), 1, BH / BW);
      const hz = PT.haze; gl.uniform1f(U('uHz'), hz ? (PT.dark ? 0.2 : 0.26) : 0);
      if (hz) gl.uniform4f(U('uHzR'), hz[0] / BW, hz[1] / BH, hz[2] / BW, hz[3] / BH);
      let vis = true, last = 0, shown = false, fr = 0, dtSum = 0, lastT = 0, lowQ = false; // kualitas turun otomatis bila HP lambat
      if ('IntersectionObserver' in window) { const io = new IntersectionObserver((e) => { vis = e[0].isIntersecting; }); io.observe(stage); observers.push(io); }
      const mv = (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; glTgt = [(e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2]; };
      addEventListener('pointermove', mv, { passive: true, signal: AC.signal });
      // sensor gerak HP sengaja tidak dipakai: membuat tampilan goyang & karakter terlihat penyok
      let gotOri = true, t0 = 0;
      const tick = (t) => {
        glRaf = requestAnimationFrame(tick);
        if (!cv.isConnected) { cancelAnimationFrame(glRaf); return; }
        if (!vis || document.hidden) return;
        const sc = document.getElementById('cover'); if (sc && sc.classList.contains('sp') && !sc.classList.contains('sp-gone')) return; // sampul menutupi layar: hemat GPU supaya animasi sampul mulus
        const film = hero.classList.contains('filming');
        if (!film && G.fog < -0.5 && t - last < 14) return;
        last = t;
        if (!t0) t0 = t;
        glPtr[0] += (glTgt[0] - glPtr[0]) * 0.045; glPtr[1] += (glTgt[1] - glPtr[1]) * 0.045;
        let s = 1, dx = 0, dy = 0;
        const tr = getComputedStyle(cam).transform;
        if (tr && tr !== 'none') { const m = new DOMMatrixReadOnly(tr); s = m.a || 1; dx = -m.e / s; dy = -m.f / s; }
        const sec = t / 1000;
        const am = coarse ? 0 : 1;
        const sx = Math.sin(sec * 0.32) * 0.004 + glPtr[0] * 0.006 * am, sy = Math.cos(sec * 0.24) * 0.0025 + glPtr[1] * 0.004 * am;
        gl.uniform2f(uF, 0.5 + dx / box.offsetWidth, 0.5 + dy / box.offsetHeight);
        gl.uniform1f(uS, s); gl.uniform2f(uSw, sx + G.orb[0], sy + G.orb[1]); gl.uniform1f(uA, G.A); gl.uniform1f(uFog, G.fog);
        if (!lowQ && fr++ > 8) { dtSum += t - lastT; if (fr === 70) { if (dtSum / 62 > 50 && cv.width > 800) { cv.width = Math.round(cv.width * 0.85); cv.height = Math.round(cv.width * BH / BW); gl.viewport(0, 0, cv.width, cv.height); } lowQ = true; } }
        lastT = t;
        gl.uniform1f(uT, (t - t0) / 1000); gl.uniform1f(uMix, G.mix);
        gl.uniform4f(uTr, G.trm, G.trp, G.trc[0], G.trc[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!shown) { shown = true; G.ok = true; cv.classList.add('on'); box.classList.add('gl-on'); }
      };
      glRaf = requestAnimationFrame(tick);
    }).catch((e) => { console.warn(e); cv.remove(); });
  }

  // kamera: titik (x,y) gambar ke tengah layar dengan perbesaran s (tidak keluar tepi gambar)
  function camT(stage, x, y, s) {
    const box = $('.pbox', stage), vw = stage.clientWidth, vh = stage.clientHeight, bw = box.offsetWidth, bh = box.offsetHeight;
    let dx = x / BW * bw - bw / 2, dy = y / BH * bh - bh / 2;
    const mx = Math.max(0, bw / 2 - vw / (2 * s)), my = Math.max(0, bh / 2 - vh / (2 * s));
    dx = Math.max(-mx, Math.min(mx, dx)); dy = Math.max(-my, Math.min(my, dy));
    return `translate(${(-s * dx).toFixed(1)}px,${(-s * dy).toFixed(1)}px) scale(${s})`;
  }
  function picShow(hero) { hero.classList.remove('pre'); hero.classList.add('play', 'shown', 'done'); }
  // ================= koreografi masuk: tiap tema punya cara sendiri =================
  // princess = amplop dibuka & kita masuk ke dalamnya | bali = gerbang candi terbuka | emas = ledakan cahaya matahari
  // biru = menyelam ke air lalu muncul di kaki air terjun | rimba = kupu-kupu cahaya memandu kamera | klasik = gunungan + lampu blencong
  function entryCtx(stage, D) {
    const X = { stage, D, dead: false, els: [], anims: [], raf: 0 };
    X.later = (fn, ms) => later(() => { if (!X.dead) fn(); }, ms);
    X.mk = (cls, html, parent) => { const e = document.createElement('div'); e.className = cls; if (html) e.innerHTML = html; (parent || stage).appendChild(e); X.els.push(e); return e; };
    X.an = (el, kf, o) => { const a = el.animate(kf, Object.assign({ fill: 'both' }, o)); X.anims.push(a); return a; };
    X.ent = () => $('.pent', stage);
    X.end = () => { X.dead = true; cancelAnimationFrame(X.raf); X.anims.forEach((a) => { try { a.cancel(); } catch (e) { /* */ } }); X.els.forEach((e) => e.remove()); };
    // bunga/daun berjatuhan melewati kamera
    X.fall = (list, n, o = {}) => {
      const box = $('.pfx', stage); if (!box || reduce || !list.length) return;
      const W = box.clientWidth || 400, H = box.clientHeight || 700;
      for (let i = 0; i < n; i++) {
        const im = document.createElement('img'); im.src = sprite(list[i % list.length]); im.alt = ''; im.className = 'pfall';
        im.style.width = (o.size || 26) * (0.6 + Math.random() * 0.9) + 'px'; box.appendChild(im);
        const x = Math.random() * W, dx = (Math.random() - 0.5) * 170, r0 = Math.random() * 360, rd = (Math.random() < 0.5 ? -1 : 1) * (240 + Math.random() * 360);
        im.animate([
          { transform: `translate(${x}px,-60px) rotate(${r0}deg) rotateX(0deg)`, opacity: 0 },
          { opacity: 1, offset: 0.1 },
          { transform: `translate(${x + dx * 0.5}px,${H * 0.5}px) rotate(${r0 + rd * 0.5}deg) rotateX(150deg)`, offset: 0.5 },
          { transform: `translate(${x + dx}px,${H + 60}px) rotate(${r0 + rd}deg) rotateX(40deg)`, opacity: 0.9 },
        ], { duration: (o.dur || 6500) * (0.8 + Math.random() * 0.6), delay: (o.delay || 0) + Math.random() * (o.spread || 1500), easing: 'linear', fill: 'both' }).onfinish = () => im.remove();
      }
    };
    // titik di lukisan (koordinat dasar) -> persen di dalam kotak lukisan
    X.at = (x, y) => `left:${px(x)}%;top:${py(y)}%`;
    return X;
  }
  const ENTRY = {};
  const mono2 = () => { const n = String(C.cover.names || '').split('&').map((s) => s.trim()).filter(Boolean); return n.length >= 2 ? `${esc(n[0][0])}<i>&amp;</i>${esc(n[1][0])}` : esc((n[0] || '♥')[0]); };

  // ---- PRINCESS: amplop muncul, segel pecah, tutup terbuka, kartu keluar, kita masuk ke dalam kartu ----
  ENTRY.env = (X) => {
    const { stage, D } = X, W = stage.clientWidth, H = stage.clientHeight;
    const ew = Math.round(Math.min(330, W * 0.8, H * 0.43)), eh = ew * 0.69, cw = ew * 0.84, ch = cw * 1168 / 784;
    const root = X.mk('ent ent-env'); root.style.setProperty('--ew', ew + 'px'); root.style.setProperty('--cw', cw + 'px');
    const grad = (id, a, b, v) => `<linearGradient id="${id}" ${v || 'x1="0" y1="0" x2="0" y2="1"'}><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    const GOLD = '#dfae55';
    root.innerHTML = `<div class="ee-veil"></div>${sparkles(16)}
      <div class="ee-env"><div class="ee-fl">
        <div class="ee-back"><svg viewBox="0 0 300 207" preserveAspectRatio="none"><defs>${grad('eeb', '#e27c9b', '#f1a0bd')}</defs><rect width="300" height="207" rx="7" fill="url(#eeb)"/></svg></div>
        <div class="ee-glow"></div>
        <div class="ee-clip"><div class="ee-card"><div class="ee-cf" style="background-image:url(${PT.world})"></div></div></div>
        <div class="ee-front"><svg viewBox="0 0 300 207" preserveAspectRatio="none"><defs>${grad('eel', '#f8bad2', '#ee94b6', 'x1="0" y1="0" x2="1" y2="1"')}${grad('eer', '#f8bad2', '#ee94b6', 'x1="1" y1="0" x2="0" y2="1"')}${grad('eeu', '#fcd3e3', '#f4a6c5', 'x1="0" y1="1" x2="0" y2="0"')}</defs>
          <polygon points="0,0 152,113 0,207" fill="url(#eel)"/><polygon points="300,0 148,113 300,207" fill="url(#eer)"/><polygon points="0,207 150,96 300,207" fill="url(#eeu)"/>
          <g fill="none" stroke="${GOLD}" stroke-width="1.1" stroke-linejoin="round" opacity=".9"><polyline points="0,207 150,96 300,207"/><polyline points="0,0 152,113 0,207"/><polyline points="300,0 148,113 300,207"/><rect x=".6" y=".6" width="298.8" height="205.8" rx="6.5"/></g></svg>
          <div class="ee-to"><span>Kepada Yth.</span><b>${esc(guest || C.cover.defaultGuest)}</b></div>
          <img class="ee-rose a" src="${sprite('rose1')}" alt=""><img class="ee-rose b" src="${sprite('rose2')}" alt=""></div>
        <div class="ee-flap"><div class="f o"><svg viewBox="0 0 300 128" preserveAspectRatio="none"><defs>${grad('eef', '#fcd0e1', '#f2a0c0')}</defs><polygon points="0,0 300,0 150,128" fill="url(#eef)" stroke="${GOLD}" stroke-width="1.2" stroke-linejoin="round"/><polyline points="16,0 150,112 284,0" fill="none" stroke="${GOLD}" stroke-width=".8" opacity=".6"/></svg></div>
          <div class="f i"><svg viewBox="0 0 300 128" preserveAspectRatio="none"><defs>${grad('eeg', '#fdeaf1', '#f6bdd2')}</defs><polygon points="0,0 300,0 150,128" fill="url(#eeg)" stroke="${GOLD}" stroke-width="1.2" stroke-linejoin="round"/></svg></div></div>
        <div class="ee-seal"><b>${mono2()}</b></div>
      </div></div><div class="ee-flash"></div>`;
    const env = $('.ee-env', root), card = $('.ee-card', root), flap = $('.ee-flap', root), seal = $('.ee-seal', root), glow = $('.ee-glow', root), flash = $('.ee-flash', root), veil = $('.ee-veil', root);
    const sk = $('.sparkles', root); if (sk) sk.style.opacity = '0';
    X.an(veil, [{ opacity: 0 }, { opacity: 1 }], { duration: 700 * D, easing: 'ease-out' });
    if (sk) X.an(sk, [{ opacity: 0 }, { opacity: 1 }], { duration: 900 * D, delay: 300 * D });
    // 1. amplop meluncur naik dari bawah
    X.an(env, [{ transform: `translateY(${H * 0.55}px) rotate(-9deg) scale(.82)`, opacity: 0 }, { transform: 'translateY(0) rotate(1.5deg) scale(1.02)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 1250 * D, delay: 250 * D, easing: 'cubic-bezier(.2,.8,.3,1)' });
    // 2. segel berdenyut lalu pecah
    X.an(seal, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0 }, { transform: 'translate(-50%,-50%) scale(1.07)', offset: 0.35 }, { transform: 'translate(-50%,-50%) scale(1)', offset: 0.6 }, { transform: 'translate(-50%,-50%) scale(1.4) rotate(14deg)', opacity: 0, offset: 1 }], { duration: 1050 * D, delay: 1550 * D, easing: 'ease-in-out' });
    // 3. tutup amplop terbuka (flap berputar ke belakang, z-index berpindah di tengah)
    X.an(flap, [{ transform: 'perspective(900px) rotateX(0deg)' }, { transform: 'perspective(900px) rotateX(-180deg)' }], { duration: 1000 * D, delay: 2450 * D, easing: 'cubic-bezier(.5,0,.25,1)' });
    X.later(() => { flap.style.zIndex = '1'; }, 2950 * D);
    X.an(glow, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 900 * D, delay: 2800 * D, easing: 'ease-out' });
    // 4. kartu (lukisan taman) keluar dari amplop, amplop turun
    const rise = ch * 0.98 + eh * 0.1, drop = Math.min(H * 0.2, ew * 0.7);
    X.an(card, [{ transform: 'translateY(0)' }, { transform: `translateY(${-rise}px)` }], { duration: 1500 * D, delay: 3500 * D, easing: 'cubic-bezier(.35,.05,.2,1)' });
    X.an(env, [{ transform: 'none' }, { transform: `translateY(${drop}px)` }], { duration: 1500 * D, delay: 3500 * D, easing: 'cubic-bezier(.35,.05,.2,1)', fill: 'forwards' });
    // kupu-kupu & kilau beterbangan dari amplop
    X.later(() => { const r = stage.getBoundingClientRect(); picFlyers($('.pfx', stage), 5, [r.width / 2, r.height * 0.5]); }, 3300 * D);
    // 5. masuk ke dalam kartu: kartu membesar sampai persis menjadi lukisan hero
    X.later(() => {
      const pr = $('.pbox', stage).getBoundingClientRect(), sr = stage.getBoundingClientRect(), cr = $('.ee-cf', root).getBoundingClientRect();
      const big = X.mk('ee-big', '<i class="ee-edge"></i>', root);
      big.style.cssText = `left:${pr.left - sr.left}px;top:${pr.top - sr.top}px;width:${pr.width}px;height:${pr.height}px;background-image:url(${PT.world})`;
      const s0 = cr.width / pr.width, tx = (cr.left + cr.width / 2) - (pr.left + pr.width / 2), ty = (cr.top + cr.height / 2) - (pr.top + pr.height / 2);
      card.style.visibility = 'hidden';
      X.an(big, [{ transform: `translate(${tx}px,${ty}px) scale(${s0})` }, { transform: 'none' }], { duration: 1500 * D, easing: 'cubic-bezier(.55,.02,.25,1)' });
      X.an($('.ee-edge', big), [{ opacity: 1 }, { opacity: 0 }], { duration: 1200 * D });
      X.an(env, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 * D, easing: 'ease-in', fill: 'forwards' });
      X.an(flash, [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 0.85, offset: 0.9 }, { opacity: 0 }], { duration: 1500 * D });
      if (sk) X.an(sk, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 * D });
    }, 5000 * D);
    X.later(() => { root.remove(); X.fall(['rose1', 'rose2'], 14, { size: 22, dur: 7000, spread: 3500 }); }, 6520 * D);
    return { camDelay: 6450 * D, titleFade: 1 };
  };

  // ---- BALI: gerbang candi (dua daun pintu) terbuka, cahaya pagi masuk, kita berjalan ke dalam ----
  ENTRY.doors = (X) => {
    const { stage, D } = X;
    const pic = `<div class="ed-pic" style="background-image:url(${PT.cover})"></div><i class="ed-sh"></i>`;
    const root = X.mk('ent ent-doors', `<div class="ed-light"></div><div class="ed-d l">${pic}</div><div class="ed-d r">${pic}</div>`);
    const [l, r] = $$('.ed-d', root), light = $('.ed-light', root);
    const o = { duration: 2500 * D, delay: 450 * D, easing: 'cubic-bezier(.62,0,.22,1)' };
    X.an(l, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-84deg)' }], o);
    X.an(r, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(84deg)' }], o);
    $$('.ed-sh', root).forEach((e) => X.an(e, [{ opacity: 0 }, { opacity: 0.85 }], o));
    X.an(light, [{ opacity: 0, transform: 'scaleX(.15)' }, { opacity: 1, transform: 'scaleX(1)', offset: 0.5 }, { opacity: 0.0, transform: 'scaleX(1.8)' }], { duration: 3300 * D, delay: 450 * D, easing: 'ease-in-out' });
    X.later(() => root.remove(), 3100 * D);
    X.later(() => X.fall(['frangi1', 'frangi2', 'leafm'], 16, { size: 24, dur: 6500, spread: 2600 }), 1500 * D);
    return {};
  };

  // ---- EMAS: kamera menuju matahari senja, cahaya emas meledak, lalu terlihat adegan dari dekat ----
  ENTRY.sun = (X) => {
    const { stage, D } = X, ent = X.ent(), [sx, sy] = PT.focus;
    const flare = X.mk('psun', '<i class="c"></i><i class="h"></i><i class="v"></i>', ent); flare.style.cssText = X.at(sx, sy);
    X.an(flare, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.4)', offset: 0.6 }, { opacity: 0.0, transform: 'translate(-50%,-50%) scale(3.2)' }], { duration: 3000 * D, delay: 150 * D, easing: 'ease-in-out' });
    const wash = X.mk('ent ent-wash');
    X.an(wash, [{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 1 }], { duration: 2900 * D, delay: 600 * D, easing: 'ease-in-out' });
    X.later(() => { wash.remove(); flare.remove(); }, 3700 * D);
    $$('.prays i', stage).forEach((e) => X.an(e, [{ opacity: 0.4 }, { opacity: 1 }, { opacity: 0.5 }], { duration: 3000 * D, delay: 200 * D, composite: 'replace' }));
    X.later(() => X.fall(['frangi1', 'leafm'], 8, { size: 22, dur: 6500, spread: 2600 }), 2600 * D);
    return {};
  };

  // ---- BIRU: riak air menyebar dari tombol, kita menyelam ke bawah permukaan, lalu naik ke kaki air terjun ----
  ENTRY.dive = (X) => {
    const { stage, D } = X, ent = X.ent(), [bx, by] = PT.focus;
    for (let i = 0; i < 4; i++) {
      const rg = X.mk('prg', '', ent); rg.style.cssText = X.at(bx, by);
      X.an(rg, [{ opacity: 0.9, transform: 'translate(-50%,-50%) scale(.05)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 1900 * D, delay: (80 + i * 260) * D, easing: 'cubic-bezier(.15,.6,.3,1)' });
    }
    const root = X.mk('ent ent-dive', `<div class="ev-tint"></div><div class="ev-caus"></div><div class="ev-bub">${Array.from({ length: 22 }, (_, i) => { const r = (k) => ((Math.sin((i + 1) * 5231 + k * 977) + 1) / 2); return `<i style="left:${(r(1) * 96 + 2).toFixed(1)}%;--s:${(4 + r(2) * 14).toFixed(1)}px;--dx:${((r(3) - 0.5) * 60).toFixed(0)}px;animation-duration:${(2.4 + r(4) * 2).toFixed(2)}s;animation-delay:${(0.5 + r(5) * 2.2).toFixed(2)}s"></i>`; }).join('')}</div><div class="ev-surf"></div>`);
    X.an($('.ev-tint', root), [{ opacity: 0 }, { opacity: 0.92, offset: 0.4 }, { opacity: 0.92, offset: 0.55 }, { opacity: 0 }], { duration: 3600 * D, delay: 500 * D, easing: 'ease-in-out' });
    X.an($('.ev-caus', root), [{ opacity: 0 }, { opacity: 0.8, offset: 0.4 }, { opacity: 0.8, offset: 0.55 }, { opacity: 0 }], { duration: 3600 * D, delay: 500 * D, easing: 'ease-in-out' });
    X.an($('.ev-surf', root), [{ opacity: 0, transform: 'translateY(30%)' }, { opacity: 1, transform: 'translateY(0)', offset: 0.35 }, { opacity: 0, transform: 'translateY(-70%)' }], { duration: 1500 * D, delay: 2300 * D, easing: 'ease-in-out' });
    X.later(() => root.remove(), 4300 * D);
    X.later(() => { const r = stage.getBoundingClientRect(); picFlyers($('.pfx', stage), 4, [r.width * 0.5, r.height * 0.75]); }, 2700 * D);
    return {};
  };

  // ---- RIMBA: kupu-kupu cahaya di tangan sang putri terbang memandu kamera menuju istana bulan ----
  ENTRY.guide = (X) => {
    const { stage, D } = X, ent = X.ent(), [hx, hy] = PT.focus;
    const bloom = X.mk('pbloom', '', ent); bloom.style.cssText = X.at(hx, hy);
    X.an(bloom, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.1)', offset: 0.35 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(2.6)' }], { duration: 2200 * D, delay: 100 * D, easing: 'ease-out' });
    // jalur kupu-kupu = titik-titik tujuan kamera
    let t = 0; const pts = [[0, hx, hy]];
    PT.shots.forEach((sh) => { if (sh[0] === 'end') return; t += sh[3] * D; pts.push([t + sh[4] * D * 0.5 + 250 * D, sh[0] + 22, sh[1] - 26]); t += sh[4] * D; });
    const bf = rbf(PT.bf[0], 64); bf.classList.add('pguide'); ent.appendChild(bf); X.els.push(bf);
    const cp = (a, b, c, d, u) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    const at = (ms) => { let i = 0; while (i < pts.length - 2 && ms > pts[i + 1][0]) i++; const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[Math.min(i + 1, pts.length - 1)], p3 = pts[Math.min(i + 2, pts.length - 1)]; const u = Math.max(0, Math.min(1, (ms - p1[0]) / Math.max(1, p2[0] - p1[0]))); return [cp(p0[1], p1[1], p2[1], p3[1], u), cp(p0[2], p1[2], p2[2], p3[2], u)]; };
    const startAt = 350 * D, endAt = pts[pts.length - 1][0] + 900 * D; let last = 0;
    const t0 = performance.now();
    const tick = (now) => {
      if (X.dead) return; const ms = now - t0; X.raf = requestAnimationFrame(tick);
      if (ms < startAt) { bf.style.opacity = '0'; return; }
      const [x, y] = at(ms - startAt), k = Math.min(1, (ms - startAt) / 500), fade = Math.max(0, Math.min(1, (endAt - ms) / 700));
      const w = ent.clientWidth || 400, sz = w * 0.085;
      bf.style.width = bf.style.height = sz + 'px'; bf.style.opacity = String(fade);
      bf.style.transform = `translate(${x / BW * w - sz / 2}px,${y / BW * w - sz / 2}px) scale(${0.3 + 0.7 * k}) rotate(${Math.sin(ms / 420) * 16 + 24}deg)`;
      if (ms - last > 55 && fade > 0.05) { last = ms; const d = document.createElement('i'); d.className = 'ptr'; d.style.cssText = `left:${px(x)}%;top:${(y / BH * 100).toFixed(2)}%;--s:${(3 + Math.random() * 5).toFixed(1)}px`; ent.appendChild(d); X.els.push(d); setTimeout(() => d.remove(), 1700); }
      if (ms > endAt) { bf.remove(); return; }
    };
    X.raf = requestAnimationFrame(tick);
    X.later(() => bloom.remove(), 2500 * D);
    return {};
  };

  // ---- KLASIK: gunungan wayang dikibaskan, lampu blencong menyala terang, kamera masuk ke pendapa joglo ----
  ENTRY.kelir = (X, fromCover) => {
    const { stage, D } = X, ent = X.ent(), [lx, ly] = PT.focus;
    if (JFX() && !fromCover) gunOpen(D * 0.8);
    const lamp = X.mk('plamp', '<i></i>', ent); lamp.style.cssText = X.at(lx, ly);
    X.an(lamp, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 0, offset: 0.25, transform: 'translate(-50%,-50%) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.5)', offset: 0.7 }, { opacity: 0.0, transform: 'translate(-50%,-50%) scale(2.6)' }], { duration: 3400 * D, delay: 200 * D, easing: 'ease-in-out' });
    X.later(() => lamp.remove(), 3800 * D);
    const root = X.mk('ent ent-kelir');
    X.an(root, [{ opacity: 0 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: 3000 * D, delay: 300 * D });
    X.later(() => root.remove(), 3500 * D);
    X.later(() => X.fall(['leafm', 'frangi1'], 8, { size: 22, dur: 7000, spread: 3000 }), 2400 * D);
    return {};
  };

  const cinOn = () => !!(window.CINEMA && PT && window.CINEMA.has(PICT));
  const cinData = () => ({ kicker: C.hero.kicker, groom: C.hero.groom, bride: C.hero.bride, date: C.hero.dateText, hashtag: C.hero.hashtag, guest, toLabel: C.cover.toLabel });
  function picOpen(instant, cover, hero, unlock, finish) {
    const stage = $('.pstage', hero), cam = $('.pcam', stage), CIN = cinOn();
    const done = () => {
      picShow(hero); unlock(); finish(); picAmbient(stage);
      picFlyers($('.pfx', stage), Math.min(Math.max(+C.effects.butterflyCount || 0, 0), cinOn() ? 2 : 8));
    };
    if (instant) { if (cover) { cover.classList.add('gone'); later(() => cover.remove(), 700); } hero.classList.add('instant'); if (CIN) window.CINEMA.final(stage, { key: PICT, data: cinData() }); done(); return; }
    const D = sp, SPL = spOn() && cover && cover.classList.contains('sp');
    if (!SPL) cover.classList.add('opening');
    hero.classList.add('filming');
    const skip = $('.pskip', stage); skip.hidden = false;
    const X = entryCtx(stage, D);
    let E;
    if (SPL) { // sampul bertema membuka dirinya sendiri, lalu (bila ada) lanjut efek masuk di dalam dunia
      E = window.SAMPUL.open(cover, X, spH()) || {};
      if (E.after && ENTRY[E.after]) later(() => { if (!X.dead) ENTRY[E.after](X, true); }, E.camDelay || 0);
    } else E = (ENTRY[PT.entry] && ENTRY[PT.entry](X)) || {};
    const cd = E.camDelay || 0;
    // susun keyframe kamera dari daftar shot
    const kf = [{ transform: 'translate(0px,0px) scale(1)', offset: 0 }], marks = [];
    let t = 0;
    const shots = PT.shots.map((sh) => sh[0] === 'end' ? { end: 1, tr: sh[1] * D, hold: 0, ev: sh[3] } : { x: sh[0], y: sh[1], s: sh[2], tr: sh[3] * D, hold: sh[4] * D, ev: sh[5] });
    shots.forEach((sh) => { marks.push([t, sh.ev]); t += sh.tr + sh.hold; });
    const total = t; t = 0;
    if (PT.cx) marks.push([marks[marks.length - 1][0] + 200 * D, 'cx']); // momen puncak khas tema, tepat sebelum nama muncul
    shots.forEach((sh) => {
      t += sh.tr;
      if (sh.end) { kf.push({ transform: 'translate(0px,0px) scale(1)', offset: 1 }); return; }
      kf[kf.length - 1].easing = 'cubic-bezier(.45,.05,.3,1)';
      kf.push({ transform: camT(stage, sh.x, sh.y, sh.s), offset: t / total, easing: 'linear' });
      t += sh.hold;
      if (sh.hold) kf.push({ transform: camT(stage, sh.x, sh.y, sh.s * 1.035), offset: t / total });
    });
    const anim = CIN ? null : cam.animate(kf, { duration: total, delay: cd, fill: 'both' });
    $$('.pcv', stage).forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: (E.titleFade ? 300 : 1100) * D, delay: (E.titleFade ? 100 : 250) * D, easing: 'ease-in-out', fill: 'forwards' }));
    if (!SPL) later(() => { if (cover.isConnected) cover.remove(); }, 900 * D);
    if (PT.carriage) later(() => picCarriage(stage), cd); // kereta kencana di atas awan + kabut (dikembalikan dari v40)
    if (!CIN) later(() => { if (!X.dead) picBirds(stage); }, cd);
    const T = (ms) => ms * D, pbox = $('.pbox', stage), mk = (cls, html, parent) => X.mk(cls, html, parent);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const put = (e, x, y) => { e.style.left = px(x) + '%'; e.style.top = py(y) + '%'; return e; };
    const spawn = (cls, html, x, y) => put(mk(cls, html, pbox), x, y);
    const imgP = (n) => `<img src="${sprite(n)}" alt="">`;
    const cqx = (v) => +(v / BW * 100).toFixed(2); // jarak koordinat dasar -> cqw (lebar pbox)
    const sparks = (n, x, y, spread, ms) => {
      for (let i = 0; i < n; i++) {
        const e = spawn('pe-sp', '', x, y), a = rnd(0, 6.283), d = spread * rnd(0.5, 1.1);
        e.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(1)}cqw),calc(-50% + ${(Math.sin(a) * d - 4).toFixed(1)}cqw)) scale(${rnd(0.6, 1.5).toFixed(2)})`, opacity: 0 }], { duration: T(rnd(900, ms || 1500)), delay: T(rnd(0, 300)), easing: 'ease-out', fill: 'both' });
      }
    };
    const pulse = (e, ms, peak, scale0, scale1) => e.animate([{ opacity: 0, transform: `translate(-50%,-50%) scale(${scale0})` }, { opacity: peak, transform: 'translate(-50%,-50%) scale(1)', offset: 0.42 }, { opacity: 0, transform: `translate(-50%,-50%) scale(${scale1})` }], { duration: T(ms), easing: 'ease-in-out', fill: 'both' });
    const CX = {
      // Princess: kastil menyala, kelopak mawar meledak ke atas lalu berguguran
      petals() {
        const [x, y] = PT.glow[0] ? [PT.glow[0][0], PT.glow[0][1]] : [520, 470];
        pulse(spawn('pcx-glow', '', x, y), 2400, 1, 0.3, 1.9);
        sparks(24, x, y, 30);
        for (let i = 0; i < 16; i++) {
          const p = spawn('pcx-p', imgP(i % 2 ? 'rose2' : 'rose1'), x, y), a = rnd(-2.6, -0.55), d = rnd(14, 34), dx = Math.cos(a) * d, dy = Math.sin(a) * d;
          // naik cepat (ease-out), lalu melayang turun pelan sambil berputar
          p.animate([
            { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 0, easing: 'cubic-bezier(.15,.8,.3,1)' },
            { transform: `translate(calc(-50% + ${dx.toFixed(1)}cqw),calc(-50% + ${dy.toFixed(1)}cqw)) scale(1) rotate(${rnd(-90, 90).toFixed(0)}deg)`, opacity: 1, offset: 0.28, easing: 'cubic-bezier(.35,.1,.65,.9)' },
            { transform: `translate(calc(-50% + ${(dx * 1.3).toFixed(1)}cqw),calc(-50% + ${(dy + rnd(20, 38)).toFixed(1)}cqw)) scale(.9) rotate(${rnd(120, 300).toFixed(0)}deg)`, opacity: 0.85, offset: 0.8 },
            { transform: `translate(calc(-50% + ${(dx * 1.4).toFixed(1)}cqw),calc(-50% + ${(dy + rnd(26, 42)).toFixed(1)}cqw)) scale(.85) rotate(${rnd(300, 400).toFixed(0)}deg)`, opacity: 0 }], { duration: T(rnd(2300, 3000)), delay: T(rnd(0, 400)), easing: 'linear', fill: 'both' });
        }
      },
      // Bali: sapuan cahaya keemasan melintasi pura, kamboja hanyut tertiup angin
      sweep() {
        const s = mk('pcx-sweep', '', stage); // menempel ke layar (bukan dunia) supaya selalu melintasi layar
        s.animate([{ transform: 'translateX(-80%) skewX(-18deg)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.7 }, { transform: 'translateX(330%) skewX(-18deg)', opacity: 0 }], { duration: T(2300), easing: 'ease-in-out', fill: 'both' });
        sparks(14, 392, 720, 24);
        for (let i = 0; i < 12; i++) {
          const p = spawn('pcx-p', imgP(i % 2 ? 'frangi2' : 'frangi1'), rnd(20, 360), rnd(300, 820)), dx = rnd(34, 62), dy = rnd(-6, 12);
          p.animate([
            { transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)', opacity: 0 },
            { transform: `translate(calc(-50% + ${(dx * 0.3).toFixed(1)}cqw),calc(-50% + ${(dy * 0.2 - 3).toFixed(1)}cqw)) scale(1) rotate(80deg)`, opacity: 1, offset: 0.25 },
            { transform: `translate(calc(-50% + ${dx.toFixed(1)}cqw),calc(-50% + ${dy.toFixed(1)}cqw)) scale(.85) rotate(${rnd(220, 380).toFixed(0)}deg)`, opacity: 0 }], { duration: T(rnd(2300, 3000)), delay: T(rnd(0, 500)), easing: 'ease-in-out', fill: 'both' });
        }
      },
      // Jawa Emas: senja jatuh. Langit merona jingga ke ungu, matahari tenggelam, serbuk emas naik
      dusk() {
        const [sx, sy] = PT.glow[0] ? [PT.glow[0][0], PT.glow[0][1]] : [650, 410];
        mk('pcx-dusk', '', stage).animate([{ opacity: 0 }, { opacity: 1 }], { duration: T(2000), easing: 'ease-in-out', fill: 'both' });
        spawn('pcx-sun', '', sx, sy).animate([
          { opacity: 0, transform: 'translate(-50%,-50%) scale(.8)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: 0.2 },
          { opacity: 0.95, transform: 'translate(-50%,calc(-50% + 22cqw)) scale(.78)', offset: 0.8 }, { opacity: 0, transform: 'translate(-50%,calc(-50% + 30cqw)) scale(.6)' }], { duration: T(2600), easing: 'ease-in', fill: 'both' });
        for (let i = 0; i < 16; i++) {
          const e = spawn('pcx-ember gold', '', rnd(120, 700), rnd(520, 900)), dx = rnd(-8, 8), dy = rnd(-34, -12);
          e.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: `translate(calc(-50% + ${dx.toFixed(1)}cqw),calc(-50% + ${dy.toFixed(1)}cqw)) scale(1)`, opacity: 0 }], { duration: T(rnd(1800, 2800)), delay: T(rnd(0, 700)), easing: 'ease-out', fill: 'both' });
        }
      },
      // Biru: bintang jatuh melintasi langit malam, riak menyebar di kolam air terjun
      star() {
        const shoot = (x0, y0, x1, y1, delay, ms) => {
          const e = spawn('pcx-star', '', x0, y0), ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
          e.animate([{ transform: `translate(0,0) rotate(${ang.toFixed(1)}deg)`, opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.7 }, { transform: `translate(${cqx(x1 - x0)}cqw,${cqx(y1 - y0)}cqw) rotate(${ang.toFixed(1)}deg)`, opacity: 0 }], { duration: T(ms), delay: T(delay), easing: 'cubic-bezier(.4,0,.6,1)', fill: 'both' });
        };
        shoot(90, 90, 560, 330, 150, 1000); shoot(300, 40, 700, 240, 850, 850);
        const w = PT.water[0] || [120, 690, 550, 300], cx = w[0] + w[2] / 2, cy = w[1] + w[3] / 2;
        for (let i = 0; i < 4; i++) spawn('pcx-ring', '', cx + rnd(-60, 60), cy + rnd(-40, 40)).animate([{ transform: 'translate(-50%,-50%) scale(.1)', opacity: 0 }, { opacity: 0.9, offset: 0.2 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: T(2000), delay: T(500 + i * 380), easing: 'ease-out', fill: 'both' });
        sparks(16, cx, cy, 22);
      },
      // Rimba: halo bulan menguat, kunang-kunang dari seluruh hutan berkumpul ke bulan
      moonfly() {
        const [mx, my] = PT.moon || [475, 385];
        pulse(spawn('pmoonf', '', mx, my), 3000, 0.95, 0.5, 1.5);
        spawn('pcx-ring moon', '', mx, my).animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 0 }, { opacity: 0.9, offset: 0.25 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }], { duration: T(2400), delay: T(300), easing: 'ease-out', fill: 'both' });
        for (let i = 0; i < 22; i++) {
          const x = Math.min(BW - 20, Math.max(20, mx + rnd(-340, 340))), y = Math.min(BH - 100, Math.max(60, my + rnd(-140, 560))), e = spawn('pfb', '', x, y);
          e.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: `translate(calc(-50% + ${cqx(mx - x)}cqw),calc(-50% + ${cqx(my - y)}cqw)) scale(1.3)`, opacity: 1, offset: 0.85 }, { transform: `translate(calc(-50% + ${cqx(mx - x)}cqw),calc(-50% + ${cqx(my - y)}cqw)) scale(.4)`, opacity: 0 }], { duration: T(rnd(2200, 3000)), delay: T(rnd(0, 600)), easing: 'cubic-bezier(.4,0,.3,1)', fill: 'both' });
        }
      },
      // Dayak: kawanan enggang terbang mendekat, bulu-bulu enggang berguguran, kilau emas
      enggang() {
        if (window.DAYAK) { window.DAYAK.flyNow(stage, true); X.later(() => window.DAYAK.flyNow(stage, true), T(500)); X.later(() => window.DAYAK.flyNow(stage, false), T(300)); }
        sparks(18, 392, 300, 34);
        for (let i = 0; i < 12; i++) {
          const p = spawn('pcx-p', imgP(i % 4 === 0 ? 'feather' : i % 2 ? 'orchid' : 'leafj'), rnd(80, 700), rnd(-40, 120)), dx = rnd(-14, 14), dy = rnd(40, 70);
          p.animate([{ transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 0 }, { opacity: 1, offset: 0.15 }, { transform: `translate(calc(-50% + ${dx.toFixed(1)}cqw),calc(-50% + ${dy.toFixed(1)}cqw)) rotate(${rnd(-260, 260).toFixed(0)}deg)`, opacity: 0 }], { duration: T(rnd(2600, 3600)), delay: T(rnd(0, 700)), easing: 'cubic-bezier(.3,.1,.6,1)', fill: 'both' });
        }
      },
      // Klasik: blencong dinyalakan. Api membesar bergoyang, bara beterbangan
      lamp() {
        const [lx, ly] = PT.glow[0] ? [PT.glow[0][0], PT.glow[0][1]] : [410, 625];
        spawn('pcx-flare', '', lx, ly).animate([
          { opacity: 0, transform: 'translate(-50%,-50%) scale(.3)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.15)', offset: 0.25 }, { opacity: 0.65, offset: 0.38 }, { opacity: 1, offset: 0.5 },
          { opacity: 0.75, offset: 0.62 }, { opacity: 1, offset: 0.75 }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1.6)' }], { duration: T(3000), easing: 'ease-out', fill: 'both' });
        for (let i = 0; i < 16; i++) {
          const e = spawn('pcx-ember', '', lx + rnd(-26, 26), ly + rnd(-10, 14)), dx = rnd(-10, 10), dy = rnd(-40, -14);
          e.animate([{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { opacity: 1, offset: 0.2 }, { transform: `translate(calc(-50% + ${dx.toFixed(1)}cqw),calc(-50% + ${dy.toFixed(1)}cqw)) scale(1)`, opacity: 0 }], { duration: T(rnd(1800, 2800)), delay: T(rnd(0, 800)), easing: 'ease-out', fill: 'both' });
        }
      },
    };
    const fire = (ev) => {
      if (!ev || X.dead) return;
      const [name, off] = String(ev).split('+');
      const go = () => {
        if (X.dead) return;
        if (name === 'birds') { if (PICT === 'dayak' && window.DAYAK) { window.DAYAK.flyNow(stage, true); window.DAYAK.flyNow(stage, false); } else picBirds(stage); }
        if (name === 'petals') X.fall(PT.petals, 10, { size: 24, dur: 6500, spread: 2500 });
        if (name === 'bf') { const r = stage.getBoundingClientRect(); picFlyers($('.pfx', stage), PT.live || cinOn() ? 2 : 6, [r.width / 2, r.height * 0.5]); }
        if (name === 'cx' && PT.cx && CX[PT.cx]) CX[PT.cx]();
      };
      if (off) X.later(go, T(+off)); else go();
    };
    if (CIN) { // sinema baru: kamera tenang, adegan tersusun, bingkai akhir berisi nama
      const film = window.CINEMA.film(stage, { key: PICT, D, cd, data: cinData(), later: X.later, fire, onEnd: () => { skip.hidden = true; hero.classList.remove('filming'); done(); } });
      skip.onclick = () => { X.end(); film.end(true); };
      return;
    }
    marks.forEach(([at, ev]) => ev && later(() => fire(ev), at + cd));
    let ended = false;
    const end = () => {
      if (ended) return; ended = true; skip.hidden = true; hero.classList.remove('filming');
      X.end();
      try { anim.commitStyles(); } catch (e) { /* */ } anim.cancel();
      const cur = getComputedStyle(cam).transform;
      cam.animate([{ transform: cur === 'none' ? 'none' : cur }, { transform: 'none' }], { duration: 900 * D, easing: 'ease-out' });
      cam.style.transform = '';
      $$('.pcv', stage).forEach((el) => { el.style.opacity = '0'; });
      done();
    };
    anim.onfinish = () => { cam.style.transform = ''; anim.cancel(); if (!ended) { ended = true; skip.hidden = true; hero.classList.remove('filming'); done(); } };
    skip.onclick = end;
  }

  // ---------- render section ----------
  const splitTitle = (t) => { t = String(t || '').trim(); const i = t.indexOf(' '); return i < 0 ? [t, ''] : [t.slice(0, i), t.slice(i + 1)]; };
  const hasWA = (c) => !!String(c.general.whatsapp || '').replace(/\D/g, '');
  const heartDiv = `<div class="divider">${ICON.heart}</div>`;
  // kartu kapsul berbingkai bunga: lengkung atas/bawah + sisi yang diulang (tidak pernah melar)
  // Tema 12: latar Wedding Gift & RSVP khusus tema (terang, hiasan mengikuti bentuk pembuka: kotak / oval / bulat).
  // Bila admin mengisi foto latar (mono.giftBg / mono.rsvpBg, atau foto latar bagian itu sendiri), foto itu yang dipakai.
  const MNA = '/assets/mono/';
  function monoDeco(c) {
    const st = (c.mono && c.mono.frameStyle) || 'rect';
    if (st === 'rect') return `<div class="mn-dec rect" aria-hidden="true">${['tl', 'tr', 'bl', 'br'].map((q) => `<img class="mn-dc ${q}" src="${MNA}rose-corner.webp" alt="" decoding="async">`).join('')}</div>`;
    return `<div class="mn-dec sprig" aria-hidden="true"><img class="mn-dc a" src="${MNA}sprig-tall.webp" alt="" decoding="async"><img class="mn-dc b" src="${MNA}sprig-arc.webp" alt="" decoding="async"></div>`;
  }
  function monoSecBg(c, o, key) { // -> { html, style } bila ada foto latar buatan admin; null = pakai latar bawaan tema
    const m = c.mono || {}, own = safeUrl(m[key]), u = own || safeUrl(o.bg);
    if (!u || /\/assets\/default\//.test(u)) return null;
    return own ? { html: bgl(m, key), style: ov(m, key) } : { html: bgl(o, 'bg'), style: ov(o, 'bg') };
  }
  // Tema 12: tiap bagian memakai rangkaian bunga berbeda; gambar yang diunggah admin sendiri tidak diganti
  const mnSlot = (k, cur) => (MN && C && C.scene && C.scene[k] && /\/assets\/mono\/corner-(top|bottom)\.webp$/.test(cur || '')) ? C.scene[k] : cur;
  const capsule = (cls, inner) => `<div class="rv cap ${cls}"><div class="fr-side"></div><img class="fr-arc t" src="${link(C.scene.frameArc)}" alt=""><img class="fr-arc b" src="${link(C.scene.frameArc)}" alt=""><div class="cap-in ${cls === 'rosecap' ? 'gf' : 'ev'}">${inner}</div></div>`;

  const R = {
    hero(c) {
      if (MN) return window.MONO.hero(mh());
      if (PT) return picHero(c);
      const h = c.hero;
      return `<section class="sec hero pre" id="s-hero">${scene(c)}
        <div class="hero-text">${JFX() ? `<img class="rv gun-s" src="${GUN}" alt="">` : ''}<div class="rv kick">${esc(h.kicker)}</div>
        <h1 class="names"><span class="rv nm">${esc(h.groom)}</span><i class="rv amp">&amp;</i><span class="rv nm">${esc(h.bride)}</span></h1>
        <div class="rv date">${esc(h.dateText)}</div><div class="rv tag">${esc(h.hashtag)}</div></div>
        <div class="scroll-hint"></div></section>`;
    },
    quote(c) {
      const o = c.quote, l = o.labels;
      // ayat Arab: kolom sendiri di admin; bila kosong, baris berhuruf Arab di teks ayat dipisahkan otomatis
      const isAr = (s) => { const a = (s.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length, t = (s.match(/[A-Za-z\u0600-\u06FF\uFB50-\uFEFF]/g) || []).length; return a > 0 && a >= t * 0.5; };
      const lines = String(o.text || '').split('\n'), arabic = String(o.arabic || '').trim() || lines.filter(isAr).join('\n'), text = String(o.arabic || '').trim() ? o.text : lines.filter((s) => !isAr(s)).join('\n').trim();
      const ars = { normal: 1, large: 1.25, xl: 1.5 }[o.arabicSize] || 1.25;
      return `<section class="sec bgi quote" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.cover.photo))}<div class="q-in">
        ${arabic ? `<p class="rv qar" dir="rtl" lang="ar" style="--ars:${ars}">${br(arabic)}</p>` : ''}<p class="rv qt">${br(text)}</p><div class="rv src">${esc(o.source)}</div>
        <div class="rv cds" id="cds"><div class="cd"><b data-k="d">00</b><span>${esc(l.days)}</span></div><div class="sep">:</div><div class="cd"><b data-k="h">00</b><span>${esc(l.hours)}</span></div><div class="sep">:</div><div class="cd"><b data-k="m">00</b><span>${esc(l.minutes)}</span></div><div class="sep">:</div><div class="cd"><b data-k="s">00</b><span>${esc(l.seconds)}</span></div></div>
        <a class="rv btn sq up" id="saveDate" target="_blank" rel="noopener">${ICON.cal}${esc(o.saveButton)}</a></div></section>`;
    },
    greeting(c) {
      const o = c.greeting, useOwn = !!safeUrl(o.bg);
      return `<section class="sec paperbg greeting">${useOwn ? bgl(o, 'bg') : bgl(c.couple, 'bg')}
        <div class="rv gpanel"><p>${br(o.text)}</p>${safeUrl(o.photo) ? `<div class="circ"><div class="phb">${photo(o, 'photo')}</div></div>` : ''}</div></section>`;
    },
    couple(c) {
      const o = Object.assign({}, c.couple, THEME === 'rose' && safeUrl(c.scene.flowers) ? { flower: c.scene.flowers } : {});
      const p = (x, side) => `<div class="person">${PT && window.CINEMA && window.CINEMA.has(PICT) ? window.CINEMA.pframe(PICT, photo(x, 'photo', x.fullName), side, safeUrl(o.flower) || PT.deco.flowers) : `<div class="pho-w"><div class="rv pho" data-a="zoom-in" style="--i:2"><div class="phb">${photo(x, 'photo', x.fullName)}</div></div>${safeUrl(o.flower) ? `<img class="rv fl-acc" data-a="bloom" style="--i:4" src="${link(o.flower)}" alt="">` : ''}</div>
        `}<div class="rv script" data-a="soft" style="--i:6">${esc(x.script)}</div><div class="rv fn" data-a="soft" style="--i:7">${esc(x.fullName)}</div><div class="rv par" data-a="soft" style="--i:8">${esc(x.parents)}</div>${safeUrl(x.instagram) ? `<a class="rv btn pill" data-a="soft" style="--i:9" href="${link(x.instagram)}" target="_blank" rel="noopener">${ICON.ig}${esc(o.instagramLabel)}</a>` : ''}</div>`;
      return `<section class="sec paperbg couple">${bgl(o, 'bg')}<div class="rv cpanel" data-a="soft" style="--i:0">${p(o.groom, 'l')}<div class="rv amp" data-a="zoom-in" style="--i:2">${esc(o.connector)}</div>${p(o.bride, 'r')}</div></section>`;
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
      const edge = (pos, src) => `<div class="edge ${pos} ${pos === 'top' ? 'sway-t' : 'sway-b'}"><div class="half l rv" data-a="${pos === 'top' ? 'bloom-l' : 'bloom-ul'}" style="--i:0">${fimg(src)}</div><div class="half r rv" data-a="${pos === 'top' ? 'bloom-r' : 'bloom-ur'}" style="--i:1">${fimg(src)}</div></div>`;
      return `<section class="sec paperbg gallery">${bgl(o, 'bg', pick(o.bg, s.paper))}${edge('top', mnSlot('galTop', s.floralTop))}${edge('bottom', mnSlot('galBot', s.floralBottom))}<h2 class="rv h-display" data-a="soft">${esc(o.title)}</h2>
        ${videoEmbed(o.video)}${galleryBody(o)}</section>`;
    },
    story(c) {
      const o = c.story;
      return `<section class="sec story" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.scene.sky))}<h2 class="rv script-h">${esc(o.title)}</h2>
        <div class="tl">${(o.items || []).map((s) => `<div class="rv card" data-a="soft"><span class="mk">${ICON.heart}</span><div class="im"><div class="phb">${photo(s, 'image', s.title)}</div></div><div class="tx"><h4>${esc(s.title)}</h4><p>${br(s.text)}</p></div></div>`).join('')}</div>
        <div class="fl sway-b"><div class="half l rv" data-a="bloom-ul" style="--i:0">${fimg(mnSlot('storyBot', c.scene.floralBottom))}</div><div class="half r rv" data-a="bloom-ur" style="--i:1">${fimg(mnSlot('storyBot', c.scene.floralBottom))}</div></div>${sparkles(10)}</section>`;
    },
    gift(c) {
      const o = c.gift, wa = hasWA(c) && o.sendWhatsapp;
      const [t1, t2] = splitTitle(o.title), [f1, f2] = splitTitle(o.formTitle);
      const banks = (o.banks || []).map((b, i) => `${i ? heartDiv : ''}<div class="bank"><div>${esc(b.bank)}</div><div>No. Rekening ${esc(b.number)}</div><div>a.n <b>${esc(b.name)}</b></div><button class="btn pill rose" data-copy="${esc(b.number)}">${esc(o.copyBank)} ${ICON.copy}</button></div>`).join('');
      const addr = o.address ? `${heartDiv}${ICON.gift}<div class="bank"><div>${esc(o.addressTitle)}</div><div class="gap"><b>${esc(o.addressName)}</b></div><div>${br(o.address)}</div><button class="btn pill rose" data-copy="${esc(o.addressName + ' - ' + o.address)}">${esc(o.copyAddress)} ${ICON.copy}</button></div>` : '';
      const main = capsule('rosecap', `<h3 class="gt"><span class="s" style="--n:${Math.max(t1.length, 6)}">${esc(t1)}</span><span class="d" style="--n:${Math.max(t2.length, 6)}">${esc(t2)}</span></h3><p class="gi">${br(o.intro)}</p>${banks}${addr}`);
      const form = o.formEnabled ? capsule('rosecap', `<h3 class="gt"><span class="s" style="--n:${Math.max(f1.length, 6)}">${esc(f1)}</span><span class="d" style="--n:${Math.max(f2.length, 6)}">${esc(f2)}</span></h3><p class="gi">${br(o.formText)}</p>
        <form class="fm" id="giftForm"><label>Nama :</label><input name="name" required maxlength="80" value="${esc(guest)}" placeholder="Nama"><label>Nama Bank :</label><input name="bank" maxlength="60" placeholder="Nama Bank"><label>Nominal :</label><input name="amount" maxlength="40" inputmode="numeric" placeholder="Nominal"><label>Ucapan :</label><input name="message" maxlength="500" placeholder="Ucapan"><label>Bukti TF :</label><input type="file" name="proof" accept="image/png,image/jpeg,image/webp"><button class="btn sq full" type="submit">${wa ? ICON.wa : ICON.send}${esc(o.formButton)}</button><div class="msg" id="giftMsg"></div></form>`) : '';
      if (MN) { const mb = monoSecBg(c, o, 'giftBg'); return mb ? `<section class="sec bgi gift" style="${mb.style}">${mb.html}${main}${form}</section>` : `<section class="sec mn-lite gift">${monoDeco(c)}${main}${form}</section>`; }
      return `<section class="sec bgi gift" style="${ov(o, 'bg')}">${bgl(o, 'bg', pick(o.bg, c.quote.bg))}${main}${form}</section>`;
    },
    rsvp(c) {
      const o = c.rsvp, n = Math.max(1, +o.maxGuests || 1), wa = hasWA(c) && o.sendWhatsapp;
      const t = String(o.title || 'RSVP').trim(), k = Math.ceil(t.length / 2);
      const mb = MN ? monoSecBg(c, o, 'rsvpBg') : null, lite = MN && !mb;
      return `<section class="sec ${lite ? 'mn-lite' : 'bgi'} rsvp" style="${MN ? (mb ? mb.style : '') : ov(o, 'bg')}">${lite ? monoDeco(c) : MN ? mb.html : bgl(o, 'bg', pick(o.bg, c.quote.bg))}<div class="rsvp-head"><h2 class="rv big"><span>${esc(t.slice(0, k))}</span><span>${esc(t.slice(k))}</span></h2>${safeUrl(o.photo) ? `<div class="rv ph"><div class="phb">${photo(o, 'photo')}</div></div>` : ''}</div>
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
        <form class="wbox fm" id="wishForm"><input name="name" required maxlength="80" value="${esc(guest)}" placeholder="Nama"><textarea name="message" required minlength="2" maxlength="600" placeholder="Ucapan"></textarea>
          <div class="wphoto"><label class="wpick" for="wishPhoto">📷 <span id="wishPhotoTxt">Tambah foto profil (opsional)</span></label><input type="file" id="wishPhoto" accept="image/png,image/jpeg,image/webp" hidden><div class="wprev" id="wishPrev" hidden><img alt="" id="wishPrevImg"><button type="button" id="wishPrevX" aria-label="Hapus foto profil">✕</button></div></div>
          <button class="btn sq" type="submit">${ICON.send}${esc(o.button)}</button><div class="msg" id="wishMsg"></div></form>
        <div class="wl-head"><span>Ucapan Tamu</span><em><b id="stW">0</b> Ucapan</em></div>
        <div class="wl-list" id="wishList"></div><div class="wl-pager" id="wishPager" hidden><button type="button" id="wishOpen" class="wl-open"></button></div><div style="text-align:center"><button class="more" id="wishMore" hidden>Muat ucapan lagi</button></div></div></section>`;
    },
    closing(c) {
      const o = c.closing, s = c.scene;
      const half = (src, i) => `<div class="half l rv" data-a="bloom-l" style="--i:${i}">${fimg(src)}</div><div class="half r rv" data-a="bloom-r" style="--i:${i}">${fimg(src)}</div>`;
      if (MN) { // Tema 12: penutup berkesan tapi tetap elegan (hitam putih, hanya transform/opacity)
        const M = window.MONO, hh = { esc };
        const stars = [[15, 21], [85, 17], [9, 47], [91, 55], [21, 73], [80, 78], [50, 9]].map((p, i) => `<i class="mc-st" style="left:${p[0]}%;top:${p[1]}%;--sd:${(i * 0.9).toFixed(1)}s"></i>`).join('');
        return `<section class="sec closing mn-closing"><div class="stage">${safeUrl(o.bg) ? bgl(o, 'bg') : `<div class="sk" style="background-image:${cssUrl(s.sky)}"></div>`}
        <div class="ft sway-t">${half(mnSlot('clTop', s.floralTop), 0)}</div><div class="fb sway-b">${half(mnSlot('clBot', s.floralBottom), 2)}</div>
        <div class="panel mc-panel"></div><div class="mc-stars" aria-hidden="true">${stars}</div>
        <div class="cl-in"><div class="mc-pw"><div class="cpho mc-pho"><div class="phb">${photo(o, 'photo')}</div></div><i class="mc-halo"></i></div>
        <div class="kick mc-k">${M.chars(hh, o.kicker, 42, 1500)}</div>
        <div class="names mc-nm">${M.chars(hh, o.names, 80, 2000)}</div>
        <img class="mc-orn" src="/assets/mono/orn-bottom.webp" alt="" decoding="async">
        <p class="txt mc-tx">${M.words(hh, o.text, 36, 3300)}</p>
        <div class="mc-hr" aria-hidden="true"><i></i>${ICON.heart}<i></i></div></div></div>
        <div class="footer">${safeUrl(o.footerUrl) ? `<a href="${link(o.footerUrl)}" target="_blank" rel="noopener">${esc(o.footer)}</a>` : esc(o.footer)}</div></section>`;
      }
      return `<section class="sec closing"><div class="stage">${safeUrl(o.bg) || (THEME === 'rose' && safeUrl(s.palace)) ? bgl(o, 'bg') : `<div class="sk" style="background-image:${cssUrl(s.sky)}"></div>`}
        <div class="ft sway-t">${half(s.floralTop, 0)}</div><div class="fb sway-b">${half(s.floralBottom, 2)}</div>
        <div class="rv panel" data-a="soft" style="--i:5"></div>${sparkles(10)}
        <div class="cl-in"><div class="rv cpho" data-a="zoom-in" style="--i:8"><div class="phb">${photo(o, 'photo')}</div></div>${JFX() ? `<img class="rv gun-s" data-a="zoom-in" style="--i:9" src="${GUN}" alt="">` : ''}<div class="rv kick" data-a="soft" style="--i:10">${esc(o.kicker)}</div><div class="rv names" data-a="soft" style="--i:11">${esc(o.names)}</div><p class="rv txt" data-a="soft" style="--i:12">${br(o.text)}</p></div></div>
        <div class="footer">${safeUrl(o.footerUrl) ? `<a href="${link(o.footerUrl)}" target="_blank" rel="noopener">${esc(o.footer)}</a>` : esc(o.footer)}</div></section>`;
    },
  };

  // galeri: slider berjalan sendiri (foto utuh, landscape/portrait sesuai aslinya) + galeri bergaya majalah
  function galleryBody(o) {
    const items = (o.items || []).map((g) => ({ u: safeUrl(g.image), g })).filter((x) => x.u).map((x, i) => Object.assign(x, { i }));
    // slider punya foto sendiri (terpisah dari galeri); bila kosong memakai foto galeri
    const own = (o.sliderItems || []).map((g) => ({ u: safeUrl(g.image), g })).filter((x) => x.u).map((x, i) => Object.assign(x, { i: items.length + i }));
    const sl = own.length ? own : items;
    if (!items.length && !sl.length) return '';
    const lay = o.layout || 'masonry', slider = o.slider !== false && sl.length > 1;
    // bentuk foto (mis. 3/4 potret, 4/3 lanskap, 21/9 panjang) & jumlah kolom — kosong = bawaan
    const okS = (v) => (/^\d+(\.\d+)?\/\d+(\.\d+)?$/.test(String(v || '')) ? String(v) : '');
    const shape = okS(o.shape);
    items.forEach((x) => { x.sh = okS(x.g.shape); }); // bentuk khusus satu foto (menimpa bentuk galeri)
    const cols = ['1', '2', '3', '4'].includes(String(o.cols)) ? +o.cols : 0;
    const uniform = lay === 'grid' || (lay === 'masonry' && !!shape); // bentuk dipilih = semua foto seragam
    const size = ['small', 'large'].includes(o.sliderSize) ? o.sliderSize : 'normal';
    const slide = (x) => `<figure class="sl" data-lb="${x.i}"><img src="${esc(x.u)}" alt="" decoding="async" draggable="false"></figure>`;
    const strip = slider ? `<div class="rv gslider" data-a="soft" data-dir="${o.sliderDir === 'left' ? 'left' : 'right'}" data-speed="${esc(o.sliderSpeed || 'normal')}" data-size="${size}"><div class="gtrack">${sl.map(slide).join('')}</div></div>` : '';
    let rest = '';
    if (!items.length) return strip;
    if (items.some((x) => x.sh) && lay !== 'none') { // ada foto dengan bentuk sendiri: susun kolom, tinggi mengikuti bentuk tiap foto
      rest = `<div class="mixg" style="--gcols:${cols || 2}">${items.map((x, k) => {
        const sh = x.sh || shape || (lay === 'grid' ? '3/4.3' : ''), p = sh.split('/'), wide = x.sh && +p[0] / +p[1] >= 1.7;
        return sh ? `<div class="rv gi mx${wide ? ' wide' : ''}" data-lb="${x.i}" data-a="zoom-in" style="--i:${k % 3};aspect-ratio:${sh}"><div class="phb">${photo(x.g, 'image')}</div></div>`
          : `<figure class="rv gi mx" data-lb="${x.i}" data-a="zoom-in" style="--i:${k % 3}"><img src="${esc(x.u)}" alt="" decoding="async" loading="lazy" style="width:100%;height:auto;display:block"></figure>`;
      }).join('')}</div>`;
    } else if (uniform) rest = `<div class="grid" style="--gcols:${cols || 3};--gar:${shape || '3/4.3'}">${items.map((x, k) => `<div class="rv gi" data-lb="${x.i}" data-a="zoom-in" style="--i:${k % 3}"><div class="phb">${photo(x.g, 'image')}</div></div>`).join('')}</div>`;
    else if (lay === 'masonry') rest = `<div class="masonry" style="--gcols:${cols || 2}"${cols ? ` data-c="${cols}"` : ''}>${items.map((x, k) => `<figure class="rv mi" data-lb="${x.i}" data-a="zoom-in" style="--i:${k % 2}"><img src="${esc(x.u)}" alt="" decoding="async" loading="lazy"></figure>`).join('')}</div>`;
    return strip + rest;
  }
  let sliderStop = null;
  function startSliders() {
    if (sliderStop) sliderStop();
    const el = $('#app .gslider'); if (!el) return;
    const tr = $('.gtrack', el), orig = [...tr.children];
    const fill = () => { // gandakan isi sampai cukup panjang untuk berputar tanpa celah
      $$('.dup', tr).forEach((d) => d.remove());
      const w = tr.scrollWidth || 1, need = Math.max(2, Math.ceil((el.clientWidth * 2) / w) + 1);
      for (let k = 1; k < need; k++) orig.forEach((n) => { const c = n.cloneNode(true); c.classList.add('dup'); tr.appendChild(c); });
    };
    fill();
    const dir = el.dataset.dir === 'left' ? -1 : 1, v = { slow: 22, normal: 38, fast: 62 }[el.dataset.speed] || 38;
    let setW = 0; const meas = () => { const d = $('.dup', tr); setW = d ? d.offsetLeft - orig[0].offsetLeft : tr.scrollWidth / 2; };
    meas();
    let x = dir > 0 ? -setW : 0, last = 0, raf = 0, vis = false, hold = false, drag = null, moved = 0;
    const wrap = () => { if (setW <= 0) return; while (x > 0) x -= setW; while (x <= -setW) x += setW; };
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(64, t - last) : 16; last = t;
      if (!hold && !reduce) x += dir * v * dt / 1000;
      wrap(); tr.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    };
    const run = () => { if (!raf && vis) { last = 0; raf = requestAnimationFrame(tick); } };
    const halt = () => { cancelAnimationFrame(raf); raf = 0; };
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; vis ? run() : halt(); }); io.observe(el); observers.push(io);
    const onLoad = () => { const old = setW; fill(); meas(); if (old && setW) x = x / old * setW; };
    $$('img', tr).forEach((im) => { if (!im.complete) im.addEventListener('load', onLoad, { once: true }); });
    const ro = new ResizeObserver(() => meas()); ro.observe(el);
    // geser manual (sentuh / tarik), lalu jalan sendiri lagi
    el.addEventListener('pointerdown', (e) => { drag = { x0: e.clientX, p0: x }; moved = 0; hold = true; el.classList.add('drag'); }, { signal: AC.signal });
    addEventListener('pointermove', (e) => { if (!drag) return; const d = e.clientX - drag.x0; moved = Math.max(moved, Math.abs(d)); x = drag.p0 + d; }, { signal: AC.signal, passive: true });
    const up = () => { if (!drag) return; drag = null; el.classList.remove('drag'); later(() => { if (!drag) hold = false; }, 900); };
    addEventListener('pointerup', up, { signal: AC.signal }); addEventListener('pointercancel', up, { signal: AC.signal });
    el.addEventListener('mouseenter', () => (hold = true), { signal: AC.signal }); el.addEventListener('mouseleave', () => { if (!drag) hold = false; }, { signal: AC.signal });
    el.addEventListener('click', (e) => { const f = e.target.closest('[data-lb]'); if (f && moved < 8) lbShow(+f.dataset.lb); }, { signal: AC.signal });
    sliderStop = () => { halt(); ro.disconnect(); };
  }

  const MUTE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/><path class="x" d="M23 9l-6 6M17 9l6 6"/><path class="w" d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>';
  function videoEmbed(u) {
    u = String(u || '').trim(); if (!u) return '';
    const btn = `<button type="button" class="vmute" aria-label="Suara video">${MUTE_ICON}</button>`;
    const m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{6,})/.exec(u);
    if (m) return `<div class="rv vid clean" data-a="soft" data-yt="${m[1]}"><div class="vcurtain"></div><div class="vshield"></div>${btn}</div>`;
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u) && safeUrl(u)) return `<div class="rv vid clean" data-a="soft"><video src="${link(u)}" muted loop playsinline autoplay disablepictureinpicture disableremoteplayback preload="auto"></video><div class="vshield"></div>${btn}</div>`;
    return '';
  }

  const mh = () => ({ C, esc, safeUrl, guest, icon: ICON.mail, alt: C.cover.names, adj: (o, k) => adjStyle(adj(o, k)) });
  function coverHtml(c) {
    if (MN) return window.MONO.cover(mh());
    if (PT) return picCover(c);
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
      ${THEME === 'rose' ? `<div class="cv-ft">${halves(c.scene.floralTop)}</div>` : ''}
      <div class="cv-fb">${halves(c.scene.floralBottom)}</div>
      ${sparkles(12)}<div class="flyers"></div></div>`;
  }

  // ---------- render (dipakai juga oleh pratinjau admin tanpa reload) ----------
  let observers = [], cdsTimer = null;
  function render(raw) {
    const cfg = effective(raw);
    C = cfg; window.__CFG = cfg;
    if (AC) AC.abort(); AC = new AbortController();
    observers.forEach((o) => o.disconnect()); observers = [];
    clearInterval(cdsTimer);
    applyTheme(cfg);
    const order = (cfg.sections || []).filter((s) => s.enabled && R[s.id]);
    $('#app').innerHTML = order.map((s) => R[s.id](cfg).replace('<section ', `<section data-sid="${s.id}" `)).join('');
    if (MN && window.MONO.fx) { window.MONO.fx($('#app')); window.MONO.closingFx($('#app')); }
    if (JFX()) $$('#app .sec.paperbg, #app .sec.story').forEach((sec) => { const d = document.createElement('div'); d.className = 'batik'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>'; const b = $(':scope>.bgl', sec); if (b) b.after(d); else sec.prepend(d); });
    $$('#app section').forEach((sec, idx) => {
      if (!sec.id) sec.id = 's-' + order[idx].id;
      const anim = order[idx] && order[idx].anim || 'fade-up', own = order[idx] && order[idx].anim;
      // animasi pilihan admin berlaku untuk semua teks/gambar di section; hanya dekorasi khusus (bunga bloom, bingkai foto) yang tetap
      $$('.rv', sec).forEach((el, i) => { if (!el.dataset.a || (own && !/^(bloom|pf)/.test(el.dataset.a))) el.dataset.a = anim; if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 5)); });
      // kecepatan animasi per bagian (admin → tiap section → "Kecepatan"); kosong = ikut pengaturan umum. Pembuka & penutup lewat applyTextSpeed.
      const spd = order[idx] && !/^(hero|closing)$/.test(order[idx].id) ? TSPD[order[idx].speed] : 0;
      if (spd && !reduce) { sec.style.setProperty('--dur', spd + 's'); sec.style.setProperty('--tk', String(spd)); sec.setAttribute('data-spd', '1'); }
    });
    if (!opened || q.has('cover')) {
      $('#coverRoot').innerHTML = coverHtml(cfg);
      $('#openBtn').addEventListener('click', () => openInvitation(false), { signal: AC.signal });
      if (spOn()) {
        const cv = $('#cover');
        $$('.sp-go', cv).forEach((b) => b.addEventListener('click', () => openInvitation(false), { signal: AC.signal }));
        $('#openBtn').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvitation(false); } }, { signal: AC.signal });
        window.SAMPUL.idle(cv, spH());
      }
      if (PT) picFlyers($('#cover .flyers'), Math.min(Math.max(+C.effects.butterflyCount || 0, 0), 5)); else if (!MN) setupButterflies($('#cover .flyers'));
      if (PREVIEW && q.has('cover') && inited) $('#cover').classList.add('play', 'shown', 'instant');
    }
    applyTextSpeed(); setTimeout(applyTextSpeed, 1500);
    bind(cfg);
    if (PT) picGL($('#s-hero .pstage'));
    if (PT && PT.live && liveW()) liveW().start($('#s-hero .pstage'));
    // bingkai foto mempelai mengikuti bentuk foto (potret tinggi / agak lebar), tetap dalam batas wajar
    $$('#app .pf').forEach((f) => { const im = $('.pimg', f); if (!im) return; const fit = () => { const r = im.naturalWidth / im.naturalHeight; if (r) f.style.aspectRatio = String(Math.min(0.86, Math.max(0.6, r))); }; if (im.complete) fit(); else im.addEventListener('load', fit, { once: true }); });
    if (opened) { startObserver(); const hero = $('#s-hero'); if (hero) { hero.classList.remove('pre'); hero.classList.add('play', 'done', 'instant', 'shown'); if (PT) { if (cinOn()) window.CINEMA.final($('.pstage', hero), { key: PICT, data: cinData() }); picFlyers($('.pfx', hero), Math.min(Math.max(+C.effects.butterflyCount || 0, 0), 8)); picAmbient($('.pstage', hero)); } else setupButterflies($('.flyers', hero), { sweep: true }); } }
  }

  // ---------- buka undangan: kamera menembus bunga -> mendekat ke pintu rumah -> mundur perlahan ----------
  function openInvitation(instant) {
    if (opened) return; opened = true;
    if (!instant && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().catch(() => { /* ditolak */ });
    const cover = $('#cover'), hero = $('#s-hero');
    applyTextSpeed(); setTimeout(applyTextSpeed, 900);
    startMusic();
    const unlock = () => { document.documentElement.classList.remove('locked'); document.body.classList.remove('locked'); window.scrollTo(0, 0); };
    const heroIn = () => { if (hero) { hero.classList.remove('pre'); hero.classList.add('play'); setupButterflies($('.flyers', hero), { sweep: true }); } };
    const finish = () => { startObserver(); parallax(); petals(); };
    if (MN && hero) { window.MONO.open({ cover, hero, D: sp, instant: instant || !C.effects.openZoom || reduce, unlock, finish, later }); return; }
    if (PT && hero) { picOpen(instant || !C.effects.openZoom || reduce, cover, hero, unlock, finish); return; }
    if (instant || !C.effects.openZoom || reduce || !hero) {
      unlock(); if (cover) { cover.classList.add('gone'); later(() => cover.remove(), 900); }
      heroIn(); if (hero) hero.classList.add('done'); finish(); return;
    }
    const D = sp; // pengali kecepatan
    cover.classList.add('opening');
    // nuansa Jawa: gunungan wayang dikibaskan dulu (seperti dalang membuka pertunjukan), lalu kamera masuk
    // Tema 1: animasi gunungan dihilangkan, kamera langsung masuk
    flyIn(cover, hero, D, unlock, heroIn, finish);
  }
  function gunOpen(D) {
    const g = document.createElement('div'); g.className = 'gun-open'; g.innerHTML = `<i class="gl"></i><img src="${GUN}" alt="">`; document.body.appendChild(g);
    const im = $('img', g), T = 2500 * D;
    im.animate([
      { transform: 'translateY(60vh) scale(.45) rotateY(0deg) rotate(0deg)', opacity: 0 },
      { transform: 'translateY(0) scale(1) rotateY(0deg) rotate(0deg)', opacity: 1, offset: 0.26 },
      { transform: 'translateY(-1vh) scale(1) rotateY(180deg) rotate(-8deg)', offset: 0.42 },
      { transform: 'translateY(0) scale(1.03) rotateY(360deg) rotate(7deg)', offset: 0.56 },
      { transform: 'translateY(0) scale(1) rotateY(360deg) rotate(-3deg)', opacity: 1, offset: 0.64 },
      { transform: 'translateY(-3vh) scale(3.4) rotateY(360deg) rotate(0deg)', opacity: 0 },
    ], { duration: T, easing: 'cubic-bezier(.45,0,.35,1)', fill: 'both' });
    $('.gl', g).animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.62 }, { opacity: 0, transform: 'scale(2.4)' }], { duration: T, easing: 'ease-in-out', fill: 'both' });
    later(() => g.remove(), T + 80);
    return T * 0.6;
  }
  function flyIn(cover, hero, D, unlock, heroIn, finish) {
    // titik fokus = pintu rumah
    const cam = $('.cam', hero), house = $('.hs img', hero);
    const cr = cam.getBoundingClientRect(), hr = house.getBoundingClientRect();
    const ox = ((hr.left + hr.width * 0.5 - cr.left) / cr.width * 100).toFixed(2), oy = ((hr.top + hr.height * (THEME === 'rose' ? 0.47 : 0.66) - cr.top) / cr.height * 100).toFixed(2);
    cam.style.transformOrigin = `${ox}% ${oy}%`;
    const zin = 1900 * D, zout = 4200 * D, peak = THEME === 'rose' ? 2.8 : 2.35;
    // tema 2: masuk menembus gapura -> cahaya putih lembut -> taman terlihat saat kamera mundur
    const fl = $('.flash', hero); if (fl && THEME === 'rose') fl.animate([{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 0.9, offset: 0.92 }, { opacity: 0 }], { duration: zin + zout * 0.35, easing: 'ease-in-out' });
    const anim = cam.animate([
      { transform: 'scale(1)', easing: 'cubic-bezier(.55,.05,.45,1)' },
      { transform: `scale(${peak})`, offset: zin / (zin + zout), easing: 'cubic-bezier(.42,0,.18,1)' },
      { transform: 'scale(1)' },
    ], { duration: zin + zout, fill: 'both' });
    hero.classList.add('flying');
    if (C.effects.zoomFx !== false) zoomFx(zin, zout, hr);
    later(() => { cover.classList.add('gone'); }, zin * 0.82);
    later(() => { cover.remove(); unlock(); }, zin + 300);
    later(heroIn, zin + zout * 0.45);
    anim.onfinish = () => { hero.classList.remove('flying'); hero.classList.add('done'); try { anim.commitStyles(); anim.cancel(); } catch (e) { /* */ } cam.style.transform = ''; };
    later(finish, zin + 400);
  }

  // kupu-kupu terbang melewati kamera + daun gugur saat kamera menuju rumah
  const LEAF_IMG = [1, 2, 3, 1, 2].map((i) => `/assets/scene/fall-leaf${i}.webp`);
  function zoomFx(zin, zout, hr) {
    if (reduce) return;
    const box = document.createElement('div'); box.className = 'zfx'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box);
    const W = innerWidth, H = innerHeight, cx = hr.left + hr.width / 2, cy = hr.top + hr.height * 0.55;
    const nB = C.effects.butterflies ? 8 : 0;
    for (let i = 0; i < nB; i++) {
      const el = document.createElement('div'); el.className = 'bf';
      const s = 26 + Math.random() * 14; el.style.width = el.style.height = s + 'px';
      el.innerHTML = bfSvg(C.scene.butterflyColor1, C.scene.butterflyColor2);
      el.querySelectorAll('.wl,.wr').forEach((w) => { w.style.animationDuration = (0.12 + Math.random() * 0.1) + 's'; });
      box.appendChild(el);
      const ang = (i / nB) * Math.PI * 2 + Math.random() * 0.6, dist = Math.max(W, H) * (0.75 + Math.random() * 0.35);
      const x0 = cx - s / 2, y0 = cy - s / 2;
      const tx = x0 + Math.cos(ang) * dist, ty = y0 + Math.sin(ang) * dist * 0.85 - 60;
      const mx = x0 + Math.cos(ang + 0.7) * dist * 0.3, my = y0 + Math.sin(ang + 0.7) * dist * 0.25 - 50;
      const rot = ang * 180 / Math.PI + 90;
      el.animate([
        { transform: `translate(${x0}px,${y0}px) rotate(${rot}deg) scale(.2)`, opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate(${mx}px,${my}px) rotate(${rot + 35}deg) scale(1)`, offset: 0.5 },
        { transform: `translate(${tx}px,${ty}px) rotate(${rot - 10}deg) scale(2.4)`, opacity: 1 },
      ], { duration: 2800 + Math.random() * 1400, delay: zin * 0.45 + i * 160, easing: 'cubic-bezier(.35,.1,.55,1)', fill: 'both' });
    }
    const rose = THEME === 'rose', cols = ['var(--primary)', 'var(--tint2)', 'var(--tint3)', 'var(--accent)'];
    for (let i = 0; i < 20; i++) {
      const el = document.createElement(rose ? 'i' : 'img'), near = i % 5 === 0;
      if (rose) { el.className = 'zp'; el.style.background = cols[i % cols.length]; } else { el.src = LEAF_IMG[i % LEAF_IMG.length]; el.alt = ''; el.className = 'zl'; }
      const sc = near ? 1.5 + Math.random() * 0.6 : 0.55 + Math.random() * 0.5;
      el.style.width = (rose ? 14 : 22) * sc + 'px';
      box.appendChild(el);
      const x = Math.random() * W, dx = (Math.random() - 0.5) * 220, r0 = Math.random() * 360, rd = (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 420);
      el.animate([
        { transform: `translate(${x}px,-80px) rotate(${r0}deg) rotateX(0deg)`, opacity: 0 },
        { opacity: 1, offset: 0.08 },
        { transform: `translate(${x + dx * 0.6}px,${H * 0.3}px) rotate(${r0 + rd * 0.3}deg) rotateX(160deg)`, offset: 0.3 },
        { transform: `translate(${x - dx * 0.3}px,${H * 0.62}px) rotate(${r0 + rd * 0.65}deg) rotateX(40deg)`, offset: 0.62 },
        { transform: `translate(${x + dx}px,${H + 90}px) rotate(${r0 + rd}deg) rotateX(220deg)`, opacity: 0.9 },
      ], { duration: (near ? 3600 : 5200) + Math.random() * 2600, delay: zin * 0.25 + Math.random() * (zin + zout * 0.5), easing: 'linear', fill: 'both' });
    }
    later(() => box.remove(), zin + zout + 9500);
  }

  // pratinjau admin: putar ulang animasi muncul satu section (mis. setelah animasinya diganti)
  function replaySection(id) {
    const el = $('#s-' + id); if (!el) return;
    if (id === 'hero') {
      el.classList.remove('instant', 'done', 'play'); el.classList.add('pre'); void el.offsetWidth;
      later(() => { el.classList.remove('pre'); el.classList.add('play'); }, 120); later(() => el.classList.add('done'), 4800); return;
    }
    const rv = $$('.rv', el); rv.forEach((r) => { r.style.transition = 'none'; r.classList.remove('in'); }); void el.offsetWidth;
    rv.forEach((r) => { r.style.transition = ''; }); later(() => rv.forEach((r) => r.classList.add('in')), 90);
  }
  function gotoSection(id) {
    const map = { scene: 'hero', scene2: 'hero', mono: 'hero', effects: 'hero', theme: 'hero', general: 'hero', sections: 'hero', 'd-wishes': 'wishes', 'd-rsvp': 'rsvp', 'd-gifts': 'gift' };
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
    // animasi baru dimulai bila elemen sudah cukup terlihat (>=30% elemen, atau >=30% tinggi layar untuk elemen tinggi);
    // sebelumnya mulai begitu 1 piksel masuk sehingga animasi sudah selesai saat tamu sampai di sana.
    // Dicopot (agar bisa diputar lagi) hanya setelah elemen benar-benar keluar dari layar, bukan saat masih terlihat.
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const seen = e.isIntersecting && (e.intersectionRatio >= 0.3 || e.intersectionRect.height >= innerHeight * 0.3);
      if (!seen && e.isIntersecting) return;
      const on = seen;
      (groups.get(e.target) || []).forEach((t) => {
        // Tema 12 mempelai: teks (nama, orang tua, tombol) diamati sendiri; bila baru terlihat setelah foto sudah lama muncul, tampil tanpa menunggu jeda berantai
        if (t.classList.contains('pho')) t.dataset.tin = on ? String(performance.now()) : '0';
        if (t.dataset.chain) { const ph = t.closest('.person') && t.closest('.person').querySelector('.pho'); t.classList.toggle('late', !!(on && ph && ph.classList.contains('in') && performance.now() - (+ph.dataset.tin || 0) > 500)); }
        t.classList.toggle('in', on);
        if (on && t.id === 'cds' && cdsRun) cdsRun();
        if (t.classList.contains('vid')) vidCtl(t, on);
      });
    }), { threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1], rootMargin: '0px 0px -8% 0px' });
    observers.push(io);
    $$('#app .bgl.palace').forEach((el) => { if (!groups.has(el)) { groups.set(el, [el]); io.observe(el); } });
    $$('#app .rv').forEach((el) => {
      // Tema 12: satu mempelai muncul berurutan dari satu pemicu (bingkai → foto → nama → orang tua → tombol)
      const pr = MN ? el.closest('.couple .person') : null;
      const chain = !!pr && !el.closest('.pho-w'); if (chain) el.dataset.chain = '1';
      const tgt = (pr && !chain) ? pr : (/^bloom/.test(el.dataset.a || '') && el.parentElement ? el.parentElement : el);
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
  function reveal() { $$('#app .rv').forEach((el) => { const r = el.getBoundingClientRect(), vis = Math.min(r.bottom, innerHeight * 0.92) - Math.max(r.top, 0); if (vis > 0 && (vis >= r.height * 0.3 || vis >= innerHeight * 0.3)) el.classList.add('in'); }); }

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
    if (!C.effects.petals || reduce || petalsOn || PT) return; petalsOn = true;
    const box = $('#petals'), cols = ['var(--primary)', 'var(--accent)', 'var(--tint2)', 'var(--tint3)'];
    box.style.opacity = '0'; setTimeout(() => (box.style.opacity = ''), 2600 * sp);
    const hide = () => box.classList.toggle('off', scrollY > innerHeight * 0.85); hide();
    addEventListener('scroll', hide, { passive: true });
    const jawa = THEME !== 'rose', ps = PT ? PT.petals.map(sprite) : null;
    for (let i = 0; i < (jawa ? 14 : 12); i++) {
      const sp2 = ps && ps.length && i % 3 !== 2 ? ps[i % ps.length] : '';
      const lf = !sp2 && jawa && !PT && i % 2 === 0; // tema Jawa: daun gugur bercampur kelopak
      const p = document.createElement('i'); p.className = lf || sp2 ? 'petal leafp' : 'petal';
      const s = sp2 ? 14 + Math.random() * 10 : lf ? 13 + Math.random() * 9 : 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s * (sp2 ? 1 : lf ? 1.66 : 1.3)}px;${sp2 ? `background-image:url(${sp2})` : lf ? `background-image:url(${LEAF_IMG[i % 5]})` : `background:${cols[i % cols.length]}`};animation-duration:${(lf ? 11 : 9) + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s;opacity:${0.55 + Math.random() * 0.35}`;
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
      const last = {}; let counting = false, played = false;
      const calc = () => { const d = Math.max(0, target - Date.now()); return { d: Math.floor(d / 864e5), h: Math.floor(d / 36e5) % 24, m: Math.floor(d / 6e4) % 60, s: Math.floor(d / 1e3) % 60 }; };
      const put = (k, n, tick) => { const el = $(`[data-k=${k}]`, box); const t = k === 'd' ? String(n) : pad(n); if (last[k] !== t) { el.textContent = t; if (tick && last[k] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } last[k] = t; } };
      // detik SELALU mengikuti jam asli (tidak pernah ikut dihitung naik) -> tidak ada lonjakan aneh di awal
      const upd = () => { const v = calc(); put('s', v.s, true); if (counting) return; put('d', v.d, false); put('h', v.h, true); put('m', v.m, true); };
      // hari/jam/menit naik halus dari 0 ke nilai asli, SEKALI SAJA saat pertama terlihat (dulu terulang tiap kali discroll & detik ikut berlari 0→59)
      cdsRun = () => {
        if (played) return; played = true;
        if (reduce) return;
        counting = true; const t0 = performance.now(), D = 1100;
        const step = (now) => {
          const p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3), v = calc();
          ['d', 'h', 'm'].forEach((k) => put(k, Math.round(v[k] * e), false));
          if (p < 1) requestAnimationFrame(step); else { counting = false; upd(); }
        };
        requestAnimationFrame(step);
      };
      // ketukan selaras batas detik asli (setInterval 1000 ms melenceng -> detik kadang terlewat / dobel)
      const loop = () => { upd(); cdsTimer = setTimeout(loop, 1000 - (Date.now() % 1000) + 15); };
      loop();
    }
    // save the date
    const sd = $('#saveDate');
    if (sd) {
      const fmt = (s) => { const d = new Date(s); if (isNaN(d)) return ''; return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`; };
      const s = fmt(c.general.eventDate), e = fmt(c.general.eventEnd) || s;
      sd.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(c.general.calendarTitle)}&dates=${s}/${e}&location=${encodeURIComponent(c.general.eventLocation)}&details=${encodeURIComponent(c.general.description)}`;
    }
    // lightbox
    lbItems = (c.gallery.items || []).concat(c.gallery.sliderItems || []).map((g) => safeUrl(g.image)).filter(Boolean);
    $$('#app .gallery .gi[data-lb], #app .gallery .mi[data-lb]').forEach((g) => g.addEventListener('click', () => lbShow(+g.dataset.lb), sig));
    startSliders();

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
      let photoData = '';
      const pin = $('#wishPhoto'), prev = $('#wishPrev'), pimg = $('#wishPrevImg'), ptxt = $('#wishPhotoTxt');
      const clearPhoto = () => { photoData = ''; pin.value = ''; prev.hidden = true; pimg.removeAttribute('src'); ptxt.textContent = 'Tambah foto profil (opsional)'; };
      pin.addEventListener('change', async () => {
        const f = pin.files && pin.files[0]; if (!f) return clearPhoto();
        const m = $('#wishMsg'); m.className = 'msg'; m.textContent = 'Memproses foto…';
        try { photoData = await shrinkImage(f, 320, 0.85); pimg.src = photoData; prev.hidden = false; ptxt.textContent = 'Ganti foto profil'; m.textContent = ''; }
        catch (e) { clearPhoto(); m.className = 'msg err'; m.textContent = 'Foto tidak bisa dibaca. Gunakan JPG, PNG, atau WebP.'; }
      }, sig);
      $('#wishPrevX').addEventListener('click', clearPhoto, sig);
      wf.addEventListener('submit', async (e) => {
        e.preventDefault(); const m = $('#wishMsg'), btn = wf.querySelector('button[type=submit]'); m.className = 'msg'; m.textContent = 'Mengirim…'; btn.disabled = true;
        const r = await post('/api/wishes', { name: wf.name.value, message: wf.message.value, photoData });
        btn.disabled = false;
        if (r.ok) { m.className = 'msg'; m.textContent = ''; popup('Terima kasih, ' + wf.name.value + '!', 'Ucapan dan doa Anda telah kami terima.'); wf.message.value = ''; clearPhoto(); loadWishes(true); } else { m.className = 'msg err'; m.textContent = r.error || 'Gagal mengirim'; }
      }, sig);
      $('#wishMore').onclick = () => loadWishes(false);
      // Daftar ucapan = kotak dengan scroll sendiri (10 ucapan per muatan); sisanya dimuat otomatis saat scroll sampai dasar kotak.
      if (WTOUCH) {
        $('#wishList').classList.add('paged');
        $('#wishOpen').addEventListener('click', openWishSheet, sig);
      } else
      { const wl = $('#wishList'), mb = $('#wishMore'), touch = false; let wt = 0;
        // HP: selama kotak digulir, semua animasi latar dijeda sementara supaya scroll tidak patah-patah
        const kick = () => { if (!touch) return; window.__wlBusy = true; document.documentElement.classList.add('wl-touch'); clearTimeout(wt); wt = setTimeout(() => { window.__wlBusy = false; document.documentElement.classList.remove('wl-touch'); }, 450); };
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach((ev) => wl.addEventListener(ev, kick, { passive: true, signal: AC.signal }));
        AC.signal.addEventListener('abort', () => { window.__wlBusy = false; document.documentElement.classList.remove('wl-touch'); });
        wl.addEventListener('scroll', kick, { passive: true, signal: AC.signal });
        // roda mouse: di ujung atas/bawah daftar, scroll langsung lanjut ke halaman (tidak "macet")
        wl.addEventListener('wheel', (e) => {
          if (e.ctrlKey || wl.scrollHeight <= wl.clientHeight + 1) return;
          const top = wl.scrollTop <= 0, bot = wl.scrollTop + wl.clientHeight >= wl.scrollHeight - 1;
          if ((e.deltaY < 0 && top) || (e.deltaY > 0 && bot)) { e.preventDefault(); scrollBy(0, e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1)); }
        }, { passive: false, signal: AC.signal });
        wl.addEventListener('scroll', () => { if (!mb.hidden && wl.scrollTop + wl.clientHeight >= wl.scrollHeight - 120) loadWishes(false); }, { passive: true, signal: AC.signal }); }
      loadWishes(true);
    }
  }
  // foto profil: dipotong persegi di tengah & dikecilkan (320px, JPEG) supaya cepat terkirim & hemat penyimpanan
  function shrinkImage(file, max, q) {
    return new Promise((ok, no) => {
      if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return no(new Error('type'));
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        const side = Math.min(im.naturalWidth, im.naturalHeight), sx = (im.naturalWidth - side) / 2, sy = (im.naturalHeight - side) / 2, out = Math.min(max, side);
        const cv = document.createElement('canvas'); cv.width = out; cv.height = out;
        const cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, out, out); cx.drawImage(im, sx, sy, side, side, 0, 0, out, out);
        ok(cv.toDataURL('image/jpeg', q));
      };
      im.onerror = () => { URL.revokeObjectURL(url); no(new Error('decode')); };
      im.src = url;
    });
  }
  const wDate = (ts) => {
    const d = new Date(+ts), z = { timeZone: 'Asia/Jakarta' };
    const tgl = d.toLocaleDateString('id-ID', { ...z, day: 'numeric', month: 'long', year: 'numeric' });
    const jam = d.toLocaleTimeString('id-ID', { ...z, hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.');
    return `${tgl} · ${jam} WIB`;
  };
  // Layar sentuh (HP/tablet): scroll di dalam kotak pada halaman penuh animasi terbukti patah-patah (video: ~3 fps).
  // Solusi: di halaman hanya tampil 5 ucapan terbaru + tombol; daftar lengkap dibuka di lembar layar-penuh yang
  // bisa di-scroll dengan lancar (halaman & efek latar dimatikan sementara selama lembar terbuka).
  const WTOUCH = matchMedia('(pointer:coarse)').matches;
  const wEmpty = '<p class="wl-empty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
  const wItem = (w, i) => {
    const ph = safeUrl(w.photo), ini = esc((w.name || '?').trim().charAt(0).toUpperCase());
    return `<div class="wl-item" style="animation-delay:${Math.min(i, 6) * 0.05}s"><div class="wl-av">${ph ? `<img src="${esc(ph)}" alt="${esc(w.name)}" decoding="async" onerror="this.remove()">` : ''}<span>${ini}</span></div><div class="wl-bd"><b>${esc(w.name)}</b><small>${esc(wDate(w.ts))}</small><p>${esc(w.message)}</p></div></div>`;
  };
  async function loadWishPreview() {
    const list = $('#wishList'), pg = $('#wishPager'), ob = $('#wishOpen'); if (!list || wBusy) return; wBusy = true;
    const d = await fetch('/api/wishes?limit=5&offset=0', { cache: 'no-store' }).then((r) => r.json()).catch(() => null); wBusy = false; if (!d || !d.items) return;
    $('#stH').textContent = d.hadir; $('#stT').textContent = d.tidak; $('#stW').textContent = d.total;
    list.innerHTML = d.items.length ? d.items.map(wItem).join('') : wEmpty;
    pg.hidden = d.total <= d.items.length; ob.textContent = `Lihat Semua Ucapan (${d.total}) ›`;
  }
  function openWishSheet() {
    if ($('#wlSheet')) return;
    const sh = document.createElement('div'); sh.id = 'wlSheet'; sh.className = 'wl-sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
    sh.innerHTML = `<div class="wls-head"><span>Ucapan Tamu</span><em><b id="wlsN">${esc($('#stW').textContent)}</b> Ucapan</em><button type="button" class="wls-x" aria-label="Tutup">✕</button></div><div class="wls-list" id="wlsList"></div>`;
    document.body.appendChild(sh);
    const root = document.documentElement, ls = $('#wlsList');
    let off = 0, total = Infinity, busy = false, closed = false;
    const more = async () => {
      if (busy || closed || off >= total) return; busy = true;
      const d = await fetch(`/api/wishes?limit=10&offset=${off}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null); busy = false;
      if (closed || !d || !d.items) return;
      total = d.total; $('#wlsN').textContent = d.total; off += d.items.length;
      if (!off) ls.innerHTML = wEmpty; else ls.insertAdjacentHTML('beforeend', d.items.map(wItem).join(''));
      if (off < total && ls.scrollHeight <= ls.clientHeight + 40) more();
    };
    ls.addEventListener('scroll', () => { if (ls.scrollTop + ls.clientHeight >= ls.scrollHeight - 200) more(); }, { passive: true });
    root.classList.add('wl-sheet-on'); window.__wlBusy = true;
    try { history.pushState({ wlSheet: 1 }, ''); } catch (e) { /* */ }
    const onPop = () => close(true);
    const close = (fromPop) => {
      if (closed) return; closed = true; removeEventListener('popstate', onPop);
      sh.remove(); root.classList.remove('wl-sheet-on'); window.__wlBusy = false;
      if (!fromPop && history.state && history.state.wlSheet) history.back(); // tombol Kembali HP menutup lembar, bukan keluar dari undangan
    };
    addEventListener('popstate', onPop);
    sh.querySelector('.wls-x').addEventListener('click', () => close(false));
    more();
  }
  let wOff = 0, wBusy = false;
  async function loadWishes(reset) {
    const list = $('#wishList'); if (!list) return;
    if (WTOUCH) return loadWishPreview();
    if (wBusy && !reset) return; wBusy = true;
    if (reset) wOff = 0;
    const d = await fetch(`/api/wishes?limit=10&offset=${wOff}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => null); wBusy = false; if (!d || !d.items) return;
    if (reset) list.innerHTML = '';
    $('#stH').textContent = d.hadir; $('#stT').textContent = d.tidak; $('#stW').textContent = d.total;
    if (reset && !d.items.length) list.innerHTML = '<p class="wl-empty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
    list.insertAdjacentHTML('beforeend', d.items.map(wItem).join(''));
    wOff += d.items.length; $('#wishMore').hidden = wOff >= d.total;
    if (!$('#wishMore').hidden && list.scrollHeight <= list.clientHeight + 4) setTimeout(() => loadWishes(false), 0); // belum cukup panjang untuk di-scroll: muat lagi
  }
  async function post(url, body) {
    try { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return await r.json(); } catch (e) { return { error: 'Koneksi bermasalah' }; }
  }
})();
