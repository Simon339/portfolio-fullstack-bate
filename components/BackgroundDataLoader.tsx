// components/ToastProviderWrapper.tsx
"use client"

import { ToastProvider } from "@/hooks/use-toast"
import { useEffect, useState } from "react"

export default function ToastProviderWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  
  return <ToastProvider />
}