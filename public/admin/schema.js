// Skema editor admin. t = tipe field: text | area | url | image | audio | color | select | bool | number | datetime | list
const F_SERIF = ['Cormorant Infant', 'Cormorant Garamond', 'Playfair Display', 'Lora', 'Libre Baskerville', 'EB Garamond', 'Marcellus', 'Cinzel', 'Alice', 'Abhaya Libre', 'Poppins', 'Montserrat', 'Josefin Sans'];
const F_SCRIPT = ['Great Vibes', 'Allura', 'Parisienne', 'Pinyon Script', 'Dancing Script'];
const ANIMS = [
  ['none', 'Tanpa animasi'], ['fade-in', 'Fade (muncul perlahan)'], ['fade-up', 'Naik dari bawah'], ['fade-down', 'Turun dari atas'],
  ['fade-left', 'Geser dari kiri'], ['fade-right', 'Geser dari kanan'], ['zoom-in', 'Zoom masuk'], ['zoom-out', 'Zoom keluar'],
  ['flip', 'Flip'], ['rotate-in', 'Putar masuk'], ['blur-in', 'Blur ke tajam'], ['bounce', 'Memantul'],
];
const SECTION_NAMES = {
  hero: 'Pembuka (Nama & Tanggal)', quote: 'Ayat & Hitung Mundur', greeting: 'Sambutan', couple: 'Mempelai', events: 'Acara (Akad/Resepsi)',
  live: 'Live Streaming', gallery: 'Galeri', story: 'Love Story', gift: 'Wedding Gift', rsvp: 'RSVP', wishes: 'Ucapan & Doa', closing: 'Penutup',
};
const SCHEMA = [
  { id: 'general', title: 'Umum & Musik', fields: [
    { k: 'general.title', l: 'Judul halaman (tab browser & preview WhatsApp)', t: 'text' },
    { k: 'general.description', l: 'Deskripsi (preview WhatsApp/Google)', t: 'area' },
    { k: 'general.ogImage', l: 'Gambar preview saat link dibagikan', t: 'image' },
    { k: 'general.eventDate', l: 'Tanggal & jam acara (untuk hitung mundur)', t: 'datetime' },
    { k: 'general.eventEnd', l: 'Jam selesai acara (untuk kalender)', t: 'datetime' },
    { k: 'general.eventLocation', l: 'Lokasi (untuk kalender)', t: 'text' },
    { k: 'general.calendarTitle', l: 'Judul agenda kalender', t: 'text' },
    { k: 'general.whatsapp', l: 'Nomor WhatsApp (628xxx) untuk notifikasi RSVP', t: 'text' },
    { k: 'general.musicUrl', l: 'Musik latar (upload mp3 atau tempel URL)', t: 'audio' },
    { k: 'general.blockRightClick', l: 'Matikan klik kanan', t: 'bool' },
  ] },
  { id: 'theme', title: 'Tema, Warna & Font', fields: [
    { k: 'theme.primary', l: 'Warna utama (judul)', t: 'color' }, { k: 'theme.accent', l: 'Warna tombol', t: 'color' }, { k: 'theme.rose', l: 'Warna merah muda (kartu Wedding Gift)', t: 'color' },
    { k: 'theme.gold', l: 'Warna emas (garis lengkung cover & penutup)', t: 'color' }, { k: 'theme.paper', l: 'Warna latar kertas', t: 'color' },
    { k: 'theme.ink', l: 'Warna teks judul', t: 'color' }, { k: 'theme.body', l: 'Warna teks isi', t: 'color' },
    { k: 'theme.sideBg', l: 'Warna latar samping (desktop)', t: 'color' },
    { k: 'theme.fontDisplay', l: 'Font judul besar', t: 'select', o: F_SERIF },
    { k: 'theme.fontHeading', l: 'Font sub-judul', t: 'select', o: F_SERIF },
    { k: 'theme.fontBody', l: 'Font isi', t: 'select', o: F_SERIF },
    { k: 'theme.fontScript', l: 'Font tulisan tangan (nama mempelai)', t: 'select', o: F_SCRIPT },
    { k: 'theme.colWidth', l: 'Lebar kolom undangan di desktop (px)', t: 'number', min: 320, max: 800 },
  ] },
  { id: 'effects', title: 'Animasi & Efek', fields: [
    { k: 'effects.animSpeed', l: 'Kecepatan animasi muncul', t: 'select', o: [['slow', 'Lambat'], ['normal', 'Normal'], ['fast', 'Cepat']] },
    { k: 'effects.openZoom', l: 'Animasi zoom ke rumah saat membuka undangan', t: 'bool' },
    { k: 'effects.butterflies', l: 'Kupu-kupu terbang', t: 'bool' },
    { k: 'effects.butterflyCount', l: 'Jumlah kupu-kupu (0-12)', t: 'number', min: 0, max: 12 },
    { k: 'effects.petals', l: 'Kelopak bunga berjatuhan', t: 'bool' },
    { k: 'effects.parallax', l: 'Efek parallax saat scroll', t: 'bool' },
    { k: 'effects.sway', l: 'Bunga bergoyang pelan', t: 'bool' },
    { k: 'effects.glow', l: 'Cahaya lampu rumah berkedip', t: 'bool' },
  ] },
  { id: 'scene', title: 'Adegan & Gambar Dekorasi', hint: 'Ganti dengan PNG transparan ilustrasi Anda sendiri (bunga atas, bunga bawah, rumah) agar tampilan persis template pilihan.', fields: [
    { k: 'scene.sky', l: 'Latar langit/awan', t: 'image' },
    { k: 'scene.floralTop', l: 'Bunga bagian atas (PNG transparan, rasio ±800×520)', t: 'image' },
    { k: 'scene.house', l: 'Rumah / ilustrasi tengah (PNG transparan)', t: 'image' },
    { k: 'scene.floralBottom', l: 'Bunga bagian bawah (PNG transparan, rasio ±800×700)', t: 'image' },
    { k: 'scene.paper', l: 'Tekstur kertas/marmer latar section', t: 'image' },
    { k: 'scene.frame', l: 'Bingkai bunga kartu kapsul (diregangkan; rasio ±3:5)', t: 'image' },
    { k: 'scene.ornament', l: 'Ikon emas di atas kartu acara (gunungan)', t: 'image' },
    { k: 'scene.flowers', l: 'Buket bunga di sudut foto mempelai (PNG transparan)', t: 'image' },
    { k: 'scene.butterflyColor1', l: 'Warna sayap kupu-kupu 1', t: 'color' },
    { k: 'scene.butterflyColor2', l: 'Warna sayap kupu-kupu 2', t: 'color' },
  ] },
  { id: 'cover', title: 'Cover (Sampul Undangan)', fields: [
    { k: 'cover.photo', l: 'Foto cover', t: 'image' }, { k: 'cover.kicker', l: 'Teks kecil atas', t: 'text' },
    { k: 'cover.names', l: 'Nama mempelai di cover', t: 'text' }, { k: 'cover.toLabel', l: 'Label "Kepada"', t: 'text' },
    { k: 'cover.defaultGuest', l: 'Nama tamu bila link tanpa ?to=', t: 'text' }, { k: 'cover.placeText', l: 'Teks tempat', t: 'text' },
    { k: 'cover.button', l: 'Teks tombol buka', t: 'text' },
  ] },
  { id: 'hero', title: 'Pembuka', fields: [
    { k: 'hero.kicker', l: 'Teks kecil', t: 'text' }, { k: 'hero.groom', l: 'Nama pria', t: 'text' }, { k: 'hero.bride', l: 'Nama wanita', t: 'text' },
    { k: 'hero.dateText', l: 'Tanggal (teks)', t: 'text' }, { k: 'hero.hashtag', l: 'Hashtag', t: 'text' },
  ] },
  { id: 'quote', title: 'Ayat & Hitung Mundur', fields: [
    { k: 'quote.bg', l: 'Foto latar', t: 'image' }, { k: 'quote.text', l: 'Teks ayat / kutipan', t: 'area' }, { k: 'quote.source', l: 'Sumber', t: 'text' },
    { k: 'quote.labels.days', l: 'Label hari', t: 'text' }, { k: 'quote.labels.hours', l: 'Label jam', t: 'text' },
    { k: 'quote.labels.minutes', l: 'Label menit', t: 'text' }, { k: 'quote.labels.seconds', l: 'Label detik', t: 'text' },
    { k: 'quote.saveButton', l: 'Teks tombol Save The Date', t: 'text' },
  ] },
  { id: 'greeting', title: 'Sambutan', fields: [{ k: 'greeting.text', l: 'Teks sambutan', t: 'area' }, { k: 'greeting.photo', l: 'Foto bulat (opsional — kosongkan untuk menyembunyikan)', t: 'image' }] },
  { id: 'couple', title: 'Mempelai', fields: [
    { k: 'couple.bg', l: 'Latar section', t: 'image' }, { k: 'couple.flower', l: 'Buket bunga di sudut foto (PNG transparan)', t: 'image' }, { k: 'couple.connector', l: 'Simbol penghubung', t: 'text' }, { k: 'couple.instagramLabel', l: 'Label tombol Instagram', t: 'text' },
    { k: 'couple.groom.photo', l: 'Pria — foto', t: 'image' }, { k: 'couple.groom.script', l: 'Pria — nama panggilan (tulisan tangan)', t: 'text' },
    { k: 'couple.groom.fullName', l: 'Pria — nama lengkap', t: 'text' }, { k: 'couple.groom.parents', l: 'Pria — orang tua', t: 'text' }, { k: 'couple.groom.instagram', l: 'Pria — link Instagram', t: 'url' },
    { k: 'couple.bride.photo', l: 'Wanita — foto', t: 'image' }, { k: 'couple.bride.script', l: 'Wanita — nama panggilan (tulisan tangan)', t: 'text' },
    { k: 'couple.bride.fullName', l: 'Wanita — nama lengkap', t: 'text' }, { k: 'couple.bride.parents', l: 'Wanita — orang tua', t: 'text' }, { k: 'couple.bride.instagram', l: 'Wanita — link Instagram', t: 'url' },
  ] },
  { id: 'events', title: 'Acara', fields: [
    { k: 'events.bg', l: 'Foto latar', t: 'image' }, { k: 'events.title', l: 'Judul', t: 'text' }, { k: 'events.intro', l: 'Teks pengantar', t: 'area' }, { k: 'events.mapLabel', l: 'Teks tombol peta', t: 'text' },
    { k: 'events.items', l: 'Daftar acara', t: 'list', itemTitle: 'title', addLabel: 'Tambah acara', fields: [
      { k: 'title', l: 'Nama acara', t: 'text' }, { k: 'date', l: 'Tanggal', t: 'text' }, { k: 'time', l: 'Jam', t: 'text' },
      { k: 'place', l: 'Nama tempat', t: 'text' }, { k: 'address', l: 'Alamat', t: 'area' }, { k: 'mapUrl', l: 'Link Google Maps', t: 'url' }] },
  ] },
  { id: 'live', title: 'Live Streaming', fields: [
    { k: 'live.bg', l: 'Foto latar', t: 'image' }, { k: 'live.title', l: 'Judul', t: 'text' }, { k: 'live.text', l: 'Teks', t: 'area' },
    { k: 'live.button', l: 'Teks tombol', t: 'text' }, { k: 'live.url', l: 'Link live (YouTube/Instagram/Zoom)', t: 'url' },
  ] },
  { id: 'gallery', title: 'Galeri', fields: [
    { k: 'gallery.title', l: 'Judul', t: 'text' }, { k: 'gallery.video', l: 'Video (link YouTube atau .mp4) — opsional', t: 'url' },
    { k: 'gallery.items', l: 'Foto galeri', t: 'list', itemTitle: null, addLabel: 'Tambah foto', fields: [{ k: 'image', l: 'Foto', t: 'image' }] },
  ] },
  { id: 'story', title: 'Love Story', fields: [
    { k: 'story.title', l: 'Judul (tulisan tangan)', t: 'text' }, { k: 'story.bg', l: 'Foto latar (kosongkan untuk pakai langit bawaan)', t: 'image' },
    { k: 'story.items', l: 'Cerita', t: 'list', itemTitle: 'title', addLabel: 'Tambah cerita', fields: [{ k: 'image', l: 'Foto', t: 'image' }, { k: 'title', l: 'Judul', t: 'text' }, { k: 'text', l: 'Cerita', t: 'area' }] },
  ] },
  { id: 'gift', title: 'Wedding Gift', fields: [
    { k: 'gift.bg', l: 'Foto latar', t: 'image' }, { k: 'gift.title', l: 'Judul (kata pertama tulisan tangan, sisanya huruf biasa)', t: 'text' }, { k: 'gift.intro', l: 'Teks pengantar', t: 'area' }, { k: 'gift.copyBank', l: 'Teks tombol salin rekening', t: 'text' },
    { k: 'gift.banks', l: 'Rekening', t: 'list', itemTitle: 'bank', addLabel: 'Tambah rekening', fields: [{ k: 'bank', l: 'Nama bank / e-wallet', t: 'text' }, { k: 'number', l: 'Nomor rekening', t: 'text' }, { k: 'name', l: 'Atas nama', t: 'text' }] },
    { k: 'gift.addressTitle', l: 'Judul kirim kado', t: 'text' }, { k: 'gift.addressName', l: 'Nama penerima', t: 'text' }, { k: 'gift.address', l: 'Alamat kirim kado (kosongkan untuk menyembunyikan)', t: 'area' }, { k: 'gift.copyAddress', l: 'Teks tombol salin alamat', t: 'text' },
    { k: 'gift.formEnabled', l: 'Tampilkan form konfirmasi gift', t: 'bool' }, { k: 'gift.sendWhatsapp', l: 'Buka WhatsApp admin setelah konfirmasi gift (isi nomor di Umum)', t: 'bool' }, { k: 'gift.formTitle', l: 'Judul form (kata pertama tulisan tangan)', t: 'text' }, { k: 'gift.formText', l: 'Teks form', t: 'area' }, { k: 'gift.formButton', l: 'Teks tombol form', t: 'text' },
  ] },
  { id: 'rsvp', title: 'RSVP', fields: [
    { k: 'rsvp.bg', l: 'Foto latar', t: 'image' }, { k: 'rsvp.photo', l: 'Foto di samping judul', t: 'image' }, { k: 'rsvp.title', l: 'Judul (dipecah dua baris, mis. RS / VP)', t: 'text' }, { k: 'rsvp.text', l: 'Teks', t: 'area' },
    { k: 'rsvp.maxGuests', l: 'Maksimal jumlah tamu per undangan', t: 'number', min: 1, max: 20 }, { k: 'rsvp.button', l: 'Teks tombol', t: 'text' },
    { k: 'rsvp.thanks', l: 'Pesan setelah submit', t: 'text' }, { k: 'rsvp.sendWhatsapp', l: 'Buka WhatsApp admin setelah submit', t: 'bool' },
  ] },
  { id: 'wishes', title: 'Ucapan & Doa', fields: [
    { k: 'wishes.bg', l: 'Foto latar', t: 'image' }, { k: 'wishes.title', l: 'Judul (kosongkan untuk menyembunyikan)', t: 'text' }, { k: 'wishes.text', l: 'Teks', t: 'area' }, { k: 'wishes.button', l: 'Teks tombol', t: 'text' },
  ] },
  { id: 'closing', title: 'Penutup', fields: [
    { k: 'closing.photo', l: 'Foto', t: 'image' }, { k: 'closing.kicker', l: 'Teks kecil', t: 'text' }, { k: 'closing.names', l: 'Nama mempelai', t: 'text' },
    { k: 'closing.text', l: 'Teks penutup', t: 'area' }, { k: 'closing.footer', l: 'Teks footer', t: 'text' }, { k: 'closing.footerUrl', l: 'Link footer (opsional)', t: 'url' },
  ] },
];
