create extension if not exists "pgcrypto";

do $$
begin
  create type public.profile_role as enum ('admin', 'manager');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.match_status as enum ('scheduled', 'played', 'postponed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.transfer_status as enum ('rumor', 'pending', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.profile_role not null default 'manager',
  created_at timestamptz not null default now()
);

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null unique,
  short_name text not null unique,
  city text,
  budget numeric(14, 2) not null default 0,
  reputation integer not null default 50 check (reputation between 1 and 100),
  league_points integer not null default 0,
  wins integer not null default 0,
  draws integer not null default 0,
  losses integer not null default 0,
  goals_for integer not null default 0,
  goals_against integer not null default 0,
  formation_attack integer not null default 0,
  formation_defense integer not null default 0,
  formation text not null default '4-4-2',
  last_lineup_saved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  first_name text not null,
  last_name text not null,
  position text not null,
  nominal_position text,
  nationality text not null default 'INT',
  age integer not null check (age between 15 and 50),
  overall integer not null check (overall between 1 and 99),
  pac integer not null default 60 check (pac between 1 and 99),
  sho integer not null default 60 check (sho between 1 and 99),
  pas integer not null default 60 check (pas between 1 and 99),
  dri integer not null default 60 check (dri between 1 and 99),
  def integer not null default 60 check (def between 1 and 99),
  phy integer not null default 60 check (phy between 1 and 99),
  div integer not null default 60 check (div between 1 and 99),
  han integer not null default 60 check (han between 1 and 99),
  kic integer not null default 60 check (kic between 1 and 99),
  ref integer not null default 60 check (ref between 1 and 99),
  spd integer not null default 60 check (spd between 1 and 99),
  pos integer not null default 60 check (pos between 1 and 99),
  attack_rating integer not null default 50,
  defense_rating integer not null default 50,
  fitness integer not null default 100 check (fitness between 0 and 100),
  suspended_until_round integer,
  injured_until timestamptz,
  value numeric(14, 2) not null default 0,
  price numeric(14, 2) not null default 0,
  wage numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  home_club_id uuid not null references public.clubs(id) on delete cascade,
  away_club_id uuid not null references public.clubs(id) on delete cascade,
  scheduled_at timestamptz not null,
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  status public.match_status not null default 'scheduled',
  round_number integer not null default 1,
  report text,
  created_at timestamptz not null default now(),
  constraint matches_different_clubs check (home_club_id <> away_club_id)
);

create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  from_club_id uuid references public.clubs(id) on delete set null,
  to_club_id uuid references public.clubs(id) on delete set null,
  fee numeric(14, 2) not null default 0,
  status public.transfer_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint transfers_club_change check (
    from_club_id is null or to_club_id is null or from_club_id <> to_club_id
  )
);

create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  slot integer not null check (slot between 1 and 16),
  role text not null default 'starter' check (role in ('starter', 'bench')),
  position_slot text,
  created_at timestamptz not null default now(),
  unique (club_id, slot),
  unique (club_id, player_id)
);

create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.league_state (
  id integer primary key default 1 check (id = 1),
  current_round integer not null default 1,
  updated_at timestamptz not null default now()
);

insert into public.league_state (id, current_round)
values (1, 1)
on conflict (id) do nothing;

create index if not exists clubs_owner_id_idx on public.clubs(owner_id);
create unique index if not exists clubs_owner_id_unique_idx
on public.clubs(owner_id)
where owner_id is not null;
create index if not exists players_club_id_idx on public.players(club_id);
create index if not exists matches_scheduled_at_idx on public.matches(scheduled_at);
create index if not exists transfers_player_id_idx on public.transfers(player_id);
create index if not exists lineups_club_id_idx on public.lineups(club_id);
create index if not exists lineups_player_id_idx on public.lineups(player_id);
create index if not exists matches_round_number_idx on public.matches(round_number);
create index if not exists players_club_id_price_idx on public.players(club_id, price);
create index if not exists news_feed_created_at_idx on public.news_feed(created_at desc);
create index if not exists news_feed_club_id_idx on public.news_feed(club_id);

grant usage on schema public to anon, authenticated;
grant select on public.clubs to anon;
grant select on public.players to anon;
grant select on public.matches to anon;
grant select on public.profiles to authenticated;
grant select, update on public.clubs to authenticated;
grant select on public.players to authenticated;
grant select on public.matches to authenticated;
grant select on public.transfers to authenticated;
grant select on public.lineups to anon, authenticated;
grant select on public.league_state to anon, authenticated;
grant select on public.news_feed to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.clubs to authenticated;
grant insert, update, delete on public.players to authenticated;
grant insert, update, delete on public.matches to authenticated;
grant insert, update, delete on public.transfers to authenticated;
grant insert, update, delete on public.lineups to authenticated;
grant update on public.league_state to authenticated;
grant insert, update, delete on public.news_feed to authenticated;

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.transfers enable row level security;
alter table public.lineups enable row level security;
alter table public.league_state enable row level security;
alter table public.news_feed enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'manager'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read clubs" on public.clubs;
create policy "Authenticated users can read clubs"
on public.clubs for select
to authenticated
using (true);

drop policy if exists "Anonymous users can read clubs for status" on public.clubs;
create policy "Anonymous users can read clubs for status"
on public.clubs for select
to anon
using (true);

drop policy if exists "Club owners can update their club" on public.clubs;
create policy "Club owners can update their club"
on public.clubs for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Authenticated users can create their club" on public.clubs;
create policy "Authenticated users can create their club"
on public.clubs for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists "Admins can manage clubs" on public.clubs;
create policy "Admins can manage clubs"
on public.clubs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read players" on public.players;
create policy "Authenticated users can read players"
on public.players for select
to authenticated
using (true);

drop policy if exists "Anonymous users can read players for dashboard" on public.players;
create policy "Anonymous users can read players for dashboard"
on public.players for select
to anon
using (true);

drop policy if exists "Club owners can create players for their club" on public.players;
create policy "Club owners can create players for their club"
on public.players for insert
to authenticated
with check (
  exists (
    select 1
    from public.clubs
    where clubs.id = players.club_id
      and clubs.owner_id = auth.uid()
  )
);

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

drop policy if exists "Admins can manage players" on public.players;
create policy "Admins can manage players"
on public.players for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read matches" on public.matches;
create policy "Authenticated users can read matches"
on public.matches for select
to authenticated
using (true);

drop policy if exists "Anonymous users can read matches for dashboard" on public.matches;
create policy "Anonymous users can read matches for dashboard"
on public.matches for select
to anon
using (true);

drop policy if exists "Admins can manage matches" on public.matches;
create policy "Admins can manage matches"
on public.matches for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read transfers" on public.transfers;
create policy "Authenticated users can read transfers"
on public.transfers for select
to authenticated
using (true);

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

drop policy if exists "Admins can manage transfers" on public.transfers;
create policy "Admins can manage transfers"
on public.transfers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

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

drop policy if exists "Anyone can read news feed" on public.news_feed;
create policy "Anyone can read news feed"
on public.news_feed for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can add league news" on public.news_feed;
create policy "Authenticated users can add league news"
on public.news_feed for insert
to authenticated
with check (true);

drop policy if exists "Admins can manage news feed" on public.news_feed;
create policy "Admins can manage news feed"
on public.news_feed for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
