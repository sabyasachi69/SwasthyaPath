alter table private.triage_protocols add column author_id uuid references auth.users;
create index triage_protocols_author_idx on private.triage_protocols(author_id);

create or replace function private.active_protocol() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object(
  'id',p.id,
  'version',p.version,
  'expires_at',p.expires_at,
  'questions',coalesce((select jsonb_agg(q order by q.position) from private.triage_questions q where q.protocol_id=p.id),'[]'),
  'rules',coalesce((select jsonb_agg(r order by r.priority desc) from private.triage_rules r where r.protocol_id=p.id),'[]'),
  'explanations',coalesce((select jsonb_object_agg(e.code,jsonb_build_object('en',e.text_en,'or',e.text_or)) from private.explanation_catalog e),'{}')
 )
 from private.triage_protocols p
 where p.status='published' and p.approved_at is not null and p.reviewer_id is not null
  and p.effective_at<=now() and p.expires_at>now()
 limit 1;
$$;

create function private.create_facility_draft(p_slug text,p_snapshot jsonb,p_reason text,p_evidence text) returns uuid language plpgsql security definer set search_path='' as $$
declare facility_id uuid;
begin
 if not private.has_role(array['data_editor','admin']) then raise exception 'FORBIDDEN'; end if;
 if p_slug !~ '^[a-z0-9-]+$' or p_evidence !~ '^https://' or length(p_reason)<10
  or not(p_snapshot ?& array['name_en','name_or','address','kind','latitude','longitude']) then raise exception 'INVALID_DRAFT'; end if;
 insert into public.facilities(slug,name_en,name_or,address,kind,latitude,longitude,data_class,verification_status)
 values(p_slug,p_snapshot->>'name_en',p_snapshot->>'name_or',p_snapshot->>'address',p_snapshot->>'kind',(p_snapshot->>'latitude')::double precision,(p_snapshot->>'longitude')::double precision,'submitted_unverified','draft')
 returning id into facility_id;
 insert into private.facility_revisions(facility_id,author_id,snapshot,reason,evidence_url,state)
 values(facility_id,auth.uid(),p_snapshot,p_reason,p_evidence,'submitted');
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'facility.draft_created',facility_id);
 return facility_id;
end $$;
create function public.create_facility_draft(p_slug text,p_snapshot jsonb,p_reason text,p_evidence text) returns uuid language sql security invoker set search_path='' as $$select private.create_facility_draft(p_slug,p_snapshot,p_reason,p_evidence);$$;
grant execute on function private.create_facility_draft(text,jsonb,text,text),public.create_facility_draft(text,jsonb,text,text) to authenticated;

