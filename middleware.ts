/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { authRoutes, publicRoutes, dashboardRoutes, DEFAULT_LOGIN_REDIRECT } from "@/routes"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "qf3gxhd/k0IE/d6SbUJAD9aUetvny0/AHqlkF31jt8k=")

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get("authToken")?.value
  let isLoggedIn = false
  let userRole = null

  if (authToken) {
    try {
      const { payload } = await jwtVerify(authToken, JWT_SECRET)
      isLoggedIn = true
      userRole = payload.role as string
    } catch (error) {
      console.error("Token verification failed:", error)
    }
  }

  if (authRoutes.includes(pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
    }
    return NextResponse.next()
  }

  const jsonEndpoints = [
    "Login.json",
    "Experience.json",
    "Projects.json",
    "Support.json",
    "placeholder.png",
    "Profile.jpg",
    "CV.pdf",
  ]
  if (jsonEndpoints.some((endpoint) => pathname.endsWith(endpoint))) {
    return NextResponse.next()
  }

  if (
    publicRoutes.some((route) => {
      const dynamicRouteRegex = new RegExp(`^${route.replace(/\[id\]/, "\\d+")}$`)
      return route === pathname || dynamicRouteRegex.test(pathname)
    })
  ) {
    return NextResponse.next()
  }

  if (!isLoggedIn && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && dashboardRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  if (isLoggedIn && !dashboardRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

