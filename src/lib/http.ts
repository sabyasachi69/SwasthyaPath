import {NextResponse} from 'next/server';
import {DatabaseContractError} from '@/lib/contract';
export function failure(code:string,status=503){return NextResponse.json({error:{code,message:code==='VALIDATION_ERROR'?'Check your selection.':'This service is currently unavailable.'}},{status,headers:{'Cache-Control':'no-store'}});}
export function serviceFailure(error:unknown,fallback:string,status=503){
 if(error instanceof DatabaseContractError)return failure('BACKEND_CONTRACT_MISMATCH',503);
 return failure(fallback,status);
}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
