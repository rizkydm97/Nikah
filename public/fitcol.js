/* fitcol.js — pelengkap /fitcol.css (Tema 13, komputer): hitung lebar kolom agar satu slide pas satu layar.
   --fitw = ceil(tinggi layar ÷ rasio kanvas). Aktif hanya bila <html class="h-slide"> dan lebar layar ≥ 700 px (HP / pratinjau admin tidak berubah).
   Berjalan ulang saat ukuran jendela / zoom berubah (zoom Chrome mengubah innerHeight) dan saat rasio kanvas (--cvh) atau tema berganti. */
(function () {
  'use strict';
  var r = document.documentElement, last = '', key = '';
  function calc() {
    if (!r.classList.contains('h-slide') || innerWidth < 700) return '';
    var cs = getComputedStyle(r);
    var ratio = (parseFloat(cs.getPropertyValue('--cvh')) || 780) / 390;
    var col = parseFloat(cs.getPropertyValue('--col')) || 480;
    var fw = Math.ceil(innerHeight / ratio);
    return fw < col ? Math.max(200, fw) + 'px' : '';
  }
  function fit(notify) {
    var w = calc();
    if (w === last) return;
    last = w;
    if (w) r.style.setProperty('--fitw', w); else r.style.removeProperty('--fitw');
    // skala kanvas (--zs) dihitung ulang oleh themes.js saat 'resize'; bila perubahan berasal dari tema / rasio (bukan resize sungguhan), bangunkan
    if (notify) { try { dispatchEvent(new Event('resize')); } catch (e) { /* abaikan */ } }
  }
  addEventListener('resize', function () { fit(false); });
  addEventListener('orientationchange', function () { fit(false); });
  addEventListener('load', function () { fit(true); });
  try {
    new MutationObserver(function () {
      var k = r.className + '|' + r.style.getPropertyValue('--cvh') + '|' + r.style.getPropertyValue('--col');
      if (k !== key) { key = k; fit(true); }
    }).observe(r, { attributes: true, attributeFilter: ['class', 'style'] });
  } catch (e) { /* peramban lama: cukup resize / load */ }
  fit(false);
})();
