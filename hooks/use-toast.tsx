"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

export function useToast() {
  return null 
}

export function ToastProvider() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <Toaster position="top-right" theme={resolvedTheme === "dark" ? "dark" : "light"} closeButton richColors />
}
