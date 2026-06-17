alter table public.clubs
add column if not exists league_points integer not null default 0,
add column if not exists wins integer not null default 0,
add column if not exists draws integer not null default 0,
add column if not exists losses integer not null default 0,
add column if not exists goals_for integer not null default 0,
add column if not exists goals_against integer not null default 0,
add column if not exists formation_attack integer not null default 0,
add column if not exists formation_defense integer not null default 0;

alter table public.players
add column if not exists attack_rating integer not null default 50,
add column if not exists defense_rating integer not null default 50,
add column if not exists price numeric(14, 2) not null default 0;

update public.players
set
  attack_rating = case
    when position in ('ST', 'RW', 'LW', 'CAM', 'NAP') then greatest(overall - 2, 1)
    when position in ('CM', 'CDM', 'POM') then greatest(overall - 8, 1)
    when position in ('CB', 'RB', 'LB', 'OBR') then greatest(overall - 18, 1)
    when position in ('GK', 'BR') then greatest(overall - 30, 1)
    else greatest(overall - 10, 1)
  end,
  defense_rating = case
    when position in ('GK', 'BR') then greatest(overall + 4, 1)
    when position in ('CB', 'RB', 'LB', 'OBR') then greatest(overall - 1, 1)
    when position in ('CM', 'CDM', 'POM') then greatest(overall - 8, 1)
    when position in ('ST', 'RW', 'LW', 'CAM', 'NAP') then greatest(overall - 25, 1)
    else greatest(overall - 10, 1)
  end,
  price = case
    when price = 0 then value
    else price
  end;

alter table public.matches
add column if not exists round_number integer not null default 1,
add column if not exists report text;

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  slot integer not null check (slot between 1 and 11),
  created_at timestamptz not null default now(),
  unique (club_id, slot),
  unique (club_id, player_id)
);

create table if not exists public.league_state (
  id integer primary key default 1 check (id = 1),
  current_round integer not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.league_state (id, current_round)
values (1, 1)
on conflict (id) do nothing;

create index if not exists lineups_club_id_idx on public.lineups(club_id);
create index if not exists lineups_player_id_idx on public.lineups(player_id);
create index if not exists matches_round_number_idx on public.matches(round_number);
create index if not exists players_club_id_price_idx on public.players(club_id, price);

grant select on public.lineups to anon, authenticated;
grant insert, update, delete on public.lineups to authenticated;
grant select on public.league_state to anon, authenticated;
grant update on public.league_state to authenticated;
grant update on public.players to authenticated;
grant insert on public.transfers to authenticated;

alter table public.lineups enable row level security;
alter table public.league_state enable row level security;

drop policy if exists "Anyone can read lineups" on public.lineups;
create policy "Anyone can read lineups"
on public.lineups for select
to anon, authenticated
using (true);

drop policy if exists "Club owners can manage their lineup" on public.lineups;
create policy "Club owners can manage their lineup"
on public.lineups for all
to authenticated
using (
  exists (
    select 1
    from public.clubs
    where clubs.id = lineups.club_id
      and clubs.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clubs
    join public.players on players.id = lineups.player_id
    where clubs.id = lineups.club_id
      and clubs.owner_id = auth.uid()
      and players.club_id = clubs.id
  )
);

drop policy if exists "Anyone can read league state" on public.league_state;
create policy "Anyone can read league state"
on public.league_state for select
to anon, authenticated
using (true);

drop policy if exists "Admins can update league state" on public.league_state;
create policy "Admins can update league state"
on public.league_state for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Club owners can buy free agents" on public.players;
create policy "Club owners can buy free agents"
on public.players for update
to authenticated
using (club_id is null)
with check (
  exists (
    select 1
    from public.clubs
    where clubs.id = players.club_id
      and clubs.owner_id = auth.uid()
  )
);

drop policy if exists "Club owners can record incoming transfers" on public.transfers;
create policy "Club owners can record incoming transfers"
on public.transfers for insert
to authenticated
with check (
  exists (
    select 1
    from public.clubs
    where clubs.id = transfers.to_club_id
      and clubs.owner_id = auth.uid()
  )
);
