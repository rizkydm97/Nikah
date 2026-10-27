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
  // Tema 12 (Monokrom): warna awal putih/abu sejak byte pertama — tanpa kilatan krem & bilah browser ikut putih
  let out = html;
  if (config.theme && config.theme.preset === 'mono') {
    out = out.replace('<body class="locked">', '<body class="locked t-mono">')
      .replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#ffffff">')
      .replace('</head>', '<style>html,body{background:#e6e6e6}#loader{background:#fff!important}</style></head>');
    // foto cover mulai diunduh sejak byte pertama (paralel dengan skrip & konfigurasi), bukan menunggu JS jalan
    const m = config.mono || {}, c = config.cover || {};
    const ok = (u) => /^(https?:\/\/|\/(?!\/))/i.test(String(u || '')) && !/\.(mp4|webm|mov|m4v|mkv)(\?|#|$)|youtu/i.test(String(u));
    const pre = [m.coverMedia, m.coverPoster, m.coverMedia ? '' : (/\/assets\/default\//.test(c.photo || '') ? '' : c.photo)].filter(ok);
    if (pre.length) out = out.replace('</head>', [...new Set(pre)].slice(0, 2).map((u) => `<link rel="preload" as="image" href="${attr(u)}" fetchpriority="high">`).join('') + '</head>');
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.end(out);
};
