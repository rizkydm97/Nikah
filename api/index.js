'use strict';
// Seluruh endpoint API (/api/*) dalam satu fungsi Vercel. Data disimpan di Supabase.
const crypto = require('crypto');
const path = require('path');
const C = require('../lib/core');
const { sb, BUCKET } = C;

const ADMIN_UPLOAD_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp3', '.m4a', '.ogg', '.wav', '.mp4', '.webm', '.mov', '.m4v', '.ico', '.ttf', '.otf', '.woff', '.woff2'];
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4v': 'video/mp4', '.mov': 'video/quicktime', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const MAX_PROOF = 2.5 * 1024 * 1024; // batas body fungsi Vercel ±4.5MB (base64 membesar ~33%)

// ---------- pembatas laju (best-effort, per instance serverless) ----------
const hits = new Map();
function limited(req, key, max, windowMs) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const k = key + ip, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}

// ---------- util ----------
function send(res, code, body, headers = {}) {
  const isJson = typeof body === 'object' && !Buffer.isBuffer(body);
  res.statusCode = code;
  const h = { 'Content-Type': isJson ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers };
  for (const k of Object.keys(h)) res.setHeader(k, h[k]);
  res.end(isJson ? JSON.stringify(body) : body);
}
async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = []; for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { throw Object.assign(new Error('JSON tidak valid'), { code: 400 }); }
}
const clean = (v, max = 500) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const uid = () => crypto.randomBytes(6).toString('hex');
function csv(rows, cols) {
  const e = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  return '﻿' + [cols.join(','), ...rows.map((r) => cols.map((c) => e(r[c])).join(','))].join('\r\n');
}
const must = ({ error, data }) => { if (error) throw error; return data; };

const TABLES = { rsvp: 'rsvp', wishes: 'wishes', gifts: 'gifts' };
const listAll = async (t) => must(await sb().from(t).select('*').order('ts', { ascending: false }).limit(10000));

