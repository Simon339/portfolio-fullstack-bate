"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw, Home } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [isProd, setIsProd] = useState(false)

  useEffect(() => {
    setIsProd(process.env.NODE_ENV === 'production')
    
    const timer = setTimeout(() => {
      router.refresh()
    }, 5000)

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router])

  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>An unknown error occurred</p>
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
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">Something went wrong</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">The page will refresh in {countdown}</p>
        </motion.div>

        {!isProd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-left"
          >
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-2 break-words">
                Error ID: {error.digest}
              </p>
            )}
          </motion.div>
        )}


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center justify-center"
        >
          <div className="relative h-12 w-12">
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
                className="text-red-500"
                strokeWidth="6"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * countdown) / 5}
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex gap-3 justify-center"
        >
          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <Home className="h-4 w-4" />
            Home
          </motion.button>

          <motion.button
            onClick={reset}
            disabled={countdown > 0}
            whileHover={countdown === 0 ? { scale: 1.05 } : {}}
            whileTap={countdown === 0 ? { scale: 0.98 } : {}}
            animate={countdown === 0 ? { 
              boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 10px rgba(59, 130, 246, 0)"],
              transition: { 
                repeat: Infinity,
                duration: 1.5
              }
            } : {}}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              countdown > 0
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 dark:bg-blue-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-blue-300 focus:ring-blue-500'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            {countdown > 0 ? `Try again (${countdown})` : 'Try again'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}