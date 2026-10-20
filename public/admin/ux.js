/* Lapisan kemudahan admin: label singkat + penjelasan, menu bertingkat, kartu per topik, checklist Beranda.
   Tidak mengubah data/skema — hanya cara tampil. */

// Label singkat & penjelasan untuk pengaturan yang labelnya panjang/teknis: kunci -> [label, penjelasan]
const FRIENDLY = {
  'general.title': ['Judul undangan', 'Muncul di tab browser dan saat link dibagikan lewat WhatsApp.'],
  'general.description': ['Deskripsi singkat', 'Kalimat pendek di bawah judul saat link dibagikan.'],
  'general.ogImage': ['Gambar saat link dibagikan', 'Foto kecil yang tampil di WhatsApp/Instagram ketika link dikirim.'],
  'general.eventDate': ['Tanggal & jam acara', 'Dipakai untuk hitung mundur di undangan.'],
  'general.eventEnd': ['Jam selesai acara', 'Dipakai untuk tombol "Simpan ke Kalender".'],
  'general.eventLocation': ['Lokasi acara', 'Dipakai untuk tombol "Simpan ke Kalender".'],
  'general.calendarTitle': ['Judul di kalender tamu', 'Contoh: Pernikahan Yogi & Ratna.'],
  'general.whatsapp': ['Nomor WhatsApp Anda', 'Format 628xxxxxxxxxx. Dipakai agar Anda dapat pesan saat tamu mengisi RSVP.'],
  'general.musicUrl': ['Musik latar', 'Unggah file mp3 atau tempel link-nya.'],
  'general.blockRightClick': ['Matikan klik kanan', 'Menyulitkan tamu menyimpan gambar dari undangan.'],
  'theme.preset': ['Pilih tema undangan', 'Hanya mengganti desain. Nama, acara, foto, dan rekening tetap sama.'],
  'theme.palette': ['Pilih warna', 'Satu klik mengganti warna tulisan, tombol, latar, dan bunga.'],
  'theme.primary': ['Warna judul', ''], 'theme.accent': ['Warna tombol', ''], 'theme.rose': ['Warna kartu hadiah', ''],
  'theme.gold': ['Warna emas (garis hiasan)', ''], 'theme.paper': ['Warna latar kertas', ''], 'theme.ink': ['Warna tulisan judul', ''],
  'theme.body': ['Warna tulisan isi', ''], 'theme.sideBg': ['Warna latar samping (di komputer)', ''],
  'theme.fontDisplay': ['Font judul besar', ''], 'theme.fontHeading': ['Font sub-judul', ''], 'theme.fontBody': ['Font isi', ''],
  'theme.fontScript': ['Font tulisan tangan (nama mempelai)', ''], 'theme.colWidth': ['Lebar undangan di komputer (px)', 'Biarkan bila tidak yakin.'],
  'effects.animMode': ['Mode animasi', 'Klik salah satu. Setelah itu Anda masih bisa menyalakan/mematikan satu per satu di kartu di bawahnya.'],
  'effects.birds': ['Burung / enggang / merpati', 'Burung yang terbang melintas di langit pembuka dan latar.'],
  'effects.particles': ['Debu cahaya, kunang-kunang & kilau', 'Titik-titik cahaya yang melayang pelan.'],
  'effects.lights': ['Cahaya, sinar & kabut', 'Sinar matahari/bulan, pendar lampu, dan kabut yang bergerak.'],
  'effects.revealAnim': ['Animasi teks & gambar muncul saat di-scroll', 'Mati = semua teks & gambar langsung tampil tanpa efek muncul.'],
  'effects.animSpeed': ['Kecepatan animasi', 'Seberapa cepat teks & foto muncul saat di-scroll.'],
  'effects.intro': ['Animasi pembuka', 'Layar pembuka sebentar sambil gambar dimuat agar animasi mulus.'],
  'effects.openZoom': ['Kamera masuk ke rumah saat dibuka', 'Efek "masuk" ke dalam rumah ketika tamu menekan Buka Undangan.'],
  'effects.clouds': ['Awan bergerak', ''], 'effects.cloudSpeed': ['Kecepatan awan', ''],
  'effects.showTree': ['Tampilkan rumah pohon', 'Hanya untuk Tema 1.'],
  'effects.butterflies': ['Kupu-kupu terbang', ''], 'effects.butterflyCount': ['Jumlah kupu-kupu (0–12)', ''],
  'effects.petals': ['Kelopak bunga berjatuhan', ''], 'effects.parallax': ['Efek kedalaman saat scroll', ''],
  'effects.sway': ['Bunga & daun bergoyang', ''], 'effects.glow': ['Lampu rumah berkedip', ''],
  'effects.javaFx': ['Nuansa Jawa hidup', 'Tema 1: gunungan wayang, burung, kunang-kunang, sinar matahari, motif batik berkilau.'],
  'effects.zoomFx': ['Kupu-kupu & daun gugur saat kamera masuk', ''],
  'effects.themedCover': ['Sampul berbentuk benda (amplop, pintu, kerang, dll)', 'Tema 3–11. Matikan untuk memakai sampul lukisan biasa + tombol.'],
  'effects.livingWorld': ['Suasana hidup di dalam undangan', 'Tema 3–11: kelopak, daun, kunang-kunang bergerak tertiup angin.'],
  'effects.livingDensity': ['Banyaknya partikel suasana', 'Pilih "Sedikit" bila undangan terasa berat di HP lama.'],
  'effects.sectionClouds': ['Awan & burung di tiap bagian', 'Tema 3–11.'],
  'effects.perchButterfly': ['Kupu-kupu hinggap di kartu', 'Tema 3–11.'],
  'effects.scrollFx': ['Semua efek scroll (saklar utama)', 'Mati = semua efek scroll di bawah ikut mati.'],
  'effects.scrollReveal': ['Judul muncul kata demi kata', ''], 'effects.bgParallax': ['Latar bergeser lebih pelan', ''],
  'effects.bloomOrnament': ['Cahaya & kunang-kunang bertambah saat scroll', ''], 'effects.skyShift': ['Warna suasana pagi → senja → malam', ''],
  'effects.galleryFx': ['Foto galeri membesar di tengah layar', ''], 'effects.countdownFlip': ['Angka hitung mundur berkilau', ''],
  'effects.wishFloat': ['Kartu ucapan melayang halus', ''], 'effects.sectionVeil': ['Tirai kabut saat pindah bagian', ''],
  'effects.ambientSound': ['Suara suasana (angin, air, gamelan, dll)', 'Mulai saat undangan dibuka. Tema 3–11.'],
  'effects.soundVolume': ['Volume suara suasana', ''], 'effects.tapFx': ['Sentuh layar memunculkan hiasan + nada', ''],
  'effects.guestInWorld': ['Nama tamu tergantung di dalam gambar', ''], 'effects.nightMode': ['Mode malam otomatis (18.00–05.00)', ''],
  'effects.haptic': ['Getar halus di HP', 'Hanya Android.'],
  'cover.photo': ['Foto cover', 'Klik "Atur posisi" agar wajah pas di bingkai.'],
  'cover.photoRatio': ['Bentuk bingkai foto', ''], 'cover.bg': ['Latar cover satu gambar penuh (opsional)', 'Kosongkan untuk memakai gambar bawaan tema.'],
  'cover.defaultGuest': ['Nama tamu bila link tanpa nama', ''], 'cover.button': ['Tulisan tombol buka', ''],
  'quote.arabic': ['Ayat tulisan Arab (opsional)', 'Kosongkan bila tidak dipakai.'],
  'quote.text': ['Terjemahan / kutipan', ''],
  'gallery.video': ['Video galeri (opsional)', 'Tempel link YouTube / .mp4, atau unggah. Putar otomatis tanpa suara.'],
  'gallery.slider': ['Slider foto berjalan sendiri', 'Foto di slider selalu tampil utuh sesuai aslinya.'], 'gallery.layout': ['Gaya susunan', 'Majalah = foto tampil sesuai ukuran aslinya. Kotak rata = semua foto seragam.'],
  'gallery.shape': ['Bentuk foto', 'Berlaku untuk semua foto. Untuk satu foto saja, klik fotonya di atas lalu atur "Bentuk foto ini". Pilih "Ukuran asli" untuk gaya majalah.'],
  'gallery.cols': ['Jumlah kolom', '2 = dua foto sejajar, 4 = empat foto sejajar. "Otomatis" = 2 (majalah) atau 3 (kotak rata).'],
  'gift.title': ['Judul', 'Kata pertama memakai tulisan tangan.'],
  'gift.address': ['Alamat kirim kado', 'Kosongkan untuk menyembunyikan.'],
  'gift.sendWhatsapp': ['Buka WhatsApp setelah tamu konfirmasi gift', 'Nomor WhatsApp diisi di menu Umum.'],
  'rsvp.sendWhatsapp': ['Buka WhatsApp setelah tamu mengisi RSVP', 'Nomor WhatsApp diisi di menu Umum.'],
  'rsvp.title': ['Judul', 'Dipecah dua baris, mis. RS / VP.'],
};

