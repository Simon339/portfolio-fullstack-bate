import type React from "react"
import { auth } from "@/server/auth"
import type { Metadata } from "next"
import { redirect } from "next/navigation"


export const metadata: Metadata = {
  title: "Deleted User",
  description: "Let's help you recover your account",
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) redirect("/auth")


  return (
    <main className="flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      {children}
    </main>
  )
}


