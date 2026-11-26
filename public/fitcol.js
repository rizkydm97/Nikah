/* fitcol.js — pelengkap /fitcol.css (Tema 13, komputer): hitung lebar kolom agar satu slide pas satu layar.
   --fitw = ceil(tinggi layar ÷ rasio kanvas). Aktif hanya bila <html class="h-slide"> dan (lebar layar ≥ 700 px atau layar mendatar); HP berdiri / pratinjau admin tidak berubah.
   Berjalan ulang saat ukuran jendela / zoom berubah (zoom Chrome mengubah innerHeight) dan saat rasio kanvas (--cvh) atau tema berganti. */
(function () {
  'use strict';
  var r = document.documentElement, last = '', key = '';
  /* v3: di HP mendatar, tinggi layar (innerHeight) berubah-ubah tiap bilah alamat Safari/Chrome naik-turun saat digeser. Dulu kolom ikut berubah
     ukuran (teks meloncat, "layar penuh" balik lagi). Sekarang dipakai tinggi TERKECIL yang pernah terlihat (bilah tampil) selama orientasi sama,
     jadi kolom tetap diam dan tidak pernah lebih tinggi dari layar. Ukuran ditiru ulang bila orientasi / lebar berubah. */
  var minH = 0, lastW = 0;
  function stableH() {
    var land = innerWidth > innerHeight, touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!land || !touch || innerHeight > 600) { minH = 0; lastW = innerWidth; return innerHeight; }
    if (!minH || Math.abs(innerWidth - lastW) > 60) { minH = innerHeight; lastW = innerWidth; }
    else if (innerHeight < minH) minH = innerHeight;
    else if (innerHeight - minH > 120) minH = innerHeight; // keyboard / mode lain berganti besar: hitung ulang
    return minH;
  }
  function calc() {
    if (!r.classList.contains('h-slide') || (innerWidth < 700 && innerWidth <= innerHeight)) return ''; // HP berdiri tidak berubah; HP mendatar ikut dihitung
    var cs = getComputedStyle(r);
    var ratio = (parseFloat(cs.getPropertyValue('--cvh')) || 780) / 390;
    var col = parseFloat(cs.getPropertyValue('--col')) || 480;
    var sh = stableH(), fw = Math.ceil(sh / ratio);
    // v4: HP mendatar (tinggi ≤ 560) — batas minimum 200 px dulu membuat kolom LEBIH TINGGI dari layar yang tampak (mis. Safari dengan bilah tab: tinggi ±283 px → kolom 200 px = kanvas 400 px).
    //     Kanvas terpotong, kartu ayat / nama / cover bertabrakan. Di HP mendatar kolom kini persis tinggi layar ÷ rasio kanvas (komputer / tablet tidak berubah: tetap min 200).
    var floor = (innerWidth > innerHeight && sh <= 560) ? 100 : 200;
    return fw < col ? Math.max(floor, fw) + 'px' : '';
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

/* v3 — nama panjang tetap muat di kolom (HP mendatar): bila satu kata nama lebih lebar dari kotaknya, ukuran huruf diperkecil seperlunya.
   Diukur langsung dari hasil gambar di peramban tamu (getBoundingClientRect), jadi benar juga di Safari iOS yang menghitung zoom berbeda. */
(function () {
  'use strict';
  var r = document.documentElement, SEL = '.sl-pp-n,.sl-ev-t,.sl-ch-t,.sl-ch-ht', busy = false, tm = 0;
  function land() { return innerWidth > innerHeight && innerHeight <= 560; }
  function fit(el) {
    el.style.removeProperty('font-size');
    if (!land()) return;
    var box = el.getBoundingClientRect().width; if (!box) return;
    var worst = 0, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = w.nextNode())) {
      var t = n.nodeValue, re = /\S+/g, m;
      while ((m = re.exec(t))) {
        var rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        var b = rg.getBoundingClientRect(); if (b.width > worst) worst = b.width;
      }
    }
    if (worst > box * 0.98) {
      var fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (fs) el.style.setProperty('font-size', Math.max(10, fs * (box * 0.96 / worst)).toFixed(2) + 'px', 'important');
    }
  }
  function run() { if (busy || !r.classList.contains('h-slide')) return; busy = true; try { document.querySelectorAll(SEL).forEach(fit); } catch (e) { /* abaikan */ } busy = false; }
  function q() { clearTimeout(tm); tm = setTimeout(run, 120); }
  addEventListener('resize', q); addEventListener('orientationchange', q); addEventListener('load', function () { q(); setTimeout(run, 1200); setTimeout(run, 3500); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(q);
  try { var a = document.getElementById('app'); if (a) new MutationObserver(q).observe(a, { childList: true, subtree: false }); } catch (e) { /* abaikan */ }
})();
