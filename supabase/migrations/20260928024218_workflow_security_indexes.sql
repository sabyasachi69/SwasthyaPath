-- Follow-up migration for clinician-controlled protocols, maker-checker
-- publication, one-time referral sharing, and advisor-recommended indexes.

create or replace function private.active_protocol() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',p.id,'version',p.version,'expires_at',p.expires_at,'questions',coalesce((select jsonb_agg(q order by q.position) from private.triage_questions q where q.protocol_id=p.id),'[]'),'rules',coalesce((select jsonb_agg(r order by r.priority desc) from private.triage_rules r where r.protocol_id=p.id),'[]'))
 from private.triage_protocols p where p.status='published' and p.approved_at is not null and p.reviewer_id is not null and p.effective_at<=now() and p.expires_at>now() limit 1;
$$;
-- This narrow exception exposes only an already-approved protocol snapshot.
grant usage on schema private to anon;
grant execute on function private.active_protocol() to anon,authenticated;
create or replace function public.active_protocol() returns jsonb language sql stable security invoker set search_path='' as $$select private.active_protocol();$$;
grant execute on function public.active_protocol() to anon,authenticated;

create or replace function private.submit_revision(p_facility uuid,p_snapshot jsonb,p_reason text,p_evidence text) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not private.has_role(array['data_editor','admin']) then raise exception 'FORBIDDEN'; end if;
 if p_evidence !~ '^https://' or length(p_reason)<10 or not(p_snapshot ?& array['name_en','name_or','address','kind','latitude','longitude']) then raise exception 'INVALID_REVISION'; end if;
 insert into private.facility_revisions(facility_id,author_id,snapshot,reason,evidence_url,state) values(p_facility,auth.uid(),p_snapshot,p_reason,p_evidence,'submitted') returning id into result;
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'revision.submitted',result);
 return result;
end $$;
create or replace function public.submit_revision(p_facility uuid,p_snapshot jsonb,p_reason text,p_evidence text) returns uuid language sql security invoker set search_path='' as $$select private.submit_revision(p_facility,p_snapshot,p_reason,p_evidence);$$;
grant execute on function private.submit_revision(uuid,jsonb,text,text),public.submit_revision(uuid,jsonb,text,text) to authenticated;

create or replace function private.review_revision(p_revision uuid,p_approve boolean,p_checklist jsonb) returns void language plpgsql security definer set search_path='' as $$
declare revision private.facility_revisions;
begin
 if not private.has_role(array['data_verifier','admin']) then raise exception 'FORBIDDEN'; end if;
 select * into revision from private.facility_revisions where id=p_revision for update;
 if not found or revision.state<>'submitted' then raise exception 'INVALID_STATE'; end if;
 if revision.author_id=auth.uid() then raise exception 'SELF_APPROVAL_DENIED'; end if;
 if p_approve and not(p_checklist @> '{"contact":true,"location":true,"source":true,"translation":true}') then raise exception 'CHECKLIST_INCOMPLETE'; end if;
 insert into private.verification_reviews(revision_id,reviewer_id,approved,checklist) values(p_revision,auth.uid(),p_approve,p_checklist);
 update private.facility_revisions set state=case when p_approve then 'approved' else 'rejected' end where id=p_revision;
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'revision.reviewed',p_revision);
end $$;
create or replace function public.review_revision(p_revision uuid,p_approve boolean,p_checklist jsonb) returns void language sql security invoker set search_path='' as $$select private.review_revision(p_revision,p_approve,p_checklist);$$;
grant execute on function private.review_revision(uuid,boolean,jsonb),public.review_revision(uuid,boolean,jsonb) to authenticated;

create or replace function private.publish_revision(p_revision uuid) returns void language plpgsql security definer set search_path='' as $$
declare revision private.facility_revisions; evidence uuid;
begin
 if not private.has_role(array['data_verifier','admin']) then raise exception 'FORBIDDEN'; end if;
 select * into revision from private.facility_revisions where id=p_revision for update;
 if not found or revision.state<>'approved' or revision.author_id=auth.uid() then raise exception 'INVALID_STATE'; end if;
 if not exists(select 1 from private.verification_reviews where revision_id=p_revision and approved and reviewer_id<>revision.author_id) then raise exception 'APPROVAL_REQUIRED'; end if;
 update public.facilities set name_en=revision.snapshot->>'name_en',name_or=revision.snapshot->>'name_or',address=revision.snapshot->>'address',kind=revision.snapshot->>'kind',latitude=(revision.snapshot->>'latitude')::double precision,longitude=(revision.snapshot->>'longitude')::double precision,data_class='verified_real',verification_status='published',last_verified_at=now(),valid_until=now()+interval '90 days',published_revision_id=p_revision where id=revision.facility_id and data_class<>'demo';
 if not found then raise exception 'FACILITY_NOT_FOUND'; end if;
 insert into public.data_sources(url,owner,evidence_type) values(revision.evidence_url,'Verification team','verified_source') returning id into evidence;
 insert into public.facility_source_links(facility_id,source_id,field_name) values(revision.facility_id,evidence,'identity');
 update private.facility_revisions set state='published' where id=p_revision;
 insert into private.publication_events(revision_id,actor_id) values(p_revision,auth.uid());
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'facility.published',revision.facility_id);
end $$;
create or replace function public.publish_revision(p_revision uuid) returns void language sql security invoker set search_path='' as $$select private.publish_revision(p_revision);$$;
grant execute on function private.publish_revision(uuid),public.publish_revision(uuid) to authenticated;

