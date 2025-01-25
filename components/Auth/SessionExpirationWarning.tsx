"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SessionExpirationWarning() {
  const [showWarning, setShowWarning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/check")
        const data = await res.json()

        if (!data.isValid) {
          router.push("/login")
        } else {
          const timeLeft = data.expiresAt - Date.now()
          if (timeLeft <= 30000) {
            // Show warning when 30 seconds or less remaining
            setShowWarning(true)
          } else {
            setShowWarning(false)
          }

          timeoutId = setTimeout(checkSession, Math.min(timeLeft, 30000))
        }
      } catch (error) {
        console.error("Error checking session:", error)
        // If there's an error, we'll check again in 30 seconds
        timeoutId = setTimeout(checkSession, 30000)
      }
    }

    checkSession()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  if (!showWarning) return null

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <p className="font-bold">Warning</p>
      <p>Your session is about to expire. Please refresh the page to continue.</p>
    </div>
  )
}

