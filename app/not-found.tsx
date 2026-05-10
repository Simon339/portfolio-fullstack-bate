"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"

export default function NotFound() {
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
        >
          <motion.h1
            className="text-7xl font-bold text-gray-900 dark:text-gray-100"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.3,
            }}
          >
            404
          </motion.h1>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mt-2">
            Page Not Found
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
            We couldn&apos;t find the page you were looking for. It may have been moved, deleted, or perhaps the URL was entered incorrectly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              href="/"
              className="px-6 py-2.5 rounded-md bg-gray-900 text-gray-400 text-sm font-bold inline-flex items-center gap-2 transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              Go home
            </Link>
          </motion.div>
          
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact support or try navigating from the homepage.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
