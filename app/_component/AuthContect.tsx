"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/hooks/getcurrectuser"


const AuthContent = ({ children }: { children: React.ReactNode }) =>  {
  // Get session from Better Auth
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();

   useEffect(() => {
    if (!isPending && session?.user?.id) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  
  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-5 h-5 border-t-2 border-[#acc2ef] rounded-full animate-spin"></div>
      </div>
    );
  }

  // If session exists but hasn't redirected yet (fallback)
  if (session?.user?.id && !isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="w-5 h-5 border-t-2 border-[#acc2ef] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

   // Only show auth content if no session
  if (!session?.user?.id) {
    return <main className="flex items-center justify-center min-h-screen bg-white">{children}</main>;
  }

  // Fallback while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="w-5 h-5 border-t-2 border-[#acc2ef] rounded-full animate-spin mb-4 mx-auto"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}


export default AuthContent