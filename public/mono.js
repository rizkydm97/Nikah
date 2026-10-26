/* Tema 12 — Monokrom: hitam putih, bersih & ringan (tanpa kupu-kupu / bunga jatuh).
   Alur: sampul foto/video layar penuh + teks beranimasi → tombol "Buka Undangan" → sampul naik →
   halaman bingkai (oval / kotak) berisi foto atau video → section lain tampil normal bernuansa hitam putih.
   Dipakai invitation.js lewat window.MONO = { cover, hero, open, deco, colors }. */
(function () {
  'use strict';
  const A = '/assets/mono/';
  const VID = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
  const ytId = (u) => (String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/) || [])[1];

  // gambar hiasan tema (menggantikan gambar bawaan Tema 1/2 pada section lain)
  const deco = { floralTop: A + 'corner-top.webp', floralBottom: A + 'corner-bottom.webp', frameArc: A + 'orn-top.webp', frameSide: A + 'orn-bottom.webp', flowers: A + 'flower-tall.webp', ornament: A + 'orn-bottom.webp', column: '' };
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
    if (VID.test(u)) return `<video class="mn-m ${cls}" src="${H.esc(u)}" muted loop playsinline ${lazy ? 'data-lp="1"' : 'autoplay'} preload="auto" disablepictureinpicture disableremoteplayback onerror="this.remove()"></video>`;
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
    const md = src ? media(H, src, key, 'mn-cv') : '';
    return `<div class="cover mono${m.grayPhoto === true ? ' gray' : ''}" id="cover">
      <div class="mn-bg${md ? '' : ' none'}"><div class="mn-kb">${md}</div></div><i class="mn-sh"></i>
      <div class="mn-top"><div class="mn-k">${chars(H, o.kicker, 38, 250)}</div></div>
      <div class="mn-nm"><span class="mn-n a">${chars(H, g, 70, 650)}</span><i class="mn-amp">&amp;</i><span class="mn-n b">${chars(H, b, 70, 1250)}</span></div>
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

  window.MONO = { cover, hero, open, deco, colors };
})();
