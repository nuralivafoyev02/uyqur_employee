create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  display_name text not null,
  status text not null default 'connected' check (status in ('connected')),
  public_config jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.integration_credentials (
  connection_id uuid primary key references public.integration_connections (id) on delete cascade,
  provider text not null,
  secret_config jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists integration_connections_set_updated_at on public.integration_connections;
create trigger integration_connections_set_updated_at
before update on public.integration_connections
for each row execute procedure public.handle_updated_at();

drop trigger if exists integration_credentials_set_updated_at on public.integration_credentials;
create trigger integration_credentials_set_updated_at
before update on public.integration_credentials
for each row execute procedure public.handle_updated_at();

grant select, insert, update on public.integration_connections to authenticated;
grant select, insert, update on public.integration_credentials to authenticated;

alter table public.integration_connections enable row level security;
alter table public.integration_credentials enable row level security;

drop policy if exists "integration_connections_select_authenticated" on public.integration_connections;
create policy "integration_connections_select_authenticated"
on public.integration_connections
for select
to authenticated
using (true);

drop policy if exists "integration_connections_manage_lead_only" on public.integration_connections;
create policy "integration_connections_manage_lead_only"
on public.integration_connections
for all
to authenticated
using (public.current_user_role() in ('admin', 'manager'))
with check (public.current_user_role() in ('admin', 'manager'));

drop policy if exists "integration_credentials_manage_lead_only" on public.integration_credentials;
create policy "integration_credentials_manage_lead_only"
on public.integration_credentials
for all
to authenticated
using (public.current_user_role() in ('admin', 'manager'))
with check (public.current_user_role() in ('admin', 'manager'));
