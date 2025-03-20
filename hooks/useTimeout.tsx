/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState, useRef } from "react"
import { signOut, useSession } from "next-auth/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TriangleAlert } from "lucide-react"

const SESSION_TIMEOUT = 60 * 60 * 1000 // 60 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

export const useSessionTimeout = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession()
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [warningId, setWarningId] = useState<NodeJS.Timeout | null>(null)
  const isAuthenticated = status === "authenticated"
  const warningShown = useRef(false)

  const resetTimer = () => {
    // Only proceed if user is authenticated
    if (!isAuthenticated) return

    // Clear existing timeouts
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    if (warningId) {
      clearTimeout(warningId)
      warningShown.current = false
    }

    // Set a new timeout for session expiration
    const newTimeoutId = setTimeout(() => {
      if (isAuthenticated) {
        // toast.error("Your session has expired. Please log in again.")
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
        signOut({ callbackUrl: "/auth" })
      }
    }, SESSION_TIMEOUT)

    // Set a new timeout for warning
    const newWarningId = setTimeout(() => {
      if (isAuthenticated && !warningShown.current) {
        <Alert variant='default'>
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Session is about to end!</AlertTitle>
          <AlertDescription>
            Your session will expire in 5 minutes due to inactivity.
          </AlertDescription>
        </Alert>
        //toast.warning("Your session will expire in 5 minutes due to inactivity.")
        warningShown.current = true
      }
    }, SESSION_TIMEOUT - WARNING_TIME)

    setTimeoutId(newTimeoutId)
    setWarningId(newWarningId)
  }

  // Reset timer when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      resetTimer()
    } else {
      // Clear timeouts when user logs out
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      if (warningId) {
        clearTimeout(warningId)
        setWarningId(null)
      }
      warningShown.current = false
    }
  }, [isAuthenticated])

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) return

    // Reset the timer on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove", "click"]
    const handleActivity = () => {
      if (isAuthenticated) {
        resetTimer()
      }
    }

    // Add event listeners
    events.forEach((event) => window.addEventListener(event, handleActivity))

    // Cleanup event listeners
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity))
    }
  }, [isAuthenticated])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)
    }
  }, [timeoutId, warningId])

  return null
}

