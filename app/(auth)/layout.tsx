import type React from "react"
import { auth } from "@/server/auth"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { db } from "@/server/db"
import { users } from "@/server/schema"
import { eq } from "drizzle-orm"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "AuthPage",
  description: "Let's Sign up or Login",
}

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-t border-gray-200 rounded-full animate-spin"></div>
    </div>
  )
}

async function AuthContent({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (session) {
    const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)

    if (user[0]) {
      if (user[0].deletionRequestedAt) {
        redirect("/account-deletion-requested")
      }

      const userStatus = user.status;
      const userRole = user.role;

      if (userStatus !== "APPROVED") {
        redirect("/onboarding/current");
      } else if (userRole === "USER") {
        redirect("/onboarding/current");
      } else if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        redirect("/dashboard");
      }
    }
  }

  return <main className="flex items-center justify-center min-h-screen bg-white">{children}</main>
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <AuthContent>{children}</AuthContent>
    </Suspense>
  )
}



