create extension if not exists pgcrypto;

create table if not exists public.tic_tac_toe_profiles (
  id text primary key,
  nickname text not null,
  mascot text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tic_tac_toe_games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by_profile_id text not null references public.tic_tac_toe_profiles (id) on delete cascade,
  current_turn_player text not null check (current_turn_player in ('X', 'O')),
  active_board_index integer check (active_board_index between 0 and 8),
  state jsonb not null default '{}'::jsonb,
  winner text check (winner in ('X', 'O', 'draw')),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'closed')),
  rematch_status text check (rematch_status in ('pending', 'accepted', 'declined')),
  rematch_requested_by_profile_id text references public.tic_tac_toe_profiles (id) on delete set null,
  last_move_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tic_tac_toe_game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.tic_tac_toe_games (id) on delete cascade,
  profile_id text not null references public.tic_tac_toe_profiles (id) on delete cascade,
  nickname text not null,
  mascot text not null,
  seat text not null check (seat in ('X', 'O')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (game_id, seat),
  unique (game_id, profile_id)
);

create index if not exists tic_tac_toe_games_status_idx
  on public.tic_tac_toe_games (status, created_at desc);

create index if not exists tic_tac_toe_games_code_idx
  on public.tic_tac_toe_games (code);

create index if not exists tic_tac_toe_game_players_game_id_idx
  on public.tic_tac_toe_game_players (game_id);

create or replace function public.tic_tac_toe_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists tic_tac_toe_profiles_set_updated_at on public.tic_tac_toe_profiles;
create trigger tic_tac_toe_profiles_set_updated_at
before update on public.tic_tac_toe_profiles
for each row
execute function public.tic_tac_toe_set_updated_at();

drop trigger if exists tic_tac_toe_games_set_updated_at on public.tic_tac_toe_games;
create trigger tic_tac_toe_games_set_updated_at
before update on public.tic_tac_toe_games
for each row
execute function public.tic_tac_toe_set_updated_at();

alter table public.tic_tac_toe_profiles enable row level security;
alter table public.tic_tac_toe_games enable row level security;
alter table public.tic_tac_toe_game_players enable row level security;

drop policy if exists "tic_tac_toe_profiles_public_access" on public.tic_tac_toe_profiles;
create policy "tic_tac_toe_profiles_public_access"
on public.tic_tac_toe_profiles
for all
using (true)
with check (true);

drop policy if exists "tic_tac_toe_games_public_access" on public.tic_tac_toe_games;
create policy "tic_tac_toe_games_public_access"
on public.tic_tac_toe_games
for all
using (true)
with check (true);

drop policy if exists "tic_tac_toe_game_players_public_access" on public.tic_tac_toe_game_players;
create policy "tic_tac_toe_game_players_public_access"
on public.tic_tac_toe_game_players
for all
using (true)
with check (true);

comment on policy "tic_tac_toe_profiles_public_access" on public.tic_tac_toe_profiles is
'Temporary public policy for mock-signin development. Tighten this when Google auth is added.';

comment on policy "tic_tac_toe_games_public_access" on public.tic_tac_toe_games is
'Temporary public policy for mock-signin development. Tighten this when Google auth is added.';

comment on policy "tic_tac_toe_game_players_public_access" on public.tic_tac_toe_game_players is
'Temporary public policy for mock-signin development. Tighten this when Google auth is added.';
