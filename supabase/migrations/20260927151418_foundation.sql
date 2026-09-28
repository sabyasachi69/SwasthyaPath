create schema if not exists extensions;
create extension if not exists postgis with schema extensions;
create schema if not exists private;
create schema if not exists api;
revoke all on schema private from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

create table public.service_areas (
 id uuid primary key default gen_random_uuid(), state text not null default 'Odisha' check(state='Odisha'), city text not null default 'Bhubaneswar' check(city='Bhubaneswar'), locality text not null, pincode text not null check(pincode ~ '^[0-9]{6}$'), latitude double precision not null, longitude double precision not null,
 unique(locality,pincode)
);
create table public.services (code text primary key, name_en text not null, name_or text not null);
create table public.facilities (
 id uuid primary key default gen_random_uuid(), slug text not null unique check(slug ~ '^[a-z0-9-]+$'), name_en text not null, name_or text not null, address text not null,
 area_id uuid references public.service_areas, latitude double precision not null check(latitude between 20.12 and 20.42), longitude double precision not null check(longitude between 85.65 and 85.95),
 location extensions.geography(point,4326) generated always as (extensions.st_setsrid(extensions.st_makepoint(longitude,latitude),4326)::extensions.geography) stored,
 kind text not null, ownership text not null default 'government', data_class text not null default 'submitted_unverified' check(data_class in('verified_real','submitted_unverified','demo')),
 verification_status text not null default 'draft' check(verification_status in('draft','published','withdrawn')), last_verified_at timestamptz, valid_until timestamptz, published_revision_id uuid,
 check(verification_status<>'published' or (data_class='verified_real' and last_verified_at is not null and valid_until>last_verified_at))
);
create index facilities_location_idx on public.facilities using gist(location);
create index facilities_area_idx on public.facilities(area_id);
create table public.data_sources (id uuid primary key default gen_random_uuid(), url text not null check(url ~ '^https://'), owner text not null, retrieved_at timestamptz not null default now(), evidence_type text not null, public_note text);
create table public.facility_contacts (id uuid primary key default gen_random_uuid(), facility_id uuid not null references public.facilities on delete cascade, phone text not null check(phone ~ '^\+?[0-9-]{3,20}$'), contact_type text not null, source_id uuid not null references public.data_sources, verified_at timestamptz not null, valid_until timestamptz not null);
create table public.facility_services (facility_id uuid references public.facilities on delete cascade, service_code text references public.services, availability text not null default 'unknown' check(availability in('listed','unknown','unavailable')), cost_category text not null default 'unknown', referral_required boolean, source_id uuid references public.data_sources, verified_at timestamptz, valid_until timestamptz, primary key(facility_id,service_code));
create table public.operating_hours (id uuid primary key default gen_random_uuid(), facility_id uuid not null references public.facilities on delete cascade, service_code text references public.services, weekday int check(weekday between 0 and 6), opens time, closes time, exception_date date, closed boolean not null default false, source_id uuid references public.data_sources, verified_at timestamptz, valid_until timestamptz);
create table public.facility_source_links (facility_id uuid references public.facilities on delete cascade, source_id uuid references public.data_sources, field_name text not null, primary key(facility_id,source_id,field_name));
create table public.referral_edges (id uuid primary key default gen_random_uuid(), from_facility_id uuid not null references public.facilities, to_facility_id uuid not null references public.facilities, service_code text references public.services, reason_en text not null, reason_or text not null, source_id uuid references public.data_sources, valid_until timestamptz not null, approved boolean not null default false, check(from_facility_id<>to_facility_id));

