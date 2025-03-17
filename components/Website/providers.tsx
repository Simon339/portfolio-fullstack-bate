"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { useState, useEffect } from "react"
import { useSessionTimeout } from "@/hooks/useTimeout"
import { ToastProvider } from "@/hooks/use-toast"


export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useSessionTimeout()

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-preference"
    >
      {children}
      {mounted && <ToastProvider />}
    </ThemeProvider>
  )
}

