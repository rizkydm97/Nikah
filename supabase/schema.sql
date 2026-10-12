-- Jalankan sekali di Supabase → SQL Editor → New query → Run

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvp (
  id text primary key,
  name text not null,
  status text not null check (status in ('hadir','tidak','ragu')),
  count int not null default 0,
  ts bigint not null
);

create table if not exists public.wishes (
  id text primary key,
  name text not null,
  message text not null,
  ts bigint not null
);

create table if not exists public.gifts (
  id text primary key,
  name text not null,
  bank text not null default '',
  amount text not null default '',
  message text not null default '',
  proof text not null default '',
  ts bigint not null
);

create index if not exists wishes_ts_idx on public.wishes (ts desc);
create index if not exists rsvp_ts_idx on public.rsvp (ts desc);
create index if not exists gifts_ts_idx on public.gifts (ts desc);

-- Semua tabel hanya diakses lewat server (service role). RLS aktif tanpa policy = anon/publik tidak bisa baca/tulis langsung.
alter table public.settings enable row level security;
alter table public.rsvp     enable row level security;
alter table public.wishes   enable row level security;
alter table public.gifts    enable row level security;

-- Bucket storage publik untuk foto/musik/bukti transfer (maks 30MB per file)
insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', true, 31457280)
on conflict (id) do update set public = true, file_size_limit = 31457280;
