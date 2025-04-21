"use server";

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { signIn, signOut } from "../auth";
import { createClient } from '../ultis/Supabase/server';


export const github_login = async () =>{
    await signIn("github",{redirectTo: "/homePage"});
};

export const facebook_login = async () =>{
    await signIn("facebook",{redirectTo: "/homePage"});
};

export const google_login = async () =>{
    await signIn("google",{redirectTo: "/homePage"});
};

export const twitter_login = async () =>{
    await signIn("twitter",{redirectTo: "/homePage"});
};

export const logout = async () =>{
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    await signOut({redirectTo: "/login"});
};

export async function password_login(email: string, password: string) {

    const supabase = await createClient();

  const data = {
    email,
    password
  }
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect('/homePage')
  }

  revalidatePath('/', 'layout')
  redirect('/homePage')
}

