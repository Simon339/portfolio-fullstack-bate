"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function SearchInput() {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // Handle Escape key to blur the input
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search
        className={`absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 ${isFocused ? "text-[#1E56A0]" : "text-gray-400"}`}
      />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search... (Ctrl+K)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-8 h-8 w-64 bg-gray-50 border-[#acc2ef] text-sm focus-visible:ring-[#1E56A0]"
      />
      {isFocused && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">Press Enter</div>}
    </form>
  )
}

