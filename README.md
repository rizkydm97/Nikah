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
