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

  let cfg = null, defaults = null, snap = '', current = 'home', defaultPw = false, lastSaved = null;
  // terapkan label singkat + penjelasan (ux.js)
  SCHEMA.forEach((g) => g.fields.forEach((f) => { const fr = FRIENDLY[f.k]; if (fr) { f.l = fr[0]; if (fr[1]) f.h = fr[1]; } }));

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
    paintSave(JSON.stringify(cfg) !== snap);
    clearTimeout(pvT); pvT = setTimeout(sendPreview, fast === true ? 120 : 450);
  }
  // true bila bagian menu ini punya perubahan yang belum disimpan
  function groupDirty(base, id) {
    if (id === 'sections') return JSON.stringify(cfg.sections) !== JSON.stringify(base.sections);
    const g = SCHEMA.find((x) => x.id === id); if (!g) return false;
    const j = (v) => JSON.stringify(v);
    return g.fields.some((f) => j(getPath(cfg, f.k)) !== j(getPath(base, f.k)) || (f.t === 'image' && j(getPath(cfg, f.k + 'Adj')) !== j(getPath(base, f.k + 'Adj'))));
  }
  const secOf = (id) => (cfg && cfg.sections || []).find((x) => x.id === id);
  function paintNavOff() { document.querySelectorAll('#nav button[data-id]').forEach((b) => { const x = secOf(b.dataset.id); b.classList.toggle('off', !!x && !x.enabled); }); }
  function moveSection(id, d) {
    const i = cfg.sections.findIndex((x) => x.id === id), j = i + d;
    if (i < 0 || j < 0 || j >= cfg.sections.length) return false;
    [cfg.sections[j], cfg.sections[i]] = [cfg.sections[i], cfg.sections[j]]; changed(true); return true;
  }
  let okT;
  function paintSave(dirty) {
    const sb = $('#saveBtn'), bar = $('#savebar');
    $('#dirty').hidden = !dirty;
    sb.textContent = dirty ? 'Simpan' : 'Tersimpan ✓'; sb.classList.toggle('pri', dirty); sb.classList.toggle('done', !dirty);
    if (dirty) { clearTimeout(okT); bar.classList.remove('ok'); bar.hidden = false; $('#sbMsg').textContent = 'Ada perubahan yang belum disimpan'; $('#sbSub').textContent = 'Pratinjau hanya contoh. Klik Simpan agar tampil di undangan asli.'; }
    else if (!bar.classList.contains('ok')) bar.hidden = true;
    paintNavOff();
    const base = JSON.parse(snap || '{}');
    document.querySelectorAll('#nav button[data-id]').forEach((b) => b.classList.toggle('mod', dirty && groupDirty(base, b.dataset.id)));
  }
  function discard() {
    if (!confirm('Buang semua perubahan yang belum disimpan dan kembali ke versi tersimpan?')) return;
    cfg = JSON.parse(snap); changed(true); show(current); toast('Perubahan dibuang');
  }
  const post = (msg) => { const f = $('#pvFrame'); try { f.contentWindow.postMessage(msg, location.origin); } catch { /* iframe belum siap */ } };
  function sendPreview() { post({ type: 'cfg', cfg }); }
  // pratinjau ikut melompat ke section yang sedang diedit
  function gotoPreview(id) { const t = id || current; if (t && t !== 'cover') post({ type: 'goto', id: t }); }
  // tunggu pratinjau selesai menerima urutan/isi baru, baru melompat ke bagian itu
  function gotoPreviewSoon(id) { clearTimeout(gotoT); gotoT = setTimeout(() => gotoPreview(id), 700); }
  let gotoT, replayT;
  function replayPreviewSoon(id, ms) { clearTimeout(replayT); replayT = setTimeout(() => post({ type: 'replay', id }), ms || 1600); }
  function loadPreview() { const g = $('#pvGuest').value; $('#pvFrame').src = '/?preview=1' + ($('#pvMode').value ? '&cover=1' : '') + (g ? '&to=' + encodeURIComponent(g) : ''); }
  // hasil menggeser teks cover langsung di pratinjau (Tema 12) -> simpan ke konfigurasi
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || e.data.type !== 'mnpos' || !cfg) return;
    const fr = $('#pvFrame'); if (!fr || e.source !== fr.contentWindow) return;
    cfg.mono = cfg.mono || {}; cfg.mono.pos = e.data.pos; changed(true);
    if (current === 'cover') { const sc = document.querySelector('.main, #main, main'); const y = sc ? sc.scrollTop : 0; show(current); if (sc) sc.scrollTop = y; }
  });
  $('#pvFrame').addEventListener('load', () => { sendPreview(); setTimeout(gotoPreview, 700); });
  $('#pvReload').onclick = () => { try { sessionStorage.removeItem('pvCfg'); } catch { /* */ } loadPreview(); };
  $('#pvGuest').onchange = loadPreview; $('#pvMode').onchange = loadPreview;
  $('#pvToggle').onclick = () => $('#preview').classList.toggle('show');
  $('#menuBtn').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#navBack').classList.toggle('show', o); };
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
  $('#saveBtn').onclick = () => save(); $('#sbSave').onclick = () => save(); $('#sbDiscard').onclick = discard;
  $('#navBack').onclick = () => { $('#nav').classList.remove('open'); $('#navBack').classList.remove('show'); };

  async function save() {
    if (JSON.stringify(cfg) === snap) { toast('Tidak ada perubahan untuk disimpan'); return; }
    const btns = [$('#saveBtn'), $('#sbSave')]; btns.forEach((b) => { b.disabled = true; b.textContent = 'Menyimpan…'; });
    const bar = $('#savebar');
    try {
      await api('/api/admin/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cfg) });
      snap = JSON.stringify(cfg); lastSaved = new Date();
      bar.classList.add('ok'); bar.hidden = false; $('#sbMsg').textContent = 'Tersimpan ✓ — undangan sudah diperbarui'; $('#sbSub').textContent = 'Terakhir disimpan pukul ' + lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      clearTimeout(okT); okT = setTimeout(() => { bar.classList.remove('ok'); paintSave(JSON.stringify(cfg) !== snap); }, 6000);
    } catch (e) { toast(e.message, true); }
    btns.forEach((b) => { b.disabled = false; });
    $('#sbSave').textContent = 'Simpan perubahan'; paintSave(JSON.stringify(cfg) !== snap);
  }

  // ---------- upload ----------
  function pickFile(accept, multiple) {
    return new Promise((res) => { if (/image\/\*/.test(accept)) accept += ',.heic,.heif,.avif,.bmp,.tif,.tiff,.jfif'; if (/video\/\*/.test(accept)) accept += ',.mov,.m4v,.mkv,.avi,.3gp,.wmv,.mts'; const i = h('input', { type: 'file', accept, multiple: multiple || null }); i.onchange = () => res([...i.files]); i.click(); });
  }
  // Kecilkan foto besar. PNG/gambar transparan -> WebP (transparansi tetap, ukuran jauh lebih kecil)
  const IMG_EXT = /\.(jpe?g|png|webp|gif|svg|ico|heic|heif|avif|bmp|tiff?|jfif|jpe|dng)$/i;
  const isImageFile = (f) => /^image\//.test(f.type) || IMG_EXT.test(f.name);
  const IMG_DIRECT = /\.(jpe?g|png|webp|gif|svg|ico)$/i; // format yang langsung dikenal server
  // format lain (HEIC iPhone, AVIF, BMP, TIFF, dll) -> diubah ke JPEG lewat browser
  async function toJpeg(file) {
    let bmp;
    try { bmp = await createImageBitmap(file); }
    catch (e) {
      try { // cadangan: dekode lewat elemen <img>
        const u = URL.createObjectURL(file);
        bmp = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('x')); im.src = u; });
      } catch (e2) { throw new Error('Format foto "' + (file.name.split('.').pop() || '?').toUpperCase() + '" belum bisa dibaca browser ini. Untuk HEIC (iPhone): unggah lewat Safari, atau di iPhone pilih Pengaturan → Kamera → Format → "Paling Kompatibel", atau kirim fotonya lewat WhatsApp dulu.'); }
    }
    const w = bmp.naturalWidth || bmp.width, h = bmp.naturalHeight || bmp.height, sc = Math.min(1, 2000 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * sc); c.height = Math.round(h * sc);
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) throw new Error('Foto gagal dikonversi. Coba format JPG/PNG.');
    return new File([blob], file.name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '_') + '.jpg', { type: 'image/jpeg' });
  }
  async function shrink(file) {
    if (isImageFile(file) && !IMG_DIRECT.test(file.name)) file = await toJpeg(file);
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
  // ---------- video: terima format apa saja, otomatis dikonversi ke MP4/WebM yang bisa diputar semua HP ----------
  const VID_EXT = /\.(mp4|mov|m4v|webm|mkv|avi|3gp|3gpp|wmv|flv|mpg|mpeg|mts|m2ts|ts|ogv)$/i;
  const isVideoFile = (f) => /^video\//.test(f.type) || VID_EXT.test(f.name);
  const VID_MAX_SEC = 600, VID_SKIP_MB = 4; // durasi TIDAK dipotong (batas 600 dtk hanya pengaman); hanya mp4/webm ≤4MB yang dibiarkan — sisanya dikompres agar cepat dimuat di HP
  async function prepareVideo(file) {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto'; v.src = url;
    try {
      await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('Browser ini tidak bisa membaca video tersebut (biasanya format HEVC/codec khusus). Coba: buka admin lewat Safari/Chrome terbaru, atau kirim ulang videonya lewat WhatsApp lalu unggah hasilnya.')); setTimeout(() => rej(new Error('Video terlalu lama dibaca — coba video yang lebih pendek.')), 20000); });
      const okType = /\.(mp4|webm)$/i.test(file.name) && /^video\/(mp4|webm)$/.test(file.type);
      if (okType && file.size <= VID_SKIP_MB * 1e6) return file; // sudah aman
      if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
        if (okType && file.size <= 48e6) return file;
        throw new Error('Browser ini belum bisa mengonversi video. Pakai Chrome/Safari terbaru.');
      }
      const W0 = v.videoWidth, H0 = v.videoHeight;
      if (!W0 || !H0) throw new Error('Video tidak terbaca (ukuran 0). Coba format lain.');
      const sc = Math.min(1, 960 / Math.max(W0, H0)), W = Math.round(W0 * sc / 2) * 2, H = Math.round(H0 * sc / 2) * 2;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      const mime = ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
      if (!mime) throw new Error('Browser ini tidak punya perekam video. Pakai Chrome/Safari terbaru.');
      const dur0 = isFinite(v.duration) && v.duration > 0 ? v.duration : 15;
      // bitrate menyesuaikan durasi agar hasil ±5MB: video pendek lebih tajam, video panjang lebih hemat (min 0,5 / maks 1,8 Mbps)
      const bps = Math.round(Math.min(1800000, Math.max(500000, 5e6 * 8 / dur0)));
      const rec = new MediaRecorder(cv.captureStream(30), { mimeType: mime, videoBitsPerSecond: bps });
      const chunks = []; rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      const stopped = new Promise((r) => { rec.onstop = r; });
      const dur = Math.min(isFinite(v.duration) ? v.duration : VID_MAX_SEC, VID_MAX_SEC);
      let live = true;
      const draw = () => { if (!live) return; try { ctx.drawImage(v, 0, 0, W, H); } catch (e) { /* frame belum siap */ }
        const pct = Math.min(99, Math.round(v.currentTime / dur * 100)); if (pct !== draw.p) { draw.p = pct; toast('Mengonversi video… ' + pct + '% (jangan tutup halaman)'); }
        if (v.ended || v.currentTime >= dur) { live = false; rec.stop(); return; } requestAnimationFrame(draw); };
      rec.start(500);
      await v.play().catch(() => { throw new Error('Video tidak bisa diputar untuk dikonversi. Coba klik Unggah lagi atau pakai format lain.'); });
      requestAnimationFrame(draw);
      await stopped;
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      if (!blob.size) throw new Error('Hasil konversi kosong. Coba video lain.');
      const ext = /mp4/.test(mime) ? '.mp4' : '.webm';
      return new File([blob], file.name.replace(/\.[^.]+$/, '') .replace(/[^\w.-]+/g, '_') + ext, { type: blob.type });
    } finally { URL.revokeObjectURL(url); v.removeAttribute('src'); v.load(); }
  }
  async function upload(file) {
    if (isVideoFile(file)) file = await prepareVideo(file);
    if (file.size > 50e6) throw new Error('Video masih ' + (file.size / 1e6).toFixed(0) + 'MB — batas Supabase gratis 50MB. Pakai video yang lebih pendek.');
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
    const items = (await api('/api/admin/uploads')).filter((u) => filter === 'audio' ? /\.(mp3|m4a|ogg|wav)$/i.test(u.url) : filter === 'video' ? /\.(mp4|webm|mov|m4v)$/i.test(u.url) : filter === 'media' ? /\.(png|jpe?g|webp|gif|mp4|webm|mov|m4v)$/i.test(u.url) : /\.(png|jpe?g|webp|gif|svg)$/i.test(u.url));
    return new Promise((res) => {
      const close = (v) => { m.hidden = true; res(v); };
      m.querySelector('[data-close]').onclick = () => close(null); m.onclick = (e) => { if (e.target === m) close(null); };
      g.textContent = '';
      if (!items.length) g.textContent = 'Belum ada file yang diunggah.';
      const sel = new Set(); let selMode = false; const cards = new Map();
      const nameOf = (u) => u.url.split('/').pop().split('?')[0];
      const bar = h('div', { class: 'libbar' });
      const bPick = h('button', { class: 'btn sm', type: 'button' }, '☑ Pilih cepat');
      const bAll = h('button', { class: 'btn sm', type: 'button' }, 'Pilih semua');
      const bDel = h('button', { class: 'btn sm danger', type: 'button' }, '🗑 Hapus terpilih (0)');
      const bWipe = h('button', { class: 'btn sm danger', type: 'button' }, '🗑 Hapus semua (' + items.length + ')');
      bar.append(bPick, bAll, bDel, bWipe);
      const old = m.querySelector('.libbar'); if (old) old.remove(); g.before(bar);
      const refresh = () => { bAll.hidden = bDel.hidden = !selMode; bDel.textContent = '🗑 Hapus terpilih (' + sel.size + ')'; bDel.disabled = !sel.size; bPick.textContent = selMode ? '✕ Selesai pilih' : '☑ Pilih cepat'; bWipe.textContent = '🗑 Hapus semua (' + cards.size + ')'; bWipe.hidden = !cards.size; g.classList.toggle('selmode', selMode); cards.forEach((c, n) => c.classList.toggle('sel', sel.has(n))); };
      const wipe = async (names, msg) => {
        if (!names.length || !confirm(msg)) return;
        try {
          for (let k = 0; k < names.length; k += 100) await api('/api/admin/upload-delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names: names.slice(k, k + 100) }), timeout: 60000 });
          names.forEach((n) => { const c = cards.get(n); if (c) c.remove(); cards.delete(n); sel.delete(n); });
          if (!cards.size) g.textContent = 'Belum ada file yang diunggah.';
          toast(names.length + ' file dihapus ✓'); refresh();
        } catch (er) { toast(er.message || 'Gagal menghapus', true); }
      };
      bPick.onclick = () => { selMode = !selMode; if (!selMode) sel.clear(); refresh(); };
      bAll.onclick = () => { if (sel.size === cards.size) sel.clear(); else cards.forEach((c, n) => sel.add(n)); refresh(); };
      bDel.onclick = () => wipe([...sel], 'Hapus ' + sel.size + ' file terpilih dari Pustaka?\n\nBila masih dipakai di undangan, gambar/video-nya akan hilang. Tidak bisa dibatalkan.');
      bWipe.onclick = () => wipe([...cards.keys()], 'HAPUS SEMUA ' + cards.size + ' file di daftar ini?\n\nFile yang masih dipakai di undangan akan hilang. Tidak bisa dibatalkan.');
      items.forEach((u) => {
        const fname = nameOf(u), isV = /\.(mp4|webm|mov|m4v)$/i.test(fname), isA = /\.(mp3|m4a|ogg|wav)$/i.test(fname);
        const card = h('div', { class: 'libitem' },
          h('button', { onclick: () => { if (selMode) { sel.has(fname) ? sel.delete(fname) : sel.add(fname); refresh(); } else close(u.url); } }, isA ? h('div', { class: 'im' }, '♪') : isV ? h('div', { class: 'im' }, '▶') : h('div', { class: 'im', style: `background-image:url("${u.url}")` }), h('small', {}, fname)),
          h('button', { class: 'libdel', title: 'Hapus file ini', onclick: (e) => { e.stopPropagation(); wipe([fname], 'Hapus file ini dari Pustaka?\n' + fname + '\n\nBila masih dipakai di undangan, gambar/video-nya akan hilang.'); } }, '🗑'));
        cards.set(fname, card); g.append(card);
      });
      refresh();
    });
  }

  // ---------- editor posisi foto: geser, zoom, mode utuh/penuh, kegelapan latar ----------
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function openAdjust(f, obj, key, onChange) {
    const url = obj[key]; if (!url) { toast('Unggah / pilih foto dulu', true); return; }
    const ch = () => { obj[key + 'Adj'] = { ...a }; (onChange || (() => changed(true)))(); };
    const A0 = { x: 50, y: 50, z: 1, fit: 'cover', o: 100 };
    let a = { ...A0, ...(obj[key + 'Adj'] || {}) };
    const own = f.arOwn, ratio = () => (own ? obj[own] : '') || (f.arKey ? getPath(cfg, f.arKey) : '') || f.ar || '4/5';
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
      f.arKey ? h('label', {}, own ? 'Bentuk foto ini' : 'Bentuk bingkai', (() => { const fdef = SCHEMA.flatMap((g) => g.fields).find((x) => x.k === f.arKey); const sel = h('select', { onchange: (e) => { if (own) { if (e.target.value) obj[own] = e.target.value; else delete obj[own]; } else { const [o, k] = parentOf(cfg, f.arKey); o[k] = e.target.value; } paintStage(); (onChange || (() => changed(true)))(); } }, ((fdef ? fdef.o : []).some(([v]) => v === '') || !own ? (fdef ? fdef.o : []) : [['', ''], ...(fdef ? fdef.o : [])]).map(([v, t]) => h('option', { value: v }, v === '' && own ? 'Ikuti pengaturan umum' : t))); sel.value = (own ? obj[own] : getPath(cfg, f.arKey)) || ''; return sel; })()) : null,
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
        set(e.target.value); if (f.rr) { changed(true); show(current); return; }
        const pr = f.preset && typeof THEME_PRESETS !== 'undefined' && THEME_PRESETS[e.target.value];
        if (pr && confirm('Terapkan juga warna & font bawaan tema ini? (bisa diubah lagi setelahnya)')) { Object.assign(cfg.theme, pr); changed(true); show(current); }
      } }, opts.map(([v, t]) => h('option', { value: v }, t)));
      sel.value = get(); wrap.append(label, sel);
    } else if (f.t === 'color') {
      const tx = h('input', { type: 'text', value: get() || '', oninput: (e) => { set(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) cp.value = e.target.value; } });
      const cp = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(get() || '') ? get() : '#000000', oninput: (e) => { tx.value = e.target.value; set(e.target.value); } });
      wrap.append(label, h('div', { class: 'row' }, cp, tx));
    } else if (f.t === 'resetpos') {
      const n = () => Object.keys(get() || {}).length;
      wrap.append(label, h('button', { class: 'btn sm', type: 'button', onclick: () => { set({}); show(current); toast('Posisi geser dikembalikan ke bawaan'); } }, n() ? 'Reset posisi geser (' + n() + ' elemen digeser)' : 'Belum ada yang digeser'));
    } else if (f.t === 'range') {
      const dv = f.def !== undefined ? f.def : f.min, cur = () => (get() === undefined || get() === '' || get() === null ? dv : +get());
      const out = h('b', { class: 'rv-out' }, cur() + (f.unit || ''));
      const rg = h('input', { type: 'range', min: f.min, max: f.max, step: f.step || 1, value: cur(), oninput: (e) => { out.textContent = e.target.value + (f.unit || ''); set(+e.target.value); } });
      const rs = h('button', { class: 'btn sm', type: 'button', onclick: () => { rg.value = dv; out.textContent = dv + (f.unit || ''); set(dv); } }, 'Reset');
      wrap.append(label, h('div', { class: 'row', style: 'align-items:center;gap:10px' }, rg, out, rs));
      rg.style.flex = '1';
    } else if (f.t === 'number') {
      wrap.append(label, h('input', { type: 'number', min: f.min, max: f.max, value: get(), oninput: (e) => set(e.target.value === '' ? '' : +e.target.value) }));
    } else if (f.t === 'datetime') {
      wrap.append(label, h('input', { type: 'datetime-local', value: (get() || '').slice(0, 16), oninput: (e) => set(e.target.value) }));
    } else if (f.t === 'image' || f.t === 'audio' || f.t === 'video' || f.t === 'media') {
      const isMed = f.t === 'media', isImg = f.t === 'image' || isMed, isAud = f.t === 'audio';
      const th = isImg ? h('div', { class: 'thumb' + (f.deco ? ' contain' : '') + (f.round ? ' round' : ''), title: f.deco ? '' : 'Klik untuk atur posisi', onclick: () => { if (!f.deco) openAdjust(f, obj, key, () => { (onChange || changed)(true); if (wrap._paint) wrap._paint(); }); } }) : null;
      const tx = h('input', { type: 'text', placeholder: isMed ? 'URL foto/video, link YouTube, atau unggah (video format apa saja)…' : isImg ? 'URL gambar atau unggah…' : isAud ? 'URL mp3 atau unggah…' : 'Link YouTube, URL .mp4, atau unggah video…', value: get() || '', oninput: (e) => { set(e.target.value); paint(); } });
      const au = isAud ? h('audio', { controls: true, style: 'width:100%;margin-top:6px;height:34px' }) : null;
      const paint = () => {
        if (th) { th.style.backgroundImage = get() ? `url("${String(get()).replace(/"/g, '')}")` : 'none'; const a = obj[key + 'Adj']; if (!f.deco) th.style.backgroundPosition = a ? `${a.x ?? 50}% ${a.y ?? 50}%` : ''; }
        if (au) { au.hidden = !get(); if (get()) au.src = get(); }
      };
      wrap._paint = paint;
      const apply = (u) => { tx.value = u; set(u); paint(); };
      const btns = h('div', { class: 'acts' },
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const [fl] = await pickFile(isMed ? 'image/*,video/*' : isImg ? 'image/*' : isAud ? 'audio/*' : 'video/*'); if (!fl) return; try { toast('Mengunggah…'); apply(await upload(fl)); toast('Terunggah ✓ — klik SIMPAN agar tampil di undangan'); } catch (e) { toast(e.message, true); } } }, 'Unggah'),
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const u = await openLibrary(isMed ? 'media' : isImg ? 'image' : isAud ? 'audio' : 'video'); if (u) apply(u); } }, 'Pustaka'),
        isImg && !f.deco ? h('button', { class: 'btn sm pri', type: 'button', onclick: () => /\.(mp4|webm|mov|m4v)(\?|$)|youtu/i.test(get() || '') ? toast('Video tidak perlu diatur posisinya', true) : openAdjust(f, obj, key, () => { (onChange || changed)(true); paint(); }) }, '✥ Atur posisi') : null,
        defVal !== undefined ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply(defVal) }, 'Default') : null,
        !isImg || isMed ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply('') }, 'Hapus') : null);
      paint();
      wrap.append(label, h('div', { class: 'imgf' }, th, h('div', { style: 'flex:1;min-width:0' }, tx, btns, au)));
    } else if (f.t === 'animmode') {
      const eff = cfg.effects || (cfg.effects = {}), on = (k) => eff[k] !== false;
      const same = (m) => Object.keys(m.v).every((k) => on(k) === m.v[k]);
      const cur = (ANIM_MODES.find(same) || { id: 'custom' }).id;
      const grid = h('div', { class: 'pals modes' });
      ANIM_MODES.forEach((m) => grid.append(h('button', { type: 'button', class: 'pal mode' + (cur === m.id ? ' on' : ''), onclick: () => { Object.assign(eff, m.v); changed(true); show(current); } },
        h('span', { class: 'mi' }, m.ico), h('b', {}, m.name), h('small', {}, m.note))));
      grid.append(h('div', { class: 'pal mode' + (cur === 'custom' ? ' on' : ''), style: 'cursor:default' }, h('span', { class: 'mi' }, '🎛️'), h('b', {}, 'Kustom'), h('small', {}, 'Aktif otomatis bila Anda mengubah saklar satu per satu di bawah.')));
      wrap.append(label, grid);
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
    if (f.h) { const hp = h('small', { class: 'fh' }, f.h); const lb = wrap.querySelector(':scope > label:not(.sw)'); if (lb) lb.after(hp); else wrap.append(hp); }
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
        arr.forEach((it, i) => g.append(h('div', { class: 'g' }, h('div', { class: 'im', title: 'Klik untuk atur posisi', onclick: () => openAdjust(f.fields[0], it, f.fields[0].k, () => { ch(true); render(); }), style: `background-image:url("${String(it[f.fields[0].k] || '').replace(/"/g, '')}");background-position:${(it[f.fields[0].k + 'Adj'] || {}).x ?? 50}% ${(it[f.fields[0].k + 'Adj'] || {}).y ?? 50}%;aspect-ratio:${it.shape || (f.fields[0].arKey && getPath(cfg, f.fields[0].arKey)) || f.fields[0].ar || '3/4'}` }),
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

  function resetFields(fields) {
    fields.forEach((f) => {
      const dv = getPath(defaults, f.k), [o, k] = parentOf(cfg, f.k);
      if (dv === undefined) delete o[k]; else o[k] = clone(dv);
      if (f.t === 'image') delete o[k + 'Adj'];
    });
  }
  function sectionBar(g, sec, onToggle) {
    const bar = h('div', { class: 'secbar' + (sec.enabled ? '' : ' off') });
    const render = () => {
      bar.textContent = ''; bar.classList.toggle('off', !sec.enabled);
      const idx = cfg.sections.indexOf(sec) + 1, tot = cfg.sections.length;
      const sw = h('label', { class: 'tgl' }, h('input', { type: 'checkbox', checked: sec.enabled, onchange: (e) => { sec.enabled = e.target.checked; changed(true); render(); onToggle(); if (sec.enabled) gotoPreviewSoon(g.id); } }), h('i'), h('b', {}, sec.enabled ? 'Ditampilkan di undangan' : 'Disembunyikan dari undangan'));
      bar.append(sw,
        h('div', { class: 'secpos' }, h('span', {}, `Posisi: ke-${idx} dari ${tot}`),
          h('button', { class: 'btn sm', type: 'button', disabled: idx <= 1 || null, onclick: () => { moveSection(g.id, -1); render(); gotoPreviewSoon(g.id); } }, '↑ Naikkan'),
          h('button', { class: 'btn sm', type: 'button', disabled: idx >= tot || null, onclick: () => { moveSection(g.id, 1); render(); gotoPreviewSoon(g.id); } }, '↓ Turunkan'),
          h('button', { class: 'btn sm', type: 'button', onclick: () => show('sections') }, 'Atur semua urutan →')),
        h('div', { class: 'secanim' }, h('b', {}, 'Animasi muncul bagian ini'),
          (() => { const sel = h('select', { title: 'Animasi muncul', onchange: (e) => { sec.anim = e.target.value; changed(true); gotoPreviewSoon(g.id); replayPreviewSoon(g.id); } }, ANIMS.map(([v, t]) => h('option', { value: v }, t))); sel.value = ANIMS.some((a) => a[0] === sec.anim) ? sec.anim : 'soft'; return sel; })(),
          h('b', { style: 'margin-left:6px' }, 'Kecepatan'),
          (() => { const sp = h('select', { title: 'Kecepatan animasi', onchange: (e) => { sec.speed = e.target.value; changed(true); gotoPreviewSoon(g.id); replayPreviewSoon(g.id); } }, SPEEDS.map(([v, t]) => h('option', { value: v }, t))); sp.value = SPEEDS.some((x) => x[0] === sec.speed) ? sec.speed : ''; return sp; })(),
          h('button', { class: 'btn sm', type: 'button', onclick: () => { gotoPreview(g.id); replayPreviewSoon(g.id, 900); } }, '▶ Putar ulang di pratinjau'),
          h('small', { class: 'fh' }, g.id === 'hero' ? 'Cara bagian ini muncul. Di Tema 12, \"Lembut mewah\" = animasi bawaan pembuka (bingkai tumbuh + teks per huruf), \"Tanpa animasi\" = langsung tampil, pilihan lain = gerak masuk seluruh isi pembuka.' : 'Cara bagian ini muncul saat tamu men-scroll. Hanya berlaku untuk bagian ini.')),
        ...(sec.enabled ? [] : [h('small', { class: 'fh' }, 'Bagian ini tidak tampil di undangan. Isinya tetap tersimpan, jadi bisa diaktifkan lagi kapan saja.')]));
    };
    render(); return bar;
  }
  function groupView(g) {
    const hint = g.hint || GROUP_HINT[g.id];
    const m = h('div', {}, h('h2', {}, g.title), hint ? h('p', { class: 'hint' }, hint) : null);
    const sec = secOf(g.id), cards = [];
    if (sec) m.append(sectionBar(g, sec, () => cards.forEach((c) => c.classList.toggle('dim', !sec.enabled))));
    const byKey = {}; g.fields.forEach((f) => { byKey[f.k] = f; });
    const addCard = (title, fields, fold) => {
      const card = h('div', { class: 'card' });
      fields.forEach((f) => { const [o, k] = parentOf(cfg, f.k); card.append(field(f, o, k)); });
      if (!title) { cards.push(card); m.append(card); return; }
      const dt = h('details', { class: 'cardx' + (fold ? ' adv' : ''), open: fold ? null : true }, h('summary', {}, title, fold ? h('small', {}, ' — klik untuk membuka') : null), card);
      cards.push(dt); m.append(dt);
    };
    const lay = LAYOUT[g.id];
    if (lay) {
      const used = new Set();
      lay.forEach(([t, keys, fold]) => { const fs = keys.map((k) => byKey[k]).filter(Boolean); fs.forEach((f) => used.add(f.k)); if (fs.length) addCard(t, fs, fold); });
      const rest = g.fields.filter((f) => !used.has(f.k)); if (rest.length) addCard('Lainnya', rest, true);
    } else addCard(null, g.fields);
    cards.forEach((c) => c.classList.toggle('dim', !!sec && !sec.enabled));
    m.append(h('button', { class: 'btn danger sm', onclick: () => { if (confirm(`Kembalikan seluruh pengaturan "${g.title}" ke bawaan? (belum tersimpan sampai Anda klik Simpan)`)) { resetFields(g.fields); changed(true); show(g.id); } } }, 'Kembalikan halaman ini ke bawaan'));
    return m;
  }

  function sectionsView() {
    const m = h('div', {}, h('h2', {}, 'Urutan & Tampil Section'), h('p', { class: 'hint' }, 'Seret ⠿ (atau pakai ↑ ↓) untuk memindah posisi, mis. Galeri ke paling atas. Hilangkan centang untuk menyembunyikan bagian dari undangan. Animasi muncul tiap bagian diatur di halaman bagian itu masing-masing (klik "Edit isi & animasi →").'));
    const wrap = h('div');
    const render = () => {
      wrap.textContent = '';
      cfg.sections.forEach((s, i) => {
        const mv = (d) => () => { const j = i + d; if (j < 0 || j >= cfg.sections.length) return; [cfg.sections[j], cfg.sections[i]] = [cfg.sections[i], cfg.sections[j]]; changed(true); render(); gotoPreviewSoon(s.id); };
        const row = h('div', { class: 'secrow' + (s.enabled ? '' : ' off'), draggable: 'true' },
          h('span', { class: 'grip', title: 'Seret untuk memindah' }, '⠿'),
          h('label', { class: 'sw', title: 'Tampilkan di undangan' }, h('input', { type: 'checkbox', checked: s.enabled, onchange: (e) => { s.enabled = e.target.checked; row.classList.toggle('off', !s.enabled); changed(true); if (s.enabled) gotoPreviewSoon(s.id); } })),
          h('span', { class: 'nm' }, (i + 1) + '. ' + (SECTION_NAMES[s.id] || s.id), s.enabled ? null : h('small', { class: 'offtag' }, ' disembunyikan')),
          SCHEMA.some((g) => g.id === s.id) ? h('button', { class: 'btn sm', onclick: () => show(s.id) }, 'Edit isi & animasi →') : null,
          h('button', { class: 'ghost sm btn', title: 'Naik', onclick: mv(-1) }, '↑'), h('button', { class: 'ghost sm btn', title: 'Turun', onclick: mv(1) }, '↓'));
        row.addEventListener('dragstart', (e) => { dragI = i; row.classList.add('drag'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)); } catch { /* */ } });
        row.addEventListener('dragend', () => { row.classList.remove('drag'); wrap.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); });
        row.addEventListener('dragover', (e) => { if (dragI < 0) return; e.preventDefault(); wrap.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); row.classList.add('over'); });
        row.addEventListener('drop', (e) => { e.preventDefault(); if (dragI < 0 || dragI === i) return; const [it] = cfg.sections.splice(dragI, 1); cfg.sections.splice(i, 0, it); dragI = -1; changed(true); render(); gotoPreviewSoon(it.id); });
        wrap.append(row);
      });
    };
    let dragI = -1;
    render();
    const all = h('select', {}, ANIMS.map(([v, t]) => h('option', { value: v }, t))); all.value = 'soft';
    m.append(wrap, h('div', { class: 'card row', style: 'flex-wrap:wrap' }, h('b', {}, 'Samakan animasi semua section:'), all,
      h('button', { class: 'btn sm', onclick: () => { cfg.sections.forEach((s) => (s.anim = all.value)); changed(true); render(); toast('Animasi disamakan'); } }, 'Terapkan')));
    return m;
  }

  function homeView() {
    const steps = CHECKS.slice(0, -1).map(([t, id, fn]) => [t, id, fn(cfg)]), last = CHECKS[CHECKS.length - 1];
    const n = steps.filter((x) => x[2]).length, pct = Math.round(n / steps.length * 100);
    const m = h('div', {}, h('h2', {}, 'Selamat datang 👋'), h('p', { class: 'hint' }, 'Ikuti daftar di bawah dari atas ke bawah. Menu di kiri sudah diurutkan sama seperti urutan di undangan.'));
    m.append(h('div', { class: 'card' },
      h('div', { class: 'prog' }, h('div', { style: `width:${pct}%` })), h('p', { class: 'hint', style: 'margin:6px 0 12px' }, `${n} dari ${steps.length} langkah terisi`),
      steps.map(([t, id, ok]) => h('div', { class: 'chk' + (ok ? ' ok' : '') }, h('span', { class: 'cc' }, ok ? '✓' : ''), h('span', { class: 'ct' }, t), h('button', { class: 'btn sm' + (ok ? '' : ' pri'), onclick: () => show(id) }, ok ? 'Ubah' : 'Isi sekarang'))),
      h('div', { class: 'chk' }, h('span', { class: 'cc' }, '→'), h('span', { class: 'ct' }, last[0]), h('button', { class: 'btn sm', onclick: () => show(last[1]) }, 'Buka'))));
    m.append(h('div', { class: 'card tips' }, h('b', {}, 'Cara kerja admin'),
      h('ol', {}, h('li', {}, 'Ubah isi di menu kiri. Tampilan kanan (Pratinjau) langsung ikut berubah — ini hanya contoh sementara.'),
        h('li', {}, 'Bila sudah puas, klik ', h('b', {}, 'Simpan'), ' (tombol di atas atau bar di bawah layar). Barulah undangan asli berubah.'),
        h('li', {}, 'Bagian menu yang berubah tapi belum disimpan diberi titik oranye ●.'),
        h('li', {}, 'Salah ubah? Klik ', h('b', {}, 'Batalkan perubahan'), ' di bar bawah untuk kembali ke versi tersimpan.')),
      h('div', { class: 'row', style: 'margin-top:10px;flex-wrap:wrap' }, h('a', { class: 'btn', href: '/', target: '_blank', rel: 'noopener' }, 'Buka undangan ↗'), h('button', { class: 'btn', onclick: () => show('theme') }, 'Ganti tema & warna'))));
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
    const cols = { rsvp: ['Nama', 'Status', 'Jumlah', 'Waktu'], wishes: ['Nama', 'Ucapan', 'Foto profil', 'Waktu'], gifts: ['Nama', 'Bank', 'Nominal', 'Ucapan', 'Bukti', 'Waktu'] }[kind];
    const tb = h('table', {}, h('thead', {}, h('tr', {}, cols.map((c) => h('th', {}, c)), h('th', {}))));
    const body = h('tbody');
    rows.forEach((r) => {
      const cells = kind === 'rsvp' ? [r.name, h('span', { class: 'tag ' + r.status }, { hadir: 'Hadir', tidak: 'Tidak hadir', ragu: 'Ragu' }[r.status]), r.count || '-', fmtT(r.ts)]
        : kind === 'wishes' ? [r.name, r.message, r.photo ? h('a', { href: r.photo, target: '_blank', rel: 'noopener' }, h('img', { src: r.photo, alt: '', style: 'width:44px;height:44px;object-fit:cover;border-radius:6px;display:block' })) : '-', fmtT(r.ts)]
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
    const btn = (id, ico, t) => h('button', { 'data-id': id, onclick: () => { show(id); n.classList.remove('open'); $('#navBack').classList.remove('show'); } }, h('span', { class: 'ni' }, ico), h('span', { class: 'nt' }, t), h('i', { class: 'ndot', title: 'Belum disimpan' }));
    NAV.forEach(([title, items, fold]) => {
      if (fold) n.append(h('details', { class: 'ngrp' }, h('summary', {}, title), items.map(([id, ico, t]) => btn(id, ico, t))));
      else n.append(h('h6', {}, title), ...items.map(([id, ico, t]) => btn(id, ico, t)));
    });
  }
  async function show(id) {
    current = id;
    const wantCover = id === 'cover' ? '1' : ''; if ($('#pvMode').value !== wantCover && (id === 'cover' || $('#pvMode').value === '1')) { $('#pvMode').value = wantCover; if ($('#pvFrame').src) loadPreview(); }
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    { const nb = $('#nav [data-id="' + id + '"]'), dt = nb && nb.closest('details'); if (dt) dt.open = true; }
    const main = $('#main'); main.textContent = 'Memuat…';
    try {
      const g = SCHEMA.find((x) => x.id === id);
      const v = g ? groupView(g) : id === 'home' ? homeView() : id === 'sections' ? sectionsView() : /^d-(rsvp|wishes|gifts)$/.test(id) ? await dataView(id.slice(2)) : id === 'links' ? linksView() : securityView();
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
      buildNav(); paintSave(false); paintNavOff(); show(defaultPw ? 'security' : current); loadPreview();
    } catch (er) {
      window.__adminReady = true;
      if (er && er.auth) return; // sudah diarahkan ke form login
      window.__adminFail('Gagal memuat admin: ' + ((er && er.message) || er));
    }
  }
  boot();
})();
