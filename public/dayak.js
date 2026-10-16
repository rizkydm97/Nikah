/* Tema 9 — Dayak: Kerajaan Malinau. Semua ilustrasi digambar sebagai vektor (SVG) supaya tiap bagian bisa hidup:
   penari Kancet Ledo & Kancet Pepatai, pemain sape', enggang terbang/hinggap, kupu-kupu Rajah Brooke, anggrek hitam,
   kantong semar, lamin bermotif, patung blontang, Batang Garing, tameng talawang, hutan, sungai & air terjun Malinau.
   window.DAYAK dipakai oleh invitation.js (dunia hero), sampul.js (tameng 3D), living.js (bagian dalam) dan tools/gen-dayak.js. */
(function () {
  'use strict';
  const C = { k: '#151010', k2: '#2a1d18', r: '#c42a2a', r2: '#8f1c1c', y: '#f2b51d', y2: '#d98c12', w: '#f6efe2', o: '#e8792b', g: '#2f8f4e', skin: '#c68a5e', skin2: '#a96f47', wood: '#7a4a24', wood2: '#5a3416', gold: '#e2b552' };
  let uid = 0; const U = (p) => p + (++uid);
  const f1 = (n) => +n.toFixed(1);
  const rnd = (i, k) => (Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2;

  // ---------- unsur dasar ----------
  // bulu enggang bergaris (putih dengan pita gelap), tegak dari (0,0) ke atas sepanjang L
  function feather(L, w, o = {}) {
    const hw = (t) => w * (t < 0.08 ? 0.25 + t / 0.08 * 0.35 : t < 0.6 ? 0.6 + 0.4 * Math.sin((t - 0.08) / 0.52 * Math.PI / 2) : 1 - Math.pow((t - 0.6) / 0.4, 1.8) * 0.85);
    const seg = (a, b, fill) => { const pts = [], n = 7; for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; pts.push([hw(t), -L * t]); } const l = pts.map(([x, y]) => `${f1(x)},${f1(y)}`), r = pts.slice().reverse().map(([x, y]) => `${f1(-x)},${f1(y)}`); return `<polygon points="${l.concat(r).join(' ')}" fill="${fill}"/>`; };
    const bands = o.plain ? [[0, 1, o.col || C.w]] : [[0, 0.56, C.w], [0.56, 0.66, o.band || '#4a2c1a'], [0.66, 0.86, C.w], [0.86, 1, o.tip || '#24160f']];
    return `<g class="fth">${bands.map(([a, b, c]) => seg(a, b, c)).join('')}<path d="M0 0 L0 ${f1(-L * 0.97)}" stroke="#bdb2a0" stroke-width="${f1(Math.max(0.6, w * 0.12))}"/></g>`;
  }
  // kipas bulu (kirip) yang dipegang penari
  const fan = (n, L, spread) => Array.from({ length: n }, (_, i) => `<g transform="rotate(${f1(-spread / 2 + spread * i / (n - 1))})">${feather(L * (0.86 + 0.14 * Math.sin(i / (n - 1) * Math.PI)), L * 0.11)}</g>`).join('');
  // ukel motif aso / kalung (spiral khas Dayak)
  function curl(s, col, w, flip) {
    const d = 'M0 0 C0 -26 18 -44 40 -44 C58 -44 68 -30 62 -18 C57 -8 44 -10 44 -19 C44 -25 50 -27 54 -24';
    return `<path d="${d}" transform="scale(${flip ? -s : s} ${s})" fill="none" stroke="${col}" stroke-width="${f1(w / s)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  // ukel berdaun (ujung melebar seperti kepala enggang)
  function hook(s, col, flip) {
    return `<path d="M0 0 C-2 -22 14 -40 36 -40 C54 -40 64 -26 58 -14 C54 -6 42 -8 42 -16 C42 -22 48 -24 52 -21 C50 -30 40 -32 32 -30 C18 -27 10 -14 12 0 Z" transform="scale(${flip ? -s : s} ${s})" fill="${col}"/>`;
  }
  // motif simetris (dipakai di tameng, lamin, hiasan) — pusat (0,0)
  function motif(s, cols) {
    const [a, b, c] = cols || [C.y, C.r, C.w];
    const half = (fl) => `<g transform="scale(${fl ? -1 : 1} 1)">
      <g transform="translate(8 -6)">${hook(0.62, a)}</g><g transform="translate(10 18) rotate(80)">${hook(0.5, b)}</g>
      <g transform="translate(30 -30) rotate(-40)">${curl(0.42, c, 3.4)}</g><g transform="translate(26 30) rotate(150)">${curl(0.4, a, 3.2)}</g></g>`;
    return `<g transform="scale(${s})">${half(0)}${half(1)}<path d="M0 -16 L8 0 L0 16 L-8 0Z" fill="${b}"/><circle r="3.4" fill="${c}"/></g>`;
  }

  // ---------- tameng talawang (depan) ----------
  const SH = 'M100 6 L186 90 Q190 94 190 100 L190 420 Q190 426 186 430 L100 514 L14 430 Q10 426 10 420 L10 100 Q10 94 14 90 Z';
  function shield(o = {}) {
    const id = U('sh'), m = o.mono || '';
    const eye = (x) => `<g transform="translate(${x} 196)"><circle r="27" fill="${C.w}"/><circle r="21" fill="${C.r}"/><circle r="13" fill="${C.k}"/><circle class="dk-eye" r="6" fill="#ffdf7a"/><circle cx="-5" cy="-6" r="3" fill="#fff"/></g>`;
    const fang = (x, fl) => `<path d="M${x} 300 C${x + (fl ? -6 : 6)} 326 ${x + (fl ? -2 : 2)} 352 ${x + (fl ? 14 : -14)} 372 C${x + (fl ? -12 : 12)} 350 ${x + (fl ? -16 : 16)} 326 ${x + (fl ? -10 : 10)} 300Z" fill="${C.w}" stroke="${C.k}" stroke-width="2"/>`;
    return `<svg class="dk-shield" viewBox="0 0 200 520" xmlns="http://www.w3.org/2000/svg"><defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".45" stop-color="${C.gold}"/><stop offset="1" stop-color="#8a5a12"/></linearGradient>
      <radialGradient id="${id}b" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#2c2220"/><stop offset="1" stop-color="#0d0909"/></radialGradient>
      <clipPath id="${id}c"><path d="${SH}"/></clipPath></defs>
      <path d="${SH}" fill="url(#${id}b)"/>
      <g clip-path="url(#${id}c)">
        <g transform="translate(100 58)">${motif(0.62, [C.y, C.r, C.w])}</g>
        <g transform="translate(100 128)"><g transform="translate(-6 0) rotate(-20)">${hook(0.9, C.y, 1)}</g><g transform="translate(6 0) rotate(20)">${hook(0.9, C.y)}</g><g transform="translate(-30 12) rotate(-70)">${curl(0.55, C.r, 4, 1)}</g><g transform="translate(30 12) rotate(70)">${curl(0.55, C.r, 4)}</g></g>
        <g transform="translate(36 160) rotate(-30)">${curl(0.55, C.w, 3.4, 1)}</g><g transform="translate(164 160) rotate(30)">${curl(0.55, C.w, 3.4)}</g>
        <g transform="translate(26 232) rotate(-100)">${hook(0.62, C.r, 1)}</g><g transform="translate(174 232) rotate(100)">${hook(0.62, C.r)}</g>
        ${eye(58)}${eye(142)}
        <path d="M44 296 Q100 280 156 296 L150 316 Q100 304 50 316Z" fill="${C.r}"/>
        <path d="M54 312 Q100 340 146 312 L140 326 Q100 352 60 326Z" fill="${C.k2}"/>
        ${[66, 78, 90, 102, 114, 126].map((x) => `<rect x="${x}" y="310" width="8" height="12" rx="2" fill="${C.w}"/>`).join('')}
        ${fang(64, 0)}${fang(136, 1)}
        <g transform="translate(100 410)">${motif(0.7, [C.r, C.y, C.w])}</g>
        <g transform="translate(40 380) rotate(-150)">${curl(0.6, C.y, 4, 1)}</g><g transform="translate(160 380) rotate(150)">${curl(0.6, C.y, 4)}</g>
        <path d="M100 470 L112 488 L100 506 L88 488Z" fill="${C.g}"/><path d="M100 478 L106 488 L100 498 L94 488Z" fill="${C.w}"/>
      </g>
      ${m ? `<g class="dk-med" transform="translate(100 252)"><circle r="27" fill="url(#${id}g)" stroke="#6a3c08" stroke-width="2"/><circle r="22" fill="none" stroke="#fff3c0" stroke-width="1.2" opacity=".8"/><text y="7" text-anchor="middle" style="font-family:var(--fScript),cursive" font-size="21" fill="#4a2208">${m}</text></g>` : `<path d="M100 236 L114 252 L100 268 L86 252Z" fill="${C.w}"/>`}
      <path d="${SH}" fill="none" stroke="url(#${id}g)" stroke-width="6"/>
      <path d="M100 18 L178 94 L178 418 L100 500 L22 418 L22 94Z" fill="none" stroke="${C.y}" stroke-width="1.4" opacity=".7"/>
    </svg>`;
  }
  // tameng bagian belakang: kayu, ikatan rotan, pegangan
  function shieldBack() {
    const id = U('sb');
    return `<svg class="dk-shield" viewBox="0 0 200 520"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#4a2a12"/><stop offset=".5" stop-color="#8a5428"/><stop offset="1" stop-color="#4a2a12"/></linearGradient></defs>
      <path d="${SH}" fill="url(#${id})" stroke="#2a160a" stroke-width="5"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${20 + i * 20} 60 Q${22 + i * 20} 260 ${20 + i * 20} 460" stroke="#3a200c" stroke-width="1" opacity=".5" fill="none"/>`).join('')}
      ${[120, 400].map((y) => `<g>${Array.from({ length: 6 }, (_, i) => `<rect x="12" y="${y + i * 5}" width="176" height="3" fill="#c9a060" opacity=".85"/>`).join('')}</g>`).join('')}
      <rect x="84" y="200" width="32" height="120" rx="14" fill="none" stroke="#2a160a" stroke-width="9"/><rect x="84" y="200" width="32" height="120" rx="14" fill="none" stroke="#a87038" stroke-width="5"/></svg>`;
  }

  // ---------- burung enggang (rangkong) terbang, menghadap kanan ----------
  function hornbill(o = {}) {
    const id = U('hb');
    const wing = (cls, dark) => `<g class="${cls}"><path d="M86 56 C76 30 52 8 16 2 C36 16 44 26 46 34 C34 28 22 30 14 34 C34 40 50 46 58 54 C46 54 36 60 30 66 C52 64 70 64 84 64Z" fill="${dark ? '#0b0808' : C.k}"/>
      <path d="M16 2 C36 16 44 26 46 34 C34 28 22 30 14 34 L10 30 C22 24 32 24 40 26 C36 18 26 10 12 6Z" fill="${dark ? '#bdb5a8' : C.w}" opacity="${dark ? 0.6 : 1}"/></g>`;
    return `<svg class="dk-hb${o.perch ? ' perch' : ''}" viewBox="0 0 200 120"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.o}"/><stop offset=".5" stop-color="${C.y}"/><stop offset="1" stop-color="#f7d76a"/></linearGradient>
      <linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8331f"/><stop offset="1" stop-color="${C.o}"/></linearGradient></defs>
      ${o.perch ? '' : wing('w2', 1)}
      <g class="hb-body"><path d="M44 58 L2 50 L0 62 L2 74 L44 68Z" fill="${C.w}"/><path d="M14 52 L24 54 L24 70 L14 72Z" fill="${C.k}"/>
      <path d="M40 60 C46 46 70 42 98 48 C116 52 124 60 118 70 C106 82 70 80 44 70Z" fill="${C.k}"/>
      <path d="M58 72 C72 80 98 80 112 70 C100 74 76 74 58 70Z" fill="${C.w}"/>
      <circle cx="120" cy="52" r="12" fill="${C.k}"/>
      <path d="M126 44 Q156 40 182 66 Q160 60 128 60Z" fill="url(#${id})"/><path d="M128 60 Q156 60 182 66 Q158 66 130 64Z" fill="${C.y2}"/>
      <path d="M122 42 Q136 26 162 34 Q164 40 156 42 Q142 42 128 48Z" fill="url(#${id}c)"/>
      <circle cx="124" cy="50" r="3.4" fill="#fff"/><circle cx="124" cy="50" r="1.8" fill="#8a1a10"/>
      ${o.perch ? `<path d="M50 56 C66 46 92 46 104 58 C92 68 70 70 50 66Z" fill="#0b0808"/><path d="M52 62 C66 66 82 66 96 62" stroke="${C.w}" stroke-width="2" opacity=".7" fill="none"/><path d="M70 76 L68 92 M84 76 L86 92" stroke="#6a4a2a" stroke-width="3" stroke-linecap="round"/>` : ''}</g>
      ${o.perch ? '' : wing('w1', 0)}</svg>`;
  }

  // ---------- kupu-kupu Rajah Brooke (sayap hitam, pita hijau) — tampak atas ----------
  function birdwing() {
    const wing = `<path d="M50 50 C40 20 20 4 4 10 C-2 22 8 40 24 46 C10 54 6 70 16 80 C30 84 44 70 50 56Z" fill="#101410"/>
      <path d="M14 18 L30 26 L22 30 Z M12 30 L32 34 L22 40Z M30 18 L42 30 L34 32Z" fill="#3ee08a"/><path d="M18 62 C26 58 34 60 40 64 C32 70 24 72 18 62Z" fill="#2fc070" opacity=".85"/><circle cx="12" cy="74" r="2.4" fill="#fff" opacity=".7"/>`;
    return `<svg class="dk-bw" viewBox="0 0 100 90"><g class="bw-l" style="transform-origin:50px 50px">${wing}</g><g class="bw-r" style="transform-origin:50px 50px;transform:scaleX(-1)">${wing}</g><ellipse cx="50" cy="52" rx="3.4" ry="18" fill="#1a1010"/><circle cx="50" cy="34" r="4.4" fill="#d22a2a"/><path d="M48 30 Q42 18 38 14 M52 30 Q58 18 62 14" stroke="#1a1010" stroke-width="1.2" fill="none"/></svg>`;
  }

  // ---------- anggrek hitam (Coelogyne pandurata): kelopak hijau muda, bibir hitam ----------
  function orchid(s, rot) {
    const pet = (a, L, W) => `<ellipse cx="0" cy="${-L / 2}" rx="${W}" ry="${L / 2}" transform="rotate(${a})" fill="#b9dc6a" stroke="#86b13a" stroke-width=".8"/>`;
    return `<g transform="scale(${s}) rotate(${rot || 0})">${pet(0, 30, 7)}${pet(-70, 28, 6)}${pet(70, 28, 6)}${pet(-150, 30, 6.5)}${pet(150, 30, 6.5)}
      <path d="M-9 4 C-14 14 -8 28 0 30 C8 28 14 14 9 4 C5 8 -5 8 -9 4Z" fill="#111" /><path d="M-6 10 Q0 14 6 10 M-5 16 Q0 20 5 16" stroke="#6a8a2a" stroke-width="1.1" fill="none"/>
      <path d="M-3 -2 Q0 -10 3 -2Z" fill="#f2f0d0"/></g>`;
  }
  // daun hutan (keladi) dengan tulang daun
  function leaf(s, rot, col) {
    const [a, b] = col || ['#2f7a45', '#1d5534'], id = U('lf');
    return `<g transform="scale(${s}) rotate(${rot || 0})"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
      <path d="M0 0 C34 -6 62 -54 0 -128 C-62 -54 -34 -6 0 0Z" fill="url(#${id})"/><path d="M0 -2 L0 -122" stroke="#9ed08a" stroke-width="2" opacity=".7"/>
      ${[-30, -56, -82].map((y) => `<path d="M0 ${y} Q20 ${y - 6} 34 ${y - 18} M0 ${y} Q-20 ${y - 6} -34 ${y - 18}" stroke="#9ed08a" stroke-width="1.2" opacity=".5" fill="none"/>`).join('')}</g>`;
  }
  // pakis / daun panjang
  const blade = (s, rot, col) => `<g transform="scale(${s}) rotate(${rot})"><path d="M0 0 C10 -40 14 -90 4 -150 C-6 -90 -8 -40 0 0Z" fill="${col || '#3d8a4a'}"/><path d="M1 -4 L4 -146" stroke="#a8dc8e" stroke-width="1" opacity=".55"/></g>`;
  // kantong semar
  function pitcher(s, rot) {
    const id = U('pt');
    return `<g transform="scale(${s}) rotate(${rot || 0})"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#9a2a24"/><stop offset=".5" stop-color="#c8513a"/><stop offset="1" stop-color="#7a1c18"/></linearGradient></defs>
      <path d="M0 -60 Q-20 -64 -26 -50" stroke="#5f8a2a" stroke-width="2.4" fill="none"/>
      <path d="M-14 -46 C-18 -20 -16 0 0 6 C16 0 18 -20 14 -46 Z" fill="url(#${id})"/><ellipse cx="0" cy="-46" rx="14" ry="5" fill="#5a1410" stroke="#e8c070" stroke-width="2"/>
      <path d="M-4 -50 Q8 -64 18 -56 Q10 -50 -4 -50Z" fill="#8bb04a"/>${[-8, 0, 8].map((x) => `<circle cx="${x}" cy="${-30 + Math.abs(x)}" r="2" fill="#f0d090" opacity=".55"/>`).join('')}</g>`;
  }
  // pohon kanopi bulat (untuk hutan)
  function tree(x, y, s, cols, i) {
    i = i || 0;
    const [a, b, c] = cols || ['#1f5a3a', '#2f7a48', '#4f9a58'];
    const blobs = Array.from({ length: 7 }, (_, k) => [(rnd(i + k, 1) - 0.5) * 70, -60 - rnd(i + k, 2) * 60, 26 + rnd(i + k, 3) * 22]);
    return `<g transform="translate(${x} ${y})"><g class="dk-tree" style="transform-origin:0px 0px;animation-delay:${-(i % 7) * 0.7}s" transform="scale(${s})"><path d="M-5 0 L-3 -70 L3 -70 L5 0Z" fill="#4a3020"/>
      ${blobs.map(([bx, by, r]) => `<circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(r)}" fill="${b}"/>`).join('')}${blobs.map(([bx, by, r]) => `<circle cx="${f1(bx - 4)}" cy="${f1(by - 6)}" r="${f1(r * 0.7)}" fill="${c}" opacity=".7"/>`).join('')}${blobs.slice(0, 3).map(([bx, by, r]) => `<circle cx="${f1(bx + 6)}" cy="${f1(by + 8)}" r="${f1(r * 0.8)}" fill="${a}" opacity=".7"/>`).join('')}</g></g>`;
  }
  // awan lembut (SVG)
  function cloud(v, col) {
    const id = U('cl'), c = col || '#fffaf0', lobes = [[40, 58, 30], [72, 44, 34], [108, 34, 40], [146, 42, 34], [176, 56, 26], [92, 58, 30], [132, 60, 30]];
    if (v === 1) lobes.splice(0, 2, [56, 52, 26], [86, 40, 30]);
    return `<svg class="dk-cl" viewBox="0 0 220 96"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="#f0d6b8"/></linearGradient></defs>
      <g fill="url(#${id})">${lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}<rect x="14" y="56" width="190" height="30" rx="15"/></g>
      <path d="M22 80 Q110 92 198 80" stroke="#e3c3a0" stroke-width="6" stroke-linecap="round" fill="none" opacity=".45"/></svg>`;
  }

  // ---------- penari perempuan: Kancet Ledo (tari gong) dengan kipas bulu ----------
  function dancerF() {
    const hd = Array.from({ length: 9 }, (_, i) => `<g transform="rotate(${-64 + i * 16})">${feather(i % 2 ? 66 : 80, 7.5)}</g>`).join('');
    const arm = (side) => {
      const s = side === 'l' ? -1 : 1, sx = 100 + s * 15, ex = 100 + s * 44, hx = 100 + s * 70;
      return `<g class="ar ${side}" style="transform-origin:${sx}px 104px"><path d="M${sx} 104 L${ex} 128" stroke="${C.skin}" stroke-width="9" stroke-linecap="round"/>
        <g class="fa" style="transform-origin:${ex}px 128px"><path d="M${ex} 128 L${hx} 116" stroke="${C.skin}" stroke-width="7.5" stroke-linecap="round"/><path d="M${100 + s * 62} 117 L${100 + s * 66} 124" stroke="${C.y}" stroke-width="5"/>
          <g class="fn" style="transform-origin:${hx}px 115px"><g transform="translate(${hx} 115) rotate(${s * 70})">${fan(6, 62, 110)}</g></g><circle cx="${hx}" cy="115" r="4.6" fill="${C.skin2}"/></g></g>`;
    };
    return `<svg class="dk-dancer f" viewBox="0 0 200 320"><g class="bd" style="transform-origin:100px 314px">
      <path d="M86 64 C80 92 80 128 84 150 L116 150 C120 128 120 92 114 64Z" fill="#1a1210"/>
      <g class="hd" style="transform-origin:100px 54px"><g transform="translate(100 52)">${hd}</g></g>
      ${arm('l')}${arm('r')}
      <path d="M93 80 L107 80 L106 94 L94 94Z" fill="${C.skin}"/>
      <path d="M80 96 Q100 88 120 96 L118 170 L82 170Z" fill="${C.k}"/>
      <path d="M86 96 Q100 116 114 96" stroke="${C.o}" stroke-width="4" fill="none"/><path d="M84 100 Q100 124 116 100" stroke="${C.y}" stroke-width="3" fill="none" stroke-dasharray="3 2"/>
      <g transform="translate(100 140)">${motif(0.38, [C.y, C.r, C.w])}</g>
      <g class="hed" style="transform-origin:100px 82px"><ellipse cx="100" cy="66" rx="15" ry="17" fill="${C.skin}"/>
        <path d="M85 60 Q86 44 100 44 Q114 44 115 60 Q108 52 100 52 Q92 52 85 60Z" fill="#1a1210"/>
        <rect x="83" y="50" width="34" height="9" rx="3" fill="${C.k}"/>${[86, 92, 98, 104, 110].map((x, i) => `<circle cx="${x + 2}" cy="54.5" r="2.2" fill="${i % 2 ? C.r : C.y}"/>`).join('')}
        <path d="M92 66 Q95 68 98 66 M102 66 Q105 68 108 66" stroke="#3a1a10" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M96 75 Q100 77 104 75" stroke="#9a3a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <circle cx="85" cy="72" r="4" fill="none" stroke="${C.gold}" stroke-width="2"/><circle cx="115" cy="72" r="4" fill="none" stroke="${C.gold}" stroke-width="2"/></g>
      <rect x="82" y="166" width="36" height="9" fill="${C.y}"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${83 + i * 4}" y="168" width="2.4" height="5" fill="${i % 2 ? C.r : C.k}"/>`).join('')}
      <g class="sk" style="transform-origin:100px 174px"><path d="M82 175 L118 175 Q124 246 120 302 L80 302 Q76 246 82 175Z" fill="${C.k}"/>
        <g transform="translate(100 214)">${motif(0.5, [C.r, C.y, C.w])}</g><g transform="translate(100 262) scale(1 -1)">${motif(0.45, [C.y, C.r, C.o])}</g>
        <rect x="80" y="288" width="40" height="5" fill="${C.r}"/><rect x="80" y="294" width="40" height="3" fill="${C.y}"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${81 + i * 4}" y="297" width="2" height="7" fill="${i % 3 ? C.w : C.o}"/>`).join('')}</g>
      <ellipse class="ft l" cx="92" cy="308" rx="7" ry="4" fill="${C.skin2}"/><ellipse class="ft r" cx="108" cy="308" rx="7" ry="4" fill="${C.skin2}"/>
    </g></svg>`;
  }

  // ---------- penari laki-laki: Kancet Pepatai (tari perang) dengan mandau & tameng ----------
  function dancerM() {
    const legs = (side) => {
      const s = side === 'l' ? -1 : 1, hx = 110 + s * 10, kx = 110 + s * 30, fx = 110 + s * 26;
      return `<g class="lg ${side}" style="transform-origin:${hx}px 196px"><path d="M${hx} 196 L${kx} 244" stroke="${C.skin}" stroke-width="12" stroke-linecap="round"/>
        <g class="sh" style="transform-origin:${kx}px 244px"><path d="M${kx} 244 L${fx} 298" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/><path d="M${kx - 5} 262 L${kx + 5} 262" stroke="${C.y}" stroke-width="4"/><ellipse cx="${fx + s * 6}" cy="302" rx="10" ry="4.5" fill="${C.skin2}"/></g></g>`;
    };
    const sm = `<g transform="translate(-24 -62) scale(.24)">${shield({}).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`;
    return `<svg class="dk-dancer m" viewBox="0 0 220 320"><g class="bd" style="transform-origin:110px 300px">
      ${legs('l')}${legs('r')}
      <g class="tor">
        <path d="M92 182 L128 182 L132 200 L88 200Z" fill="${C.r}"/><path d="M100 196 L120 196 L118 252 L102 252Z" fill="${C.r}"/><path d="M102 216 L118 216 M102 232 L118 232" stroke="${C.y}" stroke-width="3"/>
        <path d="M94 104 Q110 98 126 104 L128 184 L92 184Z" fill="${C.skin}"/>
        <path d="M90 104 Q98 100 104 104 L104 184 L90 184Z M130 104 Q122 100 116 104 L116 184 L130 184Z" fill="${C.k}"/>
        <path d="M92 120 Q98 132 92 146 M128 120 Q122 132 128 146" stroke="${C.y}" stroke-width="3" fill="none"/><path d="M94 160 L102 168 M126 160 L118 168" stroke="${C.r}" stroke-width="3"/>
        <path d="M100 104 Q110 116 120 104" stroke="${C.w}" stroke-width="3" fill="none" stroke-dasharray="2 2"/><path d="M104 112 L110 124 L116 112" stroke="${C.w}" stroke-width="2.4" fill="none"/>
      </g>
      <g class="arL" style="transform-origin:94px 108px"><path d="M94 108 L70 140" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/><g class="fa" style="transform-origin:70px 140px"><path d="M70 140 L58 118" stroke="${C.skin}" stroke-width="9" stroke-linecap="round"/><g transform="translate(56 116) rotate(-8)">${sm}</g></g></g>
      <g class="arR" style="transform-origin:126px 108px"><path d="M126 108 L152 132" stroke="${C.skin}" stroke-width="10" stroke-linecap="round"/><g class="fa" style="transform-origin:152px 132px"><path d="M152 132 L168 108" stroke="${C.skin}" stroke-width="9" stroke-linecap="round"/>
        <g transform="translate(169 106) rotate(-24)"><path d="M-3 4 L3 4 L3 -16 L-3 -16Z" fill="#3a2414"/><path d="M-5 -16 L6 -16 L6 -20 L-5 -20Z" fill="${C.gold}"/><path d="M-2 -20 C-8 -50 -4 -80 6 -104 C8 -80 10 -50 4 -20Z" fill="#d8dde2" stroke="#6a7078" stroke-width="1"/><path d="M-4 6 Q-14 14 -10 26" stroke="#1a1210" stroke-width="3" fill="none"/></g></g></g>
      <path d="M103 86 L117 86 L116 100 L104 100Z" fill="${C.skin}"/>
      <g class="hed" style="transform-origin:110px 88px"><ellipse cx="110" cy="72" rx="15" ry="17" fill="${C.skin}"/>
        <path d="M100 68 L106 68 M114 68 L120 68" stroke="#2a140c" stroke-width="2.2" stroke-linecap="round"/><path d="M104 80 Q110 84 116 80" stroke="#7a2a1a" stroke-width="2" fill="none"/><path d="M98 64 L106 62 M122 64 L114 62" stroke="#2a140c" stroke-width="1.6"/>
        <path d="M93 60 Q110 38 127 60 L125 64 L95 64Z" fill="#8a5a2a"/><path d="M95 62 L125 62" stroke="${C.y}" stroke-width="3"/>${[98, 104, 110, 116, 122].map((x, i) => `<circle cx="${x}" cy="56" r="2" fill="${i % 2 ? C.w : C.r}"/>`).join('')}
        <g class="hf" style="transform-origin:110px 44px"><g transform="translate(104 48) rotate(-14)">${feather(96, 6.5)}</g><g transform="translate(116 48) rotate(12)">${feather(84, 6.5)}</g><g transform="translate(110 46) rotate(-2)">${feather(108, 7)}</g></g>
        <g transform="translate(96 56) rotate(-70)">${feather(22, 4, { plain: 1, col: '#c9a26a' })}</g><g transform="translate(124 56) rotate(70)">${feather(22, 4, { plain: 1, col: '#c9a26a' })}</g></g>
    </g></svg>`;
  }

  // ---------- pemain sape' (duduk bersila) ----------
  function sapePlayer() {
    return `<svg class="dk-sape" viewBox="0 0 200 210"><g class="bd" style="transform-origin:100px 200px">
      <path d="M50 196 Q100 168 150 196 Q100 210 50 196Z" fill="${C.r}"/><path d="M56 192 Q100 176 144 192" stroke="${C.y}" stroke-width="3" fill="none"/>
      <path d="M60 196 Q80 178 100 186 Q120 178 140 196" stroke="${C.skin}" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M84 102 Q100 96 116 102 L120 180 L80 180Z" fill="${C.k}"/><path d="M90 104 Q100 118 110 104" stroke="${C.o}" stroke-width="3" fill="none"/><g transform="translate(100 150)">${motif(0.32, [C.y, C.r, C.w])}</g>
      <g class="sp" transform="rotate(-38 100 150)"><path d="M70 136 C68 120 70 100 80 96 L84 40 L90 40 L92 96 C104 100 106 120 104 136 C104 170 72 170 70 136Z" fill="#c78a3e" stroke="#6a3e14" stroke-width="1.6"/>
        <path d="M74 120 Q88 116 100 120 M74 140 Q88 136 100 140" stroke="${C.r}" stroke-width="3" fill="none"/><path d="M80 100 L84 154 M88 100 L90 154" stroke="#3a2412" stroke-width=".8"/><path d="M82 40 L76 30 L92 30 L88 40Z" fill="#6a3e14"/><circle cx="87" cy="158" r="5" fill="#3a2412"/></g>
      <path d="M86 112 L60 140 L88 150" stroke="${C.skin}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="st" style="transform-origin:116px 112px"><path d="M116 112 L126 146 L104 150" stroke="${C.skin}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
      <path d="M94 84 L106 84 L106 98 L94 98Z" fill="${C.skin}"/>
      <g class="hed" style="transform-origin:100px 92px"><ellipse cx="100" cy="72" rx="14" ry="16" fill="${C.skin}"/><path d="M92 70 Q95 72 98 70 M102 70 Q105 72 108 70" stroke="#3a1a10" stroke-width="1.5" fill="none"/><path d="M96 80 Q100 82 104 80" stroke="#7a2a1a" stroke-width="1.6" fill="none"/>
        <path d="M86 62 Q100 40 114 62Z" fill="#8a5a2a"/><path d="M86 62 L114 62" stroke="${C.y}" stroke-width="3"/><g transform="translate(100 46)">${feather(48, 5)}</g></g>
    </g></svg>`;
  }

  // ---------- lamin (rumah panjang) — tampak depan ----------
  function lamin() {
    const id = U('lm');
    const gable = (x, w, h, big) => `<g><path d="M${x - w / 2} 128 L${x} ${128 - h} L${x + w / 2} 128Z" fill="${C.k}" stroke="${C.wood2}" stroke-width="3"/>
      <g transform="translate(${x} ${128 - h * 0.42}) scale(${big ? 0.9 : 0.55})">${motif(1, [C.y, C.r, C.w])}</g>
      <path d="M${x - 4} ${128 - h} C${x - 18} ${118 - h} ${x - 30} ${104 - h} ${x - 26} ${92 - h} C${x - 20} ${100 - h} ${x - 12} ${108 - h} ${x} ${116 - h}Z M${x + 4} ${128 - h} C${x + 18} ${118 - h} ${x + 30} ${104 - h} ${x + 26} ${92 - h} C${x + 20} ${100 - h} ${x + 12} ${108 - h} ${x} ${116 - h}Z" fill="${C.y}" stroke="${C.wood2}" stroke-width="1.2"/></g>`;
    const panel = (x, w) => `<g><rect x="${x}" y="140" width="${w}" height="56" fill="${C.k}" stroke="${C.y}" stroke-width="1.5"/><g transform="translate(${x + w / 2} 168) scale(${w / 120})">${motif(0.9, [C.y, C.r, C.w])}</g></g>`;
    return `<svg class="dk-lamin" viewBox="0 0 520 270"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3a32"/><stop offset="1" stop-color="#2a1f1a"/></linearGradient>
      <pattern id="${id}p" width="10" height="8" patternUnits="userSpaceOnUse"><rect width="10" height="8" fill="url(#${id})"/><path d="M0 7.5 H10 M5 0 V3.5" stroke="#1a1210" stroke-width=".8" opacity=".6"/></pattern></defs>
      ${Array.from({ length: 13 }, (_, i) => `<rect x="${24 + i * 39}" y="200" width="8" height="62" fill="${C.wood2}"/>`).join('')}<rect x="14" y="258" width="492" height="6" fill="#3a2412" opacity=".6"/>
      <path d="M10 130 L66 72 L454 72 L510 130Z" fill="url(#${id}p)" stroke="#1a1210" stroke-width="2"/>
      <rect x="26" y="128" width="468" height="76" fill="${C.wood}"/>${Array.from({ length: 24 }, (_, i) => `<path d="M${30 + i * 20} 130 V202" stroke="${C.wood2}" stroke-width="1" opacity=".5"/>`).join('')}
      ${panel(40, 120)}${panel(360, 120)}
      <rect x="226" y="140" width="68" height="62" fill="#2a160a" stroke="${C.y}" stroke-width="2"/><path d="M260 140 V202" stroke="${C.y}" stroke-width="1.4"/>
      <rect x="176" y="146" width="36" height="28" fill="#2a160a" stroke="${C.y}" stroke-width="1.4"/><rect x="308" y="146" width="36" height="28" fill="#2a160a" stroke="${C.y}" stroke-width="1.4"/>
      <rect x="20" y="198" width="480" height="8" fill="${C.wood2}"/><path d="M20 186 H500" stroke="#c99a4a" stroke-width="2"/>${Array.from({ length: 25 }, (_, i) => `<path d="M${24 + i * 20} 186 V198" stroke="#c99a4a" stroke-width="2"/>`).join('')}
      <path d="M246 206 L238 266 L252 266 L262 206Z" fill="${C.wood2}"/>${[214, 226, 238, 250].map((y) => `<path d="M${244 - (y - 206) * 0.1} ${y} h14" stroke="#3a2010" stroke-width="2"/>`).join('')}
      ${gable(60, 92, 96, 0)}${gable(460, 92, 96, 0)}${gable(260, 150, 128, 1)}
    </svg>`;
  }
  // patung blontang (tiang ukir)
  function totem() {
    const face = (y) => `<g transform="translate(30 ${y})"><ellipse rx="20" ry="24" fill="#8a5a2c"/><circle cx="-8" cy="-4" r="6" fill="${C.w}"/><circle cx="8" cy="-4" r="6" fill="${C.w}"/><circle cx="-8" cy="-4" r="3" fill="${C.k}"/><circle cx="8" cy="-4" r="3" fill="${C.k}"/>
      <path d="M-8 12 Q0 18 8 12" stroke="${C.k}" stroke-width="2" fill="none"/><path d="M-3 0 L0 8 L3 0" stroke="#5a3416" stroke-width="2" fill="none"/><path d="M-20 -10 Q-26 0 -20 10 M20 -10 Q26 0 20 10" stroke="#5a3416" stroke-width="3" fill="none"/></g>`;
    return `<svg class="dk-totem" viewBox="0 0 60 300"><rect x="16" y="20" width="28" height="280" fill="#6a4020"/><path d="M18 20 V300 M42 20 V300" stroke="#4a2a14" stroke-width="2"/>
      ${face(48)}<path d="M10 82 Q30 96 50 82 L46 120 Q30 128 14 120Z" fill="#7a4a24"/><path d="M14 100 Q30 108 46 100" stroke="${C.y}" stroke-width="2" fill="none"/>${face(150)}<path d="M12 182 Q30 196 48 182 L44 216 Q30 224 16 216Z" fill="#7a4a24"/><path d="M16 198 L44 198" stroke="${C.r}" stroke-width="3"/>
      <path d="M8 18 L30 0 L52 18Z" fill="#5a3416"/></svg>`;
  }
  // Batang Garing (pohon kehidupan): tombak, cabang ukel, kipas bulu, perahu
  function batangGaring() {
    const tier = (y, w, i) => [-1, 1].map((d) => `<g transform="translate(100 ${y}) scale(${d} 1)"><path d="M0 0 C${w * 0.4} 4 ${w * 0.8} -6 ${w} -26" stroke="${i % 2 ? C.r : C.y}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g transform="translate(${w * 0.55} -2) rotate(30)">${curl(0.32, i % 2 ? C.y : C.r, 3.6)}</g><g transform="translate(${w} -26) rotate(${30 + i * 4})">${fan(5, 30, 80)}</g></g>`).join('');
    return `<svg class="dk-bg-tree" viewBox="0 0 200 300"><path d="M100 4 L108 26 L100 34 L92 26Z" fill="#c9ccd2" stroke="#5a5e66"/><rect x="97" y="30" width="6" height="226" fill="#3a3a40"/>
      ${tier(76, 50, 0)}${tier(120, 66, 1)}${tier(166, 80, 2)}${tier(212, 90, 3)}
      <path d="M30 248 Q100 262 170 248 L160 286 Q100 300 40 286Z" fill="${C.o}" stroke="#8a4a10" stroke-width="2"/><path d="M36 262 Q100 274 164 262 M42 276 Q100 288 158 276" stroke="${C.y}" stroke-width="3" fill="none"/>
      <g transform="translate(30 250) rotate(-50)">${fan(3, 30, 40)}</g><g transform="translate(170 250) rotate(50)">${fan(3, 30, 40)}</g></svg>`;
  }


  // ================= dunia hero: Kerajaan Malinau (koordinat dasar 784 x 1168) =================
  const P = (x, y, w) => `left:${(x / 7.84).toFixed(3)}%;top:${(y / 11.68).toFixed(3)}%;width:${(w / 7.84).toFixed(3)}%`;
  const L = (z, cls, inner) => `<div class="dk-l ${cls}" data-z="${z}">${inner}</div>`;
  const SV = (inner, defs) => `<svg viewBox="0 0 784 1168" preserveAspectRatio="none">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
  // semak depan: daun keladi, pakis, anggrek hitam, kantong semar
  function bush(flip, seed) {
    const r = (k) => rnd(seed, k);
    return `<svg class="dk-bush" viewBox="0 0 280 260" style="${flip ? 'transform:scaleX(-1)' : ''}">
      <g class="dk-sway" style="transform-origin:60px 260px;animation-duration:6.2s">${blade(1.1, -30, '#2f6e3c')}<g transform="translate(60 260)">${blade(1.25, -14, '#3f8a4a')}${blade(1, 10, '#2a5f36')}</g></g>
      <g class="dk-sway" style="transform-origin:40px 260px;animation-duration:5.4s;animation-delay:-2s"><g transform="translate(40 262)">${leaf(1.3, 28, ['#3a8a50', '#1e5a36'])}</g></g>
      <g class="dk-sway" style="transform-origin:120px 260px;animation-duration:7s;animation-delay:-1s"><g transform="translate(120 262)">${leaf(1.05, -10, ['#4a9a58', '#235f38'])}</g></g>
      <g class="dk-sway" style="transform-origin:200px 260px;animation-duration:5.8s;animation-delay:-3s"><g transform="translate(200 262)">${leaf(0.9, 40, ['#2f7a45', '#1a4a2e'])}${blade(0.8, 60, '#3d8a4a')}</g></g>
      <g transform="translate(150 224)">${pitcher(1.1, -8)}</g><g transform="translate(230 236)">${pitcher(0.8, 14)}</g>
      <g class="dk-sway" style="transform-origin:96px 200px;animation-duration:4.6s"><path d="M96 250 Q92 200 110 150" stroke="#5f7a2a" stroke-width="3" fill="none"/><g transform="translate(110 148)">${orchid(1.15, 10)}</g><g transform="translate(88 186)">${orchid(0.85, -30)}</g><g transform="translate(124 186)">${orchid(0.75, 40)}</g></g>
      <g transform="translate(${30 + r(1) * 10} 214)">${orchid(0.7, -50)}</g></svg>`;
  }
  // dedaunan menggantung di sudut atas (bingkai hutan)
  function canopy(flip) {
    const vines = [[40, 0, 150], [90, 0, 210], [150, 0, 120], [200, 0, 170]].map(([x, y, h], i) => `<g class="dk-sway" style="transform-origin:${x}px 0px;animation-duration:${5 + i}s;animation-delay:${-i * 1.3}s"><path d="M${x} 0 q${i % 2 ? 8 : -8} ${h / 2} ${i % 2 ? -4 : 4} ${h}" stroke="#3f6f32" stroke-width="2.4" fill="none"/>${[0.3, 0.55, 0.8].map((t, k) => `<ellipse cx="${x + (k % 2 ? 6 : -6)}" cy="${f1(h * t)}" rx="8" ry="4" fill="${k % 2 ? '#4f8f45' : '#3a7a3c'}" transform="rotate(${k % 2 ? 30 : -30} ${x} ${f1(h * t)})"/>`).join('')}${i === 1 ? `<g transform="translate(${x + 2} ${h + 8})">${orchid(0.8, 180)}</g>` : ''}</g>`).join('');
    return `<svg class="dk-bush" viewBox="0 0 300 260" style="${flip ? 'transform:scaleX(-1)' : ''}">${vines}
      <g class="dk-sway" style="transform-origin:0px 0px;animation-duration:7s"><g transform="translate(-10 -10)">${leaf(1.35, 150, ['#2f6e3c', '#1a4a2c'])}</g><g transform="translate(50 -24)">${leaf(1.1, 168, ['#3d8a4a', '#1e5a34'])}</g><g transform="translate(-24 50)">${leaf(1.05, 128, ['#2a6438', '#163e26'])}</g><g transform="translate(110 -30)">${blade(1.25, 160, '#2f7a40')}</g><g transform="translate(150 -20)">${blade(0.9, 140, '#3d8a4a')}</g></g></svg>`;
  }
  // umbul-umbul / bendera segitiga berwarna Dayak yang berkibar
  function bunting(x1, y1, x2, y2, sag, n) {
    let h = `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.max(y1, y2) + sag} ${x2} ${y2}" stroke="#4a2a12" stroke-width="1.6" fill="none"/>`;
    const cols = [C.r, C.y, C.k, C.w, C.g];
    for (let i = 1; i < n; i++) { const t = i / n, x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * (x1 + x2) / 2 + t * t * x2, y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + sag) + t * t * y2;
      h += `<g transform="translate(${f1(x)} ${f1(y)})"><path class="dk-flag" style="animation-delay:${-i * 0.23}s" d="M-6 0 L6 0 L0 16Z" fill="${cols[i % cols.length]}" stroke="#3a2010" stroke-width=".6"/></g>`; }
    return h;
  }
  function world(o = {}) {
    uid = 0;
    const sky = SV(`<rect width="784" height="1168" fill="url(#dkSky)"/><circle cx="560" cy="470" r="260" fill="url(#dkSun)"/>`,
      `<linearGradient id="dkSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2c08a"/><stop offset=".22" stop-color="#f8d6a6"/><stop offset=".42" stop-color="#fde9c8"/><stop offset=".55" stop-color="#fff2dc"/><stop offset="1" stop-color="#f8e2c0"/></linearGradient>
       <radialGradient id="dkSun"><stop offset="0" stop-color="#fffbe8"/><stop offset=".18" stop-color="#fff0c0" stop-opacity=".95"/><stop offset=".5" stop-color="#ffd890" stop-opacity=".35"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>`);
    const cl = [[30, 150, 200, 0, 90, 0.95], [420, 200, 240, 1, 120, 0.9], [210, 300, 170, 0, 75, 0.85], [560, 330, 190, 1, 100, 0.8], [90, 420, 150, 1, 65, 0.75], [470, 470, 130, 0, 55, 0.7]];
    const clouds = cl.map(([x, y, w, v, d, o], i) => `<div class="dk-cloud" style="${P(x, y, w)};opacity:${o};animation-duration:${d}s;animation-delay:${-d * ((i * 0.37) % 1)}s">${cloud(v)}</div>`).join('');
    const mtn = SV(`<path d="M0 520 Q60 470 120 500 Q190 428 262 482 Q330 398 410 468 Q480 420 540 456 Q620 380 700 450 Q750 432 784 450 L784 680 L0 680Z" fill="#c9b0b4" opacity=".85"/>
      <path d="M400 468 L410 468 Q430 452 452 462 L440 470Z M690 450 L700 450 Q714 440 728 446 L716 456Z" fill="#fff" opacity=".5"/>
      <rect y="440" width="784" height="140" fill="url(#dkHz)"/>
      <path d="M0 566 Q80 502 152 542 Q222 482 302 532 Q382 470 452 522 Q522 490 592 522 Q662 472 784 522 L784 720 L0 720Z" fill="#94a493"/>
      <rect y="520" width="784" height="110" fill="url(#dkHz)" opacity=".8"/>`, `<linearGradient id="dkHz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4e0" stop-opacity="0"/><stop offset=".6" stop-color="#fff4e0" stop-opacity=".55"/><stop offset="1" stop-color="#fff4e0" stop-opacity="0"/></linearGradient>`);
    const bumps = (y0, n, cols, amp, seed) => Array.from({ length: n }, (_, i) => { const x = i * 784 / (n - 1), r = 22 + rnd(seed + i, 1) * amp, y = y0 - rnd(seed + i, 2) * 16; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${cols[i % cols.length]}"/>`; }).join('');
    const hills = SV(`<path d="M0 622 Q100 584 200 612 Q300 572 400 602 Q500 576 600 600 Q700 572 784 590 L784 900 L0 900Z" fill="#5a8a5c"/>${bumps(612, 26, ['#5a8a5c', '#4f7f52', '#64955f'], 18, 3)}
      <path d="M598 600 C590 560 612 522 640 514 C668 504 700 510 722 500 C748 492 768 500 784 496 L784 830 L606 830 C596 760 608 690 598 600Z" fill="url(#dkRk)"/>
      <path d="M612 600 C630 596 640 610 660 606 M700 560 C716 556 730 566 746 560 M620 690 C640 684 650 700 676 694 M720 640 C736 636 752 646 770 640 M640 760 C660 756 680 768 700 762" stroke="#4a463c" stroke-width="3" fill="none" opacity=".55"/>
      ${[612, 626, 704, 724, 748, 770].map((x, i) => `<path d="M${x} ${506 + (i % 3) * 4} q${(i % 2 ? 6 : -6)} 60 ${(i % 2 ? -4 : 4)} ${110 + i * 14}" stroke="#3f7a3a" stroke-width="2.6" fill="none"/>${[30, 60, 90].map((d) => `<ellipse cx="${x + (i % 2 ? 4 : -4)}" cy="${510 + d + i * 4}" rx="5" ry="2.6" fill="#4f8f45" transform="rotate(${i % 2 ? 30 : -30} ${x} ${510 + d + i * 4})"/>`).join('')}`).join('')}
      ${bumps(512, 9, ['#3f7448', '#2f6a40', '#4d8a52'], 16, 9).replace(/cx="([\d.]+)"/g, (m, x) => `cx="${f1(600 + (+x) * 0.24)}"`)}
      <path d="M0 668 Q120 640 240 662 Q380 636 520 660 Q640 640 784 664 L784 900 L0 900Z" fill="#3f6f48"/>${bumps(664, 30, ['#3f6f48', '#356642', '#4a7d4e'], 14, 21)}
      <rect y="600" width="784" height="90" fill="url(#dkMs)"/><ellipse cx="672" cy="776" rx="70" ry="16" fill="#cfe8ec" opacity=".8"/>`, `<linearGradient id="dkRk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a8472"/><stop offset="1" stop-color="#57534a"/></linearGradient><linearGradient id="dkMs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e6" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
    const river = SV(`<path d="M720 760 Q600 792 480 792 Q360 796 240 802 Q120 808 0 800 L0 852 Q140 856 260 846 Q400 836 520 830 Q640 822 740 792Z" fill="url(#dkRv)"/>
      <g class="dk-rvl" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7"><path d="M690 780 Q560 806 420 810 Q280 816 140 824 Q60 828 0 826"/><path d="M640 800 Q520 816 380 820 Q240 828 90 836"/></g>`,
      `<linearGradient id="dkRv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d4d6"/><stop offset=".5" stop-color="#6fa8b4"/><stop offset="1" stop-color="#4f8c98"/></linearGradient>`);
    const trees = SV(`${[[18, 860, 1.9, 0], [78, 880, 1.5, 1], [130, 850, 1.25, 2], [742, 880, 1.8, 3], [700, 900, 1.3, 4]].map(([x, y, s2, i]) => tree(x, y, s2, ['#1f5236', '#2d6e44', '#4a8e54'], i)).join('')}`);
    const yard = SV(`<path d="M0 862 Q392 830 784 862 L784 1168 L0 1168Z" fill="url(#dkYd)"/>
      ${Array.from({ length: 34 }, (_, i) => { const x = i * 24 + rnd(i, 3) * 10, y = 852 + Math.abs(392 - x) * 0.03 + rnd(i, 4) * 6; return `<path d="M${f1(x)} ${f1(y)} q-3 -10 -8 -14 M${f1(x)} ${f1(y)} q1 -12 4 -16 M${f1(x)} ${f1(y)} q4 -8 10 -10" stroke="#4f7f3a" stroke-width="2" fill="none"/>`; }).join('')}
      ${[[392, 905, 34], [380, 950, 40], [402, 1000, 46], [388, 1056, 52]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${w * 0.28}" fill="#b89a6e" stroke="#8a6a40" stroke-width="1.5" opacity=".9"/>`).join('')}
      <ellipse cx="250" cy="985" rx="70" ry="12" fill="#5a3a1a" opacity=".22"/><ellipse cx="545" cy="975" rx="70" ry="12" fill="#5a3a1a" opacity=".22"/><ellipse cx="395" cy="955" rx="56" ry="9" fill="#5a3a1a" opacity=".2"/>`,
      `<linearGradient id="dkYd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b880"/><stop offset=".5" stop-color="#c8a06a"/><stop offset="1" stop-color="#a87e4c"/></linearGradient>`);
    return `<div class="dk-w">
      ${L(-1, 'sky', sky + '<div class="dk-rays"></div>')}
      ${L(-0.85, 'clouds', clouds)}
      ${L(-0.7, 'mtn', mtn)}
      <div class="dk-l flyfar" data-z="-0.6"></div>
      ${L(-0.5, 'hills', hills + `<div class="dk-wf" style="${P(650, 508, 40)};height:${(266 / 11.68).toFixed(2)}%"><i></i><i></i></div><div class="dk-wf thin" style="${P(714, 528, 14)};height:${(230 / 11.68).toFixed(2)}%"><i></i></div><div class="dk-spray" style="${P(606, 738, 132)}"></div>`)}
      ${L(-0.35, 'river', river)}
      ${L(-0.25, 'trees', trees)}
      ${L(-0.1, 'lamin', `<svg viewBox="0 0 784 1168" preserveAspectRatio="none">${bunting(93, 600, 392, 488, 70, 14)}${bunting(392, 488, 691, 600, 70, 14)}</svg><div class="dk-o" style="${P(132, 598, 520)}">${lamin()}</div><div class="dk-o" style="${P(64, 588, 58)}">${totem()}</div><div class="dk-o" style="${P(662, 588, 58)}">${totem()}</div><div class="dk-o dk-perch" style="${P(630, 548, 110)}">${hornbill({ perch: 1 })}</div>`)}
      ${L(0.15, 'yard', yard + (o.bg ? '' : `<div class="dk-o" style="${P(318, 794, 152)}">${sapePlayer()}</div><div class="dk-o" style="${P(160, 684, 180)}">${dancerF()}</div><div class="dk-o" style="${P(448, 694, 190)}">${dancerM()}</div>`))}
      ${L(0.5, 'front', `<div class="dk-o" style="${P(-84, 818, 360)}">${bush(0, 1)}</div><div class="dk-o" style="${P(508, 818, 360)}">${bush(1, 5)}</div>${o.bg ? '' : `<div class="dk-o" style="${P(-30, 0, 240)}">${canopy(0)}</div><div class="dk-o" style="${P(574, 0, 240)}">${canopy(1)}</div>`}`)}
      <div class="dk-l flynear" data-z="0.7"></div>
    </div>`;
  }
  // gerak hidup dunia: parallax berlapis, enggang terbang dekat-jauh, kupu-kupu di sekitar anggrek
  function start(stage) {
    const W = stage && stage.querySelector('.dk-w'); if (!W || W.dataset.on) return; W.dataset.on = 1;
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const layers = [...W.querySelectorAll('.dk-l')].map((el) => ({ el, z: +el.dataset.z }));
    let tx = 0, ty = 0, px = 0, py = 0, t0 = performance.now(), raf = 0;
    addEventListener('pointermove', (e) => { if (e.pointerType && e.pointerType !== 'mouse') return; tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
    const tick = (now) => {
      raf = requestAnimationFrame(tick); if (!W.isConnected) { cancelAnimationFrame(raf); return; }
      if (document.hidden || scrollY > innerHeight * 1.2) return;
      const t = (now - t0) / 1000; px += (tx - px) * 0.04; py += (ty - py) * 0.04;
      const ix = Math.sin(t * 0.21) * 0.6 + px, iy = Math.cos(t * 0.17) * 0.4 + py, sc = Math.min(scrollY / innerHeight, 1);
      for (const l of layers) l.el.style.transform = `translate3d(${(-ix * l.z * 1.1).toFixed(2)}cqw,${(-iy * l.z * 0.8 + sc * l.z * 6).toFixed(2)}cqw,0) scale(${(1.04 + Math.max(0, l.z) * 0.02).toFixed(3)})`;
    };
    // HP/tablet: tanpa parallax per-frame (tiap lapisan selebar layar akan jadi lapisan GPU -> memori iPhone habis)
    if (!reduce && matchMedia('(pointer:fine)').matches) raf = requestAnimationFrame(tick);
    if (reduce) return;
    const far = W.querySelector('.flyfar'), near = W.querySelector('.flynear');
    // enggang: kadang jauh (kecil, di antara gunung), kadang dekat (besar, melintas di depan kamera)
    const fly = (isNear) => {
      if (document.hidden || !W.isConnected || W.closest('.cin-off')) return;
      const box = isNear ? near : far, el = document.createElement('div'); el.className = 'dk-flyer'; el.innerHTML = hornbill(); box.appendChild(el);
      const dir = Math.random() < 0.5 ? 1 : -1, n = isNear ? 1 : 1 + Math.floor(Math.random() * 3);
      for (let i = 1; i < n; i++) { const e2 = el.cloneNode(true); e2.style.marginTop = i * 3 + 'cqw'; e2.style.marginLeft = -dir * i * 6 + 'cqw'; e2.querySelector('.w1').style.animationDelay = e2.querySelector('.w2').style.animationDelay = -i * 0.17 + 's'; box.appendChild(e2); go(e2, i); }
      go(el, 0);
      function go(e, i) {
        const y0 = isNear ? 60 + Math.random() * 20 : 34 + Math.random() * 10, y1 = isNear ? 30 + Math.random() * 30 : 30 + Math.random() * 12;
        const s0 = isNear ? 0.6 : 0.35, s1 = isNear ? 2.6 : 0.6, w = isNear ? 22 : 9;
        e.style.width = w + '%';
        const kf = []; for (let k = 0; k <= 12; k++) { const u = k / 12, x = dir > 0 ? -30 + u * 150 : 120 - u * 150, y = y0 + (y1 - y0) * u + Math.sin(u * Math.PI * 2) * 2.5, s = s0 + (s1 - s0) * (isNear ? u * u : u); kf.push({ transform: `translate3d(${f1(x)}cqw,${f1(y * 1.49)}cqw,0) scale(${s.toFixed(3)}) scaleX(${dir}) rotate(${f1(Math.cos(u * Math.PI * 2) * 6)}deg)`, opacity: u < 0.06 ? u / 0.06 : 1 }); }
        e.animate(kf, { duration: (isNear ? 6500 : 15000) + i * 400, delay: i * 200, easing: 'linear', fill: 'both' }).onfinish = () => e.remove();
      }
    };
    W._fly = fly; setTimeout(() => fly(false), 2500); setInterval(() => fly(Math.random() < 0.35), 9000);
    // kupu-kupu Rajah Brooke mengitari anggrek di semak depan
    const front = W.querySelector('.front');
    for (let i = 0; i < 3; i++) {
      const b = document.createElement('div'); b.className = 'dk-bfly'; b.innerHTML = birdwing(); front.appendChild(b);
      let x = i % 2 ? 80 : 12, y = 82 + Math.random() * 8;
      const hop = () => { if (!b.isConnected) return; if (W.closest('.cin-off')) { setTimeout(hop, 1500); return; } const nx = (i % 2 ? 62 : 4) + Math.random() * 30, ny = 76 + Math.random() * 18, a = Math.atan2(ny - y, nx - x) * 57.3 + 90; b.animate([{ transform: `translate3d(${f1(x)}cqw,${f1(y * 1.49)}cqw,0) rotate(${f1(a)}deg)` }, { transform: `translate3d(${f1((x + nx) / 2 + (Math.random() - 0.5) * 10)}cqw,${f1(((y + ny) / 2 - 4) * 1.49)}cqw,0) rotate(${f1(a + 20)}deg)`, offset: 0.5 }, { transform: `translate3d(${f1(nx)}cqw,${f1(ny * 1.49)}cqw,0) rotate(${f1(a)}deg)` }], { duration: 2400 + Math.random() * 2000, easing: 'ease-in-out', fill: 'forwards' }).onfinish = () => setTimeout(hop, 300 + Math.random() * 1500); x = nx; y = ny; };
      setTimeout(hop, i * 700);
    }
  }

  window.DAYAK = { C, feather, fan, curl, hook, motif, shield, shieldBack, hornbill, birdwing, orchid, leaf, blade, pitcher, tree, cloud, dancerF, dancerM, sapePlayer, lamin, totem, batangGaring, SH, bush, canopy, bunting, world, start, flyNow: (stage, near) => { const w = stage && stage.querySelector('.dk-w'); if (w && w._fly) w._fly(near); } };
})();
