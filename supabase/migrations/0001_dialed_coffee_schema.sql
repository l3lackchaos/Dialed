-- Dialed — pour-over coffee recipe & brew log schema
-- Three linked tables: beans -> recipes -> brew_logs
-- Names use snake_case to coexist with other tables in a shared Supabase project.

-- 1. beans : coffee bean inventory
create table if not exists public.beans (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  origin        text,
  process       text,           -- Washed, Natural, Honey, Anaerobic, Semi-CM, Chardonnay, Double Anaerobic
  roast_level   text,           -- Light, Medium-Light, Medium, Medium-Dark, Omni, Vienna
  roast_date    date,
  roaster       text,
  tasting_notes text
);

-- 2. recipes : a brew recipe linked to a bean
create table if not exists public.recipes (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  bean_id       uuid not null references public.beans(id) on delete cascade,
  name          text not null,
  dripper       text,           -- V60, Origami, Kalita Tsubame, Pegasus, Switch, OREA
  grinder       text,           -- C40 Nitro Blade+Starwave, X25 Tigershark, C2
  click_setting text,
  water_temp    numeric,
  dose_g        numeric,
  water_g       numeric,
  ratio         text,
  pour_schedule jsonb not null default '[]'::jsonb,  -- [{ pour, cumulative_g, time, note }]
  target_time   text,
  notes         text,
  is_favorite   boolean not null default false
);
create index if not exists recipes_bean_id_idx on public.recipes(bean_id);

-- 3. brew_logs : one record per brew, linked to a recipe
create table if not exists public.brew_logs (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  recipe_id       uuid not null references public.recipes(id) on delete cascade,
  brew_date       date not null default current_date,
  actual_time     text,
  acidity         smallint check (acidity    between 1 and 5),
  body            smallint check (body       between 1 and 5),
  sweetness       smallint check (sweetness  between 1 and 5),
  bitterness      smallint check (bitterness between 1 and 5),
  clarity         smallint check (clarity    between 1 and 5),
  overall         smallint check (overall    between 1 and 5),
  flavor_notes    text,
  aroma_notes     text,
  next_adjustment text
);
create index if not exists brew_logs_recipe_id_idx on public.brew_logs(recipe_id);
create index if not exists brew_logs_brew_date_idx on public.brew_logs(brew_date desc);

-- Row Level Security: personal single-user notebook (no auth layer).
-- RLS is enabled for consistency; anon/authenticated get full access.
-- Tighten these if you add Supabase Auth.
alter table public.beans     enable row level security;
alter table public.recipes   enable row level security;
alter table public.brew_logs enable row level security;

create policy "dialed_beans_all"     on public.beans     for all using (true) with check (true);
create policy "dialed_recipes_all"   on public.recipes   for all using (true) with check (true);
create policy "dialed_brew_logs_all" on public.brew_logs for all using (true) with check (true);
