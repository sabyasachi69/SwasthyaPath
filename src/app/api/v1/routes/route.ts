import {z} from 'zod';
import {failure} from '@/lib/http';
import {inBhubaneswar} from '@/domain/facility';

const input=z.object({from:z.object({lat:z.number().finite(),lng:z.number().finite()}),to:z.object({lat:z.number().finite(),lng:z.number().finite()})}).strict();

export async function POST(request:Request){
 try{
  const parsed=input.safeParse(await request.json());
  if(!parsed.success)return failure('VALIDATION_ERROR',400);
  if(!inBhubaneswar(parsed.data.from.lat,parsed.data.from.lng)||!inBhubaneswar(parsed.data.to.lat,parsed.data.to.lng))return failure('OUTSIDE_SERVICE_AREA',422);
  const base=process.env.ROUTING_API_URL;
  if(!base)return failure('ROUTE_PREVIEW_UNAVAILABLE');
  const {from,to}=parsed.data;
  const url=new URL(`${base.replace(/\/$/,'')}/${from.lng},${from.lat};${to.lng},${to.lat}`);
  url.searchParams.set('overview','full');
  url.searchParams.set('geometries','geojson');
  url.searchParams.set('steps','false');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),5000);
  const response=await fetch(url,{headers:process.env.ROUTING_API_KEY?{Authorization:`Bearer ${process.env.ROUTING_API_KEY}`}:{},signal:controller.signal,cache:'no-store'}).finally(()=>clearTimeout(timeout));
  if(!response.ok)throw Error('provider');
  const payload=await response.json();
  const route=payload?.routes?.[0];
  if(!route||typeof route.distance!=='number'||typeof route.duration!=='number')throw Error('provider');
  const coordinates=route.geometry?.coordinates;
  if(!Array.isArray(coordinates)||coordinates.length<2)throw Error('provider');
  return Response.json({distanceKm:Math.round(route.distance)/1000,durationMinutes:Math.ceil(route.duration/60),geometry:{coordinates},source:'configured-routing-provider'},{headers:{'Cache-Control':'no-store'}});
 }catch{return failure('ROUTE_PREVIEW_UNAVAILABLE');}
}
