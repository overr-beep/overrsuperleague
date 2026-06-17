insert into public.clubs (name, short_name, city, budget, reputation)
values
  ('Overr City', 'OVR', 'Warsaw', 85000000, 82),
  ('Northside Rovers', 'NSR', 'Gdansk', 62000000, 74),
  ('Vistula United', 'VIS', 'Krakow', 71000000, 78),
  ('Silesia Kings', 'SLK', 'Katowice', 54000000, 69),
  ('Baltic Wolves', 'BTW', 'Gdynia', 48000000, 66),
  ('Capital Athletic', 'CPA', 'Warsaw', 76000000, 80),
  ('Poznan Engineers', 'PEN', 'Poznan', 59000000, 72),
  ('Lodz Factory FC', 'LFF', 'Lodz', 43000000, 64),
  ('Wroclaw Spartans', 'WSP', 'Wroclaw', 67000000, 76),
  ('Lublin Foxes', 'LFX', 'Lublin', 39000000, 61)
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
    ('SLK', 'Filip', 'Grabowski', 'CDM', 28, 76, 15000000, 58000),
    ('BTW', 'Jan', 'Sokol', 'GK', 31, 77, 12000000, 54000),
    ('BTW', 'Oskar', 'Wilk', 'CB', 24, 74, 9000000, 42000),
    ('BTW', 'Patryk', 'Cichy', 'LW', 21, 76, 18000000, 56000),
    ('CPA', 'Mateusz', 'Adamski', 'ST', 26, 83, 39000000, 112000),
    ('CPA', 'Robert', 'Malinowski', 'CM', 30, 80, 21000000, 88000),
    ('CPA', 'Daniel', 'Szymczak', 'RB', 23, 78, 19000000, 69000),
    ('PEN', 'Bartosz', 'Maj', 'CDM', 27, 79, 22000000, 74000),
    ('PEN', 'Dawid', 'Rutkowski', 'RW', 22, 78, 23000000, 71000),
    ('PEN', 'Mikolaj', 'Stepien', 'CB', 25, 76, 15000000, 59000),
    ('LFF', 'Karol', 'Pawlak', 'GK', 28, 73, 7000000, 36000),
    ('LFF', 'Sebastian', 'Baran', 'ST', 24, 75, 13000000, 50000),
    ('LFF', 'Wiktor', 'Krupa', 'CM', 20, 72, 9000000, 31000),
    ('WSP', 'Hubert', 'Kaczmarek', 'CAM', 25, 81, 30000000, 96000),
    ('WSP', 'Marcin', 'Czerwinski', 'LB', 29, 77, 13000000, 62000),
    ('WSP', 'Norbert', 'Sawicki', 'ST', 22, 79, 27000000, 82000),
    ('LFX', 'Alan', 'Borkowski', 'CB', 26, 72, 8000000, 34000),
    ('LFX', 'Eryk', 'Duda', 'RW', 21, 73, 11000000, 39000),
    ('LFX', 'Szymon', 'Kubiak', 'CM', 24, 74, 10000000, 41000)
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
    ('OVR', 'VIS', '2026-08-22 18:00:00+00', 2, 1, 'played'),
    ('BTW', 'CPA', '2026-08-16 17:30:00+00', null, null, 'scheduled'),
    ('PEN', 'LFF', '2026-08-16 19:30:00+00', null, null, 'scheduled'),
    ('WSP', 'LFX', '2026-08-17 18:00:00+00', null, null, 'scheduled'),
    ('CPA', 'OVR', '2026-08-23 18:00:00+00', null, null, 'scheduled'),
    ('NSR', 'WSP', '2026-08-23 20:00:00+00', null, null, 'scheduled'),
    ('SLK', 'BTW', '2026-08-24 18:00:00+00', 1, 1, 'played')
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

insert into public.transfers (player_id, from_club_id, to_club_id, fee, status)
select p.id, from_club.id, to_club.id, t.fee, t.status::public.transfer_status
from (
  values
    ('Patryk', 'Cichy', 'BTW', 'PEN', 17500000, 'pending'),
    ('Hubert', 'Kaczmarek', 'WSP', 'CPA', 32000000, 'rumor'),
    ('Sebastian', 'Baran', 'LFF', 'SLK', 14500000, 'completed')
) as t(first_name, last_name, from_short, to_short, fee, status)
join public.players p on p.first_name = t.first_name and p.last_name = t.last_name
join public.clubs from_club on from_club.short_name = t.from_short
join public.clubs to_club on to_club.short_name = t.to_short
where not exists (
  select 1
  from public.transfers existing
  where existing.player_id = p.id
    and existing.to_club_id = to_club.id
    and existing.status = t.status::public.transfer_status
);
