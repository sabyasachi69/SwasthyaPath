create temporary table _directory_import on commit drop as
select * from jsonb_to_recordset($data$
[
{"id":"45b753b8-3d63-5def-89da-09c588165cc8","slug":"aiims-bhubaneswar","name_en":"AIIMS Bhubaneswar","kind":"Hospital","ownership":"government","address":"Sijua, Patrapada, Bhubaneswar","pincode":"751019","latitude":20.231,"longitude":85.774,"phone":null,"phone_alt":null,"website":null,"source_url":"https://aiimsbhubaneswar.nic.in/wp-content/uploads/2025/05/Telephone-Directory.pdf"},
{"id":"d7fa0cef-61f2-5f45-b07c-ce352865eb74","slug":"capital-hospital-pgimer-and-capital-hospital","name_en":"Capital Hospital (PGIMER and Capital Hospital)","kind":"Hospital","ownership":"government","address":"Capital Hospital, Udyan Marg, Unit 6, Ganga Nagar, Bhubaneswar","pincode":"751001","latitude":20.266,"longitude":85.836,"phone":"+91-9437349049","phone_alt":"+91-9437112454","website":null,"source_url":"https://www.publicservicesmap.in/hospitals/centre/pgimer-and-capital-hospitalbhubaneswar-khordha-odisha-hosp21g25198671"},
{"id":"06bd94f8-def1-55b8-9f6b-e0d1b6287d96","slug":"kims-bhubaneswar-kalinga-institute-of-medical-sciences","name_en":"KIMS Bhubaneswar (Kalinga Institute of Medical Sciences)","kind":"Hospital","ownership":"private","address":"Kushabhadra Campus (KIIT Campus-5), Patia, Bhubaneswar","pincode":"751024","latitude":20.354,"longitude":85.817,"phone":"+91-674-7111000","phone_alt":"+91-674-7111333","website":"https://kims.kiit.ac.in","source_url":"https://kims.kiit.ac.in/?p=2526"},
{"id":"496a6796-b158-5a71-8d5a-58bed039591d","slug":"ims-sum-hospital","name_en":"IMS & SUM Hospital","kind":"Hospital","ownership":"private","address":"K-8, Kalinga Nagar, Ghatikia, Bhubaneswar","pincode":"751003","latitude":20.282,"longitude":85.775,"phone":"+91-674-2386992","phone_alt":null,"website":null,"source_url":"https://www.zurichkotak.com/network-locator/cashless-hospitals/bhubaneswar/institute-of-medical-science-and-sum-hospital"},
{"id":"4ea0f953-cd3a-5a82-9562-ae6f91e4b058","slug":"manipal-hospitals-bhubaneswar","name_en":"Manipal Hospitals Bhubaneswar","kind":"Hospital","ownership":"private","address":"Plot No. 1, Khandagiri, Bhubaneswar","pincode":"751030","latitude":20.259,"longitude":85.781,"phone":"+91-674-6666666","phone_alt":"+91-674-6666600","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"e92c5157-0e48-597f-bb82-f08e5abc204b","slug":"care-hospitals-bhubaneswar","name_en":"CARE Hospitals Bhubaneswar","kind":"Hospital","ownership":"private","address":"Plot No. 324(P), Prachi Enclave, Chandrasekharpur, Bhubaneswar","pincode":"751014","latitude":20.325,"longitude":85.82,"phone":"+91-674-3021999","phone_alt":null,"website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"b3f4eb47-4bfa-5a46-afe9-8f89f36294a4","slug":"apollo-hospitals-bhubaneswar","name_en":"Apollo Hospitals Bhubaneswar","kind":"Hospital","ownership":"private","address":"Plot No. 251, Sainik School Road, Unit-15, Bhubaneswar","pincode":"751005","latitude":20.29,"longitude":85.83,"phone":"+91-674-6661016","phone_alt":null,"website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"ebafe27d-f1d1-5330-a094-c4c287630920","slug":"kalinga-hospital","name_en":"Kalinga Hospital","kind":"Hospital","ownership":"private","address":"Chandrasekharpur, Bhubaneswar","pincode":"751023","latitude":20.32,"longitude":85.822,"phone":"+91-674-2300570","phone_alt":"+91-674-2300997","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"184f017f-e584-5a29-a81d-affbf980f42c","slug":"utkal-hospital","name_en":"Utkal Hospital","kind":"Hospital","ownership":"private","address":"Plot No. C/3, Niladri Vihar, Chandrasekharpur, Bhubaneswar","pincode":"751021","latitude":20.322,"longitude":85.823,"phone":"+91-674-2651200","phone_alt":"+91-6370704001","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"f567b5e3-a19e-5f05-b366-5e38f267a1ac","slug":"neelachal-hospital","name_en":"Neelachal Hospital","kind":"Small hospital","ownership":"private","address":"Kharvel Nagar, Unit III, Bhubaneswar","pincode":"751001","latitude":20.266,"longitude":85.841,"phone":"+91-674-2536590","phone_alt":"+91-674-2536591","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"afc68c44-2cce-5c79-9f84-7d419ccb77a1","slug":"kar-clinic-hospital","name_en":"Kar Clinic & Hospital","kind":"Small hospital","ownership":"private","address":"Unit-IV, Bhubaneswar","pincode":"751001","latitude":20.27,"longitude":85.84,"phone":"+91-674-2516666","phone_alt":"+91-674-2518888","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"fa888244-69bd-54ad-bba0-033a9b02aea1","slug":"dr-mohan-s-diabetes-specialities-centre","name_en":"Dr. Mohan's Diabetes Specialities Centre","kind":"Clinic","ownership":"private","address":"Crescent Tower, Plot No. 476 & 477, Bomikhal, Opp. Durga Mandap, Cuttack Road, Bhubaneswar","pincode":"751010","latitude":20.27,"longitude":85.852,"phone":"+91-674-2549268","phone_alt":"+91-9776848279","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"fafa067d-20cf-5af4-8dbb-d9e07ab6a4b5","slug":"asg-eye-hospital","name_en":"ASG Eye Hospital","kind":"Eye hospital","ownership":"private","address":"Plot No. 493/1629, Near Shriya Talkies, Kharvela Nagar, Bhubaneswar","pincode":"751001","latitude":20.265,"longitude":85.841,"phone":"+91-7992533535","phone_alt":"+91-8895789377","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"9e56541d-e126-5417-9b8d-d4944ab3613e","slug":"bhubaneswar-eye-institute-lv-prasad-eye-institute","name_en":"Bhubaneswar Eye Institute (LV Prasad Eye Institute)","kind":"Eye hospital","ownership":"private","address":"Patia, Bhubaneswar","pincode":"751024","latitude":20.348,"longitude":85.819,"phone":"+91-674-2653130","phone_alt":null,"website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"cd13a459-887a-5f04-9305-0d0b89968a9b","slug":"thyrocare-bapuji-nagar","name_en":"Thyrocare Bapuji Nagar","kind":"Diagnostic lab","ownership":"private","address":"Bapuji Nagar, Bhubaneswar","pincode":"751009","latitude":20.265,"longitude":85.829,"phone":"+91-8042303326","phone_alt":null,"website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"55d0efe3-1955-55e9-8c36-5e9b5c8162bc","slug":"dental-clinic-orthodontic-centre","name_en":"Dental Clinic & Orthodontic Centre","kind":"Dental clinic","ownership":"private","address":"Shop No. 12, 2nd Floor, Deen Dayal Bhawan, Station Square, Bhubaneswar","pincode":"751001","latitude":20.268,"longitude":85.843,"phone":"+91-9437015411","phone_alt":"+91-674-2577050","website":null,"source_url":"https://hudco.org.in/writereaddata/hospitals-buro.pdf"},
{"id":"a4f5ba50-2566-500b-8d24-0908b6c71a79","slug":"apollo-pharmacy-n6-irc-village","name_en":"Apollo Pharmacy N6 IRC Village","kind":"Pharmacy","ownership":"private","address":"Khata No 1426/1487, Plot No 1980, Unit 16, Jaydev Vihar, N6 IRC Village, PS Nayapalli, Bhubaneswar","pincode":"751012","latitude":20.302,"longitude":85.82,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/Bhubaneshwar"},
{"id":"a7b43dd4-99a9-5ab2-9e40-87c9f01fc91d","slug":"apollo-pharmacy-immt-dispensary","name_en":"Apollo Pharmacy IMMT Dispensary","kind":"Pharmacy","ownership":"private","address":"IMMT, Acharya Vihar, Bhubaneswar","pincode":"751013","latitude":20.296,"longitude":85.822,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/Bhubaneshwar"},
{"id":"08b33c80-4238-5cdb-800c-ad5ac5b673e6","slug":"apollo-pharmacy-panchasakha-nagar","name_en":"Apollo Pharmacy Panchasakha Nagar","kind":"Pharmacy","ownership":"private","address":"Plot No 710/2025, Dumuduma Phase-4, PS Khandagiri, Bhubaneswar","pincode":"751019","latitude":20.262,"longitude":85.795,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/Bhubaneshwar"},
{"id":"fdd3c733-d57b-5c6a-a3c2-b4c12c8c4261","slug":"apollo-pharmacy-bjb-nagar","name_en":"Apollo Pharmacy BJB Nagar","kind":"Pharmacy","ownership":"private","address":"Plot No. A/88, BJB Nagar, Near BJEM School, Bhubaneswar","pincode":"751014","latitude":20.264,"longitude":85.834,"phone":"+91-7328841636","phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"39a0994f-cd08-5355-bf69-11d33c62487a","slug":"apollo-pharmacy-kesura-road","name_en":"Apollo Pharmacy Kesura Road","kind":"Pharmacy","ownership":"private","address":"Plot No. 2366, Khata No. 154, Kesura Road, Jharpada, PS Laxmisagar, Bhubaneswar","pincode":"751006","latitude":20.278,"longitude":85.853,"phone":"+91-8114398663","phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/khordha/apollo_pharmacy_kesura_road-bhubaneswar-17478"},
{"id":"701c0684-f688-5c3e-884d-6b1f3e127901","slug":"apollo-pharmacy-badagada-canal-road","name_en":"Apollo Pharmacy Badagada Canal Road","kind":"Pharmacy","ownership":"private","address":"Plot No. 1685/4021, Badagada Canal Road, Laxmisagar, Bhubaneswar","pincode":"751006","latitude":20.276,"longitude":85.841,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"4c3dd58d-057a-5c56-a4c2-716f030aaca5","slug":"apollo-pharmacy-badagada-brit-colony","name_en":"Apollo Pharmacy Badagada BRIT Colony","kind":"Pharmacy","ownership":"private","address":"House No. EB-3, BRIT Colony, Badagada, Bhubaneswar","pincode":"751018","latitude":20.285,"longitude":85.842,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"44c72d2d-bce0-5872-a659-5799799bf692","slug":"apollo-pharmacy-vivekananda-marg","name_en":"Apollo Pharmacy Vivekananda Marg","kind":"Pharmacy","ownership":"private","address":"Shop No. 2, Harapriya Apartment, Vivekananda Marg, Bhubaneswar","pincode":null,"latitude":20.283,"longitude":85.843,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"8a7d0a0f-5a52-5ab6-b5a0-e0e9bd87f23a","slug":"apollo-pharmacy-ratha-road-old-town","name_en":"Apollo Pharmacy Ratha Road Old Town","kind":"Pharmacy","ownership":"private","address":"Ground Floor, Ratha Road, Gautam Nagar, Old Town, Bhubaneswar","pincode":"751002","latitude":20.238,"longitude":85.843,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"37c0241e-51d5-5b79-ba99-5f5cb76c91d4","slug":"apollo-pharmacy-laxmisagar-chhak","name_en":"Apollo Pharmacy Laxmisagar Chhak","kind":"Pharmacy","ownership":"private","address":"Shop No. 1, Plot No. 301, Laxmisagar Chhak, Budheswari, Bhubaneswar","pincode":"751006","latitude":20.273,"longitude":85.848,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/bhubaneswar/apollo_pharmacy_bjb_nagar-16385"},
{"id":"83056ac4-95eb-52ca-9870-e389a4a0479e","slug":"apollo-pharmacy-mangaraj-point-kesora-chhak","name_en":"Apollo Pharmacy Mangaraj Point Kesora Chhak","kind":"Pharmacy","ownership":"private","address":"Plot No. 1970, Mangaraj Point, Kesora Chhak, Jharpada, Bhubaneswar","pincode":"751006","latitude":20.279,"longitude":85.854,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/khordha/apollo_pharmacy_kesura_road-bhubaneswar-17478"},
{"id":"41b297cf-4a11-58f9-b1a0-1a272d172403","slug":"apollo-pharmacy-jagannath-nagar-road-no-1","name_en":"Apollo Pharmacy Jagannath Nagar Road No. 1","kind":"Pharmacy","ownership":"private","address":"Plot No. 105/3559, Road No. 1, Jagannath Nagar, Jharpada, Bhubaneswar","pincode":"751025","latitude":20.281,"longitude":85.86,"phone":null,"phone_alt":null,"website":null,"source_url":"https://www.apollopharmacy.in/medical-stores/khordha/apollo_pharmacy_kesura_road-bhubaneswar-17478"}
]$data$::jsonb) as row(
 id uuid,slug text,name_en text,kind text,ownership text,address text,pincode text,
 latitude double precision,longitude double precision,phone text,phone_alt text,
 website text,source_url text
);

insert into public.facilities(
 id,slug,name_en,name_or,address,latitude,longitude,kind,ownership,data_class,
 verification_status,last_verified_at,valid_until,pincode,website,coord_quality
)
select id,slug,name_en,name_en,address,latitude,longitude,kind,ownership,'verified_real',
 'published','2026-09-28T00:00:00+05:30','2027-03-28T00:00:00+05:30',pincode,website,
 'Approximate locality-level pin; use directions and confirm before travel.'
from _directory_import
on conflict(id) do update set
 slug=excluded.slug,name_en=excluded.name_en,name_or=excluded.name_or,address=excluded.address,
 latitude=excluded.latitude,longitude=excluded.longitude,kind=excluded.kind,ownership=excluded.ownership,
 data_class=excluded.data_class,verification_status=excluded.verification_status,
 last_verified_at=excluded.last_verified_at,valid_until=excluded.valid_until,
 pincode=excluded.pincode,website=excluded.website,coord_quality=excluded.coord_quality;

insert into public.data_sources(id,url,owner,retrieved_at,evidence_type,public_note)
select distinct on(source_url) md5(source_url)::uuid,source_url,
 regexp_replace(source_url,'^https?://([^/]+).*$','\1'),
 '2026-09-28T00:00:00+05:30','directory_source','Source supplied with the Bhubaneswar directory import.'
from _directory_import
where source_url is not null
on conflict(id) do update set retrieved_at=excluded.retrieved_at,public_note=excluded.public_note;

insert into public.facility_source_links(facility_id,source_id,field_name)
select id,md5(source_url)::uuid,'directory_profile' from _directory_import where source_url is not null
on conflict do nothing;

insert into public.facility_contacts(id,facility_id,phone,contact_type,source_id,verified_at,valid_until)
select md5(id::text || ':' || phone)::uuid,id,phone,'main',md5(source_url)::uuid,
 '2026-09-28T00:00:00+05:30','2027-03-28T00:00:00+05:30'
from _directory_import where phone is not null and source_url is not null
on conflict(id) do update set phone=excluded.phone,valid_until=excluded.valid_until;

insert into public.facility_contacts(id,facility_id,phone,contact_type,source_id,verified_at,valid_until)
select md5(id::text || ':' || phone_alt)::uuid,id,phone_alt,'alternate',md5(source_url)::uuid,
 '2026-09-28T00:00:00+05:30','2027-03-28T00:00:00+05:30'
from _directory_import where phone_alt is not null and source_url is not null
on conflict(id) do update set phone=excluded.phone,valid_until=excluded.valid_until;

insert into private.audit_events(action,details)
values('directory.csv_imported',jsonb_build_object('source','bhubaneswar_facilities.csv','records',(select count(*) from _directory_import)));
