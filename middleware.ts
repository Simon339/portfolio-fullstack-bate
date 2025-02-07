import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "./routes";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);


export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const { pathname } = nextUrl;

    const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = authRoutes.includes(pathname);

    // Skip API auth routes
    if (isApiAuthRoute) {
        return null;
    }

    // Handle authentication routes
    if (isAuthRoute) {
        if (isLoggedIn) {
            nextUrl.pathname = "/dashboard/"; // Directly modify nextUrl
            return NextResponse.redirect(nextUrl);
        }
        return null; // Allow access to auth routes if not logged in
    }

    // Allow auth check for `json`
    if (
        ['Login.json', 'Experience.json', 'Projects.json', 'Support.json']
          .some(suffix => pathname.endsWith(suffix))
      ) {
        return null;
      }
    // Redirect to login if not logged in and not a public route
    if (!isLoggedIn && !isPublicRoute) {
        nextUrl.pathname = '/auth';
        nextUrl.pathname = '/verify-email';
        nextUrl.pathname = '/reset';
        nextUrl.pathname = '/new-password';
        nextUrl.searchParams.set('next', pathname);
        
        return NextResponse.redirect(nextUrl);
    }

    return null; // Allow the request to proceed
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
