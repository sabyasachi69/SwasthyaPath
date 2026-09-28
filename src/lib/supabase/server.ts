import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type {Database} from './database.types';
import {contractCompatible,DatabaseContractError,parseReleaseContract} from '@/lib/contract';
export function configured(){return !!(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
export async function rawDb(){
 if(!configured()) throw new Error('SERVICE_UNAVAILABLE');
 const jar=await cookies();
 return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll:()=>jar.getAll(),setAll:(items)=>{try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server component cannot update cookies. */}}}});
}
export async function databaseContract(){
 const client=await rawDb();
 const {data,error}=await client.rpc('release_contract');
 if(error) throw new DatabaseContractError('BACKEND_CONTRACT_UNAVAILABLE');
 const contract=parseReleaseContract(data);
 if(!contractCompatible(contract)) throw new DatabaseContractError('BACKEND_CONTRACT_MISMATCH');
 return contract;
}
export async function db(){
 const client=await rawDb();
 const {data,error}=await client.rpc('release_contract');
 if(error) throw new DatabaseContractError('BACKEND_CONTRACT_UNAVAILABLE');
 const contract=parseReleaseContract(data);
 if(!contractCompatible(contract)) throw new DatabaseContractError('BACKEND_CONTRACT_MISMATCH');
 return client;
}
