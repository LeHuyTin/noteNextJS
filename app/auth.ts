import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";


export const {auth, handlers, signIn, signOut} = NextAuth({
    providers: [
      GitHubProvider,GoogleProvider,TwitterProvider,FacebookProvider
    ],
});


