// proxy.ts
import { auth } from "@/server/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route arrays
const publicRoutes = [
  "/", 
  "/auth", 
  "/verify-email", 
  "/reset", 
  "/new-password",
  "/contact",
  "/faq",
  "/about", 
  "/my-journey",
  "/projects",
  "/services",
  "/coming-soon", 
  "/feedback",
  "/dashboard/surveys"
];

const authRoutes = ["/auth"];
const apiAuthPrefix = "/api/auth";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session?.user;

  // Skip API auth routes
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Handle authentication routes
  if (authRoutes.includes(pathname)) {
    if (isLoggedIn) {
      nextUrl.pathname = "/dashboard";
      return NextResponse.redirect(nextUrl);
    }
    return NextResponse.next();
  }

  // Check if this is a dynamic project route
  const isDynamicProjectRoute = pathname.startsWith('/projects/');
  
  // Check if it's a public route or project route
  const isPublicRoute = publicRoutes.includes(pathname) || isDynamicProjectRoute;

  // Allow auth check for `json` endpoints
  if (['Login.json', 'Experience.json', 'Projects.json', 'Support.json']
    .some(suffix => pathname.endsWith(suffix))) {
    return NextResponse.next();
  }

  // Redirect to login if not logged in and not a public route
  if (!isLoggedIn && !isPublicRoute) {
    nextUrl.pathname = '/auth';
    nextUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(nextUrl);
  }

  // Collect IP address and user agent
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Attach IP and User-Agent to request headers
  const headers = new Headers(request.headers);
  headers.set('x-ip-address', ipAddress);
  headers.set('x-user-agent', userAgent);

  // Also attach user info if logged in
  if (isLoggedIn && session.user) {
    headers.set('x-user-id', session.user.id);
    headers.set('x-user-email', session.user.email);
    
    // Type assertion to access custom fields
    const userWithCustomFields = session.user as any;
    if (userWithCustomFields.role) {
      headers.set('x-user-role', userWithCustomFields.role);
    }
  }

  // Continue with the modified headers
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};