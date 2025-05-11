
import { createClient } from '@supabase/supabase-js';
import { NextAuthOptions } from 'next-auth';
import supabase from '@/lib/supabase/client';
import { User } from 'next-auth';
import { Session } from 'next-auth';


const {data , error} = await supabase 
    .from('customers')
    .select('*')