import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);

      return NextResponse.redirect(
        new URL("/login?verified=true", request.url)
      );
    } catch (error) {
      console.error("Error exchanging code for session:", error);

      return NextResponse.redirect(
        new URL("/login?error=verification_failed", request.url)
      );
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}
