import type { Facility } from '@/domain/facility';
export function demoEnabled() { return process.env.APP_ENV==='demo'&&process.env.NEXT_PUBLIC_DEMO_MODE==='true'; }
export const demoFacilities:Facility[] = [
 {id:'11111111-1111-4111-8111-111111111111',slug:'demo-community-centre',name_en:'Demo Community Care Centre',name_or:'ଡେମୋ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର',address:'Illustrative location, Bhubaneswar',latitude:20.2961,longitude:85.8245,kind:'Primary care',data_class:'demo',verification_status:'demo',last_verified_at:null,valid_until:null,phone:null,services:['general','maternal','child'],source_url:null},
 {id:'22222222-2222-4222-8222-222222222222',slug:'demo-referral-centre',name_en:'Demo Referral Centre',name_or:'ଡେମୋ ରେଫରାଲ କେନ୍ଦ୍ର',address:'Illustrative location, Bhubaneswar',latitude:20.28,longitude:85.84,kind:'Referral care',data_class:'demo',verification_status:'demo',last_verified_at:null,valid_until:null,phone:null,services:['general','maternal','child','emergency'],source_url:null}
];
