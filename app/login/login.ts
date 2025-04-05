"use server";

import { signIn, signOut } from "../auth";

export const github_login = async () =>{
    await signIn("github",{redirectTo: "/"});
};

export const facebook_login = async () =>{
    await signIn("facebook",{redirectTo: "/"});
};

export const google_login = async () =>{
    await signIn("google",{redirectTo: "/"});
};

export const twitter_login = async () =>{
    await signIn("twitter",{redirectTo: "/"});
};

export const logout = async () =>{
    await signOut({redirectTo: "/"});
};
