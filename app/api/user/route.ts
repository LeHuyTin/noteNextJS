
import { auth } from "@/app/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user) {
    return NextResponse.json(session.user);
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}