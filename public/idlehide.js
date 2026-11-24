/* idlehide.js — tombol melayang (auto scroll, ke atas, musik) memudar saat tamu diam ±2,5 dtk, muncul lagi saat disentuh/digulir.
   Kelas .ih-off dipasang pada tombolnya sendiri; gayanya di autoscroll.css. Gulir otomatis (html.as-run) tidak dihitung sebagai aktivitas tamu.
   ?noih di alamat = matikan fitur ini (untuk membandingkan kehalusan gulir). */
(function () {
  'use strict';
  if (/[?&]noih\b/.test(location.search)) return;
  var de = document.documentElement, IDLE_MS = 2500, t = 0, idle = false, raf = 0;
  function paint() {
    raf = 0;
    var els = document.querySelectorAll('.as-wrap,.sl-top,.music');
    for (var i = 0; i < els.length; i++) els[i].classList.toggle('ih-off', idle);
  }
  function apply() { if (!raf) raf = requestAnimationFrame(paint); }
  function sleep() { if (document.hidden) return; idle = true; apply(); }
  function wake() {
    if (idle) { idle = false; apply(); }
    clearTimeout(t); t = setTimeout(sleep, IDLE_MS);
  }
  var o = { passive: true, capture: true };
  ['touchstart', 'touchmove', 'pointerdown', 'pointermove', 'mousedown', 'wheel', 'keydown'].forEach(function (e) { document.addEventListener(e, wake, o); });
  window.addEventListener('scroll', function () { if (!de.classList.contains('as-run')) wake(); }, o);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) wake(); });
  wake();
})();
