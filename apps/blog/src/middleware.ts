import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const isValid = await verifySession(token);
    if (!isValid) {
      // Clear invalid cookie and redirect
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url)
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // If authenticated user tries to access login page, redirect to admin
  if (pathname === "/admin/login") {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const isValid = await verifySession(token);
      if (isValid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  // Add pathname to headers for layout to use
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
