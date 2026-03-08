

import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import AuthContent from "../_component/AuthContect"


export const metadata: Metadata = {
  title: "Sign In | Sign Up",
  description: "Sign in to your account or create a new one",
}

function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin"></div>
    </div>
  )
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingIndicator />}>
      <AuthContent>{children}</AuthContent>
    </Suspense>
  );
}