create table private.staff_assignments (user_id uuid references auth.users on delete cascade, role text check(role in('data_editor','data_verifier','clinician_reviewer','admin')), active boolean not null default true, primary key(user_id,role));
create function private.has_role(wanted text[]) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and coalesce(auth.jwt()->>'aal','')='aal2' and exists(select 1 from private.staff_assignments where user_id=auth.uid() and active and role=any(wanted));
$$;
revoke all on function private.has_role(text[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(text[]) to authenticated;

create table private.facility_revisions (id uuid primary key default gen_random_uuid(), facility_id uuid not null references public.facilities, author_id uuid not null references auth.users, snapshot jsonb not null, reason text not null, evidence_url text not null check(evidence_url ~ '^https://'), state text not null default 'draft' check(state in('draft','submitted','approved','rejected','published')), created_at timestamptz not null default now());
create table private.verification_reviews (id uuid primary key default gen_random_uuid(), revision_id uuid not null references private.facility_revisions, reviewer_id uuid not null references auth.users, approved boolean not null, checklist jsonb not null, reviewed_at timestamptz not null default now(), unique(revision_id,reviewer_id));
create table private.publication_events (id uuid primary key default gen_random_uuid(), revision_id uuid not null references private.facility_revisions, actor_id uuid references auth.users, created_at timestamptz not null default now(), rollback_of uuid references private.publication_events);
create table private.audit_events (id bigint generated always as identity primary key, actor_id uuid, action text not null, entity_id uuid, details jsonb not null default '{}', created_at timestamptz not null default now());
create table private.retention_jobs (id bigint generated always as identity primary key, executed_at timestamptz not null default now(), summary jsonb not null);

create table private.triage_protocols (id uuid primary key default gen_random_uuid(), version text not null unique, status text not null default 'draft' check(status in('draft','approved','published','retired')), reviewer_id uuid references auth.users, approved_at timestamptz, effective_at timestamptz, expires_at timestamptz, source_urls text[] not null default '{}', locales text[] not null default '{en,or}', check(status not in('approved','published') or (reviewer_id is not null and approved_at is not null and cardinality(source_urls)>0)));
create unique index one_published_protocol on private.triage_protocols(status) where status='published';
create table private.triage_questions (id uuid primary key default gen_random_uuid(), protocol_id uuid not null references private.triage_protocols, key text not null, wording_en text not null, wording_or text not null, options jsonb not null, applicability jsonb not null, red_flag boolean not null default false, position int not null, unique(protocol_id,key));
create table private.triage_rules (id uuid primary key default gen_random_uuid(), protocol_id uuid not null references private.triage_protocols, conditions jsonb not null, disposition text not null check(disposition in('emergency','urgent','routine')), capability_codes text[] not null, explanation_codes text[] not null, priority int not null);
create table private.explanation_catalog (code text primary key, text_en text not null, text_or text not null);
create table private.protocol_reviews (id uuid primary key default gen_random_uuid(), protocol_id uuid not null references private.triage_protocols, reviewer_id uuid not null references auth.users, approved boolean not null, evidence jsonb not null, created_at timestamptz not null default now());

create table public.profiles (user_id uuid primary key references auth.users on delete cascade, preferred_language text not null default 'en' check(preferred_language in('en','or')), accessibility_preferences jsonb not null default '{}', created_at timestamptz not null default now());
create table public.saved_care_plans (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, facility_id uuid not null references public.facilities, area_id uuid references public.service_areas, service_code text not null references public.services, consent_at timestamptz not null default now(), created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '90 days');
create index care_plans_owner_idx on public.saved_care_plans(user_id);
create table public.referrals (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, care_plan_id uuid not null references public.saved_care_plans on delete cascade, destination_id uuid not null references public.facilities, status text not null default 'planned' check(status in('planned','departed','arrived','seen','referred_elsewhere','completed','cancelled')), acknowledgment text not null default 'not_connected' check(acknowledgment='not_connected'), created_at timestamptz not null default now(), closed_at timestamptz);
create index referrals_owner_idx on public.referrals(user_id);
create index referrals_plan_idx on public.referrals(care_plan_id);
create table public.referral_events (id uuid primary key default gen_random_uuid(), referral_id uuid not null references public.referrals on delete cascade, user_id uuid not null default auth.uid() references auth.users on delete cascade, status text not null check(status in('planned','departed','arrived','seen','referred_elsewhere','completed','cancelled')), actor_type text not null default 'patient' check(actor_type='patient'), created_at timestamptz not null default now());
create index events_referral_idx on public.referral_events(referral_id);
create index events_owner_idx on public.referral_events(user_id);
create table private.referral_tokens (id uuid primary key default gen_random_uuid(), referral_id uuid not null references public.referrals on delete cascade, token_hash text not null unique, expires_at timestamptz not null default now()+interval '7 days', consumed_at timestamptz, revoked_at timestamptz);
create table public.facility_feedback (id uuid primary key default gen_random_uuid(), user_id uuid default auth.uid() references auth.users on delete set null, facility_id uuid not null references public.facilities, category text not null check(category in('wrong_number','closed','missing_service','stale_hours')), moderation_status text not null default 'pending' check(moderation_status in('pending','reviewed','dismissed')), created_at timestamptz not null default now());
create index feedback_owner_idx on public.facility_feedback(user_id);
create table private.data_quality_signals (id uuid primary key default gen_random_uuid(), facility_id uuid not null references public.facilities, category text not null, report_count int not null default 1, resolved_at timestamptz);

-- Deny by default on every application table, including private tables.
do $$ declare t record; begin for t in select schemaname,tablename from pg_tables where schemaname in('public','private') loop execute format('alter table %I.%I enable row level security',t.schemaname,t.tablename); end loop; end $$;
grant select on public.service_areas,public.services,public.facilities,public.facility_contacts,public.facility_services,public.operating_hours,public.data_sources,public.facility_source_links,public.referral_edges to anon,authenticated;
create policy directory_areas on public.service_areas for select to anon,authenticated using(true);
create policy directory_services on public.services for select to anon,authenticated using(true);
create policy published_facilities on public.facilities for select to anon,authenticated using(data_class='verified_real' and verification_status='published' and valid_until>now());
create policy contacts_read on public.facility_contacts for select to anon,authenticated using(valid_until>now() and exists(select 1 from public.facilities f where f.id=facility_id));
create policy services_read on public.facility_services for select to anon,authenticated using(valid_until>now() and exists(select 1 from public.facilities f where f.id=facility_id));
create policy hours_read on public.operating_hours for select to anon,authenticated using(valid_until>now() and exists(select 1 from public.facilities f where f.id=facility_id));
create policy source_links_read on public.facility_source_links for select to anon,authenticated using(exists(select 1 from public.facilities f where f.id=facility_id));
create policy sources_read on public.data_sources for select to anon,authenticated using(exists(select 1 from public.facility_source_links l where l.source_id=id));
create policy referral_edges_read on public.referral_edges for select to anon,authenticated using(approved and valid_until>now() and exists(select 1 from public.facilities f where f.id=from_facility_id) and exists(select 1 from public.facilities f where f.id=to_facility_id));
grant select,insert,update,delete on public.profiles to authenticated;
create policy profile_owner on public.profiles to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
grant select,delete on public.saved_care_plans,public.referrals,public.facility_feedback to authenticated;
grant insert(facility_id,area_id,service_code) on public.saved_care_plans to authenticated;
create policy plans_read on public.saved_care_plans for select to authenticated using((select auth.uid())=user_id and expires_at>now());
create policy plans_insert on public.saved_care_plans for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.facilities f where f.id=facility_id));
create policy plans_delete on public.saved_care_plans for delete to authenticated using((select auth.uid())=user_id);
create policy referral_read on public.referrals for select to authenticated using((select auth.uid())=user_id);
create policy referral_delete on public.referrals for delete to authenticated using((select auth.uid())=user_id);
grant select on public.referral_events to authenticated;
create policy events_read on public.referral_events for select to authenticated using((select auth.uid())=user_id);
grant insert(facility_id,category) on public.facility_feedback to authenticated;
create policy feedback_read on public.facility_feedback for select to authenticated using((select auth.uid())=user_id);
create policy feedback_insert on public.facility_feedback for insert to authenticated with check((select auth.uid())=user_id and exists(select 1 from public.facilities f where f.id=facility_id));
create policy feedback_delete on public.facility_feedback for delete to authenticated using((select auth.uid())=user_id);

