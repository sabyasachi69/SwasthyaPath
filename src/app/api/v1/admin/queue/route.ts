import {db} from '@/lib/supabase/server';
import {failure} from '@/lib/http';
export async function GET(){try{const client=await db();const {data:{user}}=await client.auth.getUser();if(!user)return failure('UNAUTHORIZED',401);const {data,error}=await client.rpc('admin_queue');if(error)throw error;return Response.json(data,{headers:{'Cache-Control':'no-store'}});}catch{return failure('FORBIDDEN',403);}}
