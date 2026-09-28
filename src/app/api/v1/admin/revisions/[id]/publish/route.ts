import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin} from '@/lib/http';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(request))return failure('FORBIDDEN',403);try{const {id}=await params;if(!z.uuid().safeParse(id).success)return failure('VALIDATION_ERROR',400);const client=await db();const {error}=await client.rpc('publish_revision',{p_revision:id});if(error)throw error;return Response.json({ok:true});}catch{return failure('PUBLISH_FAILED',403);}}
