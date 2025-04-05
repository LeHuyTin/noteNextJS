import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "./auth";

const protectRoutes = ["/app/homePage/page.tsx"]

export default async function middleware(request:NextRequest) {
    const session = await auth();

    const {pathname} = request.nextUrl

    const isProtected = protectRoutes.some((route) => pathname.startsWith(route));

    if(isProtected && !session){
        return NextResponse.redirect(new URL("/app/login/page.tsx", request.url));
    }

    return NextResponse.next();
}