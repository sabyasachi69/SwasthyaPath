import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin} from '@/lib/http';
export async function POST(req:Request){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const parsed=z.object({facilityId:z.uuid(),category:z.enum(['wrong_number','closed','missing_service','stale_hours'])}).strict().safeParse(await req.json());if(!parsed.success)return failure('VALIDATION_ERROR',400);const c=await db();const {data:{user}}=await c.auth.getUser();if(!user)return failure('UNAUTHORIZED',401);const {error}=await c.from('facility_feedback').insert({facility_id:parsed.data.facilityId,category:parsed.data.category});if(error)throw error;return Response.json({ok:true},{status:201});}catch{return failure('FEEDBACK_FAILED');}}
