

import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import AuthContent from "../_component/AuthContect"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Sign in, create an account, reset your password, and manage access",
};

function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin"></div>
      <span className="text-gray-600 text-sm">
        Please wait
        <span className="animate-[pulse_1.5s_ease-in-out_infinite]">.</span>
        <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.2s]">.</span>
        <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.4s]">.</span>
      </span>
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