import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin,serviceFailure} from '@/lib/http';
import {tokenHash} from '@/lib/tokens';
export async function POST(req:Request){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const {token}=z.object({token:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict().parse(await req.json());const c=await db();const {data,error}=await c.rpc('consume_share',{p_hash:tokenHash(token)});if(error)throw error;return Response.json(data,{headers:{'Cache-Control':'no-store'}});}catch(error){return serviceFailure(error,'LINK_UNAVAILABLE',410);}}
