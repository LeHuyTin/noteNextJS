import { updateSession } from './app/ultis/Supabase/middleware'
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "./app/auth";

const protectRoutes = ["/homePage"];

export default async function middleware(request: NextRequest) {
const session = await auth();
  if(session?.user){
  const { pathname } = request.nextUrl;

  const isProtected = protectRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
else {return await updateSession(request)}
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}