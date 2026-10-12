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
    const r = await fetch(url, { credentials: 'same-origin', ...opt });
    let d = null; try { d = await r.json(); } catch { /* bukan JSON */ }
    if (r.status === 401 && !url.includes('/login')) { showLogin(); throw new Error('Sesi berakhir'); }
    if (!r.ok) throw new Error((d && d.error) || 'Terjadi kesalahan');
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
  function changed() {
    $('#dirty').hidden = JSON.stringify(cfg) === snap;
    clearTimeout(pvT); pvT = setTimeout(sendPreview, 500);
  }
  function sendPreview() { const f = $('#pvFrame'); try { f.contentWindow.postMessage({ type: 'cfg', cfg }, location.origin); } catch { /* iframe belum siap */ } }
  function loadPreview() { const g = $('#pvGuest').value; $('#pvFrame').src = '/?preview=1' + ($('#pvMode').value ? '&cover=1' : '') + (g ? '&to=' + encodeURIComponent(g) : ''); }
  $('#pvFrame').addEventListener('load', sendPreview);
  $('#pvReload').onclick = () => { try { sessionStorage.removeItem('pvCfg'); } catch { /* */ } loadPreview(); };
  $('#pvGuest').onchange = loadPreview; $('#pvMode').onchange = loadPreview;
  $('#pvToggle').onclick = () => $('#preview').classList.toggle('show');
  $('#menuBtn').onclick = () => $('#nav').classList.toggle('open');
  addEventListener('beforeunload', (e) => { if (cfg && JSON.stringify(cfg) !== snap) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });

  // ---------- login ----------
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; }
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
  async function shrink(file) {
    if (!/^image\/(jpeg|webp)$/.test(file.type) && !(file.type === 'image/png' && file.size > 2.5e6)) return file;
    if (file.size < 900e3) return file;
    try {
      const bmp = await createImageBitmap(file); const max = 1800; const sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * sc); c.height = Math.round(bmp.height * sc);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const keepPng = file.type === 'image/png';
      const blob = await new Promise((r) => c.toBlob(r, keepPng ? 'image/png' : 'image/jpeg', 0.86));
      return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, keepPng ? '.png' : '.jpg'), { type: blob.type }) : file;
    } catch { return file; }
  }
  async function upload(file) {
    const f = await shrink(file);
    const d = await api('/api/admin/upload-url?name=' + encodeURIComponent(f.name), { method: 'POST' });
    const fd = new FormData(); fd.append('cacheControl', '31536000'); fd.append('', f);
    const r = await fetch(d.uploadUrl, { method: 'PUT', body: fd });
    if (!r.ok) throw new Error('Upload gagal');
    return d.url;
  }
  async function openLibrary(filter) {
    const m = $('#lib'), g = $('#libGrid'); g.textContent = 'Memuat…'; m.hidden = false;
    const items = (await api('/api/admin/uploads')).filter((u) => filter === 'audio' ? /\.(mp3|m4a|ogg|wav)$/i.test(u.url) : /\.(png|jpe?g|webp|gif|svg)$/i.test(u.url));
    return new Promise((res) => {
      const close = (v) => { m.hidden = true; res(v); };
      m.querySelector('[data-close]').onclick = () => close(null); m.onclick = (e) => { if (e.target === m) close(null); };
      g.textContent = '';
      if (!items.length) g.textContent = 'Belum ada file yang diunggah.';
      items.forEach((u) => g.append(h('button', { onclick: () => close(u.url) }, filter === 'audio' ? h('div', { class: 'im' }, '♪') : h('div', { class: 'im', style: `background-image:url("${u.url}")` }), h('small', {}, u.url.split('/').pop()))));
    });
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
      const sel = h('select', { onchange: (e) => set(e.target.value) }, opts.map(([v, t]) => h('option', { value: v }, t)));
      sel.value = get(); wrap.append(label, sel);
    } else if (f.t === 'color') {
      const tx = h('input', { type: 'text', value: get() || '', oninput: (e) => { set(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) cp.value = e.target.value; } });
      const cp = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(get() || '') ? get() : '#000000', oninput: (e) => { tx.value = e.target.value; set(e.target.value); } });
      wrap.append(label, h('div', { class: 'row' }, cp, tx));
    } else if (f.t === 'number') {
      wrap.append(label, h('input', { type: 'number', min: f.min, max: f.max, value: get(), oninput: (e) => set(e.target.value === '' ? '' : +e.target.value) }));
    } else if (f.t === 'datetime') {
      wrap.append(label, h('input', { type: 'datetime-local', value: (get() || '').slice(0, 16), oninput: (e) => set(e.target.value) }));
    } else if (f.t === 'image' || f.t === 'audio') {
      const isImg = f.t === 'image';
      const th = isImg ? h('div', { class: 'thumb' + (/floral|house|ornament/i.test(f.k || '') ? ' contain' : '') }) : null;
      const tx = h('input', { type: 'text', placeholder: isImg ? 'URL gambar atau unggah…' : 'URL mp3 atau unggah…', value: get() || '', oninput: (e) => { set(e.target.value); paint(); } });
      const au = !isImg ? h('audio', { controls: true, style: 'width:100%;margin-top:6px;height:34px' }) : null;
      const paint = () => { if (th) th.style.backgroundImage = get() ? `url("${String(get()).replace(/"/g, '')}")` : 'none'; if (au) { au.hidden = !get(); if (get()) au.src = get(); } };
      const apply = (u) => { tx.value = u; set(u); paint(); };
      const btns = h('div', { class: 'acts' },
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const [fl] = await pickFile(isImg ? 'image/*' : 'audio/*'); if (!fl) return; try { toast('Mengunggah…'); apply(await upload(fl)); toast('Terunggah ✓'); } catch (e) { toast(e.message, true); } } }, 'Unggah'),
        h('button', { class: 'btn sm', type: 'button', onclick: async () => { const u = await openLibrary(isImg ? 'image' : 'audio'); if (u) apply(u); } }, 'Pustaka'),
        defVal !== undefined ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply(defVal) }, 'Default') : null,
        !isImg ? h('button', { class: 'btn sm', type: 'button', onclick: () => apply('') }, 'Hapus') : null);
      paint();
      wrap.append(label, h('div', { class: 'imgf' }, th, h('div', { style: 'flex:1;min-width:0' }, tx, btns, au)));
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
        arr.forEach((it, i) => g.append(h('div', { class: 'g' }, h('div', { class: 'im', style: `background-image:url("${String(it[f.fields[0].k] || '').replace(/"/g, '')}")` }),
          h('div', { class: 't' },
            h('span', {}, h('button', { title: 'Geser kiri', onclick: () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; ch(); render(); } } }, '←'), h('button', { title: 'Geser kanan', onclick: () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; ch(); render(); } } }, '→')),
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
  async function dataView(kind) {
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
    if (defaultPw) m.append(h('div', { class: 'warn' }, '⚠ Anda masih memakai password bawaan (admin123). Segera ganti di bawah.'));
    const cur = h('input', { type: 'password', autocomplete: 'current-password' }), nx = h('input', { type: 'password', autocomplete: 'new-password' });
    m.append(h('div', { class: 'card' }, h('div', { class: 'fld' }, h('label', {}, 'Password saat ini'), cur), h('div', { class: 'fld' }, h('label', {}, 'Password baru (min. 6 karakter)'), nx),
      h('button', { class: 'btn pri', onclick: async () => { try { await api('/api/admin/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: cur.value, next: nx.value }) }); defaultPw = false; cur.value = nx.value = ''; toast('Password diganti ✓'); show('security'); } catch (e) { toast(e.message, true); } } }, 'Ganti password')));
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
    n.append(h('h6', {}, 'Isi Undangan')); SCHEMA.slice(0, 4).forEach((g) => add(g.id, g.title)); add('sections', 'Urutan & Animasi Section');
    n.append(h('h6', {}, 'Konten Section')); SCHEMA.slice(4).forEach((g) => add(g.id, g.title));
    n.append(h('h6', {}, 'Data Tamu')); add('rsvp', 'RSVP / Kehadiran'); add('wishes', 'Ucapan & Doa'); add('gifts', 'Konfirmasi Gift'); add('links', 'Buat Link Tamu');
    n.append(h('h6', {}, 'Lainnya')); add('security', 'Keamanan & Cadangan');
  }
  async function show(id) {
    current = id;
    const wantCover = id === 'cover' ? '1' : ''; if ($('#pvMode').value !== wantCover && (id === 'cover' || $('#pvMode').value === '1')) { $('#pvMode').value = wantCover; if ($('#pvFrame').src) loadPreview(); }
    document.querySelectorAll('#nav button').forEach((b) => b.classList.toggle('on', b.dataset.id === id));
    const main = $('#main'); main.textContent = 'Memuat…';
    try {
      const g = SCHEMA.find((x) => x.id === id);
      const v = g ? groupView(g) : id === 'sections' ? sectionsView() : ['rsvp', 'wishes', 'gifts'].includes(id) ? await dataView(id) : id === 'links' ? linksView() : securityView();
      main.textContent = ''; main.append(v); scrollTo(0, 0);
    } catch (e) { main.textContent = e.message; }
  }

  async function boot() {
    try {
      const me = await api('/api/admin/me'); defaultPw = me.defaultPassword;
      const d = await api('/api/admin/config'); cfg = d.config; defaults = d.defaults;
      SCHEMA.forEach((g) => attachDefaults(g.fields));
      snap = JSON.stringify(cfg);
      $('#login').hidden = true; $('#app').hidden = false;
      buildNav(); show(defaultPw ? 'security' : current); loadPreview();
    } catch { showLogin(); }
  }
  boot();
})();
