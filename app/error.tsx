"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, HelpCircle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(30) // Increased from 5 to 30 seconds
  const [isProd, setIsProd] = useState(false)
  const [userFriendlyMessage, setUserFriendlyMessage] = useState("")

  useEffect(() => {
    setIsProd(process.env.NODE_ENV === 'production')
    
    // Generate user-friendly error message based on error type
    if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
      setUserFriendlyMessage("We're having trouble connecting to our servers. This might be due to a network issue or temporary server maintenance.")
    } else if (error?.message?.includes("timeout")) {
      setUserFriendlyMessage("The request took too long to complete. Please check your internet connection and try again.")
    } else {
      setUserFriendlyMessage("Something unexpected happened while loading this page. Our team has been notified and we're working to fix it.")
    }
    
    const timer = setTimeout(() => {
      router.refresh()
    }, 30000) // Increased from 5000 to 10000ms

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router, error])

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>We're experiencing technical difficulties. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Technical Difficulties
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm max-w-sm">
            {userFriendlyMessage}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <HelpCircle className="h-3 w-3" />
            <span>Page will refresh automatically in {countdown} seconds</span>
          </div>
        </motion.div>

        {/* Technical details (development only) */}
        {!isProd && error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-left border border-gray-200 dark:border-gray-800"
          >
            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Technical Details (Development Only):
            </h4>
            <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1 break-words">
                Reference: {error.digest}
              </p>
            )}
          </motion.div>
        )}

        {/* Countdown visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <div className="relative h-14 w-14">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-100 dark:text-gray-800"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <motion.circle
                className="text-blue-500"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * countdown) / 10}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {countdown}
            </span>
          </div>
        </motion.div>
        {/* Support contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pt-4 border-t border-gray-100 dark:border-gray-800"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If the problem persists, please contact our support team with error reference:{" "}
            <span className="font-mono text-gray-600 dark:text-gray-300">
              {error.digest || "N/A"}
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}