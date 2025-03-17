/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

const Loggout = () => {
    const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ redirect: false })

      toast("Logged out",{
        description: "You have been successfully logged out.",
      })

      router.push("/auth")
    } catch (error) {
      toast("Logout failed",{
        description: "There was an error logging out. Please try again.",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="gap-2">
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )
}

export default Loggout