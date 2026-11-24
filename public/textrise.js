/* textrise.js — Tema 13: pelengkap /textrise.css (animasi teks naik + memudar, tanpa sapuan kiri → kanan).
   Hanya memberi nomor ke elemen teks; seluruh gerak ada di CSS:
     --wi  = nomor KATA pada judul (Love Story, Our Gallery, Wedding Gift, Ucapan & Doa) → kata muncul berurutan
     --rl  = nomor BARIS pada paragraf (teks Love Story, alamat acara, teks Gallery/Gift/Ucapan) → baris muncul berurutan
     --rn  = jumlah baris alamat acara (pada .sl-ev-in) → tombol Google Maps muncul sesudah baris terakhir
   Aktif hanya di Tema 13 (<html class="h-slide">). Tidak membuat pengamat scroll sendiri, jadi tidak ada animasi dobel. */
(function () {
  'use strict';
  const de = document.documentElement;
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const SEC = '.sec:is(.gallery,.gift,.wishes)';
  const TITLES = '.sl-ch-ht,' + SEC + ' .mn-tx';
  const ROWS = '.sl-ch-tx,.sl-ev-ad,' + SEC + ' .mn-tw';

  function words() {
    $$(TITLES).forEach((t) => $$('.sl-w,.mn-w', t).forEach((w, i) => w.style.setProperty('--wi', i)));
  }

  function rows() {
    $$(ROWS).forEach((p) => {
      const ws = $$('.sl-wd,.mn-wd', p); if (!ws.length) return;
      let ln = -1, top = null;
      ws.forEach((w) => {
        const t = w.offsetTop;
        if (top === null || Math.abs(t - top) > 3) { ln++; top = t; }
        w.style.setProperty('--rl', ln);
      });
      if (p.classList.contains('sl-ev-ad')) { const ev = p.closest('.sl-ev-in'); if (ev) ev.style.setProperty('--rn', ln + 1); }
    });
  }

  function refresh() { if (!de.classList.contains('h-slide')) return; words(); rows(); }

  let t = 0;
  const later = () => { clearTimeout(t); t = setTimeout(refresh, 120); };
  addEventListener('resize', later, { passive: true });
  addEventListener('orientationchange', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  // teks dipecah / dirender ulang oleh mono.js, slide.js atau pratinjau admin → nomori ulang
  const start = () => {
    const app = document.getElementById('app'); if (!app || !('MutationObserver' in window)) return;
    new MutationObserver(later).observe(app, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.TEXTRISE = { refresh };
})();
