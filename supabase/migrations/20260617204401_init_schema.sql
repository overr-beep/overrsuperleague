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
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  first_name text not null,
  last_name text not null,
  position text not null,
  age integer not null check (age between 15 and 50),
  overall integer not null check (overall between 1 and 99),
  value numeric(14, 2) not null default 0,
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

create index if not exists clubs_owner_id_idx on public.clubs(owner_id);
create index if not exists players_club_id_idx on public.players(club_id);
create index if not exists matches_scheduled_at_idx on public.matches(scheduled_at);
create index if not exists transfers_player_id_idx on public.transfers(player_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, update on public.clubs to authenticated;
grant select on public.players to authenticated;
grant select on public.matches to authenticated;
grant select on public.transfers to authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant insert, update, delete on public.clubs to authenticated;
grant insert, update, delete on public.players to authenticated;
grant insert, update, delete on public.matches to authenticated;
grant insert, update, delete on public.transfers to authenticated;

alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.transfers enable row level security;

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

drop policy if exists "Club owners can update their club" on public.clubs;
create policy "Club owners can update their club"
on public.clubs for update
to authenticated
using (owner_id = auth.uid())
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

drop policy if exists "Admins can manage transfers" on public.transfers;
create policy "Admins can manage transfers"
on public.transfers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
