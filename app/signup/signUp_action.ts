"use server";

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../ultis/Supabase/server';

export async function signup_submit(display_name:string , email:string, password:string) {
    const supabase = await createClient()
  
    const data = {
      display_name,
      email,
      password,
    }
  
    const { error } = await supabase.auth.signUp(data)
  
    if (error) {
      console.log("Sign up error:", error.message)
      return
    }
  
    redirect('/login?success=1')
 }
