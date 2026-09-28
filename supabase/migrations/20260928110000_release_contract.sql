-- Application/database compatibility contract. Additive migrations advance
-- schema_contract; destructive cleanup may advance minimum_app_contract later.
create table private.release_contract (
 singleton boolean primary key default true check(singleton),
 schema_contract integer not null check(schema_contract > 0),
 minimum_app_contract integer not null check(minimum_app_contract > 0 and minimum_app_contract <= schema_contract),
 migration_identifier text not null,
 updated_at timestamptz not null default now()
);
alter table private.release_contract enable row level security;
revoke all on private.release_contract from public, anon, authenticated;

insert into private.release_contract(singleton,schema_contract,minimum_app_contract,migration_identifier)
values(true,1,1,'20260928110000_release_contract');

create or replace function public.release_contract()
returns jsonb
language sql
stable
security definer
set search_path=''
as $$
 select jsonb_build_object(
  'schema_contract', schema_contract,
  'minimum_app_contract', minimum_app_contract,
  'migration_identifier', migration_identifier,
  'updated_at', updated_at
 )
 from private.release_contract
 where singleton;
$$;

revoke all on function public.release_contract() from public;
grant execute on function public.release_contract() to anon, authenticated, service_role;
