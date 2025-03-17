/* eslint-disable @typescript-eslint/no-unused-vars */
import UserProfile from "@/components/Onboarding/UserProfile"
import { getCurrentUserId, getUserProfileById } from "@/server/data/user"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Onboarding | Complete Your Profile",
  description: "Complete your profile information to get started",
}

export default async function OnboardingUserPage({
  params,
}: {
  params: { id: string }
}) {
  // Await the params object before using its properties
  const { id } = await Promise.resolve(params)

  // Now use the id safely
  const userId = id === "current" ? await getCurrentUserId() : id

  if (!userId) {
    redirect("/auth")
  }

  const user = await getUserProfileById(userId)

  if (!user) {
    notFound()
  }


  if (user.status === "APPROVED") {
    redirect("/dashboard")
  }

  const currentUserId = await getCurrentUserId()
  if (!currentUserId) {
    redirect("/auth")
  }
  const isAdmin = await isUserAdmin(currentUserId)

  if (userId !== currentUserId && !isAdmin) {
    redirect(`/onboarding/${currentUserId}`)
  }

  return (
    <div className="py-6 md:py:10">
      <UserProfile user={user} />
    </div>
  )
}

async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false

  try {
    const user = await getUserProfileById(userId)
    return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
  } catch (error) {
    return false
  }
}

