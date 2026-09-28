import {z} from 'zod';
import {db} from '@/lib/supabase/server';
import {failure,sameOrigin,serviceFailure} from '@/lib/http';
import {newToken,tokenHash} from '@/lib/tokens';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const {id}=await params;if(!z.uuid().safeParse(id).success)return failure('VALIDATION_ERROR',400);const c=await db();const {data:{user}}=await c.auth.getUser();if(!user)return failure('UNAUTHORIZED',401);const token=newToken();const {error}=await c.rpc('create_share',{p_referral:id,p_hash:tokenHash(token)});if(error)throw error;return Response.json({url:`${new URL(req.url).origin}/r#${token}`,expiresInDays:7},{headers:{'Cache-Control':'no-store'}});}catch(error){return serviceFailure(error,'SHARE_FAILED');}}
export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){if(!sameOrigin(req))return failure('FORBIDDEN',403);try{const {id}=await params;const c=await db();const {error}=await c.rpc('revoke_share',{p_referral:id});if(error)throw error;return Response.json({ok:true});}catch(error){return serviceFailure(error,'REVOKE_FAILED');}}
