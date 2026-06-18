alter table public.players
add column if not exists nominal_position text,
add column if not exists nationality text not null default 'INT',
add column if not exists pac integer not null default 60 check (pac between 1 and 99),
add column if not exists sho integer not null default 60 check (sho between 1 and 99),
add column if not exists pas integer not null default 60 check (pas between 1 and 99),
add column if not exists dri integer not null default 60 check (dri between 1 and 99),
add column if not exists def integer not null default 60 check (def between 1 and 99),
add column if not exists phy integer not null default 60 check (phy between 1 and 99),
add column if not exists div integer not null default 60 check (div between 1 and 99),
add column if not exists han integer not null default 60 check (han between 1 and 99),
add column if not exists kic integer not null default 60 check (kic between 1 and 99),
add column if not exists ref integer not null default 60 check (ref between 1 and 99),
add column if not exists spd integer not null default 60 check (spd between 1 and 99),
add column if not exists pos integer not null default 60 check (pos between 1 and 99);

update public.players
set
  nominal_position = coalesce(
    nominal_position,
    case
      when position in ('BR', 'GK') then 'BR'
      when position in ('LB', 'RB', 'CB') then position
      when position in ('CM', 'CDM', 'CAM', 'LM', 'RM') then position
      when position in ('ST', 'LW', 'RW') then position
      when position = 'OBR' then 'CB'
      when position = 'POM' then 'CM'
      when position = 'NAP' then 'ST'
      else 'CM'
    end
  ),
  nationality = case
    when nationality = 'INT' then
      (array['PL','BR','FR','ES','DE','IT','NL','PT','AR','EN'])[1 + floor(random() * 10)::int]
    else nationality
  end,
  pac = greatest(least(overall + case when position in ('NAP','LW','RW','ST','LM','RM') then 6 else -2 end, 99), 1),
  sho = greatest(least(attack_rating + case when position in ('ST','NAP') then 8 else -4 end, 99), 1),
  pas = greatest(least(overall + case when position in ('CM','POM','CAM','CDM') then 5 else -3 end, 99), 1),
  dri = greatest(least(overall + case when position in ('LW','RW','LM','RM','CAM') then 6 else -2 end, 99), 1),
  def = greatest(least(defense_rating, 99), 1),
  phy = greatest(least(overall + case when position in ('CB','OBR','CDM') then 5 else -1 end, 99), 1),
  div = greatest(least(case when position = 'BR' then overall + 3 else 35 end, 99), 1),
  han = greatest(least(case when position = 'BR' then overall + 1 else 35 end, 99), 1),
  kic = greatest(least(case when position = 'BR' then overall - 2 else 35 end, 99), 1),
  ref = greatest(least(case when position = 'BR' then overall + 4 else 35 end, 99), 1),
  spd = greatest(least(case when position = 'BR' then overall - 6 else pac end, 99), 1),
  pos = greatest(least(case when position = 'BR' then overall + 2 else 35 end, 99), 1);
