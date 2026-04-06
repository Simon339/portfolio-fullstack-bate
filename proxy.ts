// proxy.ts
import { auth } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers as Header } from "next/headers";

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

const authRoutes = ["/auth", , "/two-factor", "/verify-email", "/reset", "/new-password"];
const apiAuthPrefix = "/api/auth";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  const isDynamicProjectRoute = pathname.startsWith("/projects/");
  const isPublicRoute = publicRoutes.includes(pathname) || isDynamicProjectRoute;

  
  if (
    pathname.startsWith(apiAuthPrefix) ||
    isPublicRoute ||
    ["Login.json", "Experience.json", "Projects.json", "Support.json"].some(
      (suffix) => pathname.endsWith(suffix)
    )
  ) {
    return NextResponse.next();
  }

  
  const session = await auth.api.getSession({
    headers: await Header()
  });

  const isLoggedIn = !!session?.user;

  
  if (authRoutes.includes(pathname)) {
    if (isLoggedIn) {
      nextUrl.pathname = "/dashboard";
      return NextResponse.redirect(nextUrl);
    }
    return NextResponse.next();
  }

 
  if (!isLoggedIn) {
    nextUrl.pathname = "/auth";
    nextUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(nextUrl);
  }

  
  const headers = new Headers(request.headers);

  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

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

// export const config = {
//   matcher: [
//     "/dashboard/:path*",  // only protect dashboard pages
//     "/api/:path*",        // run for API routes
//     '/((?!api|_next/static|_next/image|.*\\.png$).*)',
//   ],
// };
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};