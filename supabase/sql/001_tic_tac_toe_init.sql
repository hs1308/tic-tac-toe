create extension if not exists pgcrypto;

create table if not exists public.tic_tac_toe_games (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('same_device', 'online')),
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished', 'abandoned')),
  ruleset_version text not null default 'v1',
  host_user_id uuid references auth.users (id) on delete set null,
  current_turn_player text check (current_turn_player in ('X', 'O')),
  state jsonb not null default '{}'::jsonb,
  winner text check (winner in ('X', 'O', 'draw')),
  last_move_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tic_tac_toe_game_players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.tic_tac_toe_games (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  seat text not null check (seat in ('X', 'O')),
  display_name text,
  joined_at timestamptz not null default timezone('utc', now()),
  unique (game_id, seat),
  unique (game_id, user_id)
);

create index if not exists tic_tac_toe_games_status_idx
  on public.tic_tac_toe_games (status, created_at desc);

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

drop trigger if exists tic_tac_toe_games_set_updated_at on public.tic_tac_toe_games;

create trigger tic_tac_toe_games_set_updated_at
before update on public.tic_tac_toe_games
for each row
execute function public.tic_tac_toe_set_updated_at();

alter table public.tic_tac_toe_games enable row level security;
alter table public.tic_tac_toe_game_players enable row level security;

drop policy if exists "tic_tac_toe_games_select_for_players" on public.tic_tac_toe_games;
create policy "tic_tac_toe_games_select_for_players"
on public.tic_tac_toe_games
for select
using (
  auth.uid() = host_user_id
  or exists (
    select 1
    from public.tic_tac_toe_game_players players
    where players.game_id = tic_tac_toe_games.id
      and players.user_id = auth.uid()
  )
);

drop policy if exists "tic_tac_toe_games_insert_for_authenticated" on public.tic_tac_toe_games;
create policy "tic_tac_toe_games_insert_for_authenticated"
on public.tic_tac_toe_games
for insert
with check (auth.uid() = host_user_id);

drop policy if exists "tic_tac_toe_games_update_for_players" on public.tic_tac_toe_games;
create policy "tic_tac_toe_games_update_for_players"
on public.tic_tac_toe_games
for update
using (
  auth.uid() = host_user_id
  or exists (
    select 1
    from public.tic_tac_toe_game_players players
    where players.game_id = tic_tac_toe_games.id
      and players.user_id = auth.uid()
  )
)
with check (
  auth.uid() = host_user_id
  or exists (
    select 1
    from public.tic_tac_toe_game_players players
    where players.game_id = tic_tac_toe_games.id
      and players.user_id = auth.uid()
  )
);

drop policy if exists "tic_tac_toe_game_players_select_own_games" on public.tic_tac_toe_game_players;
create policy "tic_tac_toe_game_players_select_own_games"
on public.tic_tac_toe_game_players
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.tic_tac_toe_games games
    where games.id = tic_tac_toe_game_players.game_id
      and games.host_user_id = auth.uid()
  )
);

drop policy if exists "tic_tac_toe_game_players_insert_own_membership" on public.tic_tac_toe_game_players;
create policy "tic_tac_toe_game_players_insert_own_membership"
on public.tic_tac_toe_game_players
for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1
    from public.tic_tac_toe_games games
    where games.id = tic_tac_toe_game_players.game_id
      and games.host_user_id = auth.uid()
  )
);
