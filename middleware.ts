/* eslint-disable @typescript-eslint/no-unused-vars */
import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes";
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

    if (isLoggedIn) {
        const userRole: 'ADMIN' | 'USER' | undefined = req.auth?.user?.role;

        // Role-based route restriction
        const restrictedRoutes = {
            ADMIN: ['/onboarding'],
            USER: ['/dashboard'],
        }

        const restrictedRoute = userRole ? restrictedRoutes[userRole] : undefined;
        if (restrictedRoute?.includes(pathname)) {
            nextUrl.pathname = DEFAULT_LOGIN_REDIRECT;
            return NextResponse.redirect(nextUrl);  // Redirect to default route for the user's role
        }
    }; // Define restricted routes based on user role

    // Handle authentication routes (login, registration, etc.)
    if (isAuthRoute) {
        if (isLoggedIn) {
            const userRole = req.auth?.user?.role; // Assuming `role` is part of the user data
            // Redirect to appropriate page based on the user's role
            if (userRole === 'ADMIN') {
                nextUrl.pathname = "/dashboard";
            } else if (userRole === 'USER') {
                nextUrl.pathname = "/onboarding";
            }
            return NextResponse.redirect(nextUrl);
        }
        return null; // Allow access to auth routes if not logged in
    }

    // Allow auth check for `json` files
   if (pathname.endsWith('Login.json') || pathname.endsWith('Experience.json') || pathname.endsWith('Projects.json') || pathname.endsWith('Support.json') || pathname.endsWith('placeholder.png') || pathname.endsWith('Profile.jpg') || pathname.endsWith('CV.pdf')) {
    return null;
    }

    const url = req.nextUrl.pathname

    // Check if the current URL matches any public route or the dynamic project page route
    if (publicRoutes.some(route => new RegExp(`^${route.replace(/\[id\]/, '\\d+')}$`).test(url))) {
        return NextResponse.next() // Allow the request to continue
    }

    // Redirect to login if not logged in and not a public route
    if (!isLoggedIn && !isPublicRoute) {
        nextUrl.pathname = '/auth';
        return NextResponse.redirect(nextUrl);
    }

    if (publicRoutes.some(route => {
        // Create a dynamic regex for the route, replacing `[id]` with a pattern that matches any non-slash string
        const routePattern = new RegExp(`^${route.replace(/\[id\]/, '[^/]+')}$`);
        return routePattern.test(url);
    })) {
        return NextResponse.next(); // Allow the request to continue
    }

    return null; // Allow the request to proceed if it's a public route or the user is logged in and authorized
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};