"use server"

import type React from "react";
import Providers from "@/components/Website/providers"
import SessionProvider from "@/components/Auth/SessionProvider"
import { auth } from "@/server/auth"
import RatingModal from "@/components/Website/RatingModal"

export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <Providers>
        {children}
        <RatingModal />
      </Providers>
    </SessionProvider>
  )
}
