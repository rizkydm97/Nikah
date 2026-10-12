'use strict';
// Logika bersama untuk fungsi Vercel: koneksi Supabase, konfigurasi, autentikasi.
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
const DEFAULTS = require('../default-config.json');

const BUCKET = 'uploads';
let _sb;
function sb() {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Object.assign(new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diatur di Vercel'), { code: 500, expose: true });
  _sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return _sb;
}
const publicUrl = (p) => sb().storage.from(BUCKET).getPublicUrl(p).data.publicUrl;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
// objek digabung rekursif, array diganti utuh
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const o = { ...base };
  for (const k of Object.keys(over)) o[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k];
  return o;
}

// ---------- tabel settings (key/value jsonb) ----------
async function getSetting(key) {
  const { data, error } = await sb().from('settings').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}
async function setSetting(key, value) {
  const { error } = await sb().from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
async function getConfig() { return merge(DEFAULTS, (await getSetting('config')) || {}); }
async function saveConfig(b) { const c = merge(DEFAULTS, b); await setSetting('config', c); return c; }

// ---------- auth ----------
function hashPw(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') };
}
// Ambil auth + secret; dibuat otomatis saat pertama kali (password awal dari ADMIN_PASSWORD, atau admin123)
async function getAuth() {
  let auth = await getSetting('auth');
  if (!auth) {
    auth = hashPw(process.env.ADMIN_PASSWORD || 'admin123'); auth.default = !process.env.ADMIN_PASSWORD;
    const { error } = await sb().from('settings').upsert({ key: 'auth', value: auth }, { onConflict: 'key', ignoreDuplicates: true });
    if (error) throw error;
    auth = await getSetting('auth');
  }
  let secret = process.env.SESSION_SECRET || (await getSetting('secret') || {}).key;
  if (!secret) {
    const { error } = await sb().from('settings').upsert({ key: 'secret', value: { key: crypto.randomBytes(32).toString('hex') } }, { onConflict: 'key', ignoreDuplicates: true });
    if (error) throw error;
    secret = (await getSetting('secret')).key;
  }
  return { auth, secret };
}
const sign = (secret, s) => crypto.createHmac('sha256', secret).update(s).digest('hex');
function checkPw(auth, pw) {
  const h = crypto.scryptSync(String(pw), auth.salt, 64), a = Buffer.from(auth.hash, 'hex');
  return a.length === h.length && crypto.timingSafeEqual(a, h);
}
function makeToken({ auth, secret }) { const exp = Date.now() + 7 * 864e5; return `${exp}.${sign(secret, String(exp) + auth.hash)}`; }
function validToken({ auth, secret }, t) {
  if (!t) return false;
  const [exp, sig] = t.split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  const good = sign(secret, exp + auth.hash);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}
const cookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
const sessionCookie = (token, maxAge = 604800) => `adm=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;

module.exports = { DEFAULTS, BUCKET, sb, publicUrl, isObj, merge, getSetting, setSetting, getConfig, saveConfig, hashPw, getAuth, checkPw, makeToken, validToken, cookies, sessionCookie };
