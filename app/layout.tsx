import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import RatingModal from "@/components/Website/RatingModal"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Malesela's Portfolio",
  description: "Updated Silk full stack Portfolio",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link href="/logo.png" rel="icon" />
      </head>
      <body className="min-h-screen grow scrollbar scrollbar-track-[#000B58] scrollbar-thumb-transparent">
        {children}
        <RatingModal />
        <Toaster />
      </body>
    </html>
  )
}
