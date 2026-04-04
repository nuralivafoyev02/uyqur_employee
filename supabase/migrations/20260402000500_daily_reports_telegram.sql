alter table public.daily_reports
add column if not exists telegram_status text not null default 'not_sent',
add column if not exists telegram_payload text,
add column if not exists telegram_message_id text,
add column if not exists telegram_last_error text,
add column if not exists telegram_sent_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_reports_telegram_status_check'
  ) then
    alter table public.daily_reports
    add constraint daily_reports_telegram_status_check
    check (telegram_status in ('not_sent', 'sent', 'failed'));
  end if;
end
$$;
