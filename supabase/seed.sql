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
    ('LFX', 'Szymon', 'Kubiak', 'CM', 24, 74, 10000000, 41000),
    ('OVR', 'Lorenzo', 'Ricci', 'CB', 28, 79, 24000000, 83000),
    ('OVR', 'Noah', 'Adebayo', 'LW', 21, 80, 34000000, 91000),
    ('OVR', 'Santiago', 'Molina', 'RB', 25, 77, 17000000, 64000),
    ('OVR', 'Felix', 'Berg', 'CDM', 26, 78, 21000000, 72000),
    ('NSR', 'Hugo', 'Martins', 'ST', 24, 78, 26000000, 76000),
    ('NSR', 'Elias', 'Vogel', 'CM', 22, 76, 18000000, 56000),
    ('NSR', 'Moussa', 'Traore', 'CB', 27, 75, 13000000, 50000),
    ('NSR', 'Keita', 'Nakamura', 'CAM', 20, 74, 16000000, 43000),
    ('VIS', 'Alejandro', 'Ruiz', 'ST', 27, 81, 35000000, 101000),
    ('VIS', 'Mika', 'Virtanen', 'GK', 25, 76, 11000000, 52000),
    ('VIS', 'Omar', 'Haddad', 'LB', 23, 75, 14000000, 48000),
    ('VIS', 'Thiago', 'Pereira', 'RW', 22, 79, 28000000, 79000),
    ('SLK', 'Dante', 'Coleman', 'ST', 26, 77, 19000000, 62000),
    ('SLK', 'Andrei', 'Popescu', 'CB', 29, 74, 9000000, 41000),
    ('SLK', 'Luis', 'Navarro', 'CM', 24, 75, 13000000, 47000),
    ('SLK', 'Ibrahim', 'Diallo', 'LW', 21, 76, 20000000, 59000),
    ('BTW', 'Erik', 'Johansson', 'CDM', 30, 75, 10000000, 45000),
    ('BTW', 'Carlos', 'Vega', 'ST', 23, 77, 23000000, 68000),
    ('BTW', 'Maksim', 'Sokolov', 'CM', 25, 74, 12000000, 44000),
    ('BTW', 'Rayan', 'Belaid', 'RB', 22, 73, 9000000, 35000),
    ('CPA', 'Benjamin', 'Walker', 'GK', 28, 78, 15000000, 70000),
    ('CPA', 'Enzo', 'Moretti', 'CB', 24, 79, 24000000, 84000),
    ('CPA', 'Youssef', 'Amrani', 'LW', 22, 81, 38000000, 98000),
    ('CPA', 'Martin', 'Svoboda', 'CDM', 27, 78, 20000000, 76000),
    ('PEN', 'Oscar', 'Lind', 'GK', 26, 75, 9000000, 43000),
    ('PEN', 'Matias', 'Ferreira', 'ST', 23, 80, 31000000, 87000),
    ('PEN', 'Kenji', 'Sato', 'CAM', 22, 77, 22000000, 66000),
    ('PEN', 'Amadou', 'Kone', 'LB', 21, 74, 12000000, 39000),
    ('LFF', 'Nicolas', 'Dubois', 'CB', 25, 73, 8500000, 36000),
    ('LFF', 'Gabriel', 'Silva', 'RW', 20, 74, 14000000, 42000),
    ('LFF', 'Ivan', 'Horvat', 'CDM', 28, 72, 7000000, 34000),
    ('LFF', 'Tobias', 'Schmidt', 'LB', 24, 71, 6000000, 30000),
    ('WSP', 'Victor', 'Alvarez', 'GK', 29, 78, 14000000, 68000),
    ('WSP', 'Malik', 'Ndiaye', 'CB', 23, 77, 18000000, 61000),
    ('WSP', 'Joao', 'Costa', 'RW', 24, 80, 32000000, 90000),
    ('WSP', 'Artem', 'Kravets', 'CM', 26, 78, 21000000, 75000),
    ('LFX', 'David', 'McKenna', 'GK', 27, 72, 6500000, 33000),
    ('LFX', 'Miguel', 'Santos', 'ST', 22, 75, 15000000, 47000),
    ('LFX', 'Adrian', 'Novak', 'RB', 23, 72, 7500000, 31000),
    ('LFX', 'Karim', 'El Idrissi', 'CAM', 20, 73, 13000000, 38000)
) as p(short_name, first_name, last_name, position, age, overall, value, wage)
join public.clubs c on c.short_name = p.short_name
where not exists (
  select 1
  from public.players existing
  where existing.first_name = p.first_name
    and existing.last_name = p.last_name
);

