-- Brew log focuses on execution (gear), not taste. Tasting moves to brew_comments.
alter table public.brew_logs
  add column if not exists click_setting text,
  add column if not exists grinder text;
