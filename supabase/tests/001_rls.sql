begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into public.service_areas(id,locality,pincode,latitude,longitude)
values('90000000-0000-4000-8000-000000000001','RLS Fixture','751099',20.2961,85.8245);
insert into public.facilities(id,slug,name_en,name_or,address,area_id,latitude,longitude,kind,data_class,verification_status,last_verified_at,valid_until)
values
 ('90000000-0000-4000-8000-000000000002','verified-fixture','Verified fixture','ଯାଞ୍ଚ ଫିକ୍ସଚର୍','Test only','90000000-0000-4000-8000-000000000001',20.2961,85.8245,'test','verified_real','published',now(),now()+interval '1 day'),
 ('90000000-0000-4000-8000-000000000003','draft-fixture','Draft fixture','ଡ୍ରାଫ୍ଟ ଫିକ୍ସଚର୍','Test only','90000000-0000-4000-8000-000000000001',20.2962,85.8246,'test','submitted_unverified','draft',null,null),
 ('90000000-0000-4000-8000-000000000004','demo-fixture','Demo fixture','ଡେମୋ ଫିକ୍ସଚର୍','Test only','90000000-0000-4000-8000-000000000001',20.2963,85.8247,'test','demo','draft',null,null);

set local role anon;
select results_eq('select count(*) from public.facilities',array[1::bigint],'anonymous sees only verified, current facilities');
select results_eq($$select slug from public.facilities$$,array['verified-fixture'::text],'anonymous cannot see draft or demo facilities');
select results_eq('select count(*) from api.facility_directory',array[1::bigint],'security-invoker directory preserves facility RLS');
select results_eq('select count(*) from public.active_protocol()',array[1::bigint],'public protocol function is callable');
select is((select public.active_protocol()),null::jsonb,'no protocol means no guidance');
select throws_ok($$select * from public.saved_care_plans$$,'42501','permission denied for table saved_care_plans','anonymous cannot read plans');
select throws_ok($$select * from private.audit_events$$,'42501','permission denied for schema private','anonymous cannot read audit data');
select throws_ok($$select private.run_retention()$$,'42501','permission denied for schema private','anonymous cannot execute retention');
select results_eq($$select count(*) from public.search_facilities(20.2961,85.8245,null)$$,array[1::bigint],'search function cannot leak draft or demo facilities');

select * from finish();
rollback;
