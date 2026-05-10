
import type React from "react"
import type { Metadata } from "next"
import DashboardWrapper from "../_component/DashboardWrapper"
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <DashboardWrapper>{children}</DashboardWrapper>
    </Suspense>
  )
}



