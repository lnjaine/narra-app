-- Narra database schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('listener', 'narrator', 'both');
create type event_status as enum ('scheduled', 'live', 'finished');
create type stream_status as enum ('scheduled', 'live', 'ended');
create type reaction_type as enum ('fire', 'laugh', 'goal', 'boo');

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  email text,
  avatar_url text,
  role user_role default 'listener',
  bio text,
  style text, -- e.g. 'funny', 'technical', 'fan', 'coach'
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Events (matches)
create table events (
  id uuid primary key default uuid_generate_v4(),
  sport text not null default 'football',
  league text not null,
  title text not null,
  home_team text not null,
  away_team text not null,
  start_time timestamptz not null,
  status event_status default 'scheduled',
  external_id text,
  created_at timestamptz default now()
);

create index idx_events_start_time on events (start_time, status);

-- Streams (live narrations)
create table streams (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events on delete cascade not null,
  narrator_id uuid references profiles on delete cascade not null,
  title text not null,
  status stream_status default 'scheduled',
  listener_count int default 0,
  peak_listeners int default 0,
  sync_offset_ms int,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

create index idx_streams_event on streams (event_id, status);
create index idx_streams_narrator on streams (narrator_id, status);

-- Follows
create table follows (
  follower_id uuid references profiles on delete cascade not null,
  narrator_id uuid references profiles on delete cascade not null,
  created_at timestamptz default now(),
  primary key (follower_id, narrator_id)
);

create index idx_follows_narrator on follows (narrator_id);

-- Reactions
create table reactions (
  id uuid primary key default uuid_generate_v4(),
  stream_id uuid references streams on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  type reaction_type not null,
  created_at timestamptz default now()
);

create index idx_reactions_stream on reactions (stream_id, created_at);

-- Row Level Security
alter table profiles enable row level security;
alter table events enable row level security;
alter table streams enable row level security;
alter table follows enable row level security;
alter table reactions enable row level security;

-- Profiles: anyone can read, users can update their own
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Events: anyone can read
create policy "Events are viewable by everyone" on events for select using (true);

-- Streams: anyone can read, narrators can insert/update their own
create policy "Streams are viewable by everyone" on streams for select using (true);
create policy "Narrators can create streams" on streams for insert with check (auth.uid() = narrator_id);
create policy "Narrators can update own streams" on streams for update using (auth.uid() = narrator_id);

-- Follows: anyone can read, users can manage their own
create policy "Follows are viewable by everyone" on follows for select using (true);
create policy "Users can follow" on follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows for delete using (auth.uid() = follower_id);

-- Reactions: anyone can read, authenticated users can insert
create policy "Reactions are viewable by everyone" on reactions for select using (true);
create policy "Authenticated users can react" on reactions for insert with check (auth.uid() = user_id);

-- Seed data: upcoming Brasileirao matches
insert into events (sport, league, title, home_team, away_team, start_time, status) values
  ('football', 'Brasileirão 2026', 'Flamengo vs Fluminense', 'Flamengo', 'Fluminense', '2026-03-21 20:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'Corinthians vs Palmeiras', 'Corinthians', 'Palmeiras', '2026-03-22 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'São Paulo vs Santos', 'São Paulo', 'Santos', '2026-03-22 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'Grêmio vs Internacional', 'Grêmio', 'Internacional', '2026-03-23 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'Botafogo vs Vasco', 'Botafogo', 'Vasco', '2026-03-23 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'Atletico-MG vs Cruzeiro', 'Atletico-MG', 'Cruzeiro', '2026-03-28 21:00:00-03', 'scheduled'),
  ('football', 'Copa do Brasil 2026', 'Flamengo vs Athletico-PR', 'Flamengo', 'Athletico-PR', '2026-03-30 19:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026', 'Palmeiras vs Flamengo', 'Palmeiras', 'Flamengo', '2026-04-05 21:00:00-03', 'scheduled');
