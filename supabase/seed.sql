insert into public.clubs (name, short_name, city, budget, reputation)
values
  ('Overr City', 'OVR', 'Warsaw', 85000000, 82),
  ('Northside Rovers', 'NSR', 'Gdansk', 62000000, 74),
  ('Vistula United', 'VIS', 'Krakow', 71000000, 78),
  ('Silesia Kings', 'SLK', 'Katowice', 54000000, 69)
on conflict (name) do nothing;

insert into public.players (club_id, first_name, last_name, position, age, overall, value, wage)
select c.id, p.first_name, p.last_name, p.position, p.age, p.overall, p.value, p.wage
from (
  values
    ('OVR', 'Maks', 'Nowak', 'ST', 24, 84, 42000000, 120000),
    ('OVR', 'Igor', 'Kowal', 'CM', 27, 81, 31000000, 95000),
    ('NSR', 'Adam', 'Lis', 'GK', 29, 79, 18000000, 70000),
    ('NSR', 'Leon', 'Wrona', 'RW', 22, 77, 24000000, 65000),
    ('VIS', 'Tomasz', 'Mazur', 'CB', 26, 80, 26000000, 82000),
    ('VIS', 'Kamil', 'Zielinski', 'CAM', 23, 82, 36000000, 105000),
    ('SLK', 'Piotr', 'Urban', 'LB', 25, 75, 14000000, 52000),
    ('SLK', 'Filip', 'Grabowski', 'CDM', 28, 76, 15000000, 58000)
) as p(short_name, first_name, last_name, position, age, overall, value, wage)
join public.clubs c on c.short_name = p.short_name
where not exists (
  select 1
  from public.players existing
  where existing.first_name = p.first_name
    and existing.last_name = p.last_name
);

insert into public.matches (home_club_id, away_club_id, scheduled_at, home_score, away_score, status)
select home.id, away.id, m.scheduled_at::timestamptz, m.home_score, m.away_score, m.status::public.match_status
from (
  values
    ('OVR', 'NSR', '2026-08-15 18:00:00+00', null, null, 'scheduled'),
    ('VIS', 'SLK', '2026-08-15 20:00:00+00', null, null, 'scheduled'),
    ('OVR', 'VIS', '2026-08-22 18:00:00+00', 2, 1, 'played')
) as m(home_short, away_short, scheduled_at, home_score, away_score, status)
join public.clubs home on home.short_name = m.home_short
join public.clubs away on away.short_name = m.away_short
where not exists (
  select 1
  from public.matches existing
  where existing.home_club_id = home.id
    and existing.away_club_id = away.id
    and existing.scheduled_at = m.scheduled_at::timestamptz
);

insert into public.transfers (player_id, from_club_id, to_club_id, fee, status)
select p.id, from_club.id, to_club.id, 28000000, 'rumor'::public.transfer_status
from public.players p
join public.clubs from_club on from_club.short_name = 'VIS'
join public.clubs to_club on to_club.short_name = 'OVR'
where p.first_name = 'Kamil'
  and p.last_name = 'Zielinski'
  and not exists (
    select 1
    from public.transfers t
    where t.player_id = p.id
      and t.to_club_id = to_club.id
  );