create or replace function private.create_share(p_referral uuid,p_hash text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.referrals where id=p_referral and user_id=auth.uid()) then raise exception 'FORBIDDEN'; end if;
 if p_hash !~ '^[a-f0-9]{64}$' then raise exception 'INVALID_HASH'; end if;
 update private.referral_tokens set revoked_at=now() where referral_id=p_referral and revoked_at is null;
 insert into private.referral_tokens(referral_id,token_hash) values(p_referral,p_hash);
end $$;
create or replace function public.create_share(p_referral uuid,p_hash text) returns void language sql security invoker set search_path='' as $$select private.create_share(p_referral,p_hash);$$;
grant execute on function private.create_share(uuid,text),public.create_share(uuid,text) to authenticated;

create or replace function private.revoke_share(p_referral uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.referrals where id=p_referral and user_id=auth.uid()) then raise exception 'FORBIDDEN'; end if;
 update private.referral_tokens set revoked_at=now() where referral_id=p_referral;
end $$;
create or replace function public.revoke_share(p_referral uuid) returns void language sql security invoker set search_path='' as $$select private.revoke_share(p_referral);$$;
grant execute on function private.revoke_share(uuid),public.revoke_share(uuid) to authenticated;

create or replace function private.consume_share(p_hash text) returns jsonb language plpgsql security definer set search_path='' as $$
declare ref uuid; result jsonb;
begin
 update private.referral_tokens set consumed_at=now() where token_hash=p_hash and consumed_at is null and revoked_at is null and expires_at>now() returning referral_id into ref;
 if ref is null then raise exception 'LINK_UNAVAILABLE'; end if;
 select jsonb_build_object('facility',f.name_en,'address',f.address,'service',p.service_code,'status',r.status,'acknowledgment','not_connected') into result from public.referrals r join public.saved_care_plans p on p.id=r.care_plan_id join public.facilities f on f.id=r.destination_id where r.id=ref and p.expires_at>now();
 if result is null then raise exception 'LINK_UNAVAILABLE'; end if;
 return result;
end $$;
-- The bearer token is high entropy; atomic consumption prevents replay.
grant execute on function private.consume_share(text) to anon,authenticated;
create or replace function public.consume_share(p_hash text) returns jsonb language sql security invoker set search_path='' as $$select private.consume_share(p_hash);$$;
grant execute on function public.consume_share(text) to anon,authenticated;

-- Cover every foreign key used for joins, cascades, or RLS predicates.
create index facility_contacts_facility_idx on public.facility_contacts(facility_id);
create index facility_contacts_source_idx on public.facility_contacts(source_id);
create index facility_services_service_idx on public.facility_services(service_code);
create index facility_services_source_idx on public.facility_services(source_id);
create index operating_hours_facility_idx on public.operating_hours(facility_id);
create index operating_hours_service_idx on public.operating_hours(service_code);
create index operating_hours_source_idx on public.operating_hours(source_id);
create index facility_source_links_source_idx on public.facility_source_links(source_id);
create index referral_edges_from_idx on public.referral_edges(from_facility_id);
create index referral_edges_to_idx on public.referral_edges(to_facility_id);
create index referral_edges_service_idx on public.referral_edges(service_code);
create index referral_edges_source_idx on public.referral_edges(source_id);
create index facility_revisions_facility_idx on private.facility_revisions(facility_id);
create index facility_revisions_author_idx on private.facility_revisions(author_id);
create index verification_reviews_reviewer_idx on private.verification_reviews(reviewer_id);
create index publication_events_revision_idx on private.publication_events(revision_id);
create index publication_events_actor_idx on private.publication_events(actor_id);
create index publication_events_rollback_idx on private.publication_events(rollback_of);
create index triage_protocols_reviewer_idx on private.triage_protocols(reviewer_id);
create index triage_rules_protocol_idx on private.triage_rules(protocol_id);
create index protocol_reviews_protocol_idx on private.protocol_reviews(protocol_id);
create index protocol_reviews_reviewer_idx on private.protocol_reviews(reviewer_id);
create index care_plans_facility_idx on public.saved_care_plans(facility_id);
create index care_plans_area_idx on public.saved_care_plans(area_id);
create index care_plans_service_idx on public.saved_care_plans(service_code);
create index referrals_destination_idx on public.referrals(destination_id);
create index referral_tokens_referral_idx on private.referral_tokens(referral_id);
create index feedback_facility_idx on public.facility_feedback(facility_id);
create index quality_signals_facility_idx on private.data_quality_signals(facility_id);

-- Private tables are intentionally unreachable through Data API roles. Explicit
-- deny policies make that intent testable and silence "RLS without policy" lint.
do $$
declare t text;
begin
 for t in select tablename from pg_tables where schemaname='private' loop
  execute format('create policy %I on private.%I for all to public using (false) with check (false)', 'deny_direct_' || t, t);
 end loop;
end $$;
