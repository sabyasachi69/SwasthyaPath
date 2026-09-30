-- Additive demo practitioner metadata and public, RLS-protected availability.
-- Weekdays follow PostgreSQL/JavaScript convention: 0 = Sunday ... 6 = Saturday.

alter table public.facility_practitioners
  add column if not exists is_demo boolean not null default false,
  add column if not exists demo_label text,
  add column if not exists department_group text,
  add column if not exists sub_specialty text,
  add column if not exists designation text,
  add column if not exists gender text check (gender is null or gender in ('M', 'F')),
  add column if not exists experience_years integer check (experience_years is null or experience_years between 0 and 60),
  add column if not exists languages text[],
  add column if not exists consultation_fee_inr integer check (consultation_fee_inr is null or consultation_fee_inr >= 0),
  add column if not exists photo_path text check (photo_path is null or photo_path ~ '^/');

create index if not exists facility_practitioners_facility_spec_idx
  on public.facility_practitioners (facility_id, specialization);

create table public.facility_practitioner_contacts (
  practitioner_id uuid primary key references public.facility_practitioners(id) on delete cascade,
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+$')
);

alter table public.facility_practitioner_contacts enable row level security;
revoke all on public.facility_practitioner_contacts from public, anon, authenticated;
grant select on public.facility_practitioner_contacts to anon, authenticated;

create policy demo_practitioner_contacts_read
  on public.facility_practitioner_contacts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.facility_practitioners p
      where p.id = practitioner_id
        and p.is_demo
        and p.published
        and p.valid_until > now()
    )
  );

create table public.practitioner_schedule (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.facility_practitioners(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  starts time not null,
  ends time not null,
  activity text not null check (activity in ('opd', 'ward_rounds', 'icu', 'ot', 'emergency', 'cath_lab', 'on_call', 'diagnostics')),
  location text,
  check (ends > starts),
  unique (practitioner_id, weekday, starts, ends, activity, location)
);

create index practitioner_schedule_lookup_idx
  on public.practitioner_schedule (practitioner_id, weekday, starts);

alter table public.practitioner_schedule enable row level security;
revoke all on public.practitioner_schedule from public, anon, authenticated;
grant select on public.practitioner_schedule to anon, authenticated;

create policy published_practitioner_schedule
  on public.practitioner_schedule
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.facility_practitioners p
      where p.id = practitioner_id
        and p.published
        and p.valid_until > now()
    )
  );

create function public.practitioner_availability_at(p_now timestamptz default now())
returns table (
  practitioner_id uuid,
  facility_id uuid,
  current_activity text,
  current_status text,
  current_location text,
  current_until time,
  available_now_for_opd boolean,
  next_opd_at timestamptz,
  next_opd_location text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with n as (
    select p_now at time zone 'Asia/Kolkata' as ts
  )
  select
    p.id,
    p.facility_id,
    cur.activity,
    case cur.activity
      when 'opd' then 'In OPD'
      when 'ward_rounds' then 'On ward rounds'
      when 'icu' then 'In ICU / critical care'
      when 'ot' then 'In operation theatre'
      when 'emergency' then 'In emergency department'
      when 'cath_lab' then 'In cath lab'
      when 'on_call' then 'On call'
      when 'diagnostics' then 'In diagnostics / reporting'
      else 'Off duty'
    end,
    cur.location,
    cur.ends,
    cur.activity = 'opd',
    nxt.at_ist,
    nxt.location
  from public.facility_practitioners p
  cross join n
  left join lateral (
    select s.activity, s.location, s.ends
    from public.practitioner_schedule s
    where s.practitioner_id = p.id
      and s.weekday = extract(dow from n.ts)::integer
      and n.ts::time >= s.starts
      and n.ts::time < s.ends
    order by (s.activity = 'opd') desc, s.starts
    limit 1
  ) cur on true
  left join lateral (
    select (((n.ts::date + d.k) + s.starts) at time zone 'Asia/Kolkata') as at_ist, s.location
    from generate_series(0, 7) as d(k)
    join public.practitioner_schedule s
      on s.practitioner_id = p.id
      and s.activity = 'opd'
      and s.weekday = extract(dow from (n.ts::date + d.k))::integer
    where ((n.ts::date + d.k) + s.starts) > n.ts
    order by at_ist
    limit 1
  ) nxt on true;
$$;

revoke all on function public.practitioner_availability_at(timestamptz) from public;
grant execute on function public.practitioner_availability_at(timestamptz) to anon, authenticated;

create view public.practitioner_availability
with (security_invoker = true)
as
select * from public.practitioner_availability_at(now());

revoke all on public.practitioner_availability from public, anon, authenticated;
grant select on public.practitioner_availability to anon, authenticated;

update private.release_contract
set schema_contract = 3,
    minimum_app_contract = 2,
    migration_identifier = '20260930003827_demo_practitioner_profiles',
    updated_at = now()
where singleton;
