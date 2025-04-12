import { auth } from "@/app/auth";
import { createClient } from "@/app/ultis/Supabase/server";
import { NextResponse } from "next/server";
import { redirect } from 'next/navigation'

export async function GET() {

  const session = await auth();

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (session?.user) {
    return NextResponse.json(session.user);

  } else if (data?.user) {
    return NextResponse.json(data.user);}

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


}

