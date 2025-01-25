/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get("authToken")?.value

  if (!token) {
    return NextResponse.json({ isValid: false })
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const expiresAt = payload.exp ? payload.exp * 1000 : undefined // Convert to milliseconds

    return NextResponse.json({ isValid: true, expiresAt })
  } catch (error) {
    return NextResponse.json({ isValid: false })
  }
}

