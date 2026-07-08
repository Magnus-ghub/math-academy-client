import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JwtPayload {
  userId: string;
  userRole: string;
  groups: any[];
  exp: number;
}

const AUTH_PATHS = ["/login", "/onboarding"];

function getToken(req: NextRequest): string | null {
  return req.cookies.get("auth-token")?.value ?? null;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    const payload = JSON.parse(json) as JwtPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = getToken(req);
  const payload = token ? decodeToken(token) : null;
  const isAuth = !!payload;
  const role = payload?.userRole;

  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) && isAuth) {
    const dest = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/exam") || pathname.startsWith("/sat")) {
    if (!isAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.jpg|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico).*)",
  ],
};
