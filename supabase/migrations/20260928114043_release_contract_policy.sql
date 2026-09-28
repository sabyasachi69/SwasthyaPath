create policy deny_direct_release_contract on private.release_contract
 for all to public using(false) with check(false);
