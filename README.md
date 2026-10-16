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
