import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin} from '@/lib/http';
const input=z.object({approve:z.boolean(),checklist:z.object({contact:z.boolean(),location:z.boolean(),source:z.boolean(),translation:z.boolean()}).strict()}).strict();
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(request))return failure('FORBIDDEN',403);try{const {id}=await params;const body=input.parse(await request.json());if(!z.uuid().safeParse(id).success)return failure('VALIDATION_ERROR',400);const client=await db();const {error}=await client.rpc('review_revision',{p_revision:id,p_approve:body.approve,p_checklist:body.checklist});if(error)throw error;return Response.json({ok:true});}catch{return failure('REVIEW_FAILED',403);}}
