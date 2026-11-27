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
  var r = document.documentElement, SEL = '.sl-ev-t,.sl-ch-t,.sl-ch-ht' /* v6: .sl-pp-n dikeluarkan: ukurannya mengecil salah di iPhone mendatar (diukur ulang di bawah) */, busy = false, tm = 0;
  function land() { return innerWidth > innerHeight && innerHeight <= 560; }
  function fit(el) {
    el.style.removeProperty('font-size');
    if (!land()) return;
    var box = el.getBoundingClientRect().width; if (!box) return;
    // v5: kotak hasil geser/lebar dari admin bisa sempit; yang dijaga adalah kolom (induk), bukan kotak itu → ukuran huruf tidak ikut menciut dibanding laptop
    var pr = el.parentElement ? el.parentElement.getBoundingClientRect().width : 0; if (pr) box = Math.max(box, pr * 0.86);
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


/* v6 — nama mempelai (HP mendatar): pastikan ujung tulisan nama SEJAJAR dengan teks "Putri Ke-2 dari…" di bawahnya (seperti di laptop).
   Di iPhone (Chrome/Safari) mendatar nama bisa tergeser dari tepi kolom karena peramban menghitung zoom berbeda. Penyebabnya tak bisa diukur di sini,
   jadi koreksinya DIUKUR LANGSUNG dari hasil gambar: selisih tepi nama vs tepi teks orang tua → digeser lewat `left` sampai sejajar (maks 3 putaran).
   Tambahkan ?dbg ke alamat untuk menampilkan angka ukur di layar (bantu diagnosa). */
(function () {
  'use strict';
  var r = document.documentElement, tm = 0, dbg = /[?&]dbg(=|&|$)/.test(location.search), box = null, info = {};
  function land() { return innerWidth > innerHeight && innerHeight <= 560; }
  function ext(el) { // tepi kiri / kanan tulisan yang benar-benar tergambar (per kata, bukan kotaknya)
    var l = 1e9, rr = -1e9, w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false), n;
    while ((n = w.nextNode())) {
      if (!/\S/.test(n.nodeValue)) continue;
      var rg = document.createRange(); rg.selectNodeContents(n);
      var rs = rg.getClientRects();
      for (var i = 0; i < rs.length; i++) { if (rs[i].width < 1) continue; if (rs[i].left < l) l = rs[i].left; if (rs[i].right > rr) rr = rs[i].right; }
    }
    return rr > l ? { l: l, r: rr } : null;
  }
  function zs() { return parseFloat(r.style.getPropertyValue('--zs')) || 1; }
  function fix(n) {
    var inn = n.parentElement, par = inn && inn.querySelector('.sl-pp-p');
    if (!inn || !par) return;
    var right = inn.classList.contains('al-right'), left = !right && !inn.classList.contains('al-center');
    n.style.removeProperty('left');
    var a = ext(n), b = ext(par); info.n = a; info.p = b;
    if (!a || !b || (!right && !left)) return;
    var z = zs(), gap = 8 * z;
    var want = function (x) { return right ? (b.r - gap) - x.r : (b.l - 0) - x.l; };
    var d0 = want(a), thr = (right ? 2 : 14) * z;
    info.d0 = d0;
    if (Math.abs(d0) < thr) return;
    var x1 = d0 / z, setL = function (v) { n.style.setProperty('position', 'relative', 'important'); n.style.setProperty('left', v.toFixed(2) + 'px', 'important'); };
    setL(x1); var d1 = want(ext(n) || a); info.d1 = d1;
    if (Math.abs(d1) < thr) return;
    var gain = (d0 - d1) / x1;
    if (gain > 0.05) { var x2 = Math.max(-300, Math.min(300, x1 + d1 / gain)); setL(x2); info.d2 = want(ext(n) || a); info.x = x2; }
    else n.style.removeProperty('left');
  }
  function run() {
    if (!r.classList.contains('h-slide')) return;
    try {
      var ns = document.querySelectorAll('.sl-pp-n');
      if (!land()) { ns.forEach(function (n) { n.style.removeProperty('left'); }); }
      else ns.forEach(fix);
      if (dbg) show();
    } catch (e) { /* abaikan */ }
  }
  function show() {
    var n = document.querySelector('.sl-pp.b .sl-pp-n') || document.querySelector('.sl-pp-n'); if (!n) return;
    if (!box) { box = document.createElement('pre'); box.style.cssText = 'position:fixed;left:4px;top:4px;z-index:2147483647;margin:0;padding:6px;background:rgba(0,0,0,.8);color:#0f0;font:10px/1.3 monospace;max-width:60vw;white-space:pre-wrap;pointer-events:none'; document.body.appendChild(box); }
    var cs = getComputedStyle(n), rc = n.getBoundingClientRect(), f = function (v) { return v == null ? '-' : (typeof v === 'number' ? v.toFixed(1) : v); };
    box.textContent = ['win ' + innerWidth + 'x' + innerHeight, 'zs ' + r.style.getPropertyValue('--zs') + ' fitw ' + r.style.getPropertyValue('--fitw'), 'cls ' + r.className.replace(/\s+/g, ','),
      'fs ' + cs.fontSize + ' inl[' + n.getAttribute('style') + ']', 'rect w ' + f(rc.width) + ' l ' + f(rc.left) + ' r ' + f(rc.right),
      'txt ' + (info.n ? f(info.n.l) + '..' + f(info.n.r) : '-') + ' par ' + (info.p ? f(info.p.l) + '..' + f(info.p.r) : '-'),
      'd0 ' + f(info.d0) + ' d1 ' + f(info.d1) + ' d2 ' + f(info.d2) + ' x ' + f(info.x)].join('\n');
  }
  function q() { clearTimeout(tm); tm = setTimeout(run, 150); }
  addEventListener('resize', q); addEventListener('orientationchange', q);
  addEventListener('load', function () { q(); setTimeout(run, 1000); setTimeout(run, 2500); setTimeout(run, 5000); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(q);
  try { var a = document.getElementById('app'); if (a) new MutationObserver(q).observe(a, { childList: true, subtree: false }); } catch (e) { /* abaikan */ }
})();
