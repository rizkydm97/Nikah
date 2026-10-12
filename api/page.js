'use strict';
// Menyajikan halaman undangan (index.html) dengan judul/OG tag dari konfigurasi.
const fs = require('fs');
const path = require('path');
const { getConfig } = require('../lib/core');

const attr = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'lib', 'index.template.html'), 'utf8');

module.exports = async (req, res) => {
  let config;
  try { config = await getConfig(); } catch (e) { console.error(e); res.statusCode = 500; return res.end('Konfigurasi belum siap. Cek env Supabase di Vercel.'); }
  const g = config.general;
  const html = TEMPLATE.replace(/\{\{title\}\}/g, attr(g.title)).replace(/\{\{description\}\}/g, attr(g.description)).replace(/\{\{ogImage\}\}/g, attr(g.ogImage))
    .replace('<meta name="theme-color" content="#AD2940">', `<meta name="theme-color" content="${attr(config.theme.primary)}">`);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(html);
};