create view api.facility_directory with(security_invoker=true) as select f.id,f.slug,f.name_en,f.name_or,f.address,f.latitude,f.longitude,f.kind,f.data_class,f.verification_status,f.last_verified_at,f.valid_until,
 (select c.phone from public.facility_contacts c where c.facility_id=f.id and c.valid_until>now() order by c.verified_at desc limit 1) phone,
 coalesce((select array_agg(s.service_code) from public.facility_services s where s.facility_id=f.id and s.availability='listed' and s.valid_until>now()),'{}'::text[]) services,
 (select ds.url from public.data_sources ds join public.facility_source_links sl on sl.source_id=ds.id where sl.facility_id=f.id limit 1) source_url
 from public.facilities f;
grant usage on schema api to anon,authenticated;
grant select on api.facility_directory to anon,authenticated;
create function public.search_facilities(p_lat double precision,p_lng double precision,p_service text default null) returns setof api.facility_directory language sql stable security invoker set search_path='' as $$
 select d.* from api.facility_directory d join public.facilities f on f.id=d.id
 where p_lat between 20.12 and 20.42 and p_lng between 85.65 and 85.95 and (p_service is null or p_service=any(d.services))
 order by f.location operator(extensions.<->) extensions.st_setsrid(extensions.st_makepoint(p_lng,p_lat),4326)::extensions.geography limit 30;
