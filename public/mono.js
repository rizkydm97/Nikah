/* Tema 12 — Monokrom: hitam putih, bersih & ringan (tanpa kupu-kupu / bunga jatuh).
   Alur: sampul foto/video layar penuh + teks beranimasi → tombol "Buka Undangan" → sampul naik →
   halaman bingkai (oval / kotak) berisi foto atau video → section lain tampil normal bernuansa hitam putih.
   Dipakai invitation.js lewat window.MONO = { cover, hero, open, deco, colors }. */
(function () {
  'use strict';
  const A = '/assets/mono/';
  const CQ = window.CQ || { w: (n) => n + 'cqw', h: (n) => n + 'cqh' };
  const VID = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
  const ytId = (u) => (String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1];

  // gambar hiasan tema (menggantikan gambar bawaan Tema 1/2 pada section lain)
  const deco = { floralTop: A + 'corner-top.webp', floralBottom: A + 'corner-bottom.webp', frameArc: A + 'orn-top.webp', frameSide: A + 'orn-bottom.webp', flowers: A + 'flower-tall.webp', ornament: A + 'orn-bottom.webp', column: '',
    // bunga hitam putih mewah per bagian (gambar sudut/garis tinta bertransparansi) — dipilih otomatis bila gambar bagian itu masih bawaan tema
    galTop: A + 'lux-gal-top.webp', galBot: A + 'lux-gal-bot.webp', storyBot: A + 'lux-story-bot.webp', clTop: A + 'lux-cl-top.webp', clBot: A + 'lux-cl-bot.webp' };
  const colors = { primary: '#111111', accent: '#111111', rose: '#222222', gold: '#8c8c8c', paper: '#ffffff', ink: '#111111', body: '#3d3d3d', sideBg: '#e6e6e6',
    fontDisplay: 'Cormorant Garamond', fontHeading: 'Cormorant Garamond', fontBody: 'Poppins', fontScript: 'Great Vibes' };

  // teks dipecah per huruf (kata tidak terputus) agar bisa dianimasikan satu per satu
  function chars(H, s, step, start) {
    let n = 0; step = step || 45; start = start || 0;
    return String(s == null ? '' : s).split(/(\s+)/).map((w) => /^\s+$/.test(w) || !w ? ' '
      : `<span class="mn-w">${[...w].map((c) => `<span class="mn-c" style="--d:${start + (n++) * step}ms">${H.esc(c)}</span>`).join('')}</span>`).join('');
  }

  // foto / video / YouTube; foto memakai posisi & zoom dari admin ("Atur posisi")
  function media(H, o, k, cls, lazy) {
    const u = H.safeUrl(o && o[k]); if (!u) return '';
    const id = ytId(u);
    if (id) { const yu = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&modestbranding=1&rel=0&disablekb=1`; return `<iframe class="mn-m mn-yt ${cls}" ${lazy ? `data-src="${yu}"` : `src="${yu}"`} allow="autoplay; encrypted-media" tabindex="-1" title="" loading="lazy"></iframe>`; }
    if (VID.test(u)) return `<video class="mn-m ${cls}" src="${H.esc(u)}" muted loop playsinline ${lazy ? 'data-lp="1" preload="metadata"' : 'autoplay preload="auto"'} disablepictureinpicture disableremoteplayback onerror="this.remove()"></video>`;
    return `<img class="mn-m ${cls}" src="${H.esc(u)}" alt="${H.esc(H.alt || '')}" decoding="async" style="${H.adj(o, k)}">`;
  }

  function split(names) {
    const n = String(names || '').split('&').map((x) => x.trim()).filter(Boolean);
    return n.length >= 2 ? [n[0], n[1]] : [n[0] || '', ''];
  }

  // ---------- sampul ----------
  function cover(H) {
    const C = H.C, o = C.cover, m = C.mono || {}, [g, b] = split(o.names);
    const src = m.coverMedia ? m : (H.safeUrl(o.photo) && !/\/assets\/default\//.test(o.photo) ? o : null);
    const key = src === m ? 'coverMedia' : 'photo';
    let md = src ? media(H, src, key, 'mn-cv') : '';
    const poster = H.safeUrl(m.coverPoster);
    if (poster && /^<video /.test(md)) md = md.replace('<video ', `<video poster="${H.esc(poster)}" `); // foto tampil seketika, video menyusul
    // posisi teks cover diatur dari admin (Cover → Posisi teks); nilai di luar batas dipaksa masuk agar teks tidak hilang
    const num = (v, d, lo, hi) => { const n = (v === '' || v == null) ? NaN : +v; return isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };
    const al = ['center', 'left', 'right', 'one'].includes(m.nameAlign) ? m.nameAlign : 'stagger';
    const P = m.pos && typeof m.pos === 'object' ? m.pos : {};
    const pv = ['a', 'm', 'b', 'k', 'o'].map((id) => { const p = P[id] || {}, x = num(p.x, 0, -100, 100), y = num(p.y, 0, -100, 100); return x || y ? `--${id}x:${CQ.w(x)};--${id}y:${CQ.h(y)}` : ''; }).filter(Boolean).join(';');
    const vars = `--ng:${num(m.nameGap, 0, -60, 100) / 100}em;${pv ? pv + ';' : ''}--nmY:${CQ.h(num(m.nameY, 15, 0, 80))};--nmS:${num(m.nameSize, 100, 40, 140) / 100};--kY:${CQ.h(num(m.kickerY, 7.5, 1, 85))};--bY:${CQ.h(num(m.bottomY, 5.5, 1, 60))};--shd:${num(m.shade, 100, 0, 200) / 100}`;
    return `<div class="cover mono${m.grayPhoto === true ? ' gray' : ''}" id="cover" style="${vars}">
      <div class="mn-bg${md ? '' : ' none'}"><div class="mn-kb">${md}</div></div><i class="mn-sh"></i>
      <div class="mn-top"><div class="mn-k">${chars(H, o.kicker, 38, 250)}</div></div>
      <div class="mn-nm al-${al}"><span class="mn-n a">${chars(H, g, 70, 650)}</span><i class="mn-amp">&amp;</i><span class="mn-n b">${chars(H, b, 70, 1250)}</span></div>
      <div class="mn-bot">
        <div class="mn-date">${H.esc(C.hero.dateText)}</div>
        <div class="mn-to"><span>${H.esc(o.toLabel)}</span><b>${H.esc(H.guest || o.defaultGuest)}</b></div>
        <button class="mn-btn" id="openBtn" type="button">${H.icon}${H.esc(o.button)}</button>
      </div></div>`;
  }

  // ---------- halaman bingkai (hero) ----------
  function hero(H) {
    const C = H.C, h = C.hero, m = C.mono || {}, shape = ['oval', 'circle', 'full'].includes(m.frameStyle) ? m.frameStyle : 'rect';
    const src = m.frameMedia ? m : (H.safeUrl(C.cover.photo) && !/\/assets\/default\//.test(C.cover.photo) ? C.cover : null);
    const md = src ? media(H, src, src === m ? 'frameMedia' : 'photo', 'mn-fm', true) : '';
    const mono = `<div class="mh-mono"><span>${H.esc((h.groom || '♥')[0])}</span><i>&amp;</i><span>${H.esc((h.bride || '')[0] || '')}</span></div>`;
    const ha = ((C.sections || []).find((x) => x.id === 'hero') || {}).anim || 'soft';
    return `<section class="sec hero mono-hero pre${shape === 'full' ? ' full' : ''}${m.grayPhoto === true ? ' gray' : ''}" id="s-hero" data-ha="${H.esc(ha)}"><div class="mh-in">
      <div class="mh-k">${chars(H, h.kicker, 40, 500)}</div>
      <div class="mh-frame ${shape}">
        <div class="mh-ph">${md || mono}</div>
        ${shape === 'full' ? '' : `<div class="mh-ring">
          ${shape === 'oval' ? `<img class="mh-ov" src="${A}oval.webp" alt="" decoding="async">` : ''}
          ${shape === 'rect' ? ['tl', 'tr', 'bl', 'br'].map((q, i) => `<img class="mh-cr cq-${q}" style="--cd:${(1 + i * 0.14).toFixed(2)}s" src="${A}rose-corner.webp" alt="" decoding="async">`).join('') : `<img class="mh-fl a" src="${A}sprig-tall.webp" alt="" decoding="async"><img class="mh-fl b" src="${A}sprig-arc.webp" alt="" decoding="async">`}
        </div>`}
      </div>
      <h1 class="mh-names"><span class="mh-n">${chars(H, h.groom, 60, 1100)}</span><i class="mh-amp">&amp;</i><span class="mh-n">${chars(H, h.bride, 60, 1500)}</span></h1>
      <img class="mh-orn" src="${A}orn-bottom.webp" alt="" decoding="async">
      <div class="mh-date">${H.esc(h.dateText)}</div><div class="mh-tag">${H.esc(h.hashtag)}</div>
      <div class="mh-scroll" aria-hidden="true"><i></i></div></div></section>`;
  }

  // ---------- buka undangan: sampul naik, halaman bingkai muncul ----------
  function open(X) {
    const { cover: cv, hero: hr, D, instant, unlock, finish, later } = X;
    const play = () => { hr.classList.remove('pre'); hr.classList.add('play'); };
    if (instant || !cv) { if (cv) cv.remove(); hr.classList.add('instant'); play(); hr.classList.add('done', 'shown'); unlock(); finish(); return; }
    cv.classList.add('mn-out'); cv.style.setProperty('--mo', (1.25 * D).toFixed(2) + 's');
    later(play, 350 * D);
    unlock();
    later(() => { cv.remove(); hr.classList.add('done', 'shown'); finish(); }, 1350 * D);
  }

  // video / YouTube di bingkai pembuka baru diputar SETELAH undangan dibuka (saat foto mulai muncul), dari awal — bukan sejak halaman dimuat
  function startMedia(hero) {
    const tk = parseFloat(getComputedStyle(hero).getPropertyValue('--tk')) || 1;
    const wait = hero.classList.contains('instant') || hero.classList.contains('full') ? 0 : 1700 * tk;
    clearTimeout(hero._mt);
    const go = () => {
      if (!hero.classList.contains('play')) return;
      hero.querySelectorAll('video[data-lp]').forEach((v) => { try { v.currentTime = 0; } catch (e) { /* belum siap */ } const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); });
      hero.querySelectorAll('iframe[data-src]').forEach((f) => { if (f.getAttribute('src') !== f.dataset.src) f.setAttribute('src', f.dataset.src); });
    };
    if (wait) hero._mt = setTimeout(go, wait); else go();
  }
  function stopMedia(hero) { clearTimeout(hero._mt); hero.querySelectorAll('video[data-lp]').forEach((v) => { try { v.pause(); } catch (e) { /* abaikan */ } }); }
  if (window.MutationObserver && document.body) {
    new MutationObserver((ms) => ms.forEach((m) => {
      const t = m.target;
      if (!t || t.id !== 's-hero' || !t.classList || !t.classList.contains('mono-hero')) return;
      const on = t.classList.contains('play');
      if (on && !t._pl) { t._pl = true; startMedia(t); } else if (!on && t._pl) { t._pl = false; stopMedia(t); }
    })).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }


  // teks dipecah per kata (baris baru dipertahankan) -> naik halus satu per satu
  function words(H, s, step, start) {
    let n = 0; step = step || 34; start = start || 0;
    return String(s == null ? '' : s).split('\n').map((ln) => ln.split(/\s+/).filter(Boolean)
      .map((w) => `<span class="mn-wd" style="--d:${start + (n++) * step}ms">${H.esc(w)}</span>`).join(' ')).join('<br>');
  }

  // ---------- animasi teks section lain (Wedding Gift, RSVP, Our Gallery, dst.) ----------
  // judul -> per huruf · paragraf -> per kata · nama mempelai -> per huruf. Memakai IntersectionObserver sendiri,
  // jadi tidak bergantung pada kelas .rv (judul kapsul "Wedding Gift" memang bukan .rv).
  const TITLE = '.sec:not(.hero):not(.closing) h2, .sec:not(.hero):not(.closing) h3.gt, .couple .rv.script';
  const BODY = '.cap-in p.gi, .lead, .sub, .qt, .src, .wtxt, .live-in > p, .gpanel > p, .couple .rv.fn, .couple .rv.par, .cap-in .place, .cap-in .addr';
  let fxIO = null;
  function splitText(el, mode) {
    if (!el || el.dataset.mnx) return; el.dataset.mnx = mode;
    const rev = (el.closest('.rv') || el) !== el || el.classList.contains('rv');
    let n = 0;
    const step = mode === 'c' ? 52 : Math.max(16, Math.min(38, 1100 / Math.max(1, (el.textContent || '').trim().split(/\s+/).length)));
    const walk = (node) => {
      [...node.childNodes].forEach((ch) => {
        if (ch.nodeType === 3) {
          const t = ch.textContent; if (!t.trim()) return;
          const f = document.createDocumentFragment(), tmp = document.createElement('span');
          tmp.innerHTML = t.split(/(\s+)/).map((w) => /^\s+$/.test(w) || !w ? ' ' : mode === 'c'
            ? `<span class="mn-w">${[...w].map((c) => `<span class="mn-c" style="--d:${(n++) * step}ms">${c.replace(/[<>&]/g, (x) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[x]))}</span>`).join('')}</span>`
            : `<span class="mn-wd" style="--d:${(n++) * step}ms">${w.replace(/[<>&]/g, (x) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[x]))}</span>`).join('');
          while (tmp.firstChild) f.appendChild(tmp.firstChild); ch.replaceWith(f);
        } else if (ch.nodeType === 1 && !/^(BR|SVG|IMG|SCRIPT|STYLE|INPUT|BUTTON)$/i.test(ch.tagName)) walk(ch);
      });
    };
    walk(el); el.classList.add(mode === 'c' ? 'mn-tx' : 'mn-tw'); if (rev) el.classList.add('mn-in-rv');
  }
  function fx(root) {
    root = root || document.getElementById('app'); if (!root) return;
    if (fxIO) { fxIO.disconnect(); fxIO = null; }
    const arabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    root.querySelectorAll(TITLE).forEach((e) => { if (!arabic.test(e.textContent)) splitText(e, 'c'); });
    root.querySelectorAll(BODY).forEach((e) => { if (!arabic.test(e.textContent) && !e.classList.contains('qar')) splitText(e, 'w'); });
    const els = root.querySelectorAll('.mn-tx, .mn-tw');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) { els.forEach((e) => e.classList.add('mn-go')); return; }
    fxIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('mn-go'); fxIO.unobserve(e.target); } }), { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
    els.forEach((e) => fxIO.observe(e));
  }

  // ---------- penutup "Terima Kasih": diputar ulang tiap kali bagian ini masuk layar ----------
  let clIO = null;
  function closingFx(root) {
    root = root || document.getElementById('app'); if (!root) return;
    if (clIO) { clIO.disconnect(); clIO = null; }
    const cl = root.querySelector('.mn-closing'); if (!cl) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) { cl.classList.add('mc-go'); return; }
    clIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.intersectionRatio >= 0.3) e.target.classList.add('mc-go'); else if (e.intersectionRatio === 0) e.target.classList.remove('mc-go');
    }), { threshold: [0, 0.3] });
    clIO.observe(cl);
  }

  // hiasan Tema 12 yang dipakai section lain (sebagian dipanggil lewat CSS, tidak terlihat di DOM saat loader) — ikut dimuat sebelum undangan dibuka
  const assets = ['corner-top', 'corner-bottom', 'flower-tall', 'lux-cl-bot', 'lux-cl-top', 'lux-gal-bot', 'lux-gal-top', 'lux-story-bot', 'orn-bottom', 'orn-top', 'oval', 'rose-corner', 'sprig-arc', 'sprig-tall'].map((n) => A + n + '.webp');

  // ---------- pratinjau admin: teks cover bisa digeser (drag) langsung; hasil dikirim ke admin sebagai mono.pos ----------
  // a = nama pria, m = tanda &, b = nama wanita, k = teks kecil atas, o = blok bawah (tanggal, tamu, tombol). Satuan: % lebar (x) & % tinggi (y).
  function drag(cv, pos0, done) {
    if (!cv || cv._mnDrag) return; cv._mnDrag = true;
    const K = { a: '.mn-n.a', m: '.mn-amp', b: '.mn-n.b', k: '.mn-top', o: '.mn-bot' };
    const pos = JSON.parse(JSON.stringify(pos0 && typeof pos0 === 'object' ? pos0 : {}));
    const put = (id) => { const p = pos[id] || { x: 0, y: 0 }; cv.style.setProperty(`--${id}x`, CQ.w(p.x)); cv.style.setProperty(`--${id}y`, CQ.h(p.y)); };
    cv.classList.add('mn-edit');
    cv.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || e.target.closest('button')) return;
      const el = e.target.closest(Object.values(K).join(',')); if (!el) return;
      const id = Object.keys(K).find((k) => el.matches(K[k])), r = cv.getBoundingClientRect(), p0 = pos[id] || { x: 0, y: 0 }, x0 = e.clientX, y0 = e.clientY;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ }
      el.classList.add('mn-dragging');
      const mv = (ev) => { pos[id] = { x: +(p0.x + (ev.clientX - x0) / r.width * 100).toFixed(2), y: +(p0.y + (ev.clientY - y0) / r.height * 100).toFixed(2) }; put(id); };
      const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.classList.remove('mn-dragging'); done(JSON.parse(JSON.stringify(pos))); };
      el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }

  window.MONO = { cover, hero, open, deco, colors, chars, words, fx, closingFx, assets, drag };
})();
