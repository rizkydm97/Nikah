/* ===================================================================
   AUTO SCROLL (Tema 13 — Slide Foto)
   - Tombol bulat (pause / panah bawah) + cincin progres halaman
   - Penggeser kecepatan vertikal dengan tombol + / − (nilai 1–100)
   - Sentuh / geser / roda mouse / tombol keyboard  => berhenti seketika
   - Tekan tombol (atau panah bawah) => lanjut scroll otomatis, mulai & berhenti dengan percepatan halus
   - Aktif/nonaktif lewat Admin → Tema 13 Slide Foto → "Auto scroll"
   Konfigurasi (cfg.slide):
     autoScroll        bool    (bawaan true)  — tampilkan fitur
     autoScrollStart   bool    (bawaan true)  — mulai sendiri setelah Buka Undangan
     autoScrollDwell   detik   (bawaan 1)     — jeda sinematik tiap kartu bertumpuk (0 = mati)
     autoScrollDelay   detik   (bawaan 0)     — jeda tambahan SETELAH animasi pembuka (nama & teks) selesai
     autoScrollSpeed   1–100   (bawaan 25)    — kecepatan awal
     autoScrollResume  detik   (bawaan 0)     — lanjut sendiri setelah tamu diam N detik (0 = tidak)
   =================================================================== */