$$;
grant execute on function public.search_facilities(double precision,double precision,text) to anon,authenticated;

-- Privileged transition implementation stays outside the Data API schema.
create function private.create_referral(p_plan uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare plan public.saved_care_plans; new_id uuid;
begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 select * into plan from public.saved_care_plans where id=p_plan and user_id=auth.uid() and expires_at>now();
 if not found then raise exception 'PLAN_NOT_FOUND'; end if;
 if not exists(select 1 from public.facilities where id=plan.facility_id and data_class='verified_real' and verification_status='published' and valid_until>now()) then raise exception 'FACILITY_UNAVAILABLE'; end if;
 insert into public.referrals(user_id,care_plan_id,destination_id) values(auth.uid(),p_plan,plan.facility_id) returning id into new_id;
 insert into public.referral_events(referral_id,user_id,status) values(new_id,auth.uid(),'planned');
 return new_id;
end $$;
create function public.create_referral(p_plan uuid) returns uuid language sql security invoker set search_path='' as $$ select private.create_referral(p_plan); $$;
grant execute on function private.create_referral(uuid), public.create_referral(uuid) to authenticated;
create function private.add_referral_event(p_referral uuid,p_status text) returns void language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 if auth.uid() is null then raise exception 'UNAUTHORIZED'; end if;
 select status into current_status from public.referrals where id=p_referral and user_id=auth.uid() for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 if current_status in('completed','cancelled') then raise exception 'REFERRAL_CLOSED'; end if;
 if p_status not in('departed','arrived','seen','referred_elsewhere','completed','cancelled') then raise exception 'INVALID_STATUS'; end if;
 update public.referrals set status=p_status,closed_at=case when p_status in('completed','cancelled') then now() else null end where id=p_referral;
 insert into public.referral_events(referral_id,user_id,status) values(p_referral,auth.uid(),p_status);
end $$;
create function public.add_referral_event(p_referral uuid,p_status text) returns void language sql security invoker set search_path='' as $$ select private.add_referral_event(p_referral,p_status); $$;
grant execute on function private.add_referral_event(uuid,text),public.add_referral_event(uuid,text) to authenticated;

create function private.admin_queue() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not private.has_role(array['data_editor','data_verifier','clinician_reviewer','admin']) then raise exception 'FORBIDDEN'; end if;
 return jsonb_build_object('revisions',(select coalesce(jsonb_agg(r),'[]') from private.facility_revisions r),'feedback',(select coalesce(jsonb_agg(f),'[]') from public.facility_feedback f),'protocols',(select coalesce(jsonb_agg(p),'[]') from private.triage_protocols p));
end $$;
create function public.admin_queue() returns jsonb language sql security invoker set search_path='' as $$ select private.admin_queue(); $$;
grant execute on function private.admin_queue(),public.admin_queue() to authenticated;

-- No invented facilities or clinical protocols are seeded.
insert into public.services values('general','General care','ସାଧାରଣ ଚିକିତ୍ସା'),('maternal','Maternal care','ମାତୃ ସ୍ୱାସ୍ଥ୍ୟ'),('child','Child health','ଶିଶୁ ସ୍ୱାସ୍ଥ୍ୟ'),('emergency','Emergency department','ଜରୁରୀ ବିଭାଗ');
