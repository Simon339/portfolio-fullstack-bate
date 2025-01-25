"use server"

import type { SignInForm } from "@/types/index"
import { cookies } from "next/headers"
import { mockDb } from "@/lib/auth/mockDb"
import { sign, verify } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-keyqf3gxhd/k0IE/d6SbUJAD9aUetvny0/AHqlkF31jt8k="

export async function signIn(data: SignInForm) {
  try {
    const { email, password } = data

    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    const user = await mockDb.authenticateUser(email, password)

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    const token = sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: "1h",
    })

    ;(await cookies()).set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 1 hour
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email } }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Sign in failed" }
  }
}

export async function signOut() {
  try {
    (await cookies()).delete("authToken")
    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Sign out failed" }
  }
}

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("authToken")?.value

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as { userId: string; email: string; name: string; exp: number }

    if (Date.now() >= decoded.exp * 1000) {
      return null
    }

    const user = await mockDb.getUserById(decoded.userId)

    if (!user) {
      return null
    }

    return { id: user.id, email: user.email, name: user.name }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

