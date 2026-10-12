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
