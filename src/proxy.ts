import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/server";

const AUTH_ROUTES = ["/login", "/register"];
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/reports",
  "/employees",
  "/plans",
  "/settings",
  "/api/me",
  "/api/reports",
  "/api/employees",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function withCopiedCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = matchesPrefix(pathname, AUTH_ROUTES);
  const isPrivateRoute = matchesPrefix(pathname, PRIVATE_PREFIXES);

  if (!user && isPrivateRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";

    if (pathname !== "/login") {
      url.searchParams.set("next", pathname);
    }

    return withCopiedCookies(response, NextResponse.redirect(url));
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";

    return withCopiedCookies(response, NextResponse.redirect(url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/reports/:path*",
    "/employees/:path*",
    "/plans/:path*",
    "/settings/:path*",
    "/api/me",
    "/api/reports/:path*",
    "/api/employees/:path*",
  ],
};