// Kelompok kartu di dalam satu halaman: [judul kartu, [kunci...], dilipat?]
const LAYOUT = {
  effects: [
    ['Mode animasi (pilih cepat)', ['effects.animMode']],
    ['Animasi pembuka saat tamu menekan "Buka Undangan"', ['effects.intro', 'effects.openZoom', 'effects.zoomFx']],
    ['Teks & gambar saat masuk', ['effects.revealAnim', 'effects.animSpeed']],
    ['Hiasan bergerak di halaman awal & latar', ['effects.clouds', 'effects.cloudSpeed', 'effects.butterflies', 'effects.butterflyCount', 'effects.birds', 'effects.particles', 'effects.petals', 'effects.lights', 'effects.glow', 'effects.sway', 'effects.parallax']],
    ['Khusus Tema 1', ['effects.showTree', 'effects.javaFx'], true],
  ],
  general: [
    ['Judul & tampilan saat link dibagikan', ['general.title', 'general.description', 'general.ogImage']],
    ['Tanggal & lokasi acara', ['general.eventDate', 'general.eventEnd', 'general.eventLocation', 'general.calendarTitle']],
    ['Musik & kontak', ['general.musicUrl', 'general.whatsapp']],
    ['Lainnya (opsional)', ['general.blockRightClick'], true],
  ],
  theme: [
    ['Tema & warna', ['theme.preset', 'theme.palette']],
    ['Atur warna satu per satu (opsional)', ['theme.primary', 'theme.accent', 'theme.rose', 'theme.gold', 'theme.paper', 'theme.ink', 'theme.body', 'theme.sideBg'], true],
    ['Font (opsional)', ['theme.fontDisplay', 'theme.fontHeading', 'theme.fontBody', 'theme.fontScript', 'theme.colWidth'], true],
  ],
  couple: [
    ['Mempelai Pria', ['couple.groom.photo', 'couple.groom.script', 'couple.groom.fullName', 'couple.groom.parents', 'couple.groom.instagram']],
    ['Mempelai Wanita', ['couple.bride.photo', 'couple.bride.script', 'couple.bride.fullName', 'couple.bride.parents', 'couple.bride.instagram']],
    ['Tampilan section (opsional)', ['couple.bg', 'couple.flower', 'couple.connector', 'couple.instagramLabel'], true],
  ],
  gallery: [
    ['Foto', ['gallery.title', 'gallery.items']],
    ['Susunan foto di bawah slider', ['gallery.layout', 'gallery.shape', 'gallery.cols']],
    ['Slider (foto berjalan sendiri)', ['gallery.slider', 'gallery.sliderSize', 'gallery.sliderDir', 'gallery.sliderSpeed']],
    ['Video & latar (opsional)', ['gallery.video', 'gallery.bg'], true],
  ],
  gift: [
    ['Rekening', ['gift.title', 'gift.intro', 'gift.banks', 'gift.copyBank']],
    ['Alamat kirim kado', ['gift.addressTitle', 'gift.addressName', 'gift.address', 'gift.copyAddress']],
    ['Form konfirmasi gift', ['gift.formEnabled', 'gift.sendWhatsapp', 'gift.formTitle', 'gift.formText', 'gift.formButton'], true],
    ['Latar (opsional)', ['gift.bg'], true],
  ],
};

