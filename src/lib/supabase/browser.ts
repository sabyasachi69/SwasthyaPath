'use client';
import {createBrowserClient} from '@supabase/ssr';
import type {Database} from './database.types';
export function browserDb(){if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)throw new Error('Accounts are not configured yet.');return createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);}
