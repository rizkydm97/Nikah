/* Sistem notifikasi toast terpusat (undangan + admin).
   Pemakaian:
     Toast.success('Alamat berhasil disalin!')
     Toast.error('Gagal menyalin, silakan coba lagi.')
     Toast.warning('Silakan lengkapi data terlebih dahulu.')
     Toast.info('Memuat data...')                 // info = tetap tampil sampai ditutup / diganti
     const t = Toast.info('Memuat data...'); ...; t.close();
   Notifikasi baru ditumpuk ke bawah notifikasi sebelumnya (tidak saling menimpa). */
(function () {
  if (window.Toast) return;

  const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.5v7.2"/><circle cx="12" cy="17.6" r="1" fill="currentColor" stroke="none"/></svg>',
    info: '<svg class="tst-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 4.5a7.5 7.5 0 1 0 7.5 7.5" /></svg>',
    infoStatic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 11v6"/><circle cx="12" cy="7.4" r="1" fill="currentColor" stroke="none"/></svg>'
  };
  const DURATION = { success: 2800, error: 4000, warning: 4000, info: 0 };
  const MAX = 3;

  let stack = null;
  const live = []; // { el, type, msg, timer, closing }

  function getStack() {
    if (stack && stack.isConnected) return stack;
    stack = document.createElement('div');
    stack.className = 'tst-stack';
    stack.setAttribute('aria-live', 'polite');
    (document.body || document.documentElement).appendChild(stack);
    return stack;
  }

  function close(n) {
    if (!n || n.closing) return;
    n.closing = true; clearTimeout(n.timer);
    const i = live.indexOf(n); if (i >= 0) live.splice(i, 1);
    const el = n.el;
    el.classList.add('tst-out');
    setTimeout(() => {
      el.style.height = el.offsetHeight + 'px';
      void el.offsetHeight;
      el.classList.add('tst-collapse');
      setTimeout(() => el.remove(), 300);
    }, 260);
  }

  function arm(n, ms) {
    clearTimeout(n.timer);
    if (ms > 0) n.timer = setTimeout(() => close(n), ms);
  }

  function show(type, msg, opts) {
    type = ICONS[type] && type !== 'infoStatic' ? type : 'info';
    msg = String(msg == null ? '' : msg);
    opts = opts || {};
    const ms = opts.duration != null ? opts.duration : DURATION[type];

    // pesan yang sama dan masih tampil: cukup perpanjang waktunya (tidak menumpuk berulang)
    const dup = live.find((n) => !n.closing && n.type === type && n.msg === msg);
    if (dup) { arm(dup, ms); return { close: () => close(dup) }; }

    // batasi jumlah yang tampil bersamaan
    while (live.length >= MAX) close(live[0]);

    const el = document.createElement('div');
    el.className = 'tst-item';
    const bad = type === 'error' || type === 'warning';
    el.innerHTML = '<div class="tst tst-' + type + '" role="' + (bad ? 'alert' : 'status') + '"><span class="tst-ic" aria-hidden="true">' +
      (type === 'info' && ms > 0 ? ICONS.infoStatic : ICONS[type]) + '</span><span class="tst-tx"></span></div>';
    el.querySelector('.tst-tx').textContent = msg;
    getStack().appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('tst-in')));

    const n = { el, type, msg, timer: 0, closing: false };
    live.push(n);
    arm(n, ms);
    return { close: () => close(n) };
  }

  function clear() { live.slice().forEach(close); }

  window.Toast = {
    show,
    success: (m, o) => show('success', m, o),
    error: (m, o) => show('error', m, o),
    warning: (m, o) => show('warning', m, o),
    info: (m, o) => show('info', m, o),
    clear
  };
})();
