alter table public.clubs
add column if not exists formation text not null default '4-4-2',
add column if not exists last_lineup_saved_at timestamptz;

alter table public.players
add column if not exists fitness integer not null default 100 check (fitness between 0 and 100),
add column if not exists suspended_until_round integer,
add column if not exists injured_until timestamptz;

alter table public.lineups
add column if not exists role text not null default 'starter',
add column if not exists position_slot text;

alter table public.lineups
drop constraint if exists lineups_slot_check;

alter table public.lineups
add constraint lineups_slot_check check (slot between 1 and 16);

alter table public.lineups
drop constraint if exists lineups_role_check;

alter table public.lineups
add constraint lineups_role_check check (role in ('starter', 'bench'));

create table if not exists public.news_feed (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete set null,
  match_id uuid references public.matches(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists news_feed_created_at_idx on public.news_feed(created_at desc);
create index if not exists news_feed_club_id_idx on public.news_feed(club_id);

grant select on public.news_feed to anon, authenticated;
grant insert, update, delete on public.news_feed to authenticated;

alter table public.news_feed enable row level security;

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

update public.players
set fitness = 100
where fitness is null;
