/* idlehide.js — tombol melayang (auto scroll, ke atas, musik) memudar saat tamu diam ±2,5 dtk, muncul lagi saat disentuh/digulir.
   Kelasnya html.ih-idle; gayanya di autoscroll.css. Gulir otomatis (html.as-run) tidak dihitung sebagai aktivitas tamu. */
(function () {
  'use strict';
  var de = document.documentElement, IDLE_MS = 2500, t = 0, idle = false;
  function sleep() { if (document.hidden) return; idle = true; de.classList.add('ih-idle'); }
  function wake() {
    if (idle) { idle = false; de.classList.remove('ih-idle'); }
    clearTimeout(t); t = setTimeout(sleep, IDLE_MS);
  }
  var o = { passive: true, capture: true };
  ['touchstart', 'touchmove', 'pointerdown', 'pointermove', 'mousedown', 'wheel', 'keydown'].forEach(function (e) { document.addEventListener(e, wake, o); });
  window.addEventListener('scroll', function () { if (!de.classList.contains('as-run')) wake(); }, o);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
  wake();
})();
