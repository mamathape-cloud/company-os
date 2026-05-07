import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/login", "/setup", "/api/health"];

function isAuthPublic(pathname: string) {
  return pathname.startsWith("/api/auth/") || pathname.startsWith("/api/setup/");
}

function isBypass(pathname: string) {
  return publicPaths.includes(pathname) || isAuthPublic(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBypass(pathname)) {
    return NextResponse.next();
  }

  const healthResponse = await fetch(new URL("/api/health", request.url), {
    headers: { cookie: request.headers.get("cookie") ?? "" }
  });

  const healthData = (await healthResponse.json()) as { data?: { setup?: boolean } };
  const setupComplete = Boolean(healthData.data?.setup);

  if (!setupComplete && !pathname.startsWith("/setup") && !pathname.startsWith("/api/setup/")) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  const token = request.cookies.get("token")?.value;
  const decoded = token ? verifyToken(token) : null;

  if (setupComplete && !decoded && !pathname.startsWith("/login") && !pathname.startsWith("/api/auth/")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