create function private.restore_publication(p_publication uuid,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare event private.publication_events; revision private.facility_revisions;
begin
 if not private.has_role(array['admin']) then raise exception 'FORBIDDEN'; end if;
 if length(p_reason)<10 then raise exception 'REASON_REQUIRED'; end if;
 select * into event from private.publication_events where id=p_publication;
 if not found then raise exception 'NOT_FOUND'; end if;
 select * into revision from private.facility_revisions where id=event.revision_id;
 update public.facilities set name_en=revision.snapshot->>'name_en',name_or=revision.snapshot->>'name_or',address=revision.snapshot->>'address',kind=revision.snapshot->>'kind',latitude=(revision.snapshot->>'latitude')::double precision,longitude=(revision.snapshot->>'longitude')::double precision,last_verified_at=now(),valid_until=now()+interval '30 days',published_revision_id=revision.id where id=revision.facility_id and data_class='verified_real';
 if not found then raise exception 'FACILITY_NOT_FOUND'; end if;
 insert into private.publication_events(revision_id,actor_id,rollback_of) values(revision.id,auth.uid(),event.id);
 insert into private.audit_events(actor_id,action,entity_id,details) values(auth.uid(),'facility.restored',revision.facility_id,jsonb_build_object('reason',p_reason,'publication',p_publication));
end $$;
create function public.restore_publication(p_publication uuid,p_reason text) returns void language sql security invoker set search_path='' as $$select private.restore_publication(p_publication,p_reason);$$;
grant execute on function private.restore_publication(uuid,text),public.restore_publication(uuid,text) to authenticated;

create function private.submit_protocol(p_version text,p_expires_at timestamptz,p_source_urls text[],p_questions jsonb,p_rules jsonb,p_explanations jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare protocol_id uuid; item jsonb;
begin
 if not private.has_role(array['data_editor','clinician_reviewer','admin']) then raise exception 'FORBIDDEN'; end if;
 if p_version !~ '^[a-zA-Z0-9._-]{3,40}$' or p_expires_at<=now()+interval '7 days'
  or cardinality(p_source_urls)=0 or exists(select 1 from unnest(p_source_urls) u where u !~ '^https://')
  or jsonb_typeof(p_questions)<>'array' or jsonb_array_length(p_questions)=0
  or jsonb_typeof(p_rules)<>'array' or jsonb_array_length(p_rules)=0
  or jsonb_typeof(p_explanations)<>'array' then raise exception 'INVALID_PROTOCOL'; end if;
 insert into private.triage_protocols(version,status,expires_at,source_urls,author_id) values(p_version,'draft',p_expires_at,p_source_urls,auth.uid()) returning id into protocol_id;
 for item in select value from jsonb_array_elements(p_questions) loop
  insert into private.triage_questions(protocol_id,key,wording_en,wording_or,options,applicability,red_flag,position)
  values(protocol_id,item->>'key',item->>'wording_en',item->>'wording_or',item->'options',coalesce(item->'applicability','{}'),coalesce((item->>'red_flag')::boolean,false),(item->>'position')::int);
 end loop;
 for item in select value from jsonb_array_elements(p_explanations) loop
  insert into private.explanation_catalog(code,text_en,text_or) values(item->>'code',item->>'text_en',item->>'text_or')
  on conflict(code) do update set text_en=excluded.text_en,text_or=excluded.text_or;
 end loop;
 for item in select value from jsonb_array_elements(p_rules) loop
  insert into private.triage_rules(protocol_id,conditions,disposition,capability_codes,explanation_codes,priority)
  values(protocol_id,item->'conditions',item->>'disposition',array(select jsonb_array_elements_text(item->'capability_codes')),array(select jsonb_array_elements_text(item->'explanation_codes')),(item->>'priority')::int);
 end loop;
 if exists(select 1 from private.triage_rules r,unnest(r.capability_codes) c where r.protocol_id=protocol_id and not exists(select 1 from public.services s where s.code=c)) then raise exception 'UNKNOWN_CAPABILITY'; end if;
 if exists(select 1 from private.triage_rules r,unnest(r.explanation_codes) c where r.protocol_id=protocol_id and not exists(select 1 from private.explanation_catalog e where e.code=c)) then raise exception 'UNKNOWN_EXPLANATION'; end if;
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'protocol.submitted',protocol_id);
 return protocol_id;
end $$;
create function public.submit_protocol(p_version text,p_expires_at timestamptz,p_source_urls text[],p_questions jsonb,p_rules jsonb,p_explanations jsonb) returns uuid language sql security invoker set search_path='' as $$select private.submit_protocol(p_version,p_expires_at,p_source_urls,p_questions,p_rules,p_explanations);$$;
grant execute on function private.submit_protocol(text,timestamptz,text[],jsonb,jsonb,jsonb),public.submit_protocol(text,timestamptz,text[],jsonb,jsonb,jsonb) to authenticated;

create function private.publish_protocol(p_protocol uuid,p_evidence jsonb) returns void language plpgsql security definer set search_path='' as $$
declare protocol private.triage_protocols;
begin
 if not private.has_role(array['clinician_reviewer']) then raise exception 'FORBIDDEN'; end if;
 select * into protocol from private.triage_protocols where id=p_protocol for update;
 if not found or protocol.status<>'draft' or protocol.author_id=auth.uid() then raise exception 'INVALID_STATE'; end if;
 if coalesce(length(p_evidence->>'reviewer_registration'),0)<4 or not coalesce((p_evidence->>'all_cases_reviewed')::boolean,false) then raise exception 'REVIEW_INCOMPLETE'; end if;
 update private.triage_protocols set status='retired' where status='published';
 update private.triage_protocols set status='published',reviewer_id=auth.uid(),approved_at=now(),effective_at=now() where id=p_protocol;
 insert into private.protocol_reviews(protocol_id,reviewer_id,approved,evidence) values(p_protocol,auth.uid(),true,p_evidence);
 insert into private.audit_events(actor_id,action,entity_id) values(auth.uid(),'protocol.published',p_protocol);
end $$;
create function public.publish_protocol(p_protocol uuid,p_evidence jsonb) returns void language sql security invoker set search_path='' as $$select private.publish_protocol(p_protocol,p_evidence);$$;
grant execute on function private.publish_protocol(uuid,jsonb),public.publish_protocol(uuid,jsonb) to authenticated;
