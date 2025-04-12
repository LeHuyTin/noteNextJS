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
    redirect('/signup')
  }

  revalidatePath('/', 'layout')
  redirect('/homePage')
}

export async function signup_submit(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup')
  }

  revalidatePath('/', 'layout')
  redirect('/homePage')
}