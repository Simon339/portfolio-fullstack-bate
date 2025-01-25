"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          method: "GET",
          credentials: "include", // This is important to include cookies
        })
        const data = await response.json()
        setIsAuthenticated(data.isAuthenticated)
        if (!data.isAuthenticated) {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  return { isAuthenticated }
}
