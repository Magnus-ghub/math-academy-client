import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getTokenRole(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userRole ?? null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // Student sahifalari — login kerak
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + (request.nextUrl.search || ""));
      return NextResponse.redirect(loginUrl);
    }
  }

  // Admin sahifalari — login + ADMIN rol kerak
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const role = getTokenRole(token);
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Login sahifasi — login bo'lgan kirmasin
  if (pathname === "/login") {
    if (token) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const redirectTo = callbackUrl?.startsWith("/dashboard") ? callbackUrl : "/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};