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

-- Seed data: real Brasileirão 2026 matches

-- Rodada 8 (March 21-22, 2026)
insert into events (sport, league, title, home_team, away_team, start_time, status) values
  ('football', 'Brasileirão 2026 - Rodada 8', 'RB Bragantino vs Botafogo', 'RB Bragantino', 'Botafogo', '2026-03-21 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Fluminense vs Atlético-MG', 'Fluminense', 'Atlético-MG', '2026-03-21 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'São Paulo vs Palmeiras', 'São Paulo', 'Palmeiras', '2026-03-21 21:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Cruzeiro vs Santos', 'Cruzeiro', 'Santos', '2026-03-22 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Vasco vs Grêmio', 'Vasco', 'Grêmio', '2026-03-22 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Athletico-PR vs Coritiba', 'Athletico-PR', 'Coritiba', '2026-03-22 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Remo vs Bahia', 'Remo', 'Bahia', '2026-03-22 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Vitória vs Mirassol', 'Vitória', 'Mirassol', '2026-03-22 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Internacional vs Chapecoense', 'Internacional', 'Chapecoense', '2026-03-22 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 8', 'Corinthians vs Flamengo', 'Corinthians', 'Flamengo', '2026-03-22 20:30:00-03', 'scheduled'),

-- Rodada 9 (April 1-2, 2026)
  ('football', 'Brasileirão 2026 - Rodada 9', 'Botafogo vs Mirassol', 'Botafogo', 'Mirassol', '2026-04-01 19:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Internacional vs São Paulo', 'Internacional', 'São Paulo', '2026-04-01 19:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Cruzeiro vs Vitória', 'Cruzeiro', 'Vitória', '2026-04-01 20:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Bahia vs Athletico-PR', 'Bahia', 'Athletico-PR', '2026-04-01 20:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Coritiba vs Vasco', 'Coritiba', 'Vasco', '2026-04-01 20:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Fluminense vs Corinthians', 'Fluminense', 'Corinthians', '2026-04-01 21:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Santos vs Remo', 'Santos', 'Remo', '2026-04-02 19:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Chapecoense vs Atlético-MG', 'Chapecoense', 'Atlético-MG', '2026-04-02 19:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'Palmeiras vs Grêmio', 'Palmeiras', 'Grêmio', '2026-04-02 21:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 9', 'RB Bragantino vs Flamengo', 'RB Bragantino', 'Flamengo', '2026-04-02 21:30:00-03', 'scheduled'),

-- Rodada 10 (April 4-5, 2026)
  ('football', 'Brasileirão 2026 - Rodada 10', 'São Paulo vs Cruzeiro', 'São Paulo', 'Cruzeiro', '2026-04-04 18:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Coritiba vs Fluminense', 'Coritiba', 'Fluminense', '2026-04-04 20:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Vasco vs Botafogo', 'Vasco', 'Botafogo', '2026-04-04 21:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Chapecoense vs Vitória', 'Chapecoense', 'Vitória', '2026-04-05 16:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Flamengo vs Santos', 'Flamengo', 'Santos', '2026-04-05 17:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Atlético-MG vs Athletico-PR', 'Atlético-MG', 'Athletico-PR', '2026-04-05 17:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Corinthians vs Internacional', 'Corinthians', 'Internacional', '2026-04-05 19:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Bahia vs Palmeiras', 'Bahia', 'Palmeiras', '2026-04-05 19:30:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Mirassol vs RB Bragantino', 'Mirassol', 'RB Bragantino', '2026-04-05 20:00:00-03', 'scheduled'),
  ('football', 'Brasileirão 2026 - Rodada 10', 'Grêmio vs Remo', 'Grêmio', 'Remo', '2026-04-05 20:30:00-03', 'scheduled');