(function () {
  'use strict';
  const D = document, de = D.documentElement;
  const STRIP_END = { slStripR2: 0.68, slStripL2: 0.68, slStripR3: 0.44, slStripL3: 0.44 };   // bagian animasi geseran foto yang benar-benar bergerak (sisanya diam)
  const PXS = 2.4;                      // 1 satuan kecepatan = 2,4 px / detik (25 ≈ 60 px/dtk, 50 ≈ 120, 70 ≈ 168, 100 = 240)
    let S = null;                         // state aktif

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => { const n = parseFloat(v); return Number.isFinite(n) ? clamp(n, a, b) : d; };
  const maxY = () => Math.max(0, Math.max(de.scrollHeight, D.body ? D.body.scrollHeight : 0) - innerHeight);
  const cy = () => window.pageYOffset || de.scrollTop || 0;

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="6.5" y="5" width="3.8" height="14" rx="1.2" fill="currentColor"/><rect x="13.7" y="5" width="3.8" height="14" rx="1.2" fill="currentColor"/></svg>';
  const ICON_DOWN = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5v12.2M6.2 12.2 12 18l5.8-5.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_UP = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 19V6.8M6.2 11.8 12 6l5.8 5.8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function teardown() {
    if (!S) return;
    S.dead = true;
    if (S.raf) cancelAnimationFrame(S.raf);
    clearTimeout(S.tDelay); clearTimeout(S.tResume); clearTimeout(S.tTip);
    S.off.forEach((f) => { try { f(); } catch (e) { /* abaikan */ } });
    if (S.mo) S.mo.disconnect();
    if (S.root && S.root.parentNode) S.root.parentNode.removeChild(S.root);
    clearTimeout(S.tHold); de.classList.remove('as-on', 'as-run', 'as-hold');
    S = null;
  }

  function setup(cfg, opt) {
    teardown();
    const s = (cfg && cfg.slide) || {};
    if (s.autoScroll === false) return;
    if (opt && opt.preview) return;                       // panel admin: jangan menggulir sendiri saat mengedit
    const rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

    const st = S = {
      dead: false, raf: 0, last: 0, pos: 0, vel: 0, run: false, target: 0, speed: clamp(Math.round(num(s.autoScrollSpeed, 25, 1, 100)), 1, 100), sync: s.autoScrollSync !== false, busyUntil: 0, slowV: 1, dwell: num(s.autoScrollDwell, 1, 0, 5) * 1000, dwellUntil: 0, cards: [], ci: 0, cT: -1e9, m: 0, mT: -1e9, lastY: -1, ringP: -1,
      resume: num(s.autoScrollResume, 0, 0, 60), tDelay: 0, tResume: 0, tTip: 0, tHold: 0, hold: false, off: [], mo: null, root: null, armed: false, userPaused: false, byTouch: false, rm,
      wantStart: s.autoScrollStart !== false && !rm, delay: num(s.autoScrollDelay, 0, 0, 60) * 1000, stopping: false, lastSet: -1,
    };

    // ---------- DOM ----------
    const host = D.getElementById('fixwrap') || D.body;
    const root = st.root = D.createElement('div');
    root.className = 'as-wrap'; root.setAttribute('data-as', '1');
    const R = 21, C = 2 * Math.PI * R;
    root.innerHTML =
      '<div class="as-tip" role="status" aria-live="polite"></div>' +
      '<button type="button" class="as-btn" aria-label="Auto scroll">' +
        '<svg class="as-ring" viewBox="0 0 50 50" aria-hidden="true"><circle class="as-ring-bg" cx="25" cy="25" r="' + R + '"/><circle class="as-ring-fg" cx="25" cy="25" r="' + R + '" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + C.toFixed(2) + '"/></svg>' +
        '<span class="as-ic"></span>' +
      '</button>' +
      '<div class="as-panel" aria-label="Kecepatan auto scroll">' +
        '<div class="as-track" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="1" aria-valuemax="100"><i class="as-fill"></i><b class="as-thumb"></b></div>' +
        '<output class="as-val"></output>' +
        '<button type="button" class="as-step as-minus" aria-label="Lebih pelan">&minus;</button>' +
        '<button type="button" class="as-step as-plus" aria-label="Lebih cepat">+</button>' +
      '</div>';
    host.appendChild(root);
    const $ = (q) => root.querySelector(q);
    const btn = $('.as-btn'), ic = $('.as-ic'), tip = $('.as-tip'), ringFg = $('.as-ring-fg'), panel = $('.as-panel');
    const track = $('.as-track'), fill = $('.as-fill'), thumb = $('.as-thumb'), val = $('.as-val');

    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); st.off.push(() => t.removeEventListener(ev, fn, o)); };
    const inUi = (e) => !!(e.target && e.target.closest && e.target.closest('[data-as]'));

    const showTip = (txt, ms) => {
      clearTimeout(st.tTip); tip.textContent = txt; root.classList.add('tip');
      st.tTip = setTimeout(() => root.classList.remove('tip'), ms || 2200);
    };
    const paintSpeed = () => {
      const p = (st.speed - 1) / 99;
      fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
      thumb.style.bottom = 'calc(' + (p * 100).toFixed(2) + '% - ' + (p * 22).toFixed(2) + 'px)';
      val.textContent = String(st.speed); track.setAttribute('aria-valuenow', String(st.speed));
    };
    const setSpeed = (v) => {
      st.speed = clamp(Math.round(v), 1, 100); paintSpeed();
    };
    const atEnd = () => cy() >= maxY() - 2;
    const paintState = () => {
      const running = st.run && !st.stopping;
      root.classList.toggle('run', running);
      de.classList.toggle('as-run', running);
      btn.setAttribute('aria-pressed', running ? 'true' : 'false');
      btn.setAttribute('aria-label', running ? 'Berhenti scroll' : 'Mulai auto scroll');
      ic.innerHTML = running ? ICON_PAUSE : (atEnd() && maxY() > 0 ? ICON_UP : ICON_DOWN);
    };
    const paintRing = (force) => {
      const m = st.m || maxY(), p = m > 0 ? clamp(cy() / m, 0, 1) : 0;
      if (!force && Math.abs(p - st.ringP) < 0.004) return;       // tulis style hanya bila berubah nyata → tidak ada repaint SVG tiap frame
      st.ringP = p; ringFg.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
    };

    // ---------- mesin gulir ----------
    // ---------- jeda sinematik: tiap kartu bertumpuk (mempelai, akad, resepsi, ayat) berhenti sejenak setelah menutup penuh ----------
    // Kartu yang sudah terlewati (sudah menempel di atas) ditandai dulu; sisanya ditunggu satu per satu.
    const restOf = (r) => Math.min(0, innerHeight - r.height);          // posisi atas kartu saat menempel & menutup layar penuh
    const syncCards = () => {
      st.cards = [...D.querySelectorAll('#app .stk-pin:not(.sl-open)')]; st.cT = performance.now();
      const i = st.cards.findIndex((c) => { const r = c.getBoundingClientRect(); return r.top > restOf(r) + 90; });
      st.ci = i < 0 ? st.cards.length : i; st.dwellUntil = 0;
    };
    const DPR = Math.max(1, window.devicePixelRatio || 1);
    const frame = (t) => {
      st.raf = 0; if (st.dead) return;
      // dt dibatasi 50 ms: bila ada frame yang tersendat, gulir tidak "melompat" mengejar ketinggalan (penyebab patah-patah di iPhone lama)
      const dt = st.last ? Math.min(0.05, Math.max(0.001, (t - st.last) / 1000)) : 0.016; st.last = t;
      // tinggi halaman di-cache (membaca scrollHeight tiap frame memaksa hitung ulang tata letak)
      if (t - st.mT > 400) { st.m = maxY(); st.mT = t; }
      // sinkron dengan animasi teks: melambat HALUS (bukan menyentak) selama ada teks/foto yang sedang muncul
      // jeda sinematik: mulai memperlambat sebelum kartu menutup penuh (jarak = kecepatan × 0,28 dtk) agar berhenti tepat di posisi tempel
      let hold = performance.now() < st.dwellUntil;
      if (st.dwell > 0 && st.run && !st.stopping && !hold) {
        if (!st.cards.length && t - st.cT > 1000) syncCards();           // bagian dirender bertahap
        const c = st.cards[st.ci];
        if (c) {
          const r = c.getBoundingClientRect();
          if (r.top <= restOf(r) + st.vel * 0.28 + 4) { st.ci++; st.dwellUntil = performance.now() + 800 + st.dwell; hold = true; }
        }
      }
      const wantSlow = st.sync && performance.now() < st.busyUntil ? 0.65 : 1;
      st.slowV += (wantSlow - st.slowV) * (1 - Math.exp(-dt / 0.7));
      st.target = st.run && !st.stopping && !hold ? st.speed * PXS * st.slowV : 0;
      // percepatan awal cepat tapi halus (±0,2 dtk), perlambatan saat dihentikan lebih panjang
      const k = st.target > st.vel ? 0.2 : 0.28;
      st.vel += (st.target - st.vel) * (1 - Math.exp(-dt / k));
      if (st.run) {
        // posisi bergeser di luar kendali kita (bilah alamat iOS naik/turun, tinggi kartu berubah setelah font/foto termuat):
        // IKUTI posisi baru, jangan berhenti. Gulir dari jari/roda/keyboard sudah ditangani langsung lewat event sentuh (berhenti seketika).
        if (st.lastSet >= 0 && Math.abs(cy() - st.lastSet) > 3) { st.pos = cy(); st.lastSet = st.pos; st.lastY = -1; }
        if (st.vel > 0.05) {
          const m = st.m;
          st.pos = Math.min(m, Math.max(0, st.pos + st.vel * dt));
          // dibulatkan ke piksel perangkat (iPhone @2x = 0,5 px) → langkah gulir rata, tidak bergantian 3px/4px
          const y = Math.round(st.pos * DPR) / DPR;
          if (y !== st.lastY) { window.scrollTo(0, y); st.lastY = y; st.lastSet = cy(); }
          if (st.pos >= m - 1) { st.run = false; st.stopping = false; st.vel = 0; paintState(); paintRing(true); showTip('Selesai', 1800); }
        }
        if (st.stopping && st.vel < 1) { st.run = false; st.stopping = false; st.vel = 0; paintState(); }
      }
      paintRing();
      if (st.run || st.vel > 0.05) st.raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (!st.raf && !st.dead) { st.last = 0; st.raf = requestAnimationFrame(frame); } };

    function start(fromUser) {
      if (st.dead || !st.armed) return;
      clearTimeout(st.tDelay); clearTimeout(st.tResume);
      if (D.hidden || D.body.classList.contains('locked')) return;
      if (maxY() <= 0) return;
      if (atEnd()) { scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
      st.m = maxY(); st.mT = performance.now();
      st.pos = cy(); st.lastSet = st.pos; st.lastY = -1; st.run = true; st.stopping = false; st.userPaused = false;
      st.slowV = 1; if (st.dwell > 0) syncCards();
      if (st.rm) st.vel = st.speed * PXS;
      else if (fromUser === 'now') st.vel = st.speed * PXS * 0.45;      // mulai otomatis setelah pembuka: langsung bergerak, tanpa jeda merangkak
      paintState(); kick(); if (fromUser !== 'silent') showTip('Berhenti Scroll');
    }
    // berhenti: now = seketika (disentuh), false/'ease' = melambat halus (tombol)
    function halt(soft, byTouch) {
      if (!st.run) { if (byTouch) st.userPaused = true; return; }
      if (soft === true) { st.stopping = true; paintState(); kick(); return; }
      st.run = false; st.stopping = false; st.vel = 0; st.userPaused = true; st.byTouch = !!byTouch;
      paintState(); showTip('Mulai Auto Scroll');
      if (byTouch && st.resume > 0) { clearTimeout(st.tResume); st.tResume = setTimeout(() => start('silent'), st.resume * 1000); }
    }
    const touchStop = (e) => {
      if (!st.armed || inUi(e)) return;
      if (st.resume > 0 && !st.run && st.byTouch) { clearTimeout(st.tResume); st.tResume = setTimeout(() => start('silent'), st.resume * 1000); }
      if (st.run) halt(false, true);
    };

    // ---------- kunci gulir selama animasi pembuka ----------
    // Setelah Buka Undangan, tamu menonton dulu animasi foto & teks pembuka: gulir sentuh / roda / keyboard ditahan sampai auto scroll siap jalan.
    // Sesudah itu tamu bebas menggulir ke atas atau ke bawah. Aman: dilepas otomatis oleh reveal() / teardown() / batas waktu.
    const holdKeys = /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/;
    const holdBlock = (e) => { if (!st.hold || inUi(e)) return; if (e.cancelable) e.preventDefault(); };
    const holdKey = (e) => { if (!st.hold || inUi(e)) return; if (holdKeys.test(e.key) && e.cancelable) e.preventDefault(); };
    const holdOn = () => {
      if (st.hold || st.dead) return;
      st.hold = true; de.classList.add('as-hold');
      on(D, 'touchmove', holdBlock, { passive: false, capture: true });
      on(D, 'wheel', holdBlock, { passive: false, capture: true });
      on(D, 'keydown', holdKey, { capture: true });
      st.tHold = setTimeout(holdOff, 65000);              // pengaman: jangan pernah terkunci selamanya
    };
    const holdOff = () => { clearTimeout(st.tHold); st.hold = false; de.classList.remove('as-hold'); };
    st.holdOff = holdOff;

    // ---------- tombol ----------
    on(btn, 'click', (e) => {
      e.stopPropagation();
      if (st.run && !st.stopping) { halt(true); showTip('Mulai Auto Scroll'); st.userPaused = true; st.byTouch = false; clearTimeout(st.tResume); }
      else start(true);
    });
    on(root.querySelector('.as-minus'), 'click', () => setSpeed(st.speed - 5));
    on(root.querySelector('.as-plus'), 'click', () => setSpeed(st.speed + 5));
    // penggeser vertikal (pointer events, tanpa <input> yang diputar)
    const fromPointer = (e) => {
      const r = track.getBoundingClientRect(), p = 1 - clamp((e.clientY - r.top - 11) / Math.max(1, r.height - 22), 0, 1);
      setSpeed(1 + p * 99);
    };
    let drag = false;
    on(track, 'pointerdown', (e) => { drag = true; try { track.setPointerCapture(e.pointerId); } catch (er) { /* abaikan */ } fromPointer(e); e.preventDefault(); });
    on(track, 'pointermove', (e) => { if (drag) fromPointer(e); });
    on(track, 'pointerup', () => { drag = false; });
    on(track, 'pointercancel', () => { drag = false; });
    on(track, 'keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { setSpeed(st.speed + 5); e.preventDefault(); e.stopPropagation(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { setSpeed(st.speed - 5); e.preventDefault(); e.stopPropagation(); }
    });

    // ---------- sentuhan tamu = berhenti ----------
    on(D, 'touchstart', touchStop, { passive: true, capture: true });
    on(D, 'pointerdown', (e) => { if (e.pointerType !== 'touch') touchStop(e); }, { passive: true, capture: true });
    on(D, 'wheel', touchStop, { passive: true, capture: true });
    on(D, 'keydown', (e) => {
      if (inUi(e)) return;
      if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/.test(e.key)) touchStop(e);
    }, { capture: true });
    on(D, 'focusin', (e) => { const t = e.target; if (st.run && t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) halt(false); });
    on(D, 'visibilitychange', () => { if (D.hidden && st.run) halt(false); });
    on(window, 'resize', () => { st.mT = -1e9; paintRing(true); });
    on(window, 'scroll', () => { if (!st.raf) paintRing(); }, { passive: true });
    // lightbox / lembar ucapan terbuka → jeda
    const lb = D.getElementById('lightbox');
    const guard = () => {
      if (!st.run) return;
      if ((lb && !lb.hidden) || de.classList.contains('wl-sheet-on')) halt(false);
    };
    st.mo = new MutationObserver(() => { guard(); arm(); });
    st.mo.observe(D.body, { attributes: true, attributeFilter: ['class'] });
    st.mo.observe(de, { attributes: true, attributeFilter: ['class'] });
    if (lb) st.mo.observe(lb, { attributes: true, attributeFilter: ['hidden', 'class'] });

    // ---------- sinkron animasi: pantau elemen yang baru "masuk" (kelas in / sl-go / on / play / shown) di dalam layar ----------
    if (st.sync) {
      const app = D.getElementById('app');
      const hit = /(^|\s)(in|sl-go|on|play|shown)(\s|$)/;
      if (app) {
        const mo3 = new MutationObserver((list) => {
          if (!st.run) return;
          for (const m of list) {
            const t = m.target, cl = t.getAttribute && t.getAttribute('class') || '';
            if (hit.test(m.oldValue || '') || !hit.test(cl)) continue;
            const r = t.getBoundingClientRect();
            if (r.height > 0 && r.bottom > 0 && r.top < innerHeight * 0.92) { st.busyUntil = performance.now() + 1900; break; }
          }
        });
        mo3.observe(app, { subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
        st.off.push(() => mo3.disconnect());
      }
    }

    // ---------- tombol baru tampil SETELAH animasi pembuka selesai (agar tidak menutupi teks nama) ----------
    function reveal() {
      if (st.dead) return;
      holdOff();
      root.classList.add('ready');
      if (st.wantStart && !st.userPaused && cy() < innerHeight * 0.6) start('now'); else showTip('Mulai Auto Scroll', 3200);
    }
    // Tunggu sampai SEMUA animasi di slide pembuka (foto bergeser, nama & teks masuk) benar-benar selesai:
    // pantau animasi CSS yang masih berjalan di dalam #s-hero (animasi tak berujung seperti melayang/kilau diabaikan),
    // lalu harus tenang ±0,5 dtk berturut-turut (ada jeda antar tahap) sebelum tombol tampil & menggulir.
    function arm() {
      if (st.armed || st.dead) return;
      if (D.body.classList.contains('locked')) return;
      st.armed = true; de.classList.add('as-on'); holdOn();
      paintSpeed(); paintState(); paintRing(true);
      const hero = D.getElementById('s-hero'), t0 = performance.now();
      const finite = (a) => { try { return isFinite(a.effect.getComputedTiming().endTime); } catch (e) { return false; } };
      const busy = () => {
        if (!hero) return false;
        if (!hero.classList.contains('done')) return true;
        if (!hero.getAnimations) return performance.now() - t0 < 20000;           // peramban lama: tunggu waktu tetap
        return hero.getAnimations({ subtree: true }).some((a) => {
          if (!(a.playState === 'running' || a.playState === 'pending') || !finite(a)) return false;
          // gerak foto pembuka sangat panjang (10–26 dtk) & hanya penghias: jangan ditunggu sampai habis.
          // Geseran foto dianggap selesai saat keyframe-nya berhenti bergerak; zoom/geser lambat sesudahnya diabaikan.
          const nm = a.animationName || '';
          if (nm === 'slPanR' || nm === 'slTileZoom' || nm === 'slTileZoom2') return false;
          const fr = STRIP_END[nm];
          if (fr) { try { const t = a.effect.getComputedTiming(); return (a.currentTime || 0) < fr * t.duration; } catch (e) { return false; } }
          return true;
        });
      };
      // Tahap terakhir pembuka = kapsul bulat (.sl-scroll) yang memudar masuk setelah tanggal & garis. Animasinya sudah terdaftar sejak
      // pembuka mulai (termasuk masa tunda-nya), jadi busy() tetap true tanpa celah sampai kapsul itu tampil penuh → tidak perlu masa
      // "tenang" tambahan. Pantau tiap 60 ms dan mulai gulir begitu selesai.
      let quiet = 0;
      const iv = setInterval(() => {
        if (st.dead) { clearInterval(iv); return; }
        const el = performance.now() - t0;
        if (busy() && el < 60000) { quiet = 0; return; }
        quiet += 60;
        if (quiet >= 60 || el >= 60000) { clearInterval(iv); if (st.delay > 0) st.tDelay = setTimeout(reveal, st.delay); else reveal(); }
      }, 60);
      st.off.push(() => clearInterval(iv));
    }
    paintSpeed(); paintState(); paintRing(true); arm();
  }

  window.AUTOSCROLL = {
    setup, teardown,
    toggle: () => { if (S && S.armed) S.root.querySelector('.as-btn').click(); },
  };
})();
