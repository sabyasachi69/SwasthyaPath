begin;
create extension if not exists pgtap with schema extensions;

\ir ../seed/optional/002_seed_demo_practitioners.sql
\ir ../seed/optional/002_seed_demo_practitioners.sql

select plan(3);

select is(
  (select count(*) from public.facility_practitioners where is_demo),
  262::bigint,
  'demo practitioner seed is idempotent'
);

select is(
  (
    select count(*)
    from public.practitioner_schedule s
    join public.facility_practitioners p on p.id = s.practitioner_id
    where p.is_demo
  ),
  1969::bigint,
  'demo schedule seed is idempotent'
);

select is(
  (
    select count(*)
    from public.facility_images
    where rights_basis = 'original_illustration_created_for_project'
  ),
  28::bigint,
  'demo facility image seed is idempotent'
);

select * from finish();
rollback;
