-- 003_remove_demo_data.sql - undo the seed (schedules and demo emails cascade)
delete from public.facility_practitioners where is_demo;
delete from public.facility_images where rights_basis = 'original_illustration_created_for_project';
delete from public.data_sources where evidence_type = 'demo_synthetic' and not exists (select 1 from public.facility_practitioners where source_id = data_sources.id);
