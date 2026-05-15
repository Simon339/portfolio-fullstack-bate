import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

// Define route arrays
const publicRoutes = ["/","/auth","/verify-email","/reset","/new-password","/contact","/faq","/about","/my-journey","/projects","/services","/coming-soon","/feedback", "/terms", "/privacy", "/businesscard"];

const authRoutes = ["/auth", "/two-factor", "/verify-email", "/reset", "/new-password", "/accountdeleted"];
const apiAuthPrefix = "/api/auth";
const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  const isDynamicProjectRoute = pathname.startsWith("/projects/");
  const isPublicRoute = isDynamicProjectRoute || publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );

  const isStaticFile = /\.(json|png|jpg|jpeg|svg|ico|webp|css|js)$/.test(pathname);
  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);

  // Allow API auth routes, public routes, and static files
  if (isApiAuthRoute || isPublicRoute || isStaticFile) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session?.user;

  // Handle auth routes (login, register, etc.)
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isLoggedIn) {
      // If user is logged in and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isLoggedIn) {
    // Don't add next parameter if it's the default redirect or if it's an auth route
    const loginUrl = new URL("/auth", request.url);
    const callbackUrl = pathname + search;
    
    // Only add next parameter if it's not the default redirect
    if (callbackUrl !== DEFAULT_LOGIN_REDIRECT) {
      loginUrl.searchParams.set("next", callbackUrl);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // User is logged in, add user info to headers
  const headers = new Headers(request.headers);

  const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  headers.set("x-ip-address", ipAddress);
  headers.set("x-user-agent", userAgent);

  if (session.user) {
    headers.set("x-user-id", session.user.id);
    headers.set("x-user-email", session.user.email);

    const userWithCustomFields = session.user as any;
    if (userWithCustomFields.role) {
      headers.set("x-user-role", userWithCustomFields.role);
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
