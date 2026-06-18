-- Multi-taster comments on a brew round.
-- Each person leaves a name, an opinion, and their own 1-5 tasting scores.
create table if not exists public.brew_comments (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  brew_log_id  uuid not null references public.brew_logs(id) on delete cascade,
  author       text not null,
  comment      text,
  acidity      smallint check (acidity    between 1 and 5),
  body         smallint check (body       between 1 and 5),
  sweetness    smallint check (sweetness  between 1 and 5),
  bitterness   smallint check (bitterness between 1 and 5),
  clarity      smallint check (clarity    between 1 and 5),
  overall      smallint check (overall    between 1 and 5)
);

create index if not exists brew_comments_brew_log_id_idx
  on public.brew_comments(brew_log_id);

alter table public.brew_comments enable row level security;
create policy "dialed_brew_comments_all"
  on public.brew_comments for all using (true) with check (true);
