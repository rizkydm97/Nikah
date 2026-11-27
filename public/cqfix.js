/* cqfix.js — dimuat PALING AWAL (di <head>). Mendeteksi peramban yang salah menghitung satuan cqw/cqh di dalam elemen ber-`zoom`
   (Safari / semua peramban iPhone). Kanvas slide Tema 13 diskalakan lewat `zoom` (--zs = lebar kolom ÷ 390). Di HP berdiri --zs ≈ 1 sehingga kesalahan
   tak terlihat, tetapi di HP MENDATAR --zs ≈ 0,37: huruf berbasis cqw mengecil dua kali (nama penutup kecil, \"Thank you…\" hilang),
   lebar kotak & geseran dari admin (disimpan dalam cqw) ikut menyusut (nama mempelai pecah per kata, nama cover miring/berhamburan).
   Bila terdeteksi salah → <html class=\"cq-fix\"> + window.CQFIX = true:
     • cqfix.css (dibuat tools/gen-cqfix.py) menulis ulang semua ukuran cqw/cqh dengan --cw / --ch (px kanvas, hanya diskalakan zoom SATU kali);
     • themes.js (CQ.w / CQ.h) memakai --cw / --ch untuk geseran/lebar/ukuran dari admin.
   Uji manual di peramban apa pun: tambahkan ?cqfix ke alamat (paksa hidup) atau ?nocqfix (paksa mati). */
(function () {
  'use strict';
  var r = document.documentElement, ua = navigator.userAgent || '', qs = location.search || '';
  var force = /[?&]cqfix(=1)?(&|$)/.test(qs), off = /[?&]nocqfix(&|$)/.test(qs);
  // Uji langsung: kotak 200px ber-zoom .5 berisi anak selebar 50cqw. Benar → anak = 50% kotak. Salah (zoom dihitung dua kali) → ±25%.
  function works() {
    try {
      var h = document.createElement('div'), a = document.createElement('div'), b = document.createElement('div');
      h.style.cssText = 'position:fixed;left:-9999px;top:0;width:200px;height:20px;visibility:hidden;pointer-events:none;contain:layout';
      a.style.cssText = 'container-type:inline-size;zoom:.5;width:100%;height:10px';
      b.style.cssText = 'width:50cqw;height:10px';
      a.appendChild(b); h.appendChild(a); r.appendChild(h);
      var wa = a.getBoundingClientRect().width, wb = b.getBoundingClientRect().width;
      r.removeChild(h);
      return !(wa > 0 && wb > 0 && Math.abs(wb / wa - 0.5) > 0.04);
    } catch (e) { return true; }
  }
  var okTest = works();
  var webkit = /AppleWebKit/.test(ua) && (!/Chrome\//.test(ua) || /CriOS|FxiOS|EdgiOS/.test(ua)); // Safari + semua peramban iOS
  var mq = window.matchMedia ? matchMedia('(min-aspect-ratio:1/1) and (max-height:560px)') : null; // HP mendatar
  function want() { if (off) return false; if (force || !okTest) return true; return !!(webkit && mq && mq.matches); }
  function apply() {
    var on = want();
    if (on === !!window.CQFIX && r.classList.contains('cq-fix') === on) return;
    window.CQFIX = on; r.classList.toggle('cq-fix', on);
    try { window.dispatchEvent(new Event('cqfixchange')); } catch (e) { /* abaikan */ }
  }
  window.CQFIX = false; apply();
  window.addEventListener('resize', apply); window.addEventListener('orientationchange', apply);
})();