update public.players
set
  position = case
    when position in ('GK', 'BR') then 'BR'
    when position in ('CB', 'RB', 'LB', 'OBR') then 'OBR'
    when position in ('CM', 'CDM', 'CAM', 'POM') then 'POM'
    else 'NAP'
  end,
  attack_rating = case
    when position in ('ST', 'RW', 'LW', 'CAM', 'NAP') then greatest(overall - 2, 1)
    when position in ('CM', 'CDM', 'POM') then greatest(overall - 8, 1)
    when position in ('CB', 'RB', 'LB', 'OBR') then greatest(overall - 18, 1)
    else greatest(overall - 30, 1)
  end,
  defense_rating = case
    when position in ('GK', 'BR') then greatest(overall + 4, 1)
    when position in ('CB', 'RB', 'LB', 'OBR') then greatest(overall - 1, 1)
    when position in ('CM', 'CDM', 'POM') then greatest(overall - 8, 1)
    else greatest(overall - 25, 1)
  end,
  price = case
    when price = 0 then value
    else price
  end;

update public.players
set fitness = 100
where fitness is null;

update public.clubs
set formation = '4-4-2'
where formation is null;

insert into public.players (
  club_id,
  first_name,
  last_name,
  position,
  age,
  overall,
  attack_rating,
  defense_rating,
  value,
  price,
  wage
)
select null, p.first_name, p.last_name, p.position, p.age, p.overall, p.attack_rating, p.defense_rating, p.value, p.price, p.wage
from (
  values
    ('Andre', 'Mbele', 'NAP', 24, 76, 78, 51, 18000000, 15000000, 52000),
    ('Matteo', 'Lombardi', 'POM', 27, 75, 70, 66, 14000000, 12000000, 47000),
    ('Sven', 'Meier', 'OBR', 29, 74, 55, 76, 10000000, 8500000, 39000),
    ('Riku', 'Arai', 'BR', 23, 73, 42, 77, 9000000, 7000000, 33000),
    ('Bruno', 'Ferreira', 'NAP', 22, 78, 80, 53, 26000000, 23000000, 71000),
    ('Nabil', 'Cherif', 'POM', 25, 77, 73, 68, 21000000, 18000000, 63000),
    ('Dylan', 'OConnor', 'OBR', 26, 72, 50, 73, 7000000, 5500000, 28000),
    ('Victor', 'Santos', 'NAP', 30, 74, 76, 47, 9000000, 6000000, 36000),
    ('Milos', 'Jankovic', 'POM', 21, 73, 69, 63, 12000000, 10000000, 32000),
    ('Ethan', 'Brooks', 'OBR', 20, 71, 48, 72, 8500000, 7500000, 25000),
    ('Adil', 'Rahmani', 'NAP', 19, 72, 75, 45, 13000000, 11500000, 30000),
    ('Leandro', 'Sousa', 'POM', 28, 76, 72, 67, 16000000, 13000000, 52000),
    ('Ivan', 'Kozlov', 'BR', 31, 75, 44, 79, 7500000, 5000000, 41000),
    ('Felipe', 'Morales', 'OBR', 24, 73, 52, 75, 11000000, 9000000, 35000),
    ('Tom', 'de Vries', 'POM', 23, 74, 70, 65, 15000000, 12500000, 43000),
    ('Kofi', 'Boateng', 'NAP', 26, 77, 79, 50, 22000000, 19000000, 66000),
    ('Luka', 'Maric', 'OBR', 27, 75, 54, 77, 13000000, 11000000, 46000),
    ('Noel', 'Fischer', 'POM', 20, 71, 67, 61, 9000000, 7600000, 27000),
    ('Paulo', 'Nunes', 'NAP', 25, 75, 77, 48, 16000000, 13500000, 48000),
    ('Amir', 'Saleh', 'OBR', 22, 72, 49, 74, 9500000, 8200000, 30000),
    ('George', 'Miller', 'BR', 24, 72, 40, 76, 8000000, 6500000, 31000),
    ('Sergio', 'Castro', 'POM', 29, 76, 72, 66, 12000000, 9000000, 45000),
    ('Daniel', 'Kim', 'NAP', 21, 74, 77, 46, 15000000, 13000000, 39000),
    ('Yann', 'Rousseau', 'OBR', 30, 74, 53, 76, 8500000, 6000000, 38000)
) as p(first_name, last_name, position, age, overall, attack_rating, defense_rating, value, price, wage)
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

insert into public.news_feed (message)
select message
from (
  values
    ('League office opened the Overr Super League multiplayer preseason.'),
    ('Managers can now save formations, benches and transfer moves.'),
    ('Match engine now tracks fitness, cards and injuries.')
) as feed(message)
where not exists (
  select 1
  from public.news_feed existing
  where existing.message = feed.message
);
