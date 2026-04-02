do $$
begin
  if not exists (select 1 from pg_type where typname = 'suggestion_status') then
    create type public.suggestion_status as enum ('new', 'accepted', 'prepared', 'canceled');
  end if;
end
$$;

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  status public.suggestion_status not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists suggestions_set_updated_at on public.suggestions;
create trigger suggestions_set_updated_at
before update on public.suggestions
for each row execute procedure public.handle_updated_at();

grant select, insert, update on public.suggestions to authenticated;

alter table public.suggestions enable row level security;

drop policy if exists "suggestions_select_authenticated" on public.suggestions;
create policy "suggestions_select_authenticated"
on public.suggestions
for select
to authenticated
using (true);

drop policy if exists "suggestions_insert_own" on public.suggestions;
create policy "suggestions_insert_own"
on public.suggestions
for insert
to authenticated
with check (employee_id = auth.uid());

drop policy if exists "suggestions_update_lead_only" on public.suggestions;
create policy "suggestions_update_lead_only"
on public.suggestions
for update
to authenticated
using (public.current_user_role() in ('admin', 'manager'))
with check (public.current_user_role() in ('admin', 'manager'));
