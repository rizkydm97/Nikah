# Undangan Digital + Admin (Vercel + Supabase)

Undangan pernikahan bertema Jawa Merah dengan panel admin untuk mengubah seluruh isi.
Frontend statis di `public/`, API berupa fungsi Vercel di `api/`, data di Supabase (Postgres + Storage).

## Deploy (±10 menit)

### 1. Supabase
1. Buat project di https://supabase.com.
2. **SQL Editor → New query**, tempel isi `supabase/schema.sql`, klik **Run** (membuat tabel + bucket `uploads`).
3. **Project Settings → API**, catat **Project URL** dan **service_role key** (rahasia!).

### 2. Vercel
1. Upload folder ini ke GitHub (atau pakai `vercel` CLI).
2. Vercel → **Add New Project** → pilih repo. Framework: *Other*. Tanpa build command.
3. **Environment Variables**:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
   - `ADMIN_PASSWORD` = password admin awal (wajib diganti dari `admin123`)
4. **Deploy**.

### 3. Pakai
- Undangan: `https://domain-anda/?to=Nama+Tamu`
- Admin: `https://domain-anda/admin/` — login, lalu atur isi undangan. Password admin = nilai `ADMIN_PASSWORD` di Vercel (atau `admin123` bila kosong). Untuk menggantinya, ubah variabel itu lalu Redeploy.

## Catatan teknis
- Foto/musik diunggah langsung dari browser ke Supabase Storage (lewat URL bertanda tangan), jadi tidak terkena batas 4,5MB fungsi Vercel. Bukti transfer tamu dibatasi 2,5MB.
- Tabel dilindungi RLS tanpa policy; hanya server (service role key) yang bisa membaca/menulis. Jangan pernah menaruh service role key di kode frontend.
- Pembatas laju (anti-spam RSVP/ucapan) bersifat best-effort per instance serverless.
- Lokal: `npm install`, salin `.env.example` ke `.env.local`, lalu `npx vercel dev`.
- Ilustrasi bawaan adalah SVG buatan sendiri; unggah PNG berlisensi Anda di admin untuk mengganti.

