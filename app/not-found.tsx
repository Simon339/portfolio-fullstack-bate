"use client"

import Link from "next/link"
import { ChevronLeft, Home, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon Badge */}
        <div className="flex justify-center">
          <div className="bg-red-100 dark:bg-red-950/50 rounded-full p-4">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-3">
          <h1 className="text-8xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Page not found
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or the URL was mistyped.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="#"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              <ChevronLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Need help?{" "}
            <Link href="/contact" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}