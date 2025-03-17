/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { Suspense } from "react"

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-t border-gray-200 rounded-full animate-spin"></div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

async function RedirectContent() {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      redirect("/auth")
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
      .then((results) => results[0])

    if (!user) {
      redirect("/auth")
    }

    if (user.deletionRequestedAt) {
      redirect("/account-deletion-requested")
    }

    if (user.status === "APPROVED") {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        redirect("/dashboard")
      } else {
        redirect("/onboarding/current")
      }
    } else {
      redirect("/onboarding/current")
    }
  } catch (error) {
    return <ErrorState message="Something went wrong" />
  }

  return <LoadingIndicator />
}

export default function RedirectPage() {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <RedirectContent />
    </Suspense>
  )
}

