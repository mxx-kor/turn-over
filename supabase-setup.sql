-- Run this SQL in your Supabase SQL Editor

-- Create folders table
create table public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- If you have already created the table previously, run this command:
-- ALTER TABLE public.folders ADD COLUMN description text;

-- Create cards table
create table public.cards (
  id uuid default gen_random_uuid() primary key,
  folder_id uuid references public.folders on delete cascade not null,
  front text not null,
  back text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.folders enable row level security;
alter table public.cards enable row level security;

-- Policies for folders
create policy "Users can view their own folders."
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders."
  on folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders."
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders."
  on folders for delete
  using ( auth.uid() = user_id );

-- Policies for cards (checking folder ownership through a join or assumption if RLS is strict)
-- A simpler approach is to check if the card's folder belongs to the user
create policy "Users can view cards in their folders."
  on cards for select
  using (
    folder_id in (select id from folders where user_id = auth.uid())
  );

create policy "Users can insert cards in their folders."
  on cards for insert
  with check (
    folder_id in (select id from folders where user_id = auth.uid())
  );

create policy "Users can update cards in their folders."
  on cards for update
  using (
    folder_id in (select id from folders where user_id = auth.uid())
  );

create policy "Users can delete cards in their folders."
  on cards for delete
  using (
    folder_id in (select id from folders where user_id = auth.uid())
  );
