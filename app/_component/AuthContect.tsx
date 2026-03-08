"use client"
import { authClient } from "@/hooks/getcurrectuser"
import { redirect } from "next/navigation";

const AuthContent = ({ children }: { children: React.ReactNode }) =>  {
  // Get session from Better Auth
  const { data: session, isPending, error } = authClient.useSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error state if session check fails
  if (error) {
    console.error("Session check error:", error);
    // Still show auth page even on error - user can try to login
  }

  // If session exists but hasn't redirected yet (fallback)
  if (session?.user?.id && !isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <main className="flex items-center justify-center min-h-screen bg-white">{children}</main>;
}


export default AuthContent