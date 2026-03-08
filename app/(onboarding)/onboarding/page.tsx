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

export default async function OnboardingUserPage() {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId) {
    redirect("/auth")
  }

  const user = await getUserProfileById(currentUserId)

  if (!user) {
    notFound()
  }

  return (
    <>
      <UserProfile user={user} />
    </>
  )
}
