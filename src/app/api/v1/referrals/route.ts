import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin,serviceFailure} from '@/lib/http';
const input=z.object({planId:z.uuid(),consent:z.literal(true)}).strict();
export async function POST(req:Request){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const value=input.safeParse(await req.json());if(!value.success)return failure('VALIDATION_ERROR',400);const c=await db();const {data:{user}}=await c.auth.getUser();if(!user)return failure('UNAUTHORIZED',401);const {data,error}=await c.rpc('create_referral',{p_plan:value.data.planId});if(error)throw error;return Response.json({id:data,acknowledgment:'not_connected'},{status:201,headers:{'Cache-Control':'no-store'}});}catch(error){return serviceFailure(error,'REFERRAL_FAILED');}}
