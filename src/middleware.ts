import { NextRequest, NextResponse } from "next/server";
// import pb, {isAuthenticated} from "./lib/pocketbase";

export async function middleware(req:NextRequest) {
  // const isLoggedIn = await isAuthenticated(req.cookies as any);
  const isLoggedIn = false;
  // if (req.nextUrl.pathname && req.nextUrl.pathname.startsWith('/login')) {
  //   if (isLoggedIn) {
  //     return NextResponse.redirect(new URL('/',req.url));
  //   }
  //   return;
  // }
  // if (req.nextUrl.pathname && req.nextUrl.pathname.startsWith('/')) {
  //   if (!isLoggedIn) {
  //     return NextResponse.redirect(new URL('/login',req.url));
  //   }
  // }
  return NextResponse.next();
}

export const config = {
  matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};