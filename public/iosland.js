/* iosland.js — iPhone (Safari & semua peramban iPhone) saat DIMIRINGKAN: undangan tidak ditampilkan mendatar, melainkan meminta HP
   diputar tegak (potret). Penyebab: Safari iPhone mendatar menghitung ulang satuan & lebar teks di dalam kanvas ber-zoom sehingga nama
   mempelai, ayat, dan terjemahan bisa berhamburan / saling menimpa; layar mendatar iPhone juga hanya ±340 px tinggi sehingga tidak nyaman dibaca.
   Safari tidak mengizinkan halaman mengunci orientasi, jadi yang bisa dilakukan hanya menutup layar dengan petunjuk putar.
   Hanya iPhone / iPod (tinggi layar mendatar ≤ 560 px). iPad, Android, laptop TIDAK berubah. */
(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  if (!/iPhone|iPod/.test(ua)) return;
  var r = document.documentElement, el = null;
  var css = '.ios-rot{display:none;touch-action:none;position:fixed;inset:0;z-index:2147483000;background:#111;color:#fff;align-items:center;justify-content:center;flex-direction:row;gap:22px;padding:0 28px;box-sizing:border-box;font-family:system-ui,-apple-system,sans-serif;text-align:left}' +
    '@media (min-aspect-ratio:1/1) and (max-height:560px){.ios-rot{display:flex}}' +
    '.ios-rot svg{flex:none;width:64px;height:64px;fill:none;stroke:#fff;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;animation:iosRot 2.6s ease-in-out infinite}' +
    '.ios-rot b{display:block;font-size:17px;font-weight:600;letter-spacing:.01em}' +
    '.ios-rot span{display:block;margin-top:6px;font-size:13px;line-height:1.5;opacity:.75;max-width:300px}' +
    '@keyframes iosRot{0%,15%{transform:rotate(-90deg)}55%,100%{transform:rotate(0)}}' +
    '@media (prefers-reduced-motion:reduce){.ios-rot svg{animation:none}}';
  function build() {
    if (el || !document.body) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    el = document.createElement('div'); el.className = 'ios-rot'; el.setAttribute('role', 'alert');
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.8h2"/></svg>' +
      '<div><b>Putar HP Anda ke posisi tegak</b><span>Undangan ini paling nyaman dilihat dalam posisi potret. Matikan kunci rotasi layar bila tidak berputar otomatis.</span></div>';
    document.body.appendChild(el);
  }
  // tampil/sembunyi diatur murni oleh CSS (media query mendatar + tinggi ≤ 560 px), jadi tak bergantung pada class <html> yang bisa ditimpa skrip lain
  if (document.body) build(); else document.addEventListener('DOMContentLoaded', build);
})();
