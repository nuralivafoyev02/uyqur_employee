create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'manager', 'employee');
  end if;

  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('done', 'in_progress', 'blocked');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_priority') then
    create type public.plan_priority as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_status') then
    create type public.plan_status as enum ('todo', 'in_progress', 'done', 'blocked');
  end if;
end
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  title text,
  department text,
  role public.user_role not null default 'employee',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles (id) on delete cascade,
  report_date date not null,
  completed_work text not null,
  current_work text not null,
  next_plan text not null,
  blockers text,
  status public.report_status not null default 'in_progress',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint daily_reports_employee_id_report_date_key unique (employee_id, report_date)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  assignee_id uuid not null references public.profiles (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority public.plan_priority not null default 'medium',
  status public.plan_status not null default 'todo',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists daily_reports_set_updated_at on public.daily_reports;
create trigger daily_reports_set_updated_at
before update on public.daily_reports
for each row execute procedure public.handle_updated_at();

drop trigger if exists plans_set_updated_at on public.plans;
create trigger plans_set_updated_at
before update on public.plans
for each row execute procedure public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Yangi xodim'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid();
$$;

create or replace function public.update_plan_status(
  plan_id uuid,
  next_status public.plan_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.plans
    where id = plan_id
      and (
        assignee_id = auth.uid()
        or public.current_user_role() in ('admin', 'manager')
      )
  ) then
    raise exception 'Not allowed to update this plan status';
  end if;

  update public.plans
  set status = next_status,
      updated_at = timezone('utc', now())
  where id = plan_id;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.daily_reports to authenticated;
grant select, insert, update on public.plans to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.update_plan_status(uuid, public.plan_status) to authenticated;

alter table public.profiles enable row level security;
alter table public.daily_reports enable row level security;
alter table public.plans enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own_or_lead" on public.profiles;
create policy "profiles_update_own_or_lead"
on public.profiles
for update
to authenticated
using (
  auth.uid() = id
  or public.current_user_role() in ('admin', 'manager')
)
with check (
  auth.uid() = id
  or public.current_user_role() in ('admin', 'manager')
);

drop policy if exists "reports_select_own_or_lead" on public.daily_reports;
create policy "reports_select_own_or_lead"
on public.daily_reports
for select
to authenticated
using (
  auth.uid() = employee_id
  or public.current_user_role() in ('admin', 'manager')
);

drop policy if exists "reports_insert_own_or_lead" on public.daily_reports;
create policy "reports_insert_own_or_lead"
on public.daily_reports
for insert
to authenticated
with check (
  auth.uid() = employee_id
  or public.current_user_role() in ('admin', 'manager')
);

drop policy if exists "reports_update_own_or_lead" on public.daily_reports;
create policy "reports_update_own_or_lead"
on public.daily_reports
for update
to authenticated
using (
  auth.uid() = employee_id
  or public.current_user_role() in ('admin', 'manager')
)
with check (
  auth.uid() = employee_id
  or public.current_user_role() in ('admin', 'manager')
);

drop policy if exists "plans_select_scoped" on public.plans;
create policy "plans_select_scoped"
on public.plans
for select
to authenticated
using (
  assignee_id = auth.uid()
  or created_by = auth.uid()
  or public.current_user_role() in ('admin', 'manager')
);

drop policy if exists "plans_insert_lead_only" on public.plans;
create policy "plans_insert_lead_only"
on public.plans
for insert
to authenticated
with check (public.current_user_role() in ('admin', 'manager'));

drop policy if exists "plans_update_lead_only" on public.plans;
create policy "plans_update_lead_only"
on public.plans
for update
to authenticated
using (public.current_user_role() in ('admin', 'manager'))
with check (public.current_user_role() in ('admin', 'manager'));
