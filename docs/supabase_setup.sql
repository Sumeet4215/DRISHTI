-- ============================================================
-- DRISHTI / Supabase Database Setup & RLS Policy Schema
-- ============================================================

-- 1. Create the notes table
create table if not exists public.notes (
  id bigint primary key generated always as identity,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Insert sample data
insert into public.notes (title)
values
  ('Today I created a Supabase project.'),
  ('I added some data and queried it from Next.js.'),
  ('It was awesome!');

-- 3. Enable Row Level Security (RLS)
alter table public.notes enable row level security;

-- 4. Add RLS policy to make notes publicly readable for anonymous users
create policy "public can read notes"
  on public.notes
  for select to anon
  using (true);
