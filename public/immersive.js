/* Imersif Tema 3-8: suara suasana (sintesis WebAudio, tanpa file), sentuhan interaktif, lapisan depan parallax scroll,
   tirai kabut antar bagian, nama tamu di dalam dunia, dan suasana siang/malam. Berdiri sendiri; tidak mengubah invitation.js. */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const SP = (n) => '/assets/t/spr/' + n + '.webp';
  const THEMES = {
    princess: { fg: ['rose1', 'rose2', 'rose1'], cl: 'cloudp3', col: '#ffc2dc', snd: { wind: 420, bell: { sc: [0, 2, 4, 7, 9], base: 880, gap: [1.6, 4], g: .05, k: 'bell' } } },
    bali:     { fg: ['frangi1', 'frangi2', 'frangi1'], cl: 'cloudw1', col: '#ffe29a', snd: { wind: 520, bird: 1, bell: { sc: [0, 2, 5, 7, 10], base: 392, gap: [1.2, 3], g: .06, k: 'gam' } } },
    emas:     { fg: ['frangi1', 'frangi2', 'frangi1'], cl: '', col: '#ffd36a', snd: { wind: 360, bell: { sc: [0, 2, 5, 7, 10], base: 330, gap: [2, 4.5], g: .06, k: 'gam' } } },
    biru:     { fg: ['frangi1', 'bf_silver', 'frangi1'], cl: 'cloudb', col: '#9fd0ff', snd: { water: 1100, bell: { sc: [0, 3, 5, 7, 10], base: 523, gap: [3, 6.5], g: .035, k: 'bell' } } },
    rimba:    { fg: ['bf_blue1', 'bf_blue2', 'bf_blue1'], cl: 'cloudb', col: '#c8e0ff', snd: { wind: 300, cricket: 1, bell: { sc: [0, 3, 7, 10], base: 262, gap: [4, 8], g: .035, k: 'bell' } } },
    klasik:   { fg: ['frangi1', 'frangi2', 'frangi1'], cl: '', col: '#ffc46e', snd: { wind: 260, crackle: 1, gong: [8, 14], bell: { sc: [0, 2, 5, 7, 10], base: 220, gap: [2.5, 5], g: .06, k: 'gam' } } },
    airterjun: { fg: ['frangi1', 'bf_silver', 'frangi1'], cl: 'cloudb', col: '#9fd0ff', snd: { water: 1100, bell: { sc: [0, 3, 5, 7, 10], base: 523, gap: [3, 6.5], g: .035, k: 'bell' } } },
    istana:   { fg: ['rose1', 'rose2', 'rose1'], cl: 'cloudp3', col: '#ffc2dc', snd: { wind: 420, bell: { sc: [0, 2, 4, 7, 9], base: 880, gap: [1.6, 4], g: .05, k: 'bell' } } },
    dayak:    { fg: ['feather', 'orchid', 'leafj'], cl: 'cloudw1', col: '#ffcf6a', snd: { wind: 380, bird: 1, cricket: 1, hornbill: 1, gong: [12, 22], bell: { sc: [0, 2, 5, 7, 9], base: 294, gap: [0.9, 2.6], g: .07, k: 'sape' } } },
  };
  const E = (k) => !(window.__CFG && window.__CFG.effects && window.__CFG.effects[k] === false);
  const VOLK = () => ({ low: .5, normal: 1, high: 1.6 }[(window.__CFG && window.__CFG.effects && window.__CFG.effects.soundVolume) || 'normal'] || 1);
  let key = null, T = null, hero = null, inited = false;

  // ---------- suara ----------
  let ac = null, master = null, snd = null, on = true, timers = [], windBed = null, fxOut = null;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function noiseBuf() { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  function bed(type, f, q, g, lfoHz, lfoDepth) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf(); s.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const gn = ac.createGain(); gn.gain.value = g;
    const lf = ac.createOscillator(), lg = ac.createGain(); lf.frequency.value = lfoHz; lg.gain.value = g * lfoDepth; lf.connect(lg); lg.connect(gn.gain); lf.start();
    s.connect(fl); fl.connect(gn); gn.connect(master); s.start();
    return { gn, fl, g, f };
  }
  function tone(f, t0, dur, g, type, partials) {
    partials.forEach(([r, a]) => {
      if (f * r > 15000) return;
      const o = ac.createOscillator(), e = ac.createGain(); o.type = type; o.frequency.value = f * r;
      e.gain.setValueAtTime(0.0001, t0); e.gain.exponentialRampToValueAtTime(g * a, t0 + 0.008); e.gain.exponentialRampToValueAtTime(0.0001, t0 + dur / (r > 2 ? 1.6 : 1));
      o.connect(e); e.connect(master); o.start(t0); o.stop(t0 + dur + 0.1);
    });
  }
  const BELL = [[1, 1], [2.76, .35], [5.4, .15]], GAM = [[1, 1], [2.4, .4], [3.9, .18]];
  // petikan sape' (kecapi Dayak): dawai dipetik, nada pentatonik, kadang dua nada beruntun
  function pluck(f, t, g, out) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), e = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2.003; fl.type = 'lowpass'; fl.Q.value = 2;
    fl.frequency.setValueAtTime(f * 7, t); fl.frequency.exponentialRampToValueAtTime(f * 1.3, t + 0.9);
    e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(g, t + .006); e.gain.exponentialRampToValueAtTime(.0001, t + 1.5);
    o.connect(fl); o2.connect(fl); fl.connect(e); e.connect(out || master); o.start(t); o2.start(t); o.stop(t + 1.6); o2.stop(t + 1.6);
  }
  function note(b, oct) {
    if (b.k === 'sape') { const pick = () => b.base * Math.pow(2, b.sc[Math.floor(Math.random() * b.sc.length)] / 12) * (oct || 1) * (Math.random() < 0.3 ? 2 : 1); const t = ac.currentTime; pluck(pick(), t, b.g * 0.7); if (Math.random() < 0.55) pluck(pick(), t + 0.18 + Math.random() * 0.12, b.g * 0.55); return; }
    const f = b.base * Math.pow(2, b.sc[Math.floor(Math.random() * b.sc.length)] / 12) * (oct || 1); tone(f, ac.currentTime, b.k === 'bell' ? 2.6 : 1.7, b.g, b.k === 'bell' ? 'sine' : 'triangle', b.k === 'bell' ? BELL : GAM); }
  const loop = (fn, a, b) => { const go = () => { if (!ac) return; if (on && !document.hidden) fn(); timers.push(setTimeout(go, rnd(a, b) * 1000)); }; timers.push(setTimeout(go, rnd(a, b) * 500)); };
  function startSound() {
    if (ac || !T) return;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { ac = new AC(); } catch (e) { return; }
    snd = T.snd; master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    master.gain.linearRampToValueAtTime(0.9 * VOLK(), ac.currentTime + 3);
    if (snd.wind) windBed = bed('lowpass', snd.wind, .6, .05, .13, .7);
    else windBed = bed('lowpass', 380, .6, .012, .1, .5);
    if (snd.water) { bed('bandpass', snd.water, .5, .07, .2, .35); bed('highpass', 3500, .4, .012, .31, .6); }
    if (snd.bell) loop(() => note(snd.bell), snd.bell.gap[0], snd.bell.gap[1]);
    if (snd.bird) loop(() => { let t = ac.currentTime; for (let i = 0; i < 3; i++) { const o = ac.createOscillator(), e = ac.createGain(); o.frequency.setValueAtTime(rnd(2600, 3600), t); o.frequency.exponentialRampToValueAtTime(rnd(3600, 4600), t + .09); e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(.025, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + .11); o.connect(e); e.connect(master); o.start(t); o.stop(t + .13); t += .15; } }, 5, 11);
    if (snd.cricket) loop(() => { let t = ac.currentTime; for (let i = 0; i < 4; i++) { const o = ac.createOscillator(), e = ac.createGain(); o.frequency.value = 4400 + Math.random() * 200; e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(.012, t + .012); e.gain.linearRampToValueAtTime(.0001, t + .05); o.connect(e); e.connect(master); o.start(t); o.stop(t + .06); t += .07; } }, .8, 1.6);
    if (snd.crackle) loop(() => { const s = ac.createBufferSource(); s.buffer = noiseBuf(); const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2500; const e = ac.createGain(), t = ac.currentTime; e.gain.setValueAtTime(rnd(.02, .05), t); e.gain.exponentialRampToValueAtTime(.0001, t + rnd(.01, .035)); s.connect(f); f.connect(e); e.connect(master); s.start(t, Math.random()); s.stop(t + .05); }, .3, 1.4);
    if (snd.hornbill) loop(() => { let t = ac.currentTime; for (let i = 0; i < 3; i++) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), e = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(240, t + .12); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 3; e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(.035, t + .015); e.gain.exponentialRampToValueAtTime(.0001, t + .16); o.connect(f); f.connect(e); e.connect(master); o.start(t); o.stop(t + .18); t += .26; } }, 14, 26);
    if (snd.gong) loop(() => tone(72, ac.currentTime, 6, .1, 'sine', [[1, 1], [1.5, .5], [2.01, .35], [2.8, .2]]), snd.gong[0], snd.gong[1]);
    document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : (on && ac.resume()); });
    const b = $('.imm-snd'); if (b) b.classList.add('show');
  }
  function toggleSound() {
    on = !on; const b = $('.imm-snd'); b.classList.toggle('off', !on);
    if (!ac) return; master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(on ? 0.9 * VOLK() : 0, ac.currentTime + .5);
    if (on) ac.resume();
  }
  // hembusan angin dari living.js: suara angin membesar lalu reda
  addEventListener('living-gust', () => {
    if (!ac || !on || !windBed || document.hidden) return; const t = ac.currentTime, g = windBed.gn.gain, f = windBed.fl.frequency;
    g.cancelScheduledValues(t); g.setValueAtTime(windBed.g, t); g.linearRampToValueAtTime(windBed.g * 3.2, t + 1.3); g.linearRampToValueAtTime(windBed.g * 3, t + 2.8); g.linearRampToValueAtTime(windBed.g, t + 5.2);
    f.cancelScheduledValues(t); f.setValueAtTime(windBed.f, t); f.linearRampToValueAtTime(windBed.f * 1.8, t + 1.4); f.linearRampToValueAtTime(windBed.f, t + 5.2);
  });
  // efek suara saat sampul dibuka (segel pecah, pintu terbuka, menyelam, gong, dll.)
  function out() { if (!fxOut) { fxOut = ac.createGain(); fxOut.gain.value = 0.9 * VOLK(); fxOut.connect(ac.destination); } return fxOut; }
  function blip(f0, f1, t, dur, g, type) { const o = ac.createOscillator(), e = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(g, t + .01); e.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(e); e.connect(out()); o.start(t); o.stop(t + dur + .05); }
  function whoosh(t, dur, f0, f1, g) { const s = ac.createBufferSource(); s.buffer = noiseBuf(); const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = .8; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); const e = ac.createGain(); e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(g, t + dur * .35); e.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(fl); fl.connect(e); e.connect(out()); s.start(t); s.stop(t + dur + .05); }
  function bellAt(f, t, g, k) { const parts = k === 'gam' ? GAM : BELL; parts.forEach(([r, a]) => { if (f * r > 15000) return; const o = ac.createOscillator(), e = ac.createGain(); o.type = k === 'gam' ? 'triangle' : 'sine'; o.frequency.value = f * r; e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(g * a, t + .008); e.gain.exponentialRampToValueAtTime(.0001, t + (k === 'gam' ? 1.8 : 2.6) / (r > 2 ? 1.6 : 1)); o.connect(e); e.connect(out()); o.start(t); o.stop(t + 2.8); }); }
  function gongAt(t, g) { [[1, 1], [1.5, .5], [2.01, .35], [2.8, .2]].forEach(([r, a]) => { const o = ac.createOscillator(), e = ac.createGain(); o.frequency.value = 68 * r; e.gain.setValueAtTime(.0001, t); e.gain.exponentialRampToValueAtTime(g * a, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + 6); o.connect(e); e.connect(out()); o.start(t); o.stop(t + 6.1); }); }
  addEventListener('sampul', (ev) => {
    if (!E('ambientSound') || !on) return;
    if (!ac) startSound(); if (!ac) return; if (ac.state === 'suspended') ac.resume();
    const { phase } = ev.detail || {}, t = ac.currentTime + .02, k = key;
    const sc = (snd && snd.bell) || { sc: [0, 4, 7, 11], base: 660, k: 'bell' }, nf = (i, o) => sc.base * Math.pow(2, sc.sc[i % sc.sc.length] / 12) * (o || 1);
    if (phase === 'open') whoosh(t, .6, 600, 2400, .05);
    if (phase === 'crack') { whoosh(t, .25, 3000, 6000, .06); for (let i = 0; i < 5; i++) bellAt(nf(i, i > 3 ? 4 : 2), t + i * .085, .05, sc.k); }
    if (phase === 'swing') { blip(140, 90, t, .9, .05, 'sawtooth'); gongAt(t + .1, .12); whoosh(t + .2, 1.6, 300, 1400, .07); }
    if (phase === 'lid') { whoosh(t, 1.2, 400, 2600, .06); gongAt(t + .15, .1); for (let i = 0; i < 6; i++) bellAt(nf(i, 2), t + .4 + i * .12, .035, sc.k); }
    if (phase === 'dive') { whoosh(t, 1.4, 1800, 300, .1); for (let i = 0; i < 12; i++) blip(rnd(300, 600), rnd(900, 1600), t + .3 + i * rnd(.07, .14), .08, .04); }
    if (phase === 'fly') for (let i = 0; i < 8; i++) bellAt(nf(i, i > 4 ? 4 : 2), t + i * .11, .035, 'bell');
    if (phase === 'gong') { gongAt(t, .22); [0, .18, .3].forEach((d) => whoosh(t + .9 + d, .09, 5000, 7000, .07)); }
  });
  const chime = () => { if (ac && on) note({ ...(snd.bell || { sc: [0, 4, 7], base: 660, k: 'bell' }), g: .07 }, 2); };

  // ---------- sentuhan interaktif ----------
  const proto = {};
  function warm() { T.fg.concat(T.cl ? [] : []).forEach((n) => { if (proto[n]) return; const im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = SP(n); if (im.decode) im.decode().catch(() => {}); proto[n] = im; }); }
  function tapFx(x, y) {
    if (reduce) return; const L = $('.imm-tap'); if (!L) return;
    const c = T.col; L.style.setProperty('--c', c);
    const ring = document.createElement('i'); ring.className = 'ring'; ring.style.cssText = `width:30px;height:30px;left:${x - 15}px;top:${y - 15}px`; L.appendChild(ring);
    ring.animate([{ transform: 'scale(.2)', opacity: .9 }, { transform: 'scale(3.2)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => ring.remove();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rnd(-.3, .3), d = rnd(46, 110), sprite = i < 4, s = sprite ? rnd(20, 30) : rnd(7, 11);
      const el = sprite ? proto[T.fg[i % T.fg.length]].cloneNode() : document.createElement('i');
      if (!sprite) el.className = 'dot';
      el.style.width = s + 'px'; if (!sprite) el.style.height = s + 'px'; L.appendChild(el);
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d - 26, fall = sprite ? rnd(30, 70) : 0, r = rnd(-160, 160);
      el.animate([
        { transform: `translate3d(${x - s / 2}px,${y - s / 2}px,0) scale(.3) rotate(0deg)`, opacity: 0 },
        { transform: `translate3d(${x + dx * .7 - s / 2}px,${y + dy * .7 - s / 2}px,0) scale(1) rotate(${r * .6}deg)`, opacity: 1, offset: .3 },
        { transform: `translate3d(${x + dx - s / 2}px,${y + dy + fall - s / 2}px,0) scale(.8) rotate(${r}deg)`, opacity: 0 },
      ], { duration: rnd(1300, 1700), easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }).onfinish = () => el.remove();
    }
    chime(); if (window.__vib) window.__vib(8);
  }
  let lastTap = 0;
  function onTap(e) {
    if (!inited) return;
    if (ac && ac.state === 'suspended' && on) ac.resume();
    if (e.target.closest && e.target.closest('button,a,input,textarea,select,label,.lb,.imm-snd,#cover,.cover')) return;
    const n = performance.now(); if (n - lastTap < 140) return; lastTap = n;
    tapFx(e.clientX, e.clientY);
  }

  // ---------- lapisan depan parallax ----------
  function buildFg() {
    if (reduce) return;
    const L = document.createElement('div'); L.className = 'imm-fg'; document.body.appendChild(L);
    const items = [], vw = innerWidth;
    const defs = [[0, .12, 34, 1.5], [1, .84, 40, 1.15], [2, .5, 26, .8], [0, .72, 22, .6], [1, .26, 30, 1.35], [2, .94, 24, .95]];
    defs.forEach(([si, xf, size, k], i) => {
      const it = document.createElement('div'); it.className = 'it'; const im = document.createElement('img'); im.alt = ''; im.src = SP(T.fg[si % T.fg.length]);
      it.style.width = size + 'px'; im.style.setProperty('--d', (7 + i * 1.3) + 's'); im.style.setProperty('--dl', (-i * 1.7) + 's'); if (k < .7) im.style.opacity = .7;
      it.appendChild(im); L.appendChild(it); items.push({ it, x: xf * vw, k, b: (i * 173) % 900 });
    });
    if (T.cl) [[.1, .8, 150], [.7, .55, 190]].forEach(([xf, k, w], i) => { const it = document.createElement('div'); it.className = 'it cl'; const im = document.createElement('img'); im.alt = ''; im.src = SP(T.cl); im.style.opacity = .3; im.style.setProperty('--d', (24 + i * 8) + 's'); it.style.width = w + 'px'; it.appendChild(im); L.appendChild(it); items.push({ it, x: xf * vw - w / 2, k, b: 120 + i * 380 }); });
    let busy = false;
    const upd = () => { busy = false; const sy = scrollY, H = innerHeight + 240; items.forEach((o) => { const y = ((o.b - sy * o.k) % H + H) % H - 120; o.it.style.transform = `translate3d(${o.x}px,${y}px,0)`; }); };
    addEventListener('scroll', () => { if (!busy) { busy = true; requestAnimationFrame(upd); } }, { passive: true });
    upd(); requestAnimationFrame(() => L.classList.add('on'));
  }

  // ---------- tirai kabut antar bagian ----------
  function buildVeil() {
    if (reduce || !('IntersectionObserver' in window)) return;
    const V = document.createElement('div'); V.className = 'imm-veil v-' + key;
    const t = (window.PIC_THEMES[key].tint || [1, 1, 1]).map((v) => Math.round(v * 255)).join(',');
    V.style.background = `radial-gradient(ellipse at 50% 50%,rgba(${t},.0),rgba(${t},.42))`;
    V.innerHTML = '<img src="/assets/t/fx/mist.webp" alt=""><img src="/assets/t/fx/mist.webp" alt=""><i class="vk l"></i><i class="vk r"></i>'; document.body.appendChild(V);
    const kl = V.querySelectorAll('.vk');
    const im = V.querySelectorAll('img'); let last = 0, seen = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || seen.has(e.target)) return; seen.add(e.target);
      const n = performance.now(); if (n - last < 2600 || !hero.classList.contains('shown')) return; last = n;
      V.animate([{ opacity: 0 }, { opacity: 1, offset: .35 }, { opacity: 0 }], { duration: key === 'klasik' ? 2200 : 1900, easing: 'ease-in-out' });
      if (key === 'klasik') { kl[0].animate([{ transform: 'translateX(-101%)' }, { transform: 'translateX(-8%)', offset: .45 }, { transform: 'translateX(-101%)' }], { duration: 2200, easing: 'cubic-bezier(.6,0,.3,1)' }); kl[1].animate([{ transform: 'translateX(101%)' }, { transform: 'translateX(8%)', offset: .45 }, { transform: 'translateX(101%)' }], { duration: 2200, easing: 'cubic-bezier(.6,0,.3,1)' }); }
      im[0].animate([{ transform: 'translate3d(-14%,0,0)' }, { transform: 'translate3d(14%,0,0)' }], { duration: 1900, easing: 'ease-in-out' });
      im[1].animate([{ transform: 'translate3d(14%,0,0)' }, { transform: 'translate3d(-14%,0,0)' }], { duration: 1700, easing: 'ease-in-out' });
    }), { threshold: .3 });
    document.querySelectorAll('.sec:not(.hero)').forEach((s) => io.observe(s));
  }

  // ---------- nama tamu & jam ----------
  function guestInWorld() {
    const name = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 80); if (!name) return;
    const cg = $('.pc-guest'), label = cg && $('span', cg) ? $('span', cg).textContent : 'Kepada Bapak/Ibu/Saudara/i', pt = window.PIC_THEMES[key];
    const box = $('.pbox', hero); if (!box || $('.imm-guest', box)) return;
    const g = document.createElement('div'); g.className = 'imm-guest'; g.style.cssText = `top:${(pt.guestY / 1168 * 100).toFixed(2)}%;transform:translate(-50%,-100%);--tc:${pt.text};--tg:${pt.glowText}`;
    const sp = document.createElement('span'), b = document.createElement('b'); sp.textContent = label; b.textContent = name; g.append(sp, b); box.appendChild(g);
  }
  function daytime() {
    const h = new Date().getHours(), night = h >= 18 || h < 5; document.body.classList.toggle('imm-night', night);
    document.body.classList.toggle('imm-light', !window.PIC_THEMES[key].dark);
  }

  function init() {
    inited = true; T = THEMES[key]; warm();
    const L = document.createElement('div'); L.className = 'imm-tap'; document.body.appendChild(L);
    const b = document.createElement('button'); b.className = 'imm-snd'; b.type = 'button'; b.setAttribute('aria-label', 'Suara suasana'); b.textContent = '\u266A'; b.onclick = toggleSound; document.body.appendChild(b);
    if (E('nightMode')) daytime(); if (E('guestInWorld')) guestInWorld(); if (E('sectionVeil') && !(window.__CFG.effects.scrollFx === false)) buildVeil();
    const ob = $('#openBtn');
    const go = () => { if (E('ambientSound')) startSound(); };
    if (ob) ob.addEventListener('click', go, { once: true });
    addEventListener('pointerdown', go, { once: true, capture: true });
    if (E('tapFx')) addEventListener('pointerdown', onTap, { passive: true });
    const wait = setInterval(() => { if (hero.classList.contains('shown')) { clearInterval(wait); if (E('guestInWorld')) guestInWorld(); } }, 400);
  }
  const boot = setInterval(() => {
    if (inited) return clearInterval(boot);
    const k = Object.keys(THEMES).find((x) => document.body.classList.contains('t-' + x)); hero = $('.hero.pic');
    if (k && hero && window.PIC_THEMES && window.__CFG) { key = k; clearInterval(boot); init(); }
  }, 300);
})();
