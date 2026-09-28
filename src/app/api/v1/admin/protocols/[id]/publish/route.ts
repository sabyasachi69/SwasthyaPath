import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin} from '@/lib/http';
const input=z.object({reviewerRegistration:z.string().min(4).max(80),allCasesReviewed:z.literal(true)}).strict();
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(request))return failure('FORBIDDEN',403);try{const {id}=await params;const body=input.parse(await request.json());if(!z.uuid().safeParse(id).success)return failure('VALIDATION_ERROR',400);const client=await db();const {error}=await client.rpc('publish_protocol',{p_protocol:id,p_evidence:{reviewer_registration:body.reviewerRegistration,all_cases_reviewed:body.allCasesReviewed}});if(error)throw error;return Response.json({ok:true});}catch{return failure('PROTOCOL_PUBLISH_FAILED',403);}}