## Jika admin tidak bisa dibuka / kosong
1. Buka `https://domain-anda/api/health` — halaman ini menjelaskan apa yang kurang (variabel Vercel, tabel Supabase, bucket storage).
2. Admin sekarang selalu menampilkan pesan galat di layar (tidak lagi kosong) dan tombol "Coba lagi".
3. Pastikan ketiga variabel (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`) terisi, `supabase/schema.sql` sudah dijalankan, lalu **Redeploy**.

## Mengganti ilustrasi agar sama persis dengan template
Tata letak, bentuk kartu, font, dan animasi sudah mengikuti referensi. Gambar bawaan hanyalah placeholder buatan sendiri.
Unggah gambar Anda sendiri di Admin → *Adegan & Gambar Dekorasi*: langit, bunga atas, rumah, bunga bawah, bingkai bunga kapsul, ikon gunungan, buket sudut foto; serta foto latar tiap section.

## Pembaruan v6
- **Ilustrasi baru**: rumah Jawa, rumah pohon, awan, buket, daun pisang, barisan pohon berkabut, kolom bunga, dan bingkai kapsul (folder `public/assets/scene/`). Konfigurasi lama yang masih memakai gambar SVG bawaan otomatis beralih ke gambar baru.
- **Pembuka**: monogram + memuat gambar dulu, lalu cover lengkung muncul bertahap. Awan bergerak terus di langit.
- **Buka undangan**: kartu naik, semak membesar seperti kamera menembus dedaunan, mendekat ke pintu rumah, lalu mundur perlahan memperlihatkan rumah. Setelah itu bunga tumbuh dan nama muncul.
- **Foto fleksibel**: setiap foto/latar punya tombol **✥ Atur posisi** di admin (geser, zoom, "Tampilkan foto utuh", kegelapan lapisan). Bentuk bingkai foto cover bisa dipilih (16:9, 4:3, 1:1, potret).
- **Bingkai kapsul** tidak melar lagi: lengkung atas/bawah ikut lebar kartu, sisi bunga diulang mengikuti tinggi.
- **Pratinjau admin** diperbarui tanpa reload dan otomatis menggulir ke section yang sedang diedit.

## Tema 2 — Rose Garden (v7)
- Admin → **Tema, Warna & Font → Tema undangan**: pilih Tema 1 (Jawa Merah) atau Tema 2 (Rose Garden). Saat diganti, admin menawarkan warna & font bawaan tema tersebut.
- Isi undangan dipakai bersama; gambar dekorasi Tema 2 terpisah di **Dekorasi Tema 2** (`public/assets/rose/`).
- Alur sama: pembuka → cover (kartu berornamen emas + mawar) → klik buka → kamera masuk menembus gapura bertirai, cahaya putih lembut, lalu mundur perlahan → nama di dalam gapura.

## Tema Warna (v8)
- Admin → **Tema, Warna & Font → Tema warna**: Bawaan, Merah Marun, Pink Blush, Ungu Lilac, Dusty Blue, Peach Terakota, Champagne Emas.
- Sekali klik: warna judul, tombol, latar, lapisan foto, bingkai kapsul, kelopak, dan **bunga** (versi warna di `public/assets/pal/`) ikut berganti. Daun tetap hijau.
- Berlaku untuk Tema 1 dan Tema 2. Gambar bunga yang Anda unggah sendiri tidak diubah.

## Istana & Taman Tema 2 (v9)
- Lukisan istana pink + tangga ke gapura mawar + air mancur + pagar tanaman + pohon bunga pink (`public/assets/rose/rose-palace.jpg`, versi tiap warna di `assets/pal/`).
- Dipakai otomatis sebagai latar section Tema 2 yang belum diberi foto sendiri (Ayat, Sambutan, Mempelai, Acara, Live, Galeri, Love Story, Gift, RSVP, Ucapan, Penutup), dengan efek muncul dari cahaya lalu kamera mundur perlahan.
- Bisa diganti di Admin → Dekorasi Tema 2 → "Lukisan istana & taman".

## v10 — Hidup & Nuansa Jawa
- **Daun pisang bergerak sendiri**: bunga bawah (Tema 1) dipisah menjadi 7 daun (`assets/scene/leaf-*.webp`) + lapisan bunga (`floral-bottom-nl.webp`, juga per palet `pal/*/jawa-bottom-nl.webp`). Tiap daun bergoyang dari pangkalnya dengan irama berbeda. Mati bila "Bunga & daun bergoyang" dimatikan.
- **Nuansa Jawa** (Efek → "Nuansa Jawa hidup", hanya Tema 1): gunungan wayang dikibaskan saat membuka undangan, burung terbang di langit, kunang-kunang, sinar matahari, lampu rumah berkedip seperti pelita, motif batik kawung berkilau di section bertekstur kertas, gunungan kecil di hero & penutup.
- **Saat kamera menuju rumah** (Efek → "Kupu-kupu beterbangan & daun gugur"): kupu-kupu terbang melewati kamera + daun gugur (Tema 2: kelopak mawar). Setelahnya daun gugur bercampur kelopak terus melayang di hero.
- **Galeri baru**: slider berjalan sendiri (default ke kanan, bisa digeser/ditahan, klik = lightbox), foto tampil utuh sesuai ukuran aslinya (landscape/portrait), lebih besar; di bawahnya galeri majalah 2 kolom (ukuran asli) dengan efek Ken Burns. Pengaturan di Admin → Galeri: slider on/off, arah, kecepatan, tampilan bawah (majalah / kotak 3 kolom / tidak ada).

## v11 — 6 tema bergambar (Tema 3–8)
Admin → Tema → "Tema undangan": Nusantara (Candi Bali), Princess, Jawa Emas, Biru Air Terjun, Kerajaan Rimba Bulan, Jawa Klasik.
- Cover = lukisan asli; nama mempelai, nama tamu, dan tombol "Buka Undangan" (yang di gambar) jadi tombol sungguhan.
- Pembuka seperti film (pita hitam sinematik + tombol "Lewati"): kamera berpindah bertahap antar bagian lukisan (air terjun → sungai → candi/kastil/joglo …) lalu mundur ke tampilan penuh. Urutan shot ada di `public/themes.js` (`shots`: [x, y, zoom, ms pindah, ms diam, event]).
- Hidup terus: air terjun mengalir, riak air berkilau, kabut bergerak, cahaya matahari/bulan/lampu berdenyut, awan, burung lewat, kunang-kunang, kilau, kupu-kupu dari lembar aset (sayap mengepak 3D), kereta kencana (Princess), gunungan (Jawa Klasik), kelopak kamboja/mawar/daun gugur.
- Section lain memakai lukisan tema sebagai latar + warna & font tema (bisa diubah di Tema Warna).
- Aset: `public/assets/t/<tema>/{cover,world,bg}.webp`, sprite di `public/assets/t/spr/`, efek di `public/assets/t/fx/`.

## v12 — Hiasan dalam per tema (Tema 3–8)
Tiap tema bergambar memakai hiasan sendiri yang disusun dari lembar aset: bunga tepi atas/bawah (Galeri, Love Story, Penutup), bingkai kapsul kartu Acara & Gift (`frame-arc`/`frame-side`), buket di foto mempelai, ornamen kartu acara, ornamen di bawah judul, dan motif (batik/pola/songket) halus di panel. File: `public/assets/t/<tema>/{fl-top,fl-bottom,frame-arc,frame-side,bouquet,orn,divider,motif}.webp`. Gambar dekorasi yang diunggah sendiri lewat admin tetap diutamakan.

## v13 — Cover hidup & cara masuk berbeda tiap tema (Tema 3–8)
- **Cover kini hidup**: air terjun mengalir, awan/kabut bergerak, cahaya berdenyut, parallax 3D, kupu-kupu & partikel cahaya sudah berjalan di halaman cover. Judul & tombol dipasang sebagai lapisan transparan (`ctitle.webp`, `cbtn.webp`) di atas lukisan hidup.
- **Cara masuk per tema** (`entry` di `public/themes.js`, kode di `invitation.js` → `ENTRY`):
  - Princess: amplop merah muda dengan segel monogram → segel pecah → tutup terbuka → kartu keluar → kita masuk ke dalam kartu menuju taman kastil.
  - Nusantara (Bali): gerbang candi dua daun pintu terbuka, cahaya pagi masuk, bunga kamboja berjatuhan.
  - Jawa Emas: kamera menuju matahari senja, ledakan cahaya emas, lalu menyusuri air terjun & sawah.
  - Biru Air Terjun: riak air dari tombol, menyelam (gelembung & cahaya air), muncul di kaki air terjun.
  - Rimba Bulan: kupu-kupu cahaya di tangan sang putri terbang memandu kamera ke istana melayang & bulan.
  - Jawa Klasik: gunungan dikibaskan, lampu blencong menyala, kamera masuk ke pendapa joglo.
- Partikel hidup terus (`motes`): debu emas, bara, gelembung/serbuk cahaya sesuai tema. Tombol "Lewati" menghentikan animasi masuk dengan mulus.

## v34 — Animasi dalam Tema 3–8 (digabung dari v33; pembuka v18 tetap)
- **Imersif** (`public/immersive.js/.css`): suara suasana per tema (angin/air/lonceng/gamelan/jangkrik/gong, sintesis WebAudio, ada tombol ♪), sentuh layar memunculkan kelopak/daun/cahaya + denting, nama tamu menggantung di dalam lukisan, tirai kabut antar bagian, suasana lebih gelap pada jam 18.00–05.00.
- **Efek scroll** (`public/scrollfx.js/.css`): judul muncul kata per kata, latar parallax, warna langit bergeser dari pagi ke malam, cahaya & kunang-kunang bertambah ke bawah, hitung mundur membalik, ucapan tamu melayang, getar halus di HP, jeda animasi bagian yang jauh dari layar, perbaikan galeri HP.
- **Air hidup lewat shader**: air terjun mengalir, kilau air, kabut tipis di langit (parallax 3D dibuat lebih halus, tanpa sensor gerak agar gambar tidak penyok); percikan di dasar air terjun.
- **Momen puncak tiap tema** sebelum nama muncul: kelopak mawar meledak (Princess), sapuan cahaya (Bali), senja jatuh (Emas), bintang jatuh + riak (Biru), kunang-kunang berkumpul ke bulan (Rimba), api blencong (Klasik). Kereta kencana Princess kini dibawa awan dengan jejak kilau.
- Semua bisa dimatikan di Admin → *Efek Scroll (Tema 3-8)* dan *Suara & Sentuhan (Tema 3-8)*.

## v35 — Sampul bertema & Dunia Hidup (Tema 3-8)
- **Tampilan awal = benda bertema yang diketuk tamu** (`public/sampul.js/.css`), menggantikan cover lukisan + tombol:
  - Princess: amplop merah muda bersegel lilin emas → segel terbelah, tutup terbuka, kartu naik, kita masuk ke dalam kartu.
  - Nusantara (Bali): gapura kori agung (bata merah, paras berukir, pintu merah ber-prada, payung tedung, asap dupa) → medali terbelah, pintu terbuka, cahaya pagi, kamera melangkah masuk.
  - Jawa Emas: kotak undangan bermotif batik emas berpita + ronce melati + label nama tamu → pita lepas, tutup terangkat, cahaya emas, masuk ke kartu.
  - Biru: kerang mutiara di permukaan air bulan → kerang terbuka, mutiara bersinar, riak air, menyelam lalu muncul di air terjun.
  - Rimba Bulan: lentera kaca berisi kupu-kupu cahaya & kunang-kunang → tutup lepas, kunang-kunang berhamburan, kupu-kupu terbang dan memandu kamera.
  - Jawa Klasik: kelir wayang + blencong menyala + gunungan di gedebog → gunungan dicabut & dimainkan seperti dalang, api membesar, masuk ke pendapa.
  - Tiap benda punya suara pembuka sendiri (segel/lonceng, gong, gelembung, dll). Admin → *Sampul & Dunia Hidup* → matikan "tampilan awal berupa benda bertema" untuk kembali ke cover lama.
- **Dunia hidup di bagian dalam** (`public/living.js/.css`): kelopak/bunga/daun, kunang-kunang, debu emas, bara, gelembung & kilau per tema dengan kedalaman berlapis; angin berhembus berkala (suara angin ikut membesar); partikel ikut bergeser saat scroll & menyingkir saat disentuh; cahaya khas tema (sinar matahari, bercak cahaya dedaunan, pantulan air, cahaya bulan & kabut, kedip api blencong); makhluk lewat (merpati, burung, kawanan burung senja, kupu-kupu, bayang gunungan, bintang jatuh); kupu-kupu hinggap di tepi kartu; letupan kecil saat judul tiap bagian muncul. Pengaturan: nyala/mati, kepadatan, kupu-kupu hinggap.
- WebGL lukisan dijeda selama sampul tampil supaya animasi pembuka tetap mulus di HP.

## v36 — Tema 9 Dayak: Kerajaan Malinau + awan & burung 3D di dalam (Tema 3-9)
- **Tema 9 — Dayak: Kerajaan Malinau** (Admin → Tema → "Tema 9"). Semua ilustrasi digambar vektor (`public/dayak.js/.css`) sehingga tiap bagian hidup:
  - **Tampilan awal:** tameng talawang 3D (bertekstur kayu & tebal) berputar pelan, mata tameng berkedip, nama tamu di papan manik-manik, penari di kiri-kanan. Ketuk → gong, tameng berputar penuh, terbelah dua seperti pintu, enggang terbang keluar, kamera masuk ke kerajaan.
  - **Dunia Malinau:** langit pagi bersinar, awan berlapis, gunung & kabut, hutan bergoyang, air terjun, Sungai Malinau mengalir, lamin bermotif dengan umbul-umbul berkibar, patung blontang, enggang hinggap & terbang dekat-jauh, kupu-kupu Rajah Brooke, anggrek hitam, kantong semar; penari **Kancet Ledo** (kipas bulu enggang) & **Kancet Pepatai** (mandau & tameng) menari, pemain **sape'** memetik. Parallax berlapis mengikuti kursor & scroll.
  - **Bagian dalam:** penari & pemain sape' di bagian Ayat dan Penutup, enggang hinggap di kartu acara, bulu/daun/anggrek tertiup angin, suara petikan sape', gong, kicau burung, jangkrik & suara enggang.
  - Aset gambar tema (latar bagian, hiasan, sprite) dibuat dari kode vektor yang sama: `node tools/gen-dayak.js <url-server-lokal>`.
- **Semua Tema 3-9:** awan 3D tiga lapis kedalaman di latar tiap bagian (ikut bergeser saat scroll), dan burung/merpati/enggang/kawanan burung/kupu-kupu terbang 3D dari jauh mendekat ke kamera (atau menjauh). Admin → *Sampul & Dunia Hidup* → "awan 3D".

## v37 — Sinema hero ala video referensi + bingkai mempelai khas tema (Tema 3-9)
- **Hero tenang & bertahap** (`public/cinema.js/.css`): kamera hanya mundur pelan satu kali (±8 dtk) dan tetap di dalam adegan, jadi **bingkai lukisan tidak terlihat selama animasi**. Adegan tersusun: dedaunan/bunga tema turun dari sudut atas & naik dari bawah, **bulan realistis terbit lalu berputar perlahan** (Biru, Rimba; tekstur dari `tools/gen-moon.py`), burung & kupu-kupu terbang, momen khas tema, lalu adegan meredup dan **bingkai akhir digambar garis demi garis** berisi nama, tanggal & nama tamu — adegan di belakang tetap hidup (air terjun, bulan, awan, burung).
- Bingkai akhir berbeda tiap tema: Princess lengkung + mahkota, Bali gapura candi bertingkat, Jawa Emas lengkung Jawa + gunungan, Biru oval perak, Rimba kapsul emas, Klasik bentuk gunungan, Dayak tameng.
- **Bingkai foto mempelai** berbentuk khas tema dengan ornamen di atas; bunga mempelai pria di kiri, mempelai wanita di kanan (dicerminkan), bergoyang pelan; garis bingkai tergambar saat muncul.
- **Peralihan tiap bagian khas tema** (tidak seragam): Princess mekar lembut, Bali naik dari kabut, Jawa Emas disapu kilau emas, Biru muncul dari gelap malam, Rimba fokus berpendar, Klasik kelir terbuka dari tengah (dan tirai kelir antar bagian), Dayak membelah dari tengah. Judul tiap tema juga muncul dengan gaya berbeda.
- **Scroll halus** dengan roda mouse di desktop; di HP memakai scroll asli.

## v38 — Adegan dibangun sepotong demi sepotong, tirai/lampu gantung/pilar, air terjun bercahaya, ayat Arab
- **Lukisan Tema 3-8 dipisah menjadi lapisan** (`tools/gen-layers.py` → `public/assets/t/<tema>/lyr/`): plat latar berkabut + potongan objek (istana, taman, gazebo, candi, gunung, sawah, air terjun, sungai, tokoh, macan, pulau melayang, joglo, wayang, gamelan…). Saat dibuka, objek muncul satu per satu seperti video referensi, lalu menyatu kembali menjadi lukisan hidup yang utuh. Tema 9 Dayak dibangun lapis demi lapis (langit → awan → gunung → bukit → sungai → pohon → lamin → penari → semak).
- **Properti panggung khas tema** (ala video kedua): pilar naik dari bawah, tirai masuk dari samping lalu terikat, lampu gantung turun dan berayun — warna & bentuk berbeda per tema (kristal pink, lentera prada, robyong emas, kristal biru, lentera hijau, robyong merah marun).
- **Air terjun bercahaya**: lebih cerah, aliran berkilau, kabut di dasarnya; versi malam (Biru, Rimba) menyala biru.
- **Ayat Arab punya kolom sendiri** di Admin → Ayat & Hitung Mundur ("Ayat dalam tulisan Arab" + ukuran Sedang/Besar/Sangat besar), tampil kanan-ke-kiri dengan huruf Amiri. Bila kolom Arab kosong tapi teks ayat berisi baris Arab, baris itu otomatis dipisahkan & diperbesar.
- **Penari Dayak di bagian Ayat** dipindah ke atas ayat sehingga tidak menutupi tulisan.
- **iPhone "halaman dimuat ulang"**: penggunaan memori GPU dikurangi — kanvas WebGL lebih kecil di HP & satu tekstur saja, tanpa parallax per-frame di HP untuk Tema 9, awan bagian tidak lagi di belakang teks berfoto, tanpa backdrop-filter besar di HP, dan semua animasi hero dijeda saat hero tidak terlihat.

## v39 — Lebih ringan & rapi
- Bingkai foto mempelai sederhana seperti contoh: garis emas tipis (kapsul/lengkung/oval sesuai tema), **ukuran mengikuti bentuk foto** (potret tinggi s/d agak lebar), bunga kecil di sisi luar + satu di sudut seberang (pria kiri, wanita kanan) sehingga wajah tidak tertutup.
- Kelopak jatuh & "ledakan" bunga saat scroll dihapus; partikel cahaya dikurangi; di HP tanpa awan per bagian, tanpa blur saat muncul, kanvas efek resolusi 1x, kupu-kupu/enggang hero berhenti saat hero tidak terlihat.
- Bulan: Rimba memakai bulan asli lukisan (tidak ganda); Biru satu bulan realistis terbit di belakang puncak air terjun & memudar ke kabut. Lingkaran cahaya scroll di tema malam dihapus.
- Jawa Emas: bingkai akhir lengkung simetris. Garis putih tipis di sisi kiri hero (bentrok kelas CSS) diperbaiki.
- Penutup tanpa bunga kiri-kanan. Tombol "Lewati" dihapus.

## v40 — Masuk adegan alami & 3D (tanpa potongan)
- Potongan-potongan lukisan dihapus. Adegan sekarang muncul dari **kabut yang tersingkap mengikuti kedalaman**: yang jauh (langit, gunung, istana, candi) terlihat dulu, lalu yang dekat (tokoh, bunga, sungai) — lukisan selalu utuh.
- **Kedalaman 3D akurat**: peta kedalaman baru dibuat dengan model MiDaS (`tools/gen-depth-ai.py`), sehingga saat kamera bergeser, bagian depan bergerak lebih banyak dari latar (paralaks 3D) tanpa gambar penyok. Efek 3D lebih kuat saat masuk lalu mereda halus.
- Air terjun: aliran vertikal bercahaya (biru menyala pada tema malam), bulan Biru bercahaya dengan tepi lembut.
- Tanpa WebGL (HP sangat lama): kabut lembut biasa yang memudar.

## v42 — Tema 10 Air Terjun Bulan & Tema 11 Istana Langit (mengikuti video referensi)
- **Tema 10 — Air Terjun Bulan**: sampul gapura batu berisi foto → sampul naik → kamera menembus gapura → air terjun menyala di antara tebing batu bertekstur, kolam berkilau → bulan realistis terbit dari balik air terjun → kupu-kupu → bunga putih tumbuh di bawah → dedaunan turun dari atas → panel oval membesar dari tengah → nama muncul.
- **Tema 11 — Istana Langit**: langit galaksi → ombak awan biru → gazebo kaca naik dari bawah & tangga memanjang → awan pink di kiri-kanan tangga → pilar bermawar → mawar di bawah → bulan ungu → awan gelap → tirai merah dari samping → lampu gantung emas turun → mawar di atas → pilar putih di tepi → nama.
- Aset dibuat sendiri secara prosedural (`tools/gen-scenes.py`: langit nebula & bima sakti, tebing batu, kolam, awan bervolume). Pilih di Admin → Tema → "Tema 10" / "Tema 11".

## v43 — Urutan animasi bertahap (tidak bersamaan)
- Urutan hero di semua tema: **1) adegan tersusun & hidup sampai selesai → 2) bunga sudut → 3) pilar → tirai → lampu gantung → 4) baru bingkai nama**, lalu teks muncul satu per satu (judul, nama, tanggal, tamu).
- Tema 4 Princess: setelah amplop dibuka lukisan langsung tampil utuh (tanpa kabut ulang), tanpa ledakan mawar & kereta yang menumpuk di tengah, segel amplop lebih halus.
- Jawa Emas tanpa kabut ulang; Tema 9/10/11 mengikuti urutan yang sama (Istana: tirai → lampu gantung → mawar atas → pilar tepi → nama).

## v44 — Perbaikan Princess, penutup, Tema 10 & 11
- Princess: kabut & kereta kencana di atas awan dikembalikan seperti v40 (v43 mematikannya lewat `noFog`/`noCx`/`!CIN`).
- Bunga atas/bawah di bagian Terima Kasih Tema 3–11 muncul lagi (aturan CSS `display:none` dari v39 dihapus).
- Bug tirai Tema 11: bentrok nama kelas `.edge.top` dengan hiasan bunga membuat layer props terpotong; kelas diganti `k-cur/k-ch/k-top/k-edge`.
- Awan 3D bervolume baru (`tools/gen-clouds.py`) untuk Tema 10 & 11; kabut melayang di Tema 10.
- Pohon bervolume yang tumbuh & masuk dari sisi (Tema 10: pohon malam + pinus; Tema 11: pohon sakura + lavender).

## v44 — Tema 11 diganti: Adat Jawa (joglo, gunungan, gong, mega mendung)
- Kunci tema tetap `istana` (pilihan tema lama tidak rusak), tampilan & namanya kini **Adat Jawa — Joglo & Gunungan**.
- Urutan masuk: fajar & matahari terbit (sinar berputar) → bukit naik → mega mendung emas meluncur dari kiri-kanan → joglo "dibangun" dari bawah ke atas → pohon tumbuh & bergoyang → gong masuk, bergoyang, lalu dipukul (riak cincin emas) → gunungan naik bercahaya → semak → debu emas & kupu-kupu emas → nama.
- Aset: `public/assets/t/jawa/*.webp` (latar putih sudah dihapus). Kode: `jawaWorld`/`filmJw` di `panggung.js`, gaya di akhir `panggung.css`, sampul di `sampul.js/css`.

## v46 — Tema 11 Adat Jawa dibersihkan total dari tema lama
- Latar section, hiasan sudut atas/bawah, lengkung & sisi bingkai, pemisah, pola, dan palet warna kini semua Jawa (`public/assets/t/jawa/`); aset & kode Istana Langit lama dihapus.
- Ornamen di samping foto mempelai: gunungan, posisinya masuk ke dalam (setengah tersembunyi di balik foto), muncul zoom-in pelan satu per satu; mahkota di atas bingkai juga gunungan.

## v47 — Tema 10 diganti: Ungu Adat Jawa
- Tema 10 (kunci `airterjun`) kini memakai gambar ungu: padang lilac, air terjun berkabut, pohon, joglo, palem, gunungan, melati, bunga ungu, vas bunga, penjor pink (aset di `public/assets/t/ungu/`, kode di `public/ungu.js` + `public/ungu.css`).
- Animasi masuk bertahap seperti Tema 11: langit → padang → air terjun → kabut → pohon tumbuh → joglo dibangun → palem → gunungan → bunga & melati → vas → penjor berayun → kupu-kupu/burung → panel lengkung putih berisi nama.
- Hiasan section lain (bunga atas/bawah, bingkai, pemisah, motif, latar) dibuat dari gambar yang sama: `python3 tools/gen-ungu.py`.
- Setelah deploy: Admin → Tema → pilih ulang "Tema 10" lalu terima tawaran warna & font bawaan agar palet ungu terpakai.

## v48 — Tema 10 lebih natural
- Sampul dan home memakai adegan dunia yang sama persis (tidak ada lagi rumah yang hilang lalu tumbuh ulang); kartu sampul memudar, lalu kupu-kupu & burung masuk dan panel nama muncul halus.
- Bunga hiasan di section dalam muncul utuh (naik & memudar), tidak lagi terbelah dua dan menyapu dari kiri-kanan.

## v49
- Tema 10: rumah/pohon/air terjun tetap sama dengan sampul (tidak hilang), lalu penjor, gunungan, bunga ungu & melati tumbuh masuk bertahap, kupu-kupu & burung, baru panel nama.

## v50
- Tema 10: sampul hanya langit & padang; setelah dibuka dunia masuk satu per satu perlahan (air terjun, kabut, pohon, joglo, palem, gunungan, bunga, vas, penjor) lalu panel nama.

## v51
- Tema 10: animasi masuk kamera dolly 3D (semua lapisan mundur bersama dengan kedalaman parallax, muncul memudar berurutan), gerak kamera halus terus-menerus (juga di HP), bayangan lembut agar benda bervolume.

### v52 — Tema 10: panel nama bentuk pill + monogram
Panel akhir hero Tema 10 kini berbentuk pill tinggi (bingkai merah tua) dengan monogram inisial mempelai di atas, "THE WEDDING OF", nama huruf kapital, tanggal bertitik ("28 . 12 . 2025" bila diisi angka), dan ikon scroll oval.

### v53 — Tema 10: karangan bunga melingkar
Panel nama dikelilingi lingkaran bunga (public/assets/t/ungu/wreath.webp, dibuat oleh tools/gen-ungu.py make_wreath).

### v54 — Tema 10: adegan penuh, tidak ada ruang kosong
- Mengikuti gaya video referensi (rapat, pohon & bunga di semua tepi): sampul dan adegan hero Tema 10 kini terisi penuh.
- Lapisan baru yang sudah terlihat di **sampul** dan tetap ada saat hero (tidak hilang lalu muncul lagi): `clouds` (awan merah muda melayang), `hz` (barisan pohon ungu di kejauhan), `edge` (pohon & semak di kiri-kanan, bergoyang), `bank` (bank bunga mawar & anggrek di bawah), `canopy` (rangkaian bunga menggantung di sudut atas, berayun), serta kelopak anggrek/kamboja yang jatuh pelan dan debu cahaya lebih banyak.
- Lapisan baru yang masuk bertahap setelah dibuka: pohon tambahan (treeC/treeD/treeE) di kiri-kanan joglo, palem ketiga, dua bunga ungu tambahan, dan dahan pohon menggantung di tengah atas (`hang`); kupu-kupu pink kedua.
- Sampul: lapisan lembut di belakang teks agar nama & tombol tetap terbaca di atas barisan pohon.
- Aset baru (`public/assets/t/ungu/`): `ctopL`, `hz`, `bank`, `cl1`–`cl3` (diambil dari palet lilac yang sudah ada). Versi file di `index.template.html` naik ke `?v=54`.

### v55 — Tema 10: nama sampul lebih tebal, air terjun penuh lebar
- Nama mempelai, "The Wedding Of", dan nama tamu di sampul kini tebal (kontur + ungu tua, "&" merah bata) dengan kilau putih agar menonjol.
- Air terjun diperlebar sehingga tidak ada lagi tepi terpotong & ruang kosong di sisi kanan saat animasi.

### v56 — Tema 10: bagian dalam bersih & mudah dibaca
- Semua section berfoto gelap (acara, hadiah, RSVP, ucapan) kini berlatar lilac terang polos; quote & live tetap berfoto dengan pudar lembut ke lilac.
- Judul solid (tanpa gradien warna-warni), teks isi memakai Poppins 13.5px kontras tinggi, kartu acara putih berbingkai lilac. Palet ungu Tema 10 dikunci di CSS (`body.t-airterjun`) sehingga tidak bergantung pengaturan warna admin.

### v62 — Tema 10: animasi masuk mengikuti video, bulan berputar, awan 3D, pohon tumbuh
- **Urutan masuk baru** (satu per satu, tiap tahap terlihat jelas): gapura sampul terbuka → kamera masuk → air terjun & tebing menyala dari kabut → **bulan terbit pelan dari balik tebing** → kupu-kupu lewat → **bunga tumbuh dari bawah** (bertunas bergantian) → **pohon tumbuh** → rumah naik dari bawah, penjor turun, palem & gunungan tumbuh → **panel oval membesar dari tengah** (`grow` di `cinema.js`) → karangan bunga, nama, tanggal. Waktu panel: `t: [8300, 8800, 13400]`.
- **Bulan** kini bola: tekstur baru (`moon3d.webp`, lautan & kawah) **berputar pelan** (±210 detik/putaran) dengan bayangan tepi & arah cahaya yang bergeser pelan, plus cahaya (halo) yang berdenyut.
- **Awan 3D bervolume**: tiap awan terdiri dari 3 lembar di kedalaman berbeda (belakang/badan/puncak terang) di ruang perspektif, berputar tipis (rotateY) dan **mengalir** kiri→kanan dengan kecepatan berbeda menurut kedalaman. Ada awan jauh (di belakang bulan) dan awan dekat (lewat di depan bulan). Di HP jumlah awan dikurangi agar ringan.
- **Pohon tumbuh**: batang naik dari tanah (disingkap lembut dari bawah, tanpa potongan lurus) lalu tiga lapis tajuk mekar dari ujung dahan. Urutan: pohon tengah → kiri → kanan.
- Aset awan & bulan dibuat prosedural: `python3 tools/gen-cloud3d.py` → `public/assets/t/ungu/c3-{a..d}-{b,m,f}.webp`, `moon3d.webp`.
- File berubah: `public/ungu.js`, `public/ungu.css`, `public/cinema.js`, `lib/index.template.html` (versi `?v=62`), `README.md`, `tools/gen-cloud3d.py`, + 13 aset baru.

### v63 — Tema 10: panel setelah adegan selesai, rumah dari kabut, air terjun hidup mulus, awan di samping bulan
- **Panel & nama** (oval + karangan bunga + nama) kini baru muncul setelah SEMUA animasi masuk adegan selesai (`sceneEnd` di `ungu.js`, dipakai `cinema.js`; `t: [11600, 12100, 16700]`). Bila kecepatan animasi diset "cepat", jeda otomatis disesuaikan agar panel tetap setelah adegan.
- **Rumah** tidak lagi "dibangun" dengan potongan lurus (clip-path). Kini memudar dari buram & terang menjadi jelas (tanpa kabut tambahan di sekitarnya).
- **Air terjun hidup 3D**: aliran lama (animasi `background-position` + topeng + blend, berat & patah-patah, dan mati di HP) diganti 3 lapis aliran berkecepatan beda (halus di atas/lambat, besar di bawah/cepat) + kilau + busa di dasar. Hanya `transform`/`opacity` yang beranimasi (GPU), tekstur `streak-seamless.webp` menyambung mulus (`python3 tools/gen-streak-seamless.py`). Di HP memakai 2 lapis + potongan poligon (tanpa topeng gambar) sehingga tetap mengalir.
- **Awan** hanya di langit di kiri & kanan bulan (tidak di area tebing, tidak lagi lewat di bawah tembok/menimpa bulan). Masuk dari sisi layar lalu hanyut pelan bolak-balik terus-menerus (tetap jalan), tetap bervolume 3D. Awan disembunyikan di sampul dan baru masuk saat adegan dibuka.
- File berubah: `public/ungu.js`, `public/ungu.css`, `public/cinema.js`, `public/themes.js`, `lib/index.template.html` (`?v=63`), `README.md`, + aset `streak-seamless.webp`, `tools/gen-streak-seamless.py`.
- **Panel nama Tema 10 dipercantik**: nama mempelai kini huruf skrip besar (font Script dari admin, default Allura) berwarna ungu tua dengan "&" ungu muda, pemisah gunungan di atas menggantikan monogram, tanggal diapit dua garis tipis, panel lebih putih/solid agar kontras (`cinema.js`, akhir `ungu.css`).
- **Lampu rumah Tema 10**: jendela & tiga pintu menyala hangat (berkedip pelan), empat lampion bergoyang di tiap tiang, untaian lampu kecil berkelip di tepi atap, dan pendar di lantai teras. Menyala bertahap setelah rumah tampak (`houseLights()` di `ungu.js`, kelas `.hlt` di `ungu.css`).
- Lampu rumah dibuat **menyala stabil** (tidak berkedip): hanya "bernapas" sangat pelan (±7%) dan lampion bergoyang lembut.

### v64 — Tema warna berfungsi di Tema 3–11 + Mode Animasi di admin
- **Tema warna (Tema 3–11)**: Tema 10 tidak lagi dikunci ungu di CSS — warna mengikuti Admin → Tema warna (warna muda diturunkan otomatis dari warna utama). Teks sampul & bingkai nama Tema 9–11 ikut warna utama. Gambar (latar section, bunga/hiasan, adegan pembuka) ikut **berputar warna** (`hue-rotate`, variabel `--hr`/`--hs`, aturan di `public/animmode.css`, kelas `body.hued`) bila palet dipilih berbeda dari palet asli tema. Catatan: daun hijau pada gambar ikut bergeser sedikit karena putaran warna berlaku ke seluruh gambar.
- Konfigurasi lama yang masih memakai warna Tema 1/2 pada tema bergambar dengan palet "Bawaan tema" otomatis memakai warna bawaan tema itu (`PT.colors` di `themes.js`).
- **Admin → Animasi & Efek → Mode animasi** (satu klik): **Lengkap**, **Animasi awal saja** (pembuka & halaman awal penuh; bagian dalam bersih, hanya teks & gambar masuk), **Bersih total** (tanpa awan/burung/kupu-kupu/partikel/kamera sinematik; hanya teks & gambar masuk), dan **Kustom** (otomatis bila saklar diubah satu per satu). Definisi mode: `ANIM_MODES` di `public/admin/schema.js`.
- Saklar baru: `effects.birds`, `effects.particles`, `effects.lights`, `effects.revealAnim`. Saklar lama (`clouds`, `butterflies`, `petals`, `parallax`, `sway`, `glow`) kini juga berlaku di adegan hero Tema 9–11 (sebelumnya diabaikan). Semua default menyala sehingga undangan lama tidak berubah.
- File berubah: `invitation.js`, `themes.js`, `ungu.js`, `ungu.css`, `panggung.js`, `dayak.js`, `animmode.css` (baru), `admin/{schema,ux,admin}.js`, `admin/admin.css`, `default-config.json`, `lib/index.template.html` (`?v=64`).
- v64 (perbaikan): putaran warna tidak lagi mengenai foto mempelai (sampul hanya memutar hiasan, latar kartu Tema 10 kini mengikuti warna utama); `.bgl` hanya latar tema (`.palace`). Menu **Animasi & Efek** dipindah ke grup "Tampilan" (sebelumnya terlipat di Pengaturan Lanjutan); file admin diberi `?v=64` agar tidak memakai cache lama.


## Pembaruan Ucapan & Doa
- Daftar ucapan berupa kotak setinggi layar (maks 430px) yang bisa di-scroll sendiri, 10 ucapan per muatan dan otomatis memuat berikutnya saat sampai bawah. Di HP blur dan animasi dalam kotak dimatikan agar scroll sentuh lancar.
- Statistik: Hadir, Tidak Hadir, **Yang Mengucapkan** (jumlah pengirim unik) dan **Total Ucapan**.
- Tamu bisa menambah **foto profil** (dipotong persegi & dikecilkan otomatis; tampil sebagai avatar bulat di samping nama). Tiap ucapan menampilkan tanggal dan jam (WIB).
- **PENTING (sekali saja):** jalankan ulang `supabase/schema.sql` di Supabase → SQL Editor agar kolom `photo` pada tabel `wishes` dibuat. Tanpa itu ucapan tetap terkirim, tetapi foto tidak tersimpan.
- HP/tablet: halaman menampilkan 5 ucapan terbaru + tombol "Lihat Semua Ucapan"; daftar lengkap dibuka di lembar layar-penuh yang bisa di-scroll (efek latar dimatikan selama terbuka; tombol Kembali HP menutup lembar). Desktop: kotak scroll biasa.

## v13 — Tema 12 Monokrom (hitam putih, bersih & ringan)
Admin → Tema → "Tema undangan" → **Tema 12 — Monokrom**. Tanpa kupu-kupu, kelopak jatuh, awan, atau burung; animasi hanya teks per huruf, fade, dan geser halus (hanya transform/opacity, ringan di HP).
- **Cover**: foto **atau video** layar penuh (otomatis hitam putih) + judul, nama (huruf muncul satu per satu), tanggal, nama tamu, tombol "Buka Undangan".
- **Setelah dibuka**: sampul naik, lalu halaman **bingkai oval** (aset bunga & garis ganda dari Anda) berisi foto/video, nama, ornamen, tanggal. Bisa diganti bingkai **kotak**.
- **Section lain**: normal, bernuansa hitam putih (kartu acara/gift bergaris tipis + ornamen).
- Isi lewat Admin → **Tema 12 Hitam Putih** (foto/video cover, foto/video bingkai, bentuk bingkai, hitam-putih otomatis). Video: unggah .mp4/.webm, tempel URL .mp4, atau link YouTube.
- File: `public/mono.js`, `public/mono.css`, aset `public/assets/mono/`.

## Update v90/92 — Posisi teks cover Tema 12 & preload semua gambar
- **Admin → Cover → "Posisi teks cover"**: susunan nama (bertingkat / tengah / kiri / kanan / satu baris), posisi naik-turun nama, ukuran nama, posisi teks kecil atas, posisi blok bawah (tanggal, tamu, tombol), dan kekuatan bayangan gelap di atas foto. Pratinjau langsung ikut berubah; tombol **Reset** mengembalikan ke bawaan.
- **Loader memuat SEMUA gambar** (galeri, cerita, mempelai, penutup, latar, bingkai, hiasan Tema 12) + `decode()` sebelum tombol "Buka Undangan" muncul, sehingga tidak ada gambar yang menyusul setelah undangan dibuka. Batas tunggu loader 7 dtk → 15 dtk.
- File berubah: `public/mono.js`, `public/mono.css`, `public/invitation.js`, `public/admin/{admin,schema}.js`, `public/admin/index.html`, `default-config.json`, `lib/index.template.html`.

## Tema 13 — Slide Foto
- Admin → **Tema, Warna & Font → Tema undangan → Tema 13**, lalu isi foto di menu **Tema 13 Slide Foto** (Pengaturan Lanjutan).
- Alur: sampul foto/video → klik Buka → pembuka otomatis (1–2 foto bergantian + teks masuk) → mempelai pria & wanita (satu slide masing-masing, foto dari menu Mempelai) → ayat + hitung mundur → akad & resepsi (foto per-acara di menu Acara, gradasi putih di bawah) → love story, galeri, live, gift, RSVP, ucapan (tampilan Tema 12) → penutup berfoto.
- Teks & foto setiap slide diputar ulang tiap kali slide masuk layar. Urutan bagian di tema ini tetap; bagian yang dimatikan tetap dilewati.

## Tema 13 — v5 (28 Okt 2026)
- **Menu admin mengikuti tema**: menu & kolom khusus Tema 12 hanya tampil bila Tema 12 dipilih, khusus Tema 13 hanya di Tema 13 (begitu juga Tema 1, Tema 2, dan Tema 3–11). Mengganti "Tema undangan" otomatis menyesuaikan menu. Data kolom yang disembunyikan tetap tersimpan. Aturan ada di properti `th` pada `public/admin/schema.js` (`th: 'slide'`, `th: 'mono,slide'`, `th: '!mono,slide'` = semua tema kecuali itu) dan argumen ke-4 item `NAV` di `public/admin/ux.js`.
- **Kolom Tema 13 kini ada di menu bagiannya masing-masing** (Cover, Pembuka, Mempelai, Ayat, Acara, Love Story, Penutup) dan tetap lengkap di menu "Tema 13 Slide Foto". Urutan section di Tema 13 tetap, jadi tombol naik/turun & seret disembunyikan.
- **Font Vivaldi**: pilihan baru di "FONT tulisan tangan Tema 13" (juga di menu Tema, Warna & Font). Vivaldi berlisensi Monotype sehingga tidak disertakan; unggah file font milik sendiri (.ttf/.otf/.woff/.woff2) di kolom **File font Vivaldi**. Tanpa file: dipakai Vivaldi bila terpasang di perangkat tamu, bila tidak Great Vibes. Vivaldi tidak ikut diminta ke Google Fonts (permintaan font tidak gagal).
- **Posisi & ukuran tulisan** (cover, pembuka, mempelai, ayat & hitung mundur, tiap acara, love story, penutup): tarik langsung di pratinjau admin (Shift + roda mouse = besar/kecil) atau pakai penggeser di kolom "POSISI & UKURAN TULISAN". Disimpan di `slide.adj` = `{ "cv.nm": {x, y, s} }`; x/y dalam % lebar layar (satuan `cqw`, sama di semua HP), s = ukuran %. Diterapkan lewat properti CSS `translate` & `scale` sehingga tidak bentrok dengan animasi teks masuk.
- **Pembuka setelah Buka Undangan**: foto bergeser perlahan ke kanan (±18 dtk, mengikuti pengaturan kecepatan) sementara teks masuk per huruf/kata.
- **Perbaikan cover saat baru dibuka (iPhone)**: teks cover tidak lagi memakai blur per huruf (sering gagal digambar Safari iOS), dan sekitar 4,8 dtk setelah animasi mulai semua teks cover dipaksa tampil penuh (kelas `.fin`) bila peramban menjatuhkan sebagian animasi.
- **Tombol ke atas** (pojok kanan bawah, di atas tombol musik) muncul setelah menggulir lebih dari satu layar.
- Upload admin kini menerima file font (`.ttf .otf .woff .woff2`).
- File berubah: `public/slide.js`, `public/slide.css`, `public/invitation.js`, `public/admin/{schema,ux,admin}.js`, `public/admin/admin.css`, `public/admin/index.html`, `api/index.js`, `api/[...path].js`, `default-config.json`, `lib/index.template.html` (`slide.js?v=4`, `slide.css?v=4`, `invitation.js?v=101`).

## Notifikasi toast (terpusat)

- Berkas: `public/toast.js` + `public/toast.css` (dimuat di undangan dan `/admin`). API: `Toast.success(pesan)`, `Toast.error(pesan)`, `Toast.warning(pesan)`, `Toast.info(pesan)` (info tetap tampil sampai `.close()`).
- Salin rekening/alamat memakai atribut `data-copy` + `data-copy-type="rekening|alamat|link"` pada tombol; pesan sukses hanya muncul bila salinan benar-benar berhasil.
- RSVP, ucapan & doa, dan konfirmasi gift: isian kosong → peringatan; sukses/gagal ditampilkan setelah server menjawab.
- Mengubah teks/durasi: ubah di `public/invitation.js` (pemanggil) atau `DURATION` di `public/toast.js`.

## Elegant Animation (Tema 13)

- Pilih di Admin → Animasi & Efek → **Gaya animasi** (`effects.animStyle`: `default` | `elegant`). Gaya lama tidak diubah; tersimpan di konfigurasi dan berlaku setelah muat ulang.
- Berkas: `public/elegant.css` (semua gerak, durasi, urutan — satu tempat) + `public/elegant.js` (indeks baris paragraf & penanda peran). Aktif hanya bila `<html class="h-slide" data-anim-style="elegant">`.
- Urutan: judul/nama (sapuan tulisan tangan ±1,9 dtk) → garis ornamen → isi/paragraf/info → tombol & ikon. Subjudul kapital: jarak huruf melebar + memudar. Paragraf: fade per baris (80 ms). Ayat: fade ±2 dtk. Info penting (hitung mundur, tanggal, jam, tempat, alamat): cepat. `prefers-reduced-motion` dihormati.

## Logo & layar loading bisa digeser (Tema 13)

- Admin → Cover → pilih tampilan **Loading / Logo** di atas pratinjau: layar loading ditahan tampil. Tarik logo/monogram, tulisan di bawah logo, dan bilah loading langsung di pratinjau (Shift + roda = ukuran), atau pakai penggeser di "POSISI & UKURAN LOGO, TULISAN & BILAH LOADING". Kunci: `ld.lg`, `ld.k`, `ld.bar` (disimpan di `slide.adj`, dipakai juga saat tamu membuka undangan).
