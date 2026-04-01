grant delete on public.daily_reports to authenticated;

drop policy if exists "reports_delete_own_or_admin" on public.daily_reports;
create policy "reports_delete_own_or_admin"
on public.daily_reports
for delete
to authenticated
using (
  auth.uid() = employee_id
  or public.current_user_role() = 'admin'
);
