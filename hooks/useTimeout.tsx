/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, TriangleAlert } from "lucide-react"
import { authClient } from "@/lib/auth"
import { toast } from "sonner"

const SESSION_TIMEOUT = 60 * 60 * 1000 // 60 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

export const useSessionTimeout = () => {
  const { data: session, isLoading } = authClient.useSession()
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [warningId, setWarningId] = useState<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [showExpired, setShowExpired] = useState(false)
  const isAuthenticated = !!session?.user
  const warningShown = useRef(false)
  const lastActivity = useRef(Date.now())

  const resetTimer = useCallback(() => {
    // Update last activity time
    lastActivity.current = Date.now()

    // Only proceed if user is authenticated
    if (!isAuthenticated || isLoading) return

    // Clear existing timeouts
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    if (warningId) {
      clearTimeout(warningId)
    }

    // Set a new timeout for session expiration
    const newTimeoutId = setTimeout(() => {
      if (isAuthenticated) {
        setShowExpired(true)
        toast.error("Your session has expired. Please log in again.", {
          duration: 5000,
        })
        
        // Sign out using Better Auth
        authClient.signOut()
          .then(() => {
            window.location.href = "/auth?expired=true"
          })
          .catch((error) => {
            console.error("Failed to sign out:", error)
            window.location.href = "/auth?expired=true"
          })
      }
    }, SESSION_TIMEOUT)

    // Set a new timeout for warning
    const newWarningId = setTimeout(() => {
      if (isAuthenticated && !warningShown.current) {
        setShowWarning(true)
        toast.warning("Your session will expire in 5 minutes due to inactivity.", {
          duration: 10000,
        })
        warningShown.current = true
      }
    }, SESSION_TIMEOUT - WARNING_TIME)

    setTimeoutId(newTimeoutId)
    setWarningId(newWarningId)
  }, [isAuthenticated, isLoading, timeoutId, warningId])

  const handleExtendSession = useCallback(async () => {
    setShowWarning(false)
    warningShown.current = false
    
    try {
      // Refresh the session to extend it
      await authClient.refreshSession()
      resetTimer()
      toast.success("Session extended")
    } catch (error) {
      console.error("Failed to extend session:", error)
      toast.error("Failed to extend session")
    }
  }, [resetTimer])

  // Reset timer when authentication status changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
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
      setShowWarning(false)
      setShowExpired(false)
    }
  }, [isAuthenticated, isLoading])

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated || isLoading) return

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
  }, [isAuthenticated, isLoading, resetTimer])

  // Check for inactivity periodically
  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    const intervalId = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity.current
      
      // If user has been inactive for more than 55 minutes (5 minutes before warning)
      if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_TIME) && !warningShown.current) {
        setShowWarning(true)
        toast.warning("Your session will expire soon due to inactivity.", {
          duration: 10000,
        })
        warningShown.current = true
      }
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [isAuthenticated, isLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (warningId) clearTimeout(warningId)
    }
  }, [timeoutId, warningId])

  // Render alerts (optional - you can remove this if you're using toast notifications)
  const renderAlerts = () => {
    return (
      <>
        {showWarning && (
          <Alert variant="default" className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Session is about to end!</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Your session will expire in 5 minutes due to inactivity.</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleExtendSession}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Extend Session
                </button>
                <button
                  onClick={() => {
                    setShowWarning(false)
                    warningShown.current = false
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {showExpired && (
          <Alert variant="destructive" className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Session Expired</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        )}
      </>
    )
  }

  return {
    renderAlerts,
    resetTimer,
    isAuthenticated,
    showWarning,
    showExpired,
    handleExtendSession,
  }
}