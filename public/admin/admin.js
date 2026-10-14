(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'value') e.value = v;
      else if (k === 'checked') e.checked = !!v;
      else e.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return e;
  }
  const api = async (url, opt = {}) => {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), opt.timeout || 20000);
    let r;
    try { r = await fetch(url, { credentials: 'same-origin', ...opt, signal: ctl.signal }); }
    catch (e) { throw new Error(e.name === 'AbortError' ? 'Server terlalu lama merespons (' + url + ')' : 'Tidak dapat terhubung ke server (' + url + ')'); }
    finally { clearTimeout(tm); }
    let d = null; try { d = await r.json(); } catch { /* bukan JSON */ }
    if (r.status === 401 && !url.includes('/login')) { showLogin(); throw Object.assign(new Error('Sesi berakhir'), { auth: true }); }
    if (!r.ok) throw new Error((d && d.error) || ('Server membalas ' + r.status + (d ? '' : ' (bukan JSON — rute API mungkin tidak terpasang)') + ' • ' + url));
    return d;
  };
  let toastT;
  function toast(m, bad) { const t = $('#toast'); t.textContent = m; t.classList.toggle('bad', !!bad); t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

  let cfg = null, defaults = null, snap = '', current = 'general', defaultPw = false;

  // ---------- path helper ----------
  function parentOf(root, path) {
    const ks = path.split('.'); let o = root;
    for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; }
    return [o, ks[ks.length - 1]];
  }
  const getPath = (root, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), root);

  // ---------- dirty & preview ----------
  let pvT;
  function changed(fast) {
    $('#dirty').hidden = JSON.stringify(cfg) === snap;
    clearTimeout(pvT); pvT = setTimeout(sendPreview, fast === true ? 120 : 450);
  }
  const post = (msg) => { const f = $('#pvFrame'); try { f.contentWindow.postMessage(msg, location.origin); } catch { /* iframe belum siap */ } };
  function sendPreview() { post({ type: 'cfg', cfg }); }
  // pratinjau ikut melompat ke section yang sedang diedit
  function gotoPreview() { if (current && current !== 'cover') post({ type: 'goto', id: current }); }
  function loadPreview() { const g = $('#pvGuest').value; $('#pvFrame').src = '/?preview=1' + ($('#pvMode').value ? '&cover=1' : '') + (g ? '&to=' + encodeURIComponent(g) : ''); }
  $('#pvFrame').addEventListener('load', () => { sendPreview(); setTimeout(gotoPreview, 700); });
  $('#pvReload').onclick = () => { try { sessionStorage.removeItem('pvCfg'); } catch { /* */ } loadPreview(); };
  $('#pvGuest').onchange = loadPreview; $('#pvMode').onchange = loadPreview;
  $('#pvToggle').onclick = () => $('#preview').classList.toggle('show');
  $('#menuBtn').onclick = () => $('#nav').classList.toggle('open');
  addEventListener('beforeunload', (e) => { if (cfg && JSON.stringify(cfg) !== snap) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });

  // ---------- login ----------
  function showLogin() { $('#boot').hidden = true; $('#app').hidden = true; $('#login').hidden = false; setTimeout(() => { const p = $('#pw'); if (p) p.focus(); }, 50); }
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); $('#loginErr').textContent = '';
    try { const r = await api('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) }); defaultPw = r.defaultPassword; $('#pw').value = ''; boot(); }
    catch (er) { $('#loginErr').textContent = er.message; }
  });
  $('#logout').onclick = async () => { await api('/api/logout', { method: 'POST' }); location.reload(); };
  $('#saveBtn').onclick = () => save();

  async function save() {
    const b = $('#saveBtn'); b.disabled = true;
    try { await api('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) }); snap = JSON.stringify(cfg); $('#dirty').hidden = true; toast('Tersimpan ✓ — undangan sudah diperbarui'); }
    catch (e) { toast(e.message, true); }
    b.disabled = false;
  }

  // ---------- upload ----------
  function pickFile(accept, multiple) {
    return new Promise((res) => { const i = h('input', { type: 'file', accept, multiple: multiple || null }); i.onchange = () => res([...i.files]); i.click(); });
  }
  // Kecilkan foto besar. PNG/gambar transparan -> WebP (transparansi tetap, ukuran jauh lebih kecil)
  async function shrink(file) {
    if (!/^image\/(jpeg|webp|png)$/.test(file.type) || file.size < 700e3) return file;
    try {
      const bmp = await createImageBitmap(file); const max = 2000; const sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const isPng = file.type === 'image/png';
      const mime = isPng ? 'image/webp' : 'image/jpeg', ext = isPng ? '.webp' : '.jpg';
      const blob = await new Promise((r) => c.toBlob(r, mime, 0.88));
      if (!blob || blob.type !== mime || blob.size >= file.size) return file;
      return new File([blob], file.name.replace(/\.\w+$/, ext), { type: mime });
    } catch { return file; }
  }
  async function upload(file) {
    const f = await shrink(file);
    if (f.size <= 3.8e6) { // file kecil: lewat server (paling andal)
      const r = await fetch('/api/admin/upload?name=' + encodeURIComponent(f.name), { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: f, credentials: 'same-origin' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || (r.status === 401 ? 'Sesi login habis — muat ulang halaman admin lalu login lagi' : r.status === 413 ? 'File terlalu besar (maks ±4MB lewat jalur ini)' : 'Upload gagal (' + r.status + ')'));
      return d.url;
    }
    // file besar (musik/video): langsung ke Supabase lewat URL bertanda tangan
    const d = await api('/api/admin/upload-url?name=' + encodeURIComponent(f.name), { method: 'POST' });
    const fd = new FormData(); fd.append('cacheControl', '31536000'); fd.append('', f);
    const r = await fetch(d.uploadUrl, { method: 'PUT', body: fd });
    if (!r.ok) throw new Error('Upload ke Supabase gagal (' + r.status + '). Cek bucket "uploads" & batas ukuran file di Supabase.');
    return d.url;
  }
  async function openLibrary(filter) {
    const m = $('#lib'), g = $('#libGrid'); g.textContent = 'Memuat…'; m.hidden = false;
    const items = (await api('/api/admin/uploads')).filter((u) => filter === 'audio' ? /\.(mp3|m4a|ogg|wav)$/i.test(u.url) : filter === 'video' ? /\.(mp4|webm)$/i.test(u.url) : /\.(png|jpe?g|webp|gif|svg)$/i.test(u.url));
    return new Promise((res) => {
      const close = (v) => { m.hidden = true; res(v); };
      m.querySelector('[data-close]').onclick = () => close(null); m.onclick = (e) => { if (e.target === m) close(null); };
      g.textContent = '';
      if (!items.length) g.textContent = 'Belum ada file yang diunggah.';
      items.forEach((u) => g.append(h('button', { onclick: () => close(u.url) }, filter === 'audio' ? h('div', { class: 'im' }, '♪') : filter === 'video' ? h('div', { class: 'im' }, '▶') : h('div', { class: 'im', style: `background-image:url("${u.url}")` }), h('small', {}, u.url.split('/').pop()))));
    });
  }

  // ---------- editor posisi foto: geser, zoom, mode utuh/penuh, kegelapan latar ----------
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function openAdjust(f, obj, key, onChange) {
    const url = obj[key]; if (!url) { toast('Unggah / pilih foto dulu', true); return; }
    const ch = () => { obj[key + 'Adj'] = { ...a }; (onChange || (() => changed(true)))(); };
    const A0 = { x: 50, y: 50, z: 1, fit: 'cover', o: 100 };
    let a = { ...A0, ...(obj[key + 'Adj'] || {}) };
    const ratio = () => (f.arKey ? getPath(cfg, f.arKey) : f.ar) || '4/5';
    const m = $('#adj'), body = $('#adjBody'); body.textContent = '';
    const im = h('img', { src: url, alt: '', draggable: 'false' });
    const fill = h('span', { class: 'bfill', style: `background-image:url("${String(url).replace(/"/g, '')}")` });
    const stage = h('div', { class: 'adj-stage' + (f.round ? ' round' : '') + (f.arch ? ' arch' : '') }, fill, im, h('i', { class: 'grid3' }));
    const shade = h('i', { class: 'shade' }); if (f.bg) stage.append(shade);
    const paintStage = () => {
      const r = ratio(); stage.style.aspectRatio = r; stage.style.width = `min(460px, 100%, calc(58vh * (${r})))`;
      im.style.objectFit = a.fit === 'contain' ? 'contain' : 'cover';
      im.style.objectPosition = `${a.x}% ${a.y}%`; im.style.transformOrigin = `${a.x}% ${a.y}%`; im.style.transform = `scale(${a.z})`;
      fill.style.display = a.fit === 'contain' ? '' : 'none';
      shade.style.opacity = a.o / 100;
      zr.value = Math.round(a.z * 100); zv.textContent = Math.round(a.z * 100) + '%';
      xr.value = a.x; yr.value = a.y; if (orr) { orr.value = a.o; ov.textContent = a.o + '%'; }
      bc.classList.toggle('on', a.fit !== 'contain'); bu.classList.toggle('on', a.fit === 'contain');
    };
    const set = (patch) => { a = { ...a, ...patch }; a.x = clamp(+a.x, 0, 100); a.y = clamp(+a.y, 0, 100); a.z = clamp(+a.z, 1, 4); paintStage(); ch(); };
    // geser dengan mouse / jari
    let drag = null;
    stage.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; stage.setPointerCapture(e.pointerId); stage.classList.add('drag'); });
    stage.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
      const W = stage.clientWidth, H = stage.clientHeight, iw = im.naturalWidth || W, ih = im.naturalHeight || H;
      const sc = a.fit === 'contain' ? Math.min(W / iw, H / ih) : Math.max(W / iw, H / ih);
      const rx = Math.max(iw * sc - W, 0) + W * (a.z - 1), ry = Math.max(ih * sc - H, 0) + H * (a.z - 1);
      set({ x: rx > 2 ? a.x - dx / rx * 100 : a.x, y: ry > 2 ? a.y - dy / ry * 100 : a.y });
    });
    const end = () => { drag = null; stage.classList.remove('drag'); };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', (e) => { e.preventDefault(); set({ z: a.z * (e.deltaY < 0 ? 1.06 : 1 / 1.06) }); }, { passive: false });
    const zr = h('input', { type: 'range', min: 100, max: 400, step: 1, oninput: (e) => set({ z: e.target.value / 100 }) }), zv = h('b');
    const xr = h('input', { type: 'range', min: 0, max: 100, step: 0.5, oninput: (e) => set({ x: +e.target.value }) });
    const yr = h('input', { type: 'range', min: 0, max: 100, step: 0.5, oninput: (e) => set({ y: +e.target.value }) });
    const orr = f.bg ? h('input', { type: 'range', min: 0, max: 100, step: 1, oninput: (e) => set({ o: +e.target.value }) }) : null, ov = h('b');
    const bc = h('button', { type: 'button', class: 'seg', onclick: () => set({ fit: 'cover' }) }, 'Penuhi bingkai'), bu = h('button', { type: 'button', class: 'seg', onclick: () => set({ fit: 'contain', z: 1 }) }, 'Tampilkan foto utuh');
    const ctl = h('div', { class: 'adj-ctl' },
      h('div', { class: 'segs' }, bc, bu),
      f.arKey ? h('label', {}, 'Bentuk bingkai', (() => { const fdef = SCHEMA.flatMap((g) => g.fields).find((x) => x.k === f.arKey); const sel = h('select', { onchange: (e) => { const [o, k] = parentOf(cfg, f.arKey); o[k] = e.target.value; paintStage(); changed(true); } }, (fdef ? fdef.o : []).map(([v, t]) => h('option', { value: v }, t))); sel.value = ratio(); return sel; })()) : null,
      h('label', {}, h('span', {}, 'Zoom ', zv), zr),
      h('label', {}, 'Geser kiri ↔ kanan', xr),
      h('label', {}, 'Geser atas ↕ bawah', yr),
      orr ? h('label', {}, h('span', {}, 'Kegelapan lapisan agar teks terbaca ', ov), orr) : null,
      h('div', { class: 'row', style: 'margin-top:6px;flex-wrap:wrap' },
        h('button', { type: 'button', class: 'btn sm', onclick: () => set({ x: 50, y: 50 }) }, 'Ke tengah'),
        h('button', { type: 'button', class: 'btn sm', onclick: () => set({ ...A0 }) }, 'Reset'),
        h('span', { class: 'sp' }),
        h('button', { type: 'button', class: 'btn pri', onclick: () => close() }, 'Selesai')));
    body.append(h('p', { class: 'hint', style: 'margin:0 0 10px' }, 'Seret foto untuk menggeser, scroll/slider untuk zoom. Pratinjau di kanan langsung ikut berubah. Pilih "Tampilkan foto utuh" bila tidak ingin foto terpotong (sisa ruang diisi versi blur).'),
      h('div', { class: 'adj-wrap' }, h('div', { class: 'adj-sw' }, stage), ctl));
    const close = () => { m.hidden = true; };
    m.querySelector('[data-close]').onclick = close; m.onclick = (e) => { if (e.target === m) close(); };
    m.hidden = false; paintStage();
  }

  // ---------- render field ----------
  function field(f, obj, key, onChange) {
    const wrap = h('div', { class: 'fld' });
    const label = h('label', {}, f.l); const get = () => obj[key];
    const set = (v) => { obj[key] = v; (onChange || changed)(); };
    const defVal = f._def;
    if (f.t === 'bool') {
      wrap.append(h('label', { class: 'sw' }, h('input', { type: 'checkbox', checked: !!get(), onchange: (e) => set(e.target.checked) }), h('span', {}, f.l)));
    } else if (f.t === 'area') {
      wrap.append(label, h('textarea', { oninput: (e) => set(e.target.value) }, get() || ''));
      wrap.querySelector('textarea').value = get() || '';
    } else if (f.t === 'select') {
      const opts = f.o.map((o) => (Array.isArray(o) ? o : [o, o]));
      const sel = h('select', { onchange: (e) => {
        set(e.target.value);
        const pr = f.preset && typeof THEME_PRESETS !== 'undefined' && THEME_PRESETS[e.target.value];
        if (pr && confirm('Terapkan juga warna & font bawaan tema ini? (bisa diubah lagi setelahnya)')) { Object.assign(cfg.theme, pr); changed(true); show(current); }
      } }, opts.map(([v, t]) => h('option', { value: v }, t)));
      sel.value = get(); wrap.append(label, sel);
    } else if (f.t === 'color') {
      const tx = h('input', { type: 'text', value: get() || '', oninput: (e) => { set(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) cp.value = e.target.value; } });
      const cp = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(get() || '') ? get() : '#000000', oninput: (e) => { tx.value = e.target.value; set(e.target.value); } });
      wrap.append(label, h('div', { class: 'row' }, cp, tx));
    } else if (f.t === 'number') {
      wrap.append(label, h('input', { type: 'number', min: f.min, max: f.max, value: get(), oninput: (e) => set(e.target.value === '' ? '' : +e.target.value) }));
    } else if (f.t === 'datetime') {
      wrap.append(label, h('input', { type: 'datetime-local', value: (get() || '').slice(0, 16), oninput: (e) => set(e.target.value) }));
    } else if (f.t === 'image' || f.t === 'audio' || f.t === 'video') {
      const isImg = f.t === 'image', isAud = f.t === 'audio';
      const th = isImg ? h('div', { class: 'thumb' + (f.deco ? ' contain' : '') + (f.round ? ' round' : ''), title: f.deco ? '' : 'Klik untuk atur posisi', onclick: () => { if (!f.deco) openAdjust(f, obj, key, () => { (onChange || changed)(true); if (wrap._paint) wrap._paint(); }); } }) : null;
      const tx = h('input', { type: 'text', placeholder: isImg ? 'URL gambar atau unggah…' : isAud ? 'URL mp3 atau unggah…' : 'Link YouTube, URL .mp4, atau unggah video…', value: get() || '', oninput: (e) => { set(e.target.value); paint(); } });
      const au = isAud ? h('audio', { controls: true, style: 'width:100%;margin-top:6px;height:34px' }) : null;
      const paint = () => {
        if (th) { th.style.backgroundImage = get() ? `url("${String(get()).replace(/"/g, '')}")` : 'none'; const a = obj[key + 'Adj']; if (!f.deco) th.style.backgroundPosition = a ? `${a.x ?? 50}% ${a.y ?? 50}%` : ''; }
        if (au) { au.hidden = !get(); if (get()) au.src = get(); }
      };
      wrap._paint = paint;
      const apply = (u) => { tx.value = u; set(u); paint(); };
      const btns = h('div', { class: 'acts' },
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const [fl] = await pickFile(isImg ? 'image/*' : isAud ? 'audio/*' : 'video/*'); if (!fl) return; try { toast('Mengunggah…'); apply(await upload(fl)); toast('Terunggah ✓ — klik SIMPAN agar tampil di undangan'); } catch (e) { toast(e.message, true); } } }, 'Unggah'),
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const u = await openLibrary(isImg ? 'image' : isAud ? 'audio' : 'video'); if (u) apply(u); } }, 'Pustaka'),
        isImg && !f.deco ? h('button', { class: 'btn sm pri', type: 'button', onclick: () => openAdjust(f, obj, key, () => { (onChange || changed)(true); paint(); }) }, '✥ Atur posisi') : null,
        defVal !== undefined ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply(defVal) }, 'Default') : null,
        !isImg ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply('') }, 'Hapus') : null);
      paint();
      wrap.append(label, h('div', { class: 'imgf' }, th, h('div', { style: 'flex:1;min-width:0' }, tx, btns, au)));
    } else if (f.t === 'palette') {
      const grid = h('div', { class: 'pals' });
      const paint = () => grid.querySelectorAll('.pal').forEach((b) => b.classList.toggle('on', b.dataset.id === (get() || 'auto')));
      PALETTES.forEach((pl) => {
        const lay = ['rose', 'princess'].includes(cfg.theme.preset) ? 'rose' : 'jawa';
        const nat = { jawa: 'maroon', rose: 'pink' }[lay];
        const fl = pl.id === 'auto' || pl.id === nat ? (lay === 'rose' ? '/assets/rose/rose-bouquet.webp' : '/assets/scene/bouquet.webp') : `/assets/pal/${pl.id}/${lay}-bouquet.webp`;
        const cols = pl.c ? [pl.c.primary, pl.c.accent, pl.c.gold, pl.c.paper] : [];
        grid.append(h('button', { type: 'button', class: 'pal', 'data-id': pl.id, onclick: () => {
          obj[key] = pl.id;
          if (pl.c) Object.assign(cfg.theme, pl.c);
          else if (typeof THEME_PRESETS !== 'undefined') Object.assign(cfg.theme, THEME_PRESETS[cfg.theme.preset] || THEME_PRESETS[lay]);
          changed(true); show(current);
        } }, h('img', { src: fl, alt: '' }), h('b', {}, pl.name), h('span', { class: 'dots' }, cols.map((c) => h('i', { style: `background:${c}` }))), pl.note ? h('small', {}, pl.note) : null));
      });
      paint(); wrap.append(label, grid);
    } else if (f.t === 'list') {
      wrap.append(label, listField(f, obj, key, onChange));
    } else {
      wrap.append(label, h('input', { type: f.t === 'url' ? 'url' : 'text', value: get() == null ? '' : get(), oninput: (e) => set(e.target.value) }));
      if (f.t === 'url') wrap.querySelector('input').type = 'text';
    }
    return wrap;
  }

  function blank(fields) { const o = {}; fields.forEach((f) => { o[f.k] = f.t === 'bool' ? false : f.t === 'list' ? [] : ''; }); return o; }
  function listField(f, obj, key, onChange) {
    if (!Array.isArray(obj[key])) obj[key] = [];
    const arr = obj[key], ch = onChange || changed;
    const box = h('div', { class: 'list' });
    const photoOnly = f.fields.length === 1 && f.fields[0].t === 'image';
    const render = () => {
      box.textContent = '';
      if (photoOnly) {
        const g = h('div', { class: 'gl' });
        arr.forEach((it, i) => g.append(h('div', { class: 'g' }, h('div', { class: 'im', title: 'Klik untuk atur posisi', onclick: () => openAdjust(f.fields[0], it, f.fields[0].k, () => { ch(true); render(); }), style: `background-image:url("${String(it[f.fields[0].k] || '').replace(/"/g, '')}");background-position:${(it[f.fields[0].k + 'Adj'] || {}).x ?? 50}% ${(it[f.fields[0].k + 'Adj'] || {}).y ?? 50}%;aspect-ratio:${f.fields[0].ar || '3/4'}` }),
          h('div', { class: 't' },
            h('span', {}, h('button', { title: 'Geser kiri', onclick: () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; ch(); render(); } } }, '←'), h('button', { title: 'Geser kanan', onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; ch(); render(); } } }, '→')),
            h('button', { title: 'Atur posisi', onclick: () => openAdjust(f.fields[0], it, f.fields[0].k, () => { ch(true); render(); }) }, '✥'),
            h('button', { title: 'Hapus', onclick: () => { arr.splice(i, 1); ch(); render(); } }, '🗑')))));
        g.append(h('div', { class: 'add', onclick: async () => {
          const files = await pickFile('image/*', true); if (!files.length) return;
          toast(`Mengunggah ${files.length} foto…`);
          for (const fl of files) { try { arr.push({ [f.fields[0].k]: await upload(fl) }); } catch (e) { toast(e.message, true); } }
          ch(); render(); toast('Selesai ✓');
        } }, '+ ' + (f.addLabel || 'Tambah')));
        box.append(g); return;
      }
      arr.forEach((it, i) => {
        const item = h('div', { class: 'item closed' });
        const title = h('b', {}, (f.itemTitle && it[f.itemTitle]) || `${f.addLabel ? f.addLabel.replace(/^Tambah /, '') : 'Item'} ${i + 1}`);
        const mv = (d) => (e) => { e.stopPropagation(); const j = i + d; if (j < 0 || j >= arr.length) return; [arr[j], arr[i]] = [arr[i], arr[j]]; ch(); render(); };
        item.append(h('div', { class: 'ih', onclick: () => item.classList.toggle('closed') }, '▸ ', title,
          h('button', { class: 'ghost sm', type: 'button', onclick: mv(-1) }, '↑'), h('button', { class: 'ghost sm', type: 'button', onclick: mv(1) }, '↓'),
          h('button', { class: 'ghost sm btn danger', type: 'button', onclick: (e) => { e.stopPropagation(); if (confirm('Hapus item ini?')) { arr.splice(i, 1); ch(); render(); } } }, 'Hapus')));
        const body = h('div', { class: 'ib' });
        f.fields.forEach((sf) => body.append(field(sf, it, sf.k, () => { if (f.itemTitle) title.textContent = it[f.itemTitle] || title.textContent; ch(); })));
        item.append(body); box.append(item);
      });
      box.append(h('div', {}, h('button', { class: 'btn', type: 'button', onclick: () => { const n = blank(f.fields); arr.push(n); ch(); render(); box.querySelector('.item:last-of-type')?.classList.remove('closed'); } }, '+ ' + (f.addLabel || 'Tambah'))));
    };
    render(); return box;
  }

  // ---------- views ----------
  function attachDefaults(fields, prefix) {
    fields.forEach((f) => { if (f.t === 'image' || f.t === 'audio') { const v = getPath(defaults, f.k); if (v !== undefined) f._def = v; } });
  }
  SCHEMA.forEach((g) => attachDefaults(g.fields));

  function groupView(g) {
    const m = h('div', {}, h('h2', {}, g.title), g.hint ? h('p', { class: 'hint' }, g.hint) : null);
    const card = h('div', { class: 'card' });
    g.fields.forEach((f) => { const [o, k] = parentOf(cfg, f.k); card.append(field(f, o, k)); });
    m.append(card, h('button', { class: 'btn danger sm', onclick: () => { if (confirm(`Kembalikan seluruh pengaturan "${g.title}" ke bawaan?`)) { cfg[g.id] = clone(defaults[g.id]); changed(); show(g.id); } } }, 'Kembalikan bagian ini ke bawaan'));
    return m;
  }

  function sectionsView() {
    const m = h('div', {}, h('h2', {}, 'Urutan, Tampil & Animasi Section'), h('p', { class: 'hint' }, 'Atur urutan section, tampilkan/sembunyikan, dan pilih animasi muncul tiap section saat di-scroll.'));
    const wrap = h('div');
    const render = () => {
      wrap.textContent = '';
      cfg.sections.forEach((s, i) => {
        const mv = (d) => () => { const j = i + d; if (j < 0 || j >= cfg.sections.length) return; [cfg.sections[j], cfg.sections[i]] = [cfg.sections[i], cfg.sections[j]]; changed(); render(); };
        const sel = h('select', { onchange: (e) => { s.anim = e.target.value; changed(); } }, ANIMS.map(([v, t]) => h('option', { value: v }, t))); sel.value = s.anim;
        wrap.append(h('div', { class: 'secrow' },
          h('label', { class: 'sw' }, h('input', { type: 'checkbox', checked: s.enabled, onchange: (e) => { s.enabled = e.target.checked; changed(); } })),
          h('span', { class: 'nm' }, (i + 1) + '. ' + (SECTION_NAMES[s.id] || s.id)), sel,
          h('button', { class: 'ghost sm btn', onclick: mv(-1) }, '↑'), h('button', { class: 'ghost sm btn', onclick: mv(1) }, '↓')));
      });
    };
    render(); m.append(wrap, h('button', { class: 'btn sm', onclick: () => { const a = prompt('Terapkan animasi yang sama ke semua section? Ketik salah satu: ' + ANIMS.map((x) => x[0]).join(', '), 'fade-up'); if (a && ANIMS.some((x) => x[0] === a)) { cfg.sections.forEach((s) => (s.anim = a)); changed(); render(); } } }, 'Samakan animasi semua section'));
    return m;
  }

  const fmtT = (ts) => new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  const escH = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STATUS = { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Masih ragu' };
  function printRsvp(rows) {
    const w = window.open('', '_blank'); if (!w) { toast('Izinkan pop-up untuk mencetak PDF', true); return; }
    const hadir = rows.filter((r) => r.status === 'hadir'), tot = hadir.reduce((a, r) => a + (+r.count || 1), 0);
    const title = (cfg && cfg.general && cfg.general.title) || 'Undangan';
    const tr = rows.map((r, i) => `<tr><td>${i + 1}</td><td>${escH(r.name)}</td><td>${STATUS[r.status] || r.status}</td><td style="text-align:center">${r.status === 'hadir' ? (+r.count || 1) : '-'}</td><td>${escH(fmtT(r.ts))}</td></tr>`).join('');
    w.document.write(`<!doctype html><meta charset="utf-8"><title>Data Kehadiran</title><style>body{font:13px system-ui,Arial,sans-serif;color:#222;margin:28px}h1{font-size:20px;margin:0}p{color:#666;margin:4px 0 14px}.s{display:flex;gap:10px;margin-bottom:14px}.s div{border:1px solid #ddd;border-radius:8px;padding:8px 14px}.s b{display:block;font-size:20px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:7px 8px;text-align:left}th{background:#f5f0ee;font-size:11px;text-transform:uppercase}@media print{body{margin:12mm}}</style>
      <h1>Data Kehadiran Tamu</h1><p>${escH(title)} • dicetak ${escH(new Date().toLocaleString('id-ID'))}</p>
      <div class="s"><div><b>${tot}</b>Total tamu hadir</div><div><b>${hadir.length}</b>Konfirmasi hadir</div><div><b>${rows.filter((r) => r.status === 'tidak').length}</b>Tidak hadir</div><div><b>${rows.filter((r) => r.status === 'ragu').length}</b>Masih ragu</div></div>
      <table><thead><tr><th>No</th><th>Nama</th><th>Status</th><th>Jumlah</th><th>Waktu</th></tr></thead><tbody>${tr}</tbody></table>`);
    w.document.close(); w.focus(); setTimeout(() => w.print(), 450);
  }
  async function rsvpView() {
    const m = h('div', {});
    const rows = await api('/api/admin/rsvp');
    const hadir = rows.filter((r) => r.status === 'hadir'), tidak = rows.filter((r) => r.status === 'tidak'), ragu = rows.filter((r) => r.status === 'ragu');
    const tot = hadir.reduce((a, r) => a + (+r.count || 1), 0);
    m.append(h('div', { class: 'rhead' }, h('div', {}, h('h2', {}, 'Konfirmasi Kehadiran'), h('p', { class: 'hint', style: 'margin:0' }, 'Terpisah dari ucapan & doa')),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => show('d-rsvp') }, 'Refresh'), h('a', { class: 'btn', href: '/api/admin/rsvp.csv' }, '⬇ CSV'), h('button', { class: 'btn pri', onclick: () => printRsvp(rows) }, 'Cetak PDF'))));
    m.append(h('div', { class: 'total' }, h('small', {}, 'TOTAL TAMU YANG AKAN DATANG'), h('b', {}, tot), h('span', {}, 'orang')));
    m.append(h('div', { class: 'stats three' }, h('div', {}, h('small', {}, 'Respons'), h('b', {}, rows.length)), h('div', {}, h('small', {}, 'Hadir'), h('b', { class: 'ok' }, hadir.length)), h('div', {}, h('small', {}, 'Berhalangan'), h('b', { class: 'bad' }, tidak.length)), h('div', {}, h('small', {}, 'Masih ragu'), h('b', { class: 'wait' }, ragu.length))));
    const group = (title, list, cls, withCount) => {
      if (!list.length) return;
      const box = h('div', { class: 'glist ' + cls }, h('div', { class: 'gh' }, title + ' — ' + list.length + ' konfirmasi' + (withCount ? ' · ' + list.reduce((a, r) => a + (+r.count || 1), 0) + ' orang' : '')));
      list.forEach((r) => { const row = h('div', { class: 'gr' }, h('div', {}, h('b', {}, r.name), h('small', {}, (r.status === 'hadir' ? (+r.count || 1) + ' orang · ' : '') + fmtT(r.ts))),
        h('button', { class: 'ghost sm', onclick: async () => { if (!confirm('Hapus data ini?')) return; await api('/api/admin/rsvp/' + r.id, { method: 'DELETE' }); show('d-rsvp'); } }, 'Hapus')); box.append(row); });
      m.append(box);
    };
    group('Akan hadir', hadir, 'g-ok', true); group('Tidak hadir', tidak, 'g-bad', false); group('Masih ragu', ragu, 'g-wait', false);
    if (!rows.length) m.append(h('p', { class: 'hint' }, 'Belum ada konfirmasi kehadiran.'));
    return m;
  }
  async function dataView(kind) {
    if (kind === 'rsvp') return rsvpView();
    const titles = { rsvp: 'Data RSVP / Kehadiran', wishes: 'Ucapan & Doa', gifts: 'Konfirmasi Gift' };
    const m = h('div', {}, h('h2', {}, titles[kind]));
    const rows = await api('/api/admin/' + kind);
    if (kind === 'rsvp') {
      const hadir = rows.filter((r) => r.status === 'hadir');
      m.append(h('div', { class: 'stats' }, h('div', {}, h('b', {}, hadir.reduce((a, r) => a + (+r.count || 1), 0)), 'Orang hadir'), h('div', {}, h('b', {}, hadir.length), 'Konfirmasi hadir'), h('div', {}, h('b', {}, rows.filter((r) => r.status === 'tidak').length), 'Tidak hadir'), h('div', {}, h('b', {}, rows.filter((r) => r.status === 'ragu').length), 'Ragu')));
    }
    m.append(h('p', { style: 'margin-bottom:10px' }, h('a', { class: 'btn sm', href: `/api/admin/${kind}.csv` }, '⬇ Unduh CSV')));
    const cols = { rsvp: ['Nama', 'Status', 'Jumlah', 'Waktu'], wishes: ['Nama', 'Ucapan', 'Waktu'], gifts: ['Nama', 'Bank', 'Nominal', 'Ucapan', 'Bukti', 'Waktu'] }[kind];
    const tb = h('table', {}, h('thead', {}, h('tr', {}, cols.map((c) => h('th', {}, c)), h('th', {}))));
    const body = h('tbody');
    rows.forEach((r) => {
      const cells = kind === 'rsvp' ? [r.name, h('span', { class: 'tag ' + r.status }, { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Ragu' }[r.status]), r.count || '-', fmtT(r.ts)]
        : kind === 'wishes' ? [r.name, r.message, fmtT(r.ts)]
          : [r.name, r.bank, r.amount, r.message, r.proof ? h('a', { href: r.proof, target: '_blank', rel: 'noopener' }, 'Lihat') : '-', fmtT(r.ts)];
      const tr = h('tr', {}, cells.map((c) => h('td', {}, c)), h('td', {}, h('button', { class: 'btn danger sm', onclick: async () => { if (!confirm('Hapus data ini?')) return; await api(`/api/admin/${kind}/${r.id}`, { method: 'DELETE' }); tr.remove(); } }, 'Hapus')));
      body.append(tr);
    });
    tb.append(body);
    m.append(rows.length ? h('div', { class: 'tw' }, tb) : h('p', { class: 'hint' }, 'Belum ada data.'));
    return m;
  }

  function linksView() {
    const m = h('div', {}, h('h2', {}, 'Buat Link Tamu'), h('p', { class: 'hint' }, 'Tulis satu nama tamu per baris. Setiap tamu mendapat link pribadi yang menampilkan namanya di cover.'));
    const ls = (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* */ } };
    const names = h('textarea', { placeholder: 'Yogi dan Ratna\nBapak Budi & Keluarga\n…', style: 'min-height:120px' }, ls('lk_names', ''));
    const tpl = h('textarea', { style: 'min-height:130px' }, ls('lk_tpl', 'Assalamualaikum Wr. Wb.\n\nKepada Yth. {nama}\n\nKami mengundang Anda ke acara pernikahan kami. Detail undangan digital:\n{link}\n\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir. Terima kasih 🙏'));
    const out = h('div');
    const gen = () => {
      lsSet('lk_names', names.value); lsSet('lk_tpl', tpl.value); out.textContent = '';
      names.value.split('\n').map((s) => s.trim()).filter(Boolean).forEach((n) => {
        const link = `${location.origin}/?to=${encodeURIComponent(n).replace(/%20/g, '+')}`;
        const msg = tpl.value.replace(/\{nama\}/g, n).replace(/\{link\}/g, link);
        out.append(h('div', { class: 'linkrow' }, h('span', {}, n),
          h('button', { class: 'btn sm', onclick: () => navigator.clipboard.writeText(link).then(() => toast('Link disalin ✓')) }, 'Salin link'),
          h('button', { class: 'btn sm', onclick: () => navigator.clipboard.writeText(msg).then(() => toast('Pesan disalin ✓')) }, 'Salin pesan'),
          h('a', { class: 'btn sm pri', href: 'https://wa.me/?text=' + encodeURIComponent(msg), target: '_blank', rel: 'noopener' }, 'Kirim WhatsApp')));
      });
    };
    m.append(h('div', { class: 'card' }, h('div', { class: 'fld' }, h('label', {}, 'Daftar nama tamu'), names), h('div', { class: 'fld' }, h('label', {}, 'Template pesan (gunakan {nama} dan {link})'), tpl), h('button', { class: 'btn pri', onclick: gen }, 'Buat link')), out);
    gen(); return m;
  }

  function securityView() {
    const m = h('div', {}, h('h2', {}, 'Keamanan & Cadangan'));
    if (defaultPw) m.append(h('div', { class: 'warn' }, '⚠ Anda masih memakai password bawaan (admin123). Segera ganti lewat Vercel agar tidak mudah ditebak.'));
    m.append(h('div', { class: 'card' },
      h('p', { style: 'font-weight:600;margin-bottom:6px' }, 'Cara mengganti password admin'),
      h('ol', { style: 'padding-left:20px;display:grid;gap:4px' },
        h('li', {}, 'Buka Vercel → proyek ini → Settings → Environment Variables.'),
        h('li', {}, 'Isi/ubah variabel ', h('code', {}, 'ADMIN_PASSWORD'), ' dengan password baru.'),
        h('li', {}, 'Klik Redeploy. Password lama langsung tidak berlaku.')),
      h('p', { class: 'hint', style: 'margin:10px 0 0' }, 'Password disimpan di Vercel (bukan di database) sehingga tidak bisa bocor dari data undangan.')));
    m.append(h('div', { class: 'card' }, h('p', { class: 'hint' }, 'Cadangan: unduh seluruh konfigurasi isi undangan sebagai file JSON, atau pulihkan dari file cadangan.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' })), download: 'undangan-config.json' }); a.click(); } }, '⬇ Unduh konfigurasi'),
        h('button', { class: 'btn', onclick: async () => { const [f] = await pickFile('application/json'); if (!f) return; try { cfg = merge(defaults, JSON.parse(await f.text())); changed(); toast('Konfigurasi dimuat — klik Simpan untuk menerapkan'); show('general'); } catch { toast('File tidak valid', true); } } }, '⬆ Pulihkan dari file'))));
    return m;
  }
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  function merge(b, o) { if (!isObj(b) || !isObj(o)) return o === undefined ? b : o; const r = { ...b }; for (const k in o) r[k] = isObj(b[k]) && isObj(o[k]) ? merge(b[k], o[k]) : o[k]; return r; }

  // ---------- navigasi ----------
  function buildNav() {
    const n = $('#nav'); n.textContent = '';
    const add = (id, t) => n.append(h('button', { 'data-id': id, onclick: () => { show(id); n.classList.remove('open'); } }, t));
    n.append(h('h6', {}, 'Isi Undangan')); SCHEMA.slice(0, 5).forEach((g) => add(g.id, g.title)); add('sections', 'Urutan & Animasi Section');
    n.append(h('h6', {}, 'Konten Section')); SCHEMA.slice(5).forEach((g) => add(g.id, g.title));
    n.append(h('h6', {}, 'Data Tamu')); add('d-rsvp', 'RSVP / Kehadiran'); add('d-wishes', 'Ucapan Tamu'); add('d-gifts', 'Konfirmasi Gift'); add('links', 'Buat Link Tamu');
    n.append(h('h6', {}, 'Lainnya')); add('security', 'Keamanan & Cadangan');
  }
  async function show(id) {
    current = id;
    const wantCover = id === 'cover' ? '1' : ''; if ($('#pvMode').value !== wantCover && (id === 'cover' || $('#pvMode').value === '1')) { $('#pvMode').value = wantCover; if ($('#pvFrame').src) loadPreview(); }
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    const main = $('#main'); main.textContent = 'Memuat…';
    try {
      const g = SCHEMA.find((x) => x.id === id);
      const v = g ? groupView(g) : id === 'sections' ? sectionsView() : /^d-(rsvp|wishes|gifts)$/.test(id) ? await dataView(id.slice(2)) : id === 'links' ? linksView() : securityView();
      main.textContent = ''; main.append(v); scrollTo(0, 0);
      gotoPreview();
    } catch (e) { main.textContent = e.message; }
  }

  async function boot() {
    $('#boot').hidden = false; $('#bootMsg').textContent = 'Memuat…'; $('#bootMsg').className = '';
    try {
      const me = await api('/api/admin/me'); defaultPw = me.defaultPassword;
      const d = await api('/api/admin/config'); cfg = d.config; defaults = d.defaults;
      SCHEMA.forEach((g) => attachDefaults(g.fields));
      snap = JSON.stringify(cfg);
      $('#boot').hidden = true; $('#login').hidden = true; $('#app').hidden = false;
      window.__adminReady = true;
      buildNav(); show(defaultPw ? 'security' : current); loadPreview();
    } catch (er) {
      window.__adminReady = true;
      if (er && er.auth) return; // sudah diarahkan ke form login
      window.__adminFail('Gagal memuat admin: ' + ((er && er.message) || er));
    }
  }
  boot();
})();
