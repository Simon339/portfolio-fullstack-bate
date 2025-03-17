import type React from "react"
import type { Metadata } from "next"
import DashboardWrapper from "../_component/DashboardWrapper"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/schema"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { eq } from "drizzle-orm"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Updated Silk full stack Portfolio",
}

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-t border-gray-200 rounded-full animate-spin"></div>
    </div>
  )
}

async function DashboardContent({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) redirect("/auth")

  // Fetch the user's details from the database
  const user = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)

  if (!user[0]) {
    redirect("/auth")
  }

  if (user[0].deletionRequestedAt) {
    redirect("/account-deletion-requested")
  }

  const userStatus = user[0].status
  const userRole = user[0].role

  if (userStatus !== "APPROVED") {
    redirect("/onboarding/current")
  } else if (userRole === "USER") {
    redirect("/onboarding/current")
  }

  after(async () => {
    if (!session?.user?.id) return

    const user = await db.select().from(users).where(eq(users.id, session?.user?.id)).limit(1)

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10)) return

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id))
  })

  return <DashboardWrapper>{children}</DashboardWrapper>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  )
}



