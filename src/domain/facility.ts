export type Lang = 'en' | 'or';
export type Practitioner = {
  id: string;
  display_name: string;
  specialization: string;
  qualification: string;
  is_demo?: boolean;
  demo_label?: string | null;
  department_group?: string | null;
  sub_specialty?: string | null;
  designation?: string | null;
  experience_years?: number | null;
  languages?: string[] | null;
  consultation_fee_inr?: number | null;
  photo_path?: string | null;
};

export type PractitionerSchedule = {
  weekday: number;
  starts: string;
  ends: string;
  activity: string;
  location: string | null;
};

export type PractitionerAvailability = {
  current_status: string;
  current_location: string | null;
  current_until: string | null;
  next_opd_at: string | null;
  next_opd_location: string | null;
};

export type PractitionerProfile = Practitioner & {
  email: string | null;
  availability: PractitionerAvailability | null;
  schedule: PractitionerSchedule[];
};

export type Facility = {
  id: string;
  slug: string;
  name_en: string;
  name_or: string;
  address: string;
  locality?: string | null;
  pincode?: string | null;
  latitude: number;
  longitude: number;
  kind: string;
  ownership?: string;
  website?: string | null;
  coord_quality?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  data_class: 'verified_real' | 'demo' | 'submitted_unverified';
  verification_status: string;
  last_verified_at: string | null;
  valid_until: string | null;
  phone: string | null;
  services: string[];
  source_url: string | null;
  practitioners?: Practitioner[];
  distance_km?: number;
  reasons?: string[];
};
export function distanceKm(a:{lat:number;lng:number}, b:{lat:number;lng:number}) { const r=Math.PI/180; const dlat=(b.lat-a.lat)*r, dlng=(b.lng-a.lng)*r; const h=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlng/2)**2; return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); }
export function rankFacilities(rows:Facility[], location:{lat:number;lng:number}, service?:string, now=Date.now()) { return rows.filter(f=>f.data_class==='verified_real'&&f.verification_status==='published'&&!!f.valid_until&&Date.parse(f.valid_until)>now).filter(f=>!service||f.services.includes(service)).map(f=>({...f,distance_km:distanceKm(location,{lat:f.latitude,lng:f.longitude}),reasons:[service?'Requested service listed':'Nearby directory listing','Straight-line distance; road time not known']})).sort((a,b)=>a.distance_km-b.distance_km||a.id.localeCompare(b.id)); }
export function inBhubaneswar(lat:number,lng:number) { return lat>=20.12&&lat<=20.42&&lng>=85.65&&lng<=85.95; }
