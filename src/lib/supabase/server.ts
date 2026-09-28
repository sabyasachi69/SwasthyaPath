import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type {Database} from './database.types';
export function configured(){return !!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
export async function db(){
 if(!configured()) throw new Error('SERVICE_UNAVAILABLE');
 const jar=await cookies();
 return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:(items)=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server component cannot update cookies. */}}}});
}