// ---------- rute ----------
async function route(req, res, url) {
  const m = req.method, p = url.pathname.replace(/\/+$/, '');

  // diagnosa (publik, hanya mengembalikan ya/tidak — tanpa rahasia)
  if (m === 'GET' && p === '/api/health') {
    const out = { ok: true, env: { SUPABASE_URL: !!process.env.SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD }, database: 'belum dicek', storage: 'belum dicek' };
    if (!out.env.SUPABASE_URL || !out.env.SUPABASE_SERVICE_ROLE_KEY) { out.ok = false; out.database = 'Variabel SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di Vercel'; return send(res, 200, out, { 'Cache-Control': 'no-store' }); }
    try {
      const r = await sb().from('settings').select('key').limit(1);
      out.database = r.error ? 'GAGAL: ' + (r.error.code === '42P01' || /does not exist|schema cache/i.test(r.error.message || '') ? 'tabel belum dibuat — jalankan supabase/schema.sql di SQL Editor' : (r.error.message || 'tidak diketahui')) : 'OK';
      if (r.error) out.ok = false;
    } catch (e) { out.ok = false; out.database = 'GAGAL terhubung ke Supabase (cek SUPABASE_URL & key)'; }
    try {
      const b = await sb().storage.from(BUCKET).list('', { limit: 1 });
      out.storage = b.error ? 'GAGAL: bucket "' + BUCKET + '" belum ada — jalankan supabase/schema.sql' : 'OK';
      if (b.error) out.ok = false;
    } catch (e) { out.ok = false; out.storage = 'GAGAL terhubung ke Storage'; }
    return send(res, 200, out, { 'Cache-Control': 'no-store' });
  }

  // publik
  if (m === 'GET' && p === '/api/config') return send(res, 200, await C.getConfig(), { 'Cache-Control': 'no-cache' });

  if (m === 'GET' && p === '/api/wishes') {
    const limit = Math.min(+url.searchParams.get('limit') || 10, 100), offset = Math.max(+url.searchParams.get('offset') || 0, 0);
    const page = async (cols) => sb().from('wishes').select(cols, { count: 'exact' }).order('ts', { ascending: false }).range(offset, offset + limit - 1);
    let w = await page('id,name,message,photo,ts');
    if (w.error) w = await page('id,name,message,ts'); // kolom photo belum dibuat (belum jalankan schema.sql terbaru)
    const [r, n] = await Promise.all([
      sb().from('rsvp').select('status,count').limit(10000),
      sb().from('wishes').select('name').limit(10000),
    ]);
    const items = must(w), rs = must(r), names = must(n);
    const senders = new Set(names.map((x) => String(x.name || '').trim().toLowerCase().replace(/\s+/g, ' '))).size;
    return send(res, 200, {
      total: w.count || 0, senders, items: items.map((x) => ({ photo: '', ...x })),
      hadir: rs.filter((x) => x.status === 'hadir').reduce((a, x) => a + (+x.count || 1), 0),
      tidak: rs.filter((x) => x.status === 'tidak').length,
    }, { 'Cache-Control': 'no-store' });
  }
  if (m === 'POST' && p === '/api/rsvp') {
    if (limited(req, 'rsvp', 8, 600000)) return send(res, 429, { error: 'Terlalu banyak permintaan' });
    const b = await readJson(req), name = clean(b.name, 80);
    if (name.length < 2) return send(res, 400, { error: 'Nama wajib diisi' });
    const status = ['hadir', 'tidak', 'ragu'].includes(b.status) ? b.status : 'hadir';
    must(await sb().from('rsvp').insert({ id: uid(), name, status, count: status === 'hadir' ? Math.min(Math.max(+b.count || 1, 1), 20) : 0, ts: Date.now() }));
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/wishes') {
    if (limited(req, 'wish', 10, 600000)) return send(res, 429, { error: 'Terlalu banyak permintaan' });
    const b = await readJson(req), name = clean(b.name, 80), message = clean(b.message, 600);
    if (name.length < 2 || message.length < 2) return send(res, 400, { error: 'Nama dan ucapan minimal 2 karakter' });
    let photo = '';
    if (b.photoData) {
      const mt = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(b.photoData);
      if (!mt) return send(res, 400, { error: 'Format foto tidak didukung (gunakan JPG, PNG, atau WebP)' });
      const buf = Buffer.from(mt[2], 'base64');
      if (buf.length > MAX_PROOF) return send(res, 413, { error: 'Foto maksimal 2,5MB' });
      const ext = mt[1] === 'png' ? '.png' : mt[1] === 'webp' ? '.webp' : '.jpg';
      const key = `wish/${uid()}${ext}`;
      must(await sb().storage.from(BUCKET).upload(key, buf, { contentType: `image/${mt[1] === 'jpg' ? 'jpeg' : mt[1]}`, upsert: false }));
      photo = C.publicUrl(key);
    }
    const row = { id: uid(), name, message, ts: Date.now() };
    if (photo) {
      const r = await sb().from('wishes').insert({ ...row, photo });
      if (r.error) must(await sb().from('wishes').insert(row)); // kolom photo belum ada: simpan ucapan tanpa foto
    } else must(await sb().from('wishes').insert(row));
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/gift') {
    if (limited(req, 'gift', 6, 600000)) return send(res, 429, { error: 'Terlalu banyak permintaan' });
    const b = await readJson(req), name = clean(b.name, 80);
    if (name.length < 2) return send(res, 400, { error: 'Nama wajib diisi' });
    let proof = '';
    if (b.proofData) {
      const mt = /^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/.exec(b.proofData);
      if (!mt) return send(res, 400, { error: 'Format bukti tidak didukung' });
      const buf = Buffer.from(mt[2], 'base64');
      if (buf.length > MAX_PROOF) return send(res, 413, { error: 'Bukti maksimal 2,5MB' });
      const ext = mt[1] === 'png' ? '.png' : mt[1] === 'webp' ? '.webp' : '.jpg';
      const key = `proof/${uid()}${ext}`;
      must(await sb().storage.from(BUCKET).upload(key, buf, { contentType: `image/${mt[1] === 'jpg' ? 'jpeg' : mt[1]}`, upsert: false }));
      proof = C.publicUrl(key);
    }
    must(await sb().from('gifts').insert({ id: uid(), name, bank: clean(b.bank, 60), amount: clean(b.amount, 40), message: clean(b.message, 500), proof, ts: Date.now() }));
    return send(res, 200, { ok: true });
  }

  // login / logout
  if (m === 'POST' && p === '/api/login') {
    if (limited(req, 'login', 30, 600000)) return send(res, 429, { error: 'Terlalu banyak percobaan, coba lagi nanti' });
    const b = await readJson(req), A = await C.getAuth();
    if (!C.checkPw(A.auth, b.password || '')) return send(res, 401, { error: 'Password salah' });
    return send(res, 200, { ok: true, defaultPassword: !!A.auth.default }, { 'Set-Cookie': C.sessionCookie(C.makeToken(A)) });
  }
  if (m === 'POST' && p === '/api/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': C.sessionCookie('', 0) });

  // admin
  if (!p.startsWith('/api/admin')) return send(res, 404, { error: 'Tidak ditemukan' });
  const A = await C.getAuth();
  if (!C.validToken(A, C.cookies(req).adm)) return send(res, 401, { error: 'Belum login' });
  const origin = req.headers.origin;
  if (m !== 'GET' && origin && new URL(origin).host !== req.headers.host) return send(res, 403, { error: 'Origin tidak valid' });

  if (m === 'GET' && p === '/api/admin/me') return send(res, 200, { ok: true, defaultPassword: !!A.auth.default });
  if (m === 'GET' && p === '/api/admin/config') return send(res, 200, { config: await C.getConfig(), defaults: C.DEFAULTS });
  if (m === 'PUT' && p === '/api/admin/config') {
    const b = await readJson(req);
    if (!C.isObj(b)) return send(res, 400, { error: 'Konfigurasi tidak valid' });
    await C.saveConfig(b);
    return send(res, 200, { ok: true });
  }
  if (m === 'POST' && p === '/api/admin/password') {
    return send(res, 400, { error: 'Password diatur lewat ADMIN_PASSWORD di Vercel (Settings → Environment Variables), lalu Redeploy.' });
  }

  // Upload langsung (≤ 4MB): isi file dikirim ke sini dan diteruskan server ke Supabase Storage.
  if (m === 'POST' && p === '/api/admin/upload') {
    const name = clean(url.searchParams.get('name') || 'file', 100).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(name).toLowerCase();
    if (!ADMIN_UPLOAD_EXT.includes(ext)) return send(res, 400, { error: 'Tipe file tidak didukung' });
    let buf = Buffer.isBuffer(req.body) ? req.body : null;
    if (!buf) { const chunks = []; for await (const c of req) chunks.push(c); buf = Buffer.concat(chunks); }
    if (!buf.length) return send(res, 400, { error: 'File kosong' });
    if (buf.length > 4 * 1024 * 1024) return send(res, 413, { error: 'File terlalu besar untuk jalur ini' });
    const key = `${Date.now().toString(36)}-${name}`;
    must(await sb().storage.from(BUCKET).upload(key, buf, { contentType: MIME[ext] || 'application/octet-stream', upsert: false }));
    return send(res, 200, { url: C.publicUrl(key) });
  }
  // Upload: file besar tidak lewat Vercel (batas 4,5MB). Server hanya membuat URL upload bertanda tangan,
  // lalu browser mengunggah langsung ke Supabase Storage.
  if (m === 'POST' && p === '/api/admin/upload-url') {
    const name = clean(url.searchParams.get('name') || 'file', 100).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(name).toLowerCase();
    if (!ADMIN_UPLOAD_EXT.includes(ext)) return send(res, 400, { error: 'Tipe file tidak didukung' });
    const key = `${Date.now().toString(36)}-${name}`;
    const d = must(await sb().storage.from(BUCKET).createSignedUploadUrl(key));
    return send(res, 200, { uploadUrl: d.signedUrl, url: C.publicUrl(key) });
  }
  // Hapus file dari Pustaka (Supabase Storage)
  if (m === 'POST' && p === '/api/admin/upload-delete') {
    const b = await readJson(req), list = (Array.isArray(b.names) ? b.names : [b.name]).map((x) => String(x || '').split('?')[0]).slice(0, 200);
    if (!list.length || list.some((n) => !/^[a-zA-Z0-9._-]{1,200}$/.test(n))) return send(res, 400, { error: 'Nama file tidak valid' });
    must(await sb().storage.from(BUCKET).remove(list));
    return send(res, 200, { ok: true, deleted: list.length });
  }
  if (m === 'GET' && p === '/api/admin/uploads') {
    const files = must(await sb().storage.from(BUCKET).list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } }));
    return send(res, 200, files.filter((f) => f.id).map((f) => ({ url: C.publicUrl(f.name), ts: Date.parse(f.created_at) || 0 })));
  }

  const col = /^\/api\/admin\/(rsvp|wishes|gifts)(?:\/([a-f0-9]+))?(\.csv)?$/.exec(p);
  if (col) {
    const [, name, id, isCsv] = col;
    if (m === 'GET' && !id) {
      const rows = await listAll(TABLES[name]);
      if (isCsv || url.searchParams.get('format') === 'csv') {
        const cols = { rsvp: ['name', 'status', 'count', 'time'], wishes: ['name', 'message', 'photo', 'time'], gifts: ['name', 'bank', 'amount', 'message', 'proof', 'time'] }[name];
        const data = rows.map((r) => ({ ...r, time: new Date(+r.ts).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) }));
        return send(res, 200, csv(data, cols), { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}.csv"` });
      }
      return send(res, 200, rows);
    }
    if (m === 'DELETE' && id) { must(await sb().from(TABLES[name]).delete().eq('id', id)); return send(res, 200, { ok: true }); }
  }
  return send(res, 404, { error: 'Tidak ditemukan' });
}

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const sub = url.searchParams.get('__p'); // diisi oleh rewrite di vercel.json
    if (sub !== null) { url.pathname = '/api/' + sub; url.searchParams.delete('__p'); }
    await route(req, res, url);
  }
  catch (e) {
    console.error(e);
    const code = e.code === 400 ? 400 : e.code === 413 ? 413 : 500;
    send(res, code, { error: e.expose || e.code === 400 || e.code === 413 ? e.message : 'Kesalahan server' });
  }
};
