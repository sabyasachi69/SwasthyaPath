import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin,serviceFailure} from '@/lib/http';
const input=z.object({facilityId:z.uuid(),service:z.enum(['general','maternal','child','emergency']),consent:z.literal(true)}).strict();
export async function POST(req:Request){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const value=input.safeParse(await req.json());if(!value.success)return failure('VALIDATION_ERROR',400);const c=await db();const {data:{user}}=await c.auth.getUser();if(!user)return failure('UNAUTHORIZED',401);const {data,error}=await c.from('saved_care_plans').insert({facility_id:value.data.facilityId,service_code:value.data.service}).select('id').single();if(error)throw error;return Response.json(data,{status:201,headers:{'Cache-Control':'no-store'}});}catch(error){return serviceFailure(error,'SAVE_FAILED');}}
