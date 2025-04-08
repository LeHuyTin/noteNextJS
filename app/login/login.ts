"use server";

import { signIn, signOut } from "../auth";

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
    await signOut({redirectTo: "/"});
};
