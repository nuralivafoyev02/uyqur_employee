grant delete on public.ai_threads to authenticated;

drop policy if exists "ai_threads_delete_own" on public.ai_threads;
create policy "ai_threads_delete_own"
on public.ai_threads
for delete
to authenticated
using (auth.uid() = user_id);
