"use client"

import { useEffect } from "react"

interface BackgroundDataLoaderProps {
  loadData: () => Promise<void>
}

export default function BackgroundDataLoader({ loadData }: BackgroundDataLoaderProps) {
  useEffect(() => {
    loadData()
  }, [loadData])

  return null // This component doesn't render anything
}

