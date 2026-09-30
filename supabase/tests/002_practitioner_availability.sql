begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into public.service_areas(id, locality, pincode, latitude, longitude)
values ('91000000-0000-4000-8000-000000000001', 'Practitioner fixture', '751098', 20.2961, 85.8245);

insert into public.facilities(
  id, slug, name_en, name_or, address, area_id, latitude, longitude, kind,
  data_class, verification_status, last_verified_at, valid_until
)
values (
  '91000000-0000-4000-8000-000000000002', 'practitioner-fixture',
  'Practitioner fixture', 'Practitioner fixture', 'Test only',
  '91000000-0000-4000-8000-000000000001', 20.2961, 85.8245, 'hospital',
  'verified_real', 'published', now(), now() + interval '1 day'
);

insert into public.data_sources(id, url, owner, evidence_type)
values (
  '91000000-0000-4000-8000-000000000003',
  'https://example.org/practitioner-test',
  'Test suite',
  'demo_synthetic'
);

insert into public.facility_practitioners(
  id, facility_id, display_name, specialization, qualification, source_id,
  verified_at, valid_until, published, is_demo, demo_label
)
values
  (
    '91000000-0000-4000-8000-000000000004',
    '91000000-0000-4000-8000-000000000002',
    'Dr Demo', 'General Medicine', 'MBBS',
    '91000000-0000-4000-8000-000000000003', now(), now() + interval '1 day',
    true, true, 'Demo profile - not a real clinician'
  ),
  (
    '91000000-0000-4000-8000-000000000005',
    '91000000-0000-4000-8000-000000000002',
    'Dr Private', 'General Medicine', 'MBBS',
    '91000000-0000-4000-8000-000000000003', now(), now() + interval '1 day',
    true, false, null
  );

insert into public.practitioner_schedule(practitioner_id, weekday, starts, ends, activity, location)
values (
  '91000000-0000-4000-8000-000000000004', 1, '10:00', '12:00', 'opd', 'OPD fixture'
);

insert into public.facility_practitioner_contacts(practitioner_id, email)
values
  ('91000000-0000-4000-8000-000000000004', 'demo@example.org'),
  ('91000000-0000-4000-8000-000000000005', 'private@example.org');

set local role anon;

select results_eq(
  $$select count(*) from public.facility_practitioners where id = '91000000-0000-4000-8000-000000000004'$$,
  array[1::bigint],
  'anonymous can read a current published demo practitioner'
);

select results_eq(
  $$select count(*) from public.practitioner_schedule where practitioner_id = '91000000-0000-4000-8000-000000000004'$$,
  array[1::bigint],
  'anonymous can read the schedule for a visible practitioner'
);

select results_eq(
  $$select email from public.facility_practitioner_contacts order by email$$,
  array['demo@example.org'::text],
  'anonymous cannot read a non-demo practitioner email'
);

select results_eq(
  $$select current_status from public.practitioner_availability_at('2026-09-28 05:00:00+00') where practitioner_id = '91000000-0000-4000-8000-000000000004'$$,
  array['In OPD'::text],
  'availability is evaluated at a deterministic Asia/Kolkata time'
);

select * from finish();
rollback;
