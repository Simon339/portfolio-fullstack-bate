"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-100 to-red-200 p-4">
      <div className="text-center">
        <motion.h1
          className="mb-4 text-6xl font-bold text-red-800"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          404
        </motion.h1>
        <motion.h2
          className="mb-4 text-4xl font-semibold text-red-700"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Page Not Found
        </motion.h2>
        <motion.p
          className="mb-8 text-lg text-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <Link
            href="/"
            className="inline-block rounded-full bg-red-500 px-6 py-3 text-white transition-colors hover:bg-red-600"
          >
            Go Back Home
          </Link>
        </motion.div>
      </div>
      <motion.div
        className="mt-12"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </motion.div>
    </main>
  )
}

