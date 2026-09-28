-- Rich public directory fields. Operational claims remain nullable until sourced.
alter table public.facilities
 add column locality text,
 add column pincode text check(pincode is null or pincode ~ '^[0-9]{6}$'),
 add column website text check(website is null or website ~ '^https://'),
 add column coord_quality text;

create table public.facility_images (
 id uuid primary key default gen_random_uuid(),
 facility_id uuid not null references public.facilities on delete cascade,
 public_path text not null check(public_path ~ '^/'),
 alt_text text not null,
 source_url text check(source_url is null or source_url ~ '^https://'),
 rights_basis text not null,
 position integer not null default 0,
 published boolean not null default false,
 created_at timestamptz not null default now()
);

create table public.facility_practitioners (
 id uuid primary key default gen_random_uuid(),
 facility_id uuid not null references public.facilities on delete cascade,
 display_name text not null,
 specialization text not null,
 qualification text not null,
 source_id uuid not null references public.data_sources,
 verified_at timestamptz not null,
 valid_until timestamptz not null,
 published boolean not null default false
);

create table public.facility_capabilities (
 facility_id uuid primary key references public.facilities on delete cascade,
 beds_total integer check(beds_total is null or beds_total >= 0),
 icu_beds integer check(icu_beds is null or icu_beds >= 0),
 ambulances integer check(ambulances is null or ambulances >= 0),
 pharmacy_onsite boolean,
 lab_onsite boolean,
 source_id uuid not null references public.data_sources,
 verified_at timestamptz not null,
 valid_until timestamptz not null
);

create index facility_images_facility_idx on public.facility_images(facility_id);
create index facility_practitioners_facility_idx on public.facility_practitioners(facility_id);
create index facility_practitioners_source_idx on public.facility_practitioners(source_id);
create index facility_capabilities_source_idx on public.facility_capabilities(source_id);

alter table public.facility_images enable row level security;
alter table public.facility_practitioners enable row level security;
alter table public.facility_capabilities enable row level security;

grant select on public.facility_images, public.facility_practitioners, public.facility_capabilities to anon, authenticated;
create policy published_images on public.facility_images for select to anon, authenticated
 using(published and exists(select 1 from public.facilities f where f.id=facility_id));
create policy published_practitioners on public.facility_practitioners for select to anon, authenticated
 using(published and valid_until>now() and exists(select 1 from public.facilities f where f.id=facility_id));
create policy current_capabilities on public.facility_capabilities for select to anon, authenticated
 using(valid_until>now() and exists(select 1 from public.facilities f where f.id=facility_id));

-- Expose richer public profiles while retaining security-invoker RLS behavior.
drop function public.search_facilities(double precision,double precision,text);
drop view api.facility_directory;
create view api.facility_directory with(security_invoker=true) as
 select f.id,f.slug,f.name_en,f.name_or,f.address,f.locality,f.pincode,
  f.latitude,f.longitude,f.kind,f.ownership,f.website,f.coord_quality,
  f.data_class,f.verification_status,f.last_verified_at,f.valid_until,
  (select c.phone from public.facility_contacts c where c.facility_id=f.id and c.valid_until>now() order by c.verified_at desc limit 1) phone,
  coalesce((select array_agg(s.service_code) from public.facility_services s where s.facility_id=f.id and s.availability='listed' and s.valid_until>now()),'{}'::text[]) services,
  (select ds.url from public.data_sources ds join public.facility_source_links sl on sl.source_id=ds.id where sl.facility_id=f.id limit 1) source_url,
  (select i.public_path from public.facility_images i where i.facility_id=f.id and i.published order by i.position limit 1) image_url,
  (select i.alt_text from public.facility_images i where i.facility_id=f.id and i.published order by i.position limit 1) image_alt
 from public.facilities f;
grant select on api.facility_directory to anon,authenticated;

create function public.search_facilities(
 p_lat double precision,
 p_lng double precision,
 p_service text default null,
 p_kind text default null
) returns setof api.facility_directory
language sql stable security invoker set search_path='' as $$
 select d.* from api.facility_directory d join public.facilities f on f.id=d.id
 where p_lat between 20.12 and 20.42 and p_lng between 85.65 and 85.95
  and (p_service is null or p_service=any(d.services))
  and (p_kind is null or
   (p_kind='hospital' and lower(d.kind) like '%hospital%') or
   (p_kind='clinic' and lower(d.kind) like '%clinic%') or
   (p_kind='pharmacy' and lower(d.kind)='pharmacy') or
   (p_kind='diagnostic' and lower(d.kind) like '%diagnostic%'))
 order by f.location operator(extensions.<->) extensions.st_setsrid(extensions.st_makepoint(p_lng,p_lat),4326)::extensions.geography
 limit 50;
$$;
revoke all on function public.search_facilities(double precision,double precision,text,text) from public;
grant execute on function public.search_facilities(double precision,double precision,text,text) to anon,authenticated;

insert into public.service_areas(locality,pincode,latitude,longitude) values
 ('Patrapada','751019',20.231,85.774),
 ('Unit 6','751001',20.266,85.836),
 ('Patia','751024',20.354,85.817),
 ('Khandagiri','751030',20.259,85.781),
 ('Chandrasekharpur','751023',20.320,85.822),
 ('Bapuji Nagar','751009',20.265,85.829),
 ('Jaydev Vihar','751012',20.302,85.820),
 ('Acharya Vihar','751013',20.296,85.822),
 ('BJB Nagar','751014',20.264,85.834),
 ('Laxmisagar','751006',20.276,85.848),
 ('Old Town','751002',20.238,85.843)
on conflict(locality,pincode) do update set latitude=excluded.latitude,longitude=excluded.longitude;

update private.release_contract
 set schema_contract=2,
     migration_identifier='20260928111320_facility_directory_profiles',
     updated_at=now()
 where singleton;
