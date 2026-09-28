-- Retention runs inside Postgres and is independent of user web requests.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create or replace function private.run_retention(p_now timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  deleted_tokens integer := 0;
  deleted_referrals integer := 0;
  deleted_plans integer := 0;
  aggregated_feedback integer := 0;
  result jsonb;
begin
  delete from private.referral_tokens
  where expires_at <= p_now or revoked_at is not null or consumed_at is not null;
  get diagnostics deleted_tokens = row_count;

  delete from public.referrals
  where closed_at is not null and closed_at <= p_now - interval '90 days';
  get diagnostics deleted_referrals = row_count;

  delete from public.saved_care_plans plan
  where plan.expires_at <= p_now
    and not exists (
      select 1 from public.referrals referral where referral.care_plan_id = plan.id
    );
  get diagnostics deleted_plans = row_count;

  with removed as (
    delete from public.facility_feedback
    where created_at <= p_now - interval '12 months'
    returning facility_id, category
  ), grouped as (
    select facility_id, category, count(*)::integer as report_count
    from removed
    group by facility_id, category
  ), written as (
    insert into private.data_quality_signals(facility_id, category, report_count)
    select facility_id, category, report_count from grouped
    returning report_count
  )
  select coalesce(sum(report_count), 0)::integer
  into aggregated_feedback
  from written;

  result := jsonb_build_object(
    'deleted_tokens', deleted_tokens,
    'deleted_referrals', deleted_referrals,
    'deleted_plans', deleted_plans,
    'aggregated_feedback', aggregated_feedback
  );
  insert into private.retention_jobs(summary) values(result);
  return result;
end;
$$;

revoke all on function private.run_retention(timestamptz) from public, anon, authenticated;
grant execute on function private.run_retention(timestamptz) to postgres, service_role;

do $$
declare existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'swasthyapath-retention-daily';
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
  perform cron.schedule(
    'swasthyapath-retention-daily',
    '17 2 * * *',
    'select private.run_retention();'
  );
end $$;

create or replace function private.admin_queue()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
begin
  if not private.has_role(array['data_editor','data_verifier','clinician_reviewer','admin']) then
    raise exception 'FORBIDDEN';
  end if;
  return jsonb_build_object(
    'revisions', (select coalesce(jsonb_agg(r order by r.created_at desc),'[]') from private.facility_revisions r),
    'feedback', (select coalesce(jsonb_agg(f order by f.created_at desc),'[]') from public.facility_feedback f where f.moderation_status='pending'),
    'protocols', (select coalesce(jsonb_agg(p order by p.version desc),'[]') from private.triage_protocols p),
    'stale_facilities', (select count(*) from public.facilities f where f.verification_status='published' and f.valid_until <= now() + interval '30 days'),
    'verified_facilities', (select count(*) from public.facilities f where f.data_class='verified_real' and f.verification_status='published' and f.valid_until > now())
  );
end;
$$;

revoke all on function private.admin_queue() from public, anon;
grant execute on function private.admin_queue() to authenticated;