// Penjelasan singkat di bawah judul halaman
const GROUP_HINT = {
  general: 'Pengaturan dasar: judul, tanggal acara, musik. Isi bagian ini lebih dulu.',
  cover: 'Layar pertama yang dilihat tamu sebelum membuka undangan.',
  hero: 'Nama pengantin dan tanggal di bagian awal setelah undangan dibuka.',
  couple: 'Foto & data kedua mempelai. Klik foto lalu "Atur posisi" bila wajah terpotong.',
  events: 'Isi Akad, Resepsi, dll. Tiap acara punya tombol peta sendiri.',
  gallery: 'Unggah beberapa foto sekaligus. Seret panah ← → untuk mengubah urutan.',
  gift: 'Nomor rekening/e-wallet dan alamat kirim kado.',
  rsvp: 'Tamu mengisi hadir/tidak di sini. Hasilnya ada di menu Data Tamu → RSVP.',
  effects: 'Semua opsional. Matikan efek bila undangan terasa berat di HP tamu.',
};

// Menu: [judul bagian, [[id, ikon, nama]...], dilipat?]
const NAV = [
  ['Mulai', [['home', '🏠', 'Beranda & Checklist']]],
  ['Isi Undangan (urut seperti di undangan)', [
    ['general', '⚙️', 'Umum & Musik'], ['cover', '💌', 'Cover'], ['hero', '✨', 'Pembuka'], ['quote', '📖', 'Ayat & Hitung Mundur'],
    ['greeting', '👋', 'Sambutan'], ['couple', '💑', 'Mempelai'], ['events', '📅', 'Acara'], ['live', '📺', 'Live Streaming'],
    ['gallery', '🖼️', 'Galeri'], ['story', '❤️', 'Love Story'], ['gift', '🎁', 'Wedding Gift'], ['rsvp', '✅', 'RSVP'],
    ['wishes', '💬', 'Ucapan & Doa'], ['closing', '🙏', 'Penutup'],
  ]],
  ['Tampilan', [['theme', '🎨', 'Tema, Warna & Font'], ['effects', '🎬', 'Animasi & Efek'], ['sections', '↕️', 'Urutan & Tampil Section']]],
  ['Data Tamu', [['d-rsvp', '📋', 'Kehadiran (RSVP)'], ['d-wishes', '📝', 'Ucapan Tamu'], ['d-gifts', '💳', 'Konfirmasi Gift'], ['links', '🔗', 'Buat Link Tamu']]],
  ['Pengaturan Lanjutan (opsional)', [
    ['livingfx', '🌿', 'Sampul & Suasana Hidup'], ['scrollfx', '🖱️', 'Efek Scroll'], ['soundfx', '🔊', 'Suara & Sentuhan'],
    ['scene', '🏡', 'Gambar Tema 1'], ['scene2', '🌹', 'Gambar Tema 2'],
  ], true],
  ['Lainnya', [['security', '🔒', 'Keamanan & Cadangan']]],
];

// Checklist Beranda: [teks, id menu, fungsi cek(cfg)]
const CHECKS = [
  ['Isi tanggal & jam acara', 'general', (c) => !!(c.general && c.general.eventDate)],
  ['Isi nama pengantin di Pembuka', 'hero', (c) => !!(c.hero && c.hero.groom && c.hero.bride)],
  ['Unggah foto kedua mempelai', 'couple', (c) => !!(c.couple && c.couple.groom && c.couple.groom.photo && c.couple.bride && c.couple.bride.photo)],
  ['Isi minimal satu acara (Akad/Resepsi)', 'events', (c) => !!(c.events && (c.events.items || []).length)],
  ['Tambah foto galeri', 'gallery', (c) => !!(c.gallery && (c.gallery.items || []).length)],
  ['Isi rekening / alamat hadiah', 'gift', (c) => !!(c.gift && ((c.gift.banks || []).length || c.gift.address))],
  ['Isi nomor WhatsApp untuk notifikasi RSVP', 'general', (c) => !!(c.general && c.general.whatsapp)],
  ['Pasang musik latar', 'general', (c) => !!(c.general && c.general.musicUrl)],
  ['Buat link tamu & kirim', 'links', () => false],
];
