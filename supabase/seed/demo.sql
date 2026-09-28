-- DEMO ONLY. This file is not enabled by supabase/config.toml and must never be
-- applied to production. All names, addresses, and records below are fictional.
insert into public.service_areas(id,locality,pincode,latitude,longitude)
values('00000000-0000-4000-8000-000000000001','Demo Ward','751000',20.2961,85.8245)
on conflict(id) do nothing;

insert into public.facilities(id,slug,name_en,name_or,address,area_id,latitude,longitude,kind,ownership,data_class,verification_status)
values
 ('11111111-1111-4111-8111-111111111111','demo-community-centre','Demo Community Care Centre','ଡେମୋ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର','Illustrative location, Bhubaneswar','00000000-0000-4000-8000-000000000001',20.2961,85.8245,'Primary care','demo','demo','draft'),
 ('22222222-2222-4222-8222-222222222222','demo-referral-centre','Demo Referral Centre','ଡେମୋ ରେଫରାଲ କେନ୍ଦ୍ର','Illustrative location, Bhubaneswar','00000000-0000-4000-8000-000000000001',20.2800,85.8400,'Referral care','demo','demo','draft')
on conflict(id) do nothing;

insert into public.facility_services(facility_id,service_code,availability,cost_category)
values
 ('11111111-1111-4111-8111-111111111111','general','listed','demo'),
 ('11111111-1111-4111-8111-111111111111','maternal','listed','demo'),
 ('11111111-1111-4111-8111-111111111111','child','listed','demo'),
 ('22222222-2222-4222-8222-222222222222','general','listed','demo'),
 ('22222222-2222-4222-8222-222222222222','maternal','listed','demo'),
 ('22222222-2222-4222-8222-222222222222','child','listed','demo'),
 ('22222222-2222-4222-8222-222222222222','emergency','listed','demo')
on conflict(facility_id,service_code) do nothing;
