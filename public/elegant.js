/* ELEGANT ANIMATION (Tema 13) — bagian JavaScript. Seluruh gerak ada di /elegant.css; berkas ini hanya:
   1) memberi indeks BARIS pada tiap kata paragraf (--el-l) supaya teks memudar per baris (jeda 80 ms, bukan per huruf);
   2) menandai peran elemen umum di dalam .rv (judul tulisan tangan, subjudul kapital, ayat) untuk CSS;
   3) merapatkan lebar judul rata-tengah agar sapuan tulisan tangan tidak "kosong" di sisi kiri.
   Tidak membuat pengamat scroll sendiri: pemicu tetap pengamat bawaan (.sl-go / .in / .mn-go), jadi tidak ada animasi dobel.
   Aktif hanya bila <html class="h-slide" data-anim-style="elegant">. Gaya lama tidak disentuh. */
(function () {
  'use strict';
  const de = document.documentElement;
  const active = () => de.classList.contains('h-slide') && de.dataset.animStyle === 'elegant';
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const SCRIPT = /Great Vibes|Allura|Parisienne|Pinyon|Dancing|Delafield|Muellerhoff|Doulaise|Allison|Aurore|Italianno|Whisper|Vivaldi|cursive/i;
  const ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const PARA = '.sl-cv-tx,.sl-pp-p,.qt,.sl-ev-ad,.sl-cl-tx,.sl-ch-tx,.mn-tw';
  const SKIP = '.gi,.mi,.pho,.cpho,.vid,.half,.gslider,.gun-s,.mn-tx,.mn-tw,.btn,button,[data-copy]';
  const SIMPLE = /^(BR|SPAN|B|I|EM|STRONG|SMALL|U)$/;

  function lines() {
    $$(PARA).forEach((p) => {
      const ws = $$('.sl-wd,.mn-wd', p); if (!ws.length) return;
      let ln = -1, top = null;
      ws.forEach((w) => { const t = w.offsetTop; if (top === null || Math.abs(t - top) > 3) { ln++; top = t; } w.style.setProperty('--el-l', ln); });
    });
  }

  function fit() {
    $$('.sl-ch-ht,.mn-tx,[data-el="title"]').forEach((el) => {
      const cs = getComputedStyle(el); if (cs.display !== 'block') { el.removeAttribute('data-el-fit'); return; }
      const a = cs.textAlign; if (a === 'center') el.dataset.elFit = 'c'; else if (a === 'right' || a === 'end') el.dataset.elFit = 'r'; else el.removeAttribute('data-el-fit');
    });
  }

  function role(el) {
    const txt = (el.textContent || '').trim(); if (!txt || txt.length > 140) return '';
    const cs = getComputedStyle(el);
    if (el.matches('.qar,[lang="ar"]') || (ARABIC.test(txt) && (txt.match(ARABIC) || []).length >= txt.replace(/\s/g, '').length * 0.4)) return 'quran';
    if (txt.length <= 60 && SCRIPT.test(cs.fontFamily)) return 'title';
    const up = cs.textTransform === 'uppercase' || (txt === txt.toUpperCase() && /[A-Z]{2}/.test(txt) && !/\d{4,}/.test(txt));
    if (up && txt.length <= 70) return 'caps';
    return '';
  }

  function tag() {
    $$('#app .rv').forEach((rv) => {
      const cand = [rv, ...$$('div,p,span,h1,h2,h3,h4,b,small', rv)];
      cand.forEach((el) => {
        if (el.dataset.el !== undefined && el.dataset.el !== '') return;
        if (el.matches(SKIP) || el.closest('.btn,button,[data-copy],.mn-tx,.mn-tw,.sl-s,.sl-open')) return;
        if (!(el.children.length === 0 || [...el.children].every((c) => SIMPLE.test(c.tagName)))) return;
        const r = role(el); if (r) el.dataset.el = r;
      });
    });
  }

  let t = 0;
  function refresh() {
    if (!active()) { $$('[data-el]').forEach((e) => e.removeAttribute('data-el')); $$('[data-el-fit]').forEach((e) => e.removeAttribute('data-el-fit')); return; }
    tag(); fit(); lines();
  }
  const later = () => { clearTimeout(t); t = setTimeout(refresh, 120); };

  addEventListener('resize', later, { passive: true });
  addEventListener('orientationchange', later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  window.ELEGANT = { refresh, active };
})();
