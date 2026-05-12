import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = [
  "/projects",
  "/materials",
  "/quotation",
  "/reports",
  "/finances",
  "/borrows",
  "/portfolio",
  "/users",
  "/purchase",
];

const PUBLIC_PORTFOLIO_FILE = /^\/portfolio\/.+\.(?:jpg|jpeg|png|gif|webp|avif|svg)$/i;

function parseSessionValue(value: string | undefined) {
  if (!value) return null;
  try {
    const decoded = atob(value);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PORTFOLIO_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const isAdminPath = ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

  if (!isAdminPath) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;
  const session = parseSessionValue(sessionCookie);

  if (!session || !session.role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/reports") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  if (pathname.startsWith("/users") && session.role !== "admin") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    "/projects/:path*",
    "/materials/:path*",
    "/quotation/:path*",
    "/reports/:path*",
    "/finances/:path*",
    "/borrows/:path*",
    "/portfolio/:path*",
    "/users/:path*",
    "/projects",
    "/materials",
    "/quotation",
    "/reports",
    "/finances",
    "/borrows",
    "/portfolio",
    "/users",
    "/purchase/:path*",
    "/purchase",
  ],
};
