"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Command } from "lucide-react"

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
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative group">
      {/* Glow effect on focus */}
      <div
        className={`absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#1E56A0]/20 to-[#acc2ef]/40 opacity-0 blur-sm transition-opacity duration-300 ${
          isFocused ? "opacity-100" : "group-hover:opacity-50"
        }`}
      />

      <div className="relative flex items-center">
        {/* Search icon with animation */}
        <div className={`absolute left-3.5 z-10 transition-all duration-200 ${
          isFocused ? "text-[#1E56A0] scale-110" : "text-gray-400"
        }`}>
          <Search className="h-4 w-4" />
        </div>

        <Input
          ref={inputRef}
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`pl-10 pr-20 h-10 w-72 bg-white/80 backdrop-blur-sm border-[#acc2ef] text-sm rounded-xl transition-all duration-200 ${
            isFocused
              ? "border-[#1E56A0] shadow-lg shadow-[#1E56A0]/10 bg-white"
              : "hover:border-[#1E56A0]/50 hover:shadow-md"
          }`}
        />

        {/* Keyboard shortcut indicator */}
        <div className={`absolute right-3 flex items-center gap-1 transition-all duration-200 ${
          isFocused ? "opacity-0 translate-x-2" : "opacity-100"
        }`}>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded-md border border-[#acc2ef] bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Press Enter hint when focused */}
        <div className={`absolute right-3 flex items-center gap-1 transition-all duration-200 ${
          isFocused && query.trim() ? "opacity-100" : "opacity-0 -translate-x-2"
        }`}>
          <span className="text-xs text-[#1E56A0] font-medium animate-pulse">
            Enter
          </span>
        </div>
      </div>
    </form>
  )
}
