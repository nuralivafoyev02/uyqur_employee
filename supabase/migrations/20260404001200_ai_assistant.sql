create table if not exists public.ai_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Yangi chat',
  last_message_preview text,
  last_message_at timestamptz not null default timezone('utc', now()),
  memory jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.ai_threads (id) on delete cascade,
  sender text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint ai_messages_sender_check check (sender in ('user', 'assistant', 'system'))
);

create index if not exists ai_threads_user_id_last_message_at_idx
on public.ai_threads (user_id, last_message_at desc);

create index if not exists ai_messages_thread_id_created_at_idx
on public.ai_messages (thread_id, created_at asc);

drop trigger if exists ai_threads_set_updated_at on public.ai_threads;
create trigger ai_threads_set_updated_at
before update on public.ai_threads
for each row execute procedure public.handle_updated_at();

grant select, insert, update on public.ai_threads to authenticated;
grant select, insert on public.ai_messages to authenticated;

alter table public.ai_threads enable row level security;
alter table public.ai_messages enable row level security;

drop policy if exists "ai_threads_select_own" on public.ai_threads;
create policy "ai_threads_select_own"
on public.ai_threads
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "ai_threads_insert_own" on public.ai_threads;
create policy "ai_threads_insert_own"
on public.ai_threads
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "ai_threads_update_own" on public.ai_threads;
create policy "ai_threads_update_own"
on public.ai_threads
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "ai_messages_select_own_thread" on public.ai_messages;
create policy "ai_messages_select_own_thread"
on public.ai_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.ai_threads
    where public.ai_threads.id = ai_messages.thread_id
      and public.ai_threads.user_id = auth.uid()
  )
);

drop policy if exists "ai_messages_insert_own_thread" on public.ai_messages;
create policy "ai_messages_insert_own_thread"
on public.ai_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.ai_threads
    where public.ai_threads.id = ai_messages.thread_id
      and public.ai_threads.user_id = auth.uid()
  )
);
