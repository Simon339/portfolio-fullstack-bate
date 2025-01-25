"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.refresh()
    }, 5000)

    const interval = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className=" text-gray-200 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 text-4xl font-extrabold text-gray-200 sm:text-5xl"
          >
            Oops! Something went wrong.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-2 text-base text-gray-300 sm:text-lg"
          >
            We&apos;re sorry, but we encountered an unexpected error.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8"
        >
          <p className="text-sm text-gray-300">Error: {error.message}</p>
          {error.digest && <p className="text-xs text-gray-200 mt-1">Digest: {error.digest}</p>}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6"
        >
          <p className="text-sm text-gray-300">The page will automatically refresh in {countdown} seconds.</p>
          <div className="mt-4 flex justify-center">
            <div className="relative">
              <motion.svg
                className="w-20 h-20"
                viewBox="0 0 100 100"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <circle
                  className="text-gray-200"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <motion.circle
                  className="text-blue-600"
                  strokeWidth="5"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (283 * countdown) / 5}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </motion.svg>
              <motion.span
                className="absolute top-1/2 left-1/2 text-center transform -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-blue-600"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                {countdown}
              </motion.span>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-6"
        >
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try again
          </motion.button>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: Math.random() * 2 + 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            className="absolute w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

