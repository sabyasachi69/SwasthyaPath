import {NextResponse} from 'next/server';
export function failure(code:string,status=503){return NextResponse.json({error:{code,message:code==='VALIDATION_ERROR'?'Check your selection.':'This service is currently unavailable.'}},{status,headers:{'Cache-Control':'no-store'}});}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
