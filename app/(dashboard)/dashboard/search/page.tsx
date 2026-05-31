"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { searchAll, type SearchResult } from "@/server/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Cpu, FolderOpen, Mail, Search, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const typeIcons = {
  projects: FolderOpen,
  technologies: Cpu,
  mails: Mail,
  user: Users,
}

const typeLabels = {
  projects: "Project",
  technologies: "Technology",
  mails: "Inquiry",
  user: "User",
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [query])

  const performSearch = async (searchTerm: string) => {
    if (searchTerm.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchResults = await searchAll(searchTerm)
      setResults(searchResults)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Update URL with search query
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery)
      window.history.pushState({}, "", url.toString())

      performSearch(searchQuery)
    }
  }

  const filteredResults = activeTab === "all"
    ? results
    : results.filter((result) => result.type === activeTab)

  const tabs = [
    { id: "all", label: "All Results", icon: Sparkles },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "technologies", label: "Technologies", icon: Cpu },
    { id: "mails", label: "Inquiries", icon: Mail },
    { id: "user", label: "Users", icon: Users },
  ]

  const getResultCount = (tabId: string) => {
    if (tabId === "all") return results.length
    return results.filter((r) => r.type === tabId).length
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#acc2ef]/10">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(172,194,239,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(172,194,239,0.13) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="mx-auto px-2 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Search</h1>
          <p className="text-sm text-gray-500">Find projects, technologies, inquiries, and users</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for anything…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                pl-10 h-11 text-sm bg-white
                border border-gray-200 rounded-xl
                shadow-sm
                focus-visible:ring-2 focus-visible:ring-[#1E56A0]/30
                focus-visible:border-[#1E56A0]/60
                placeholder:text-gray-300
                transition-all duration-200
              "
            />
          </div>
          <Button
            type="submit"
            className="
              h-11 px-5 rounded-xl text-sm font-medium
              bg-[#1E56A0] hover:bg-[#174a8c]
              shadow-md shadow-[#1E56A0]/20
              hover:shadow-lg hover:shadow-[#1E56A0]/30
              transition-all duration-200
            "
          >
            Search
          </Button>
          </div>
        </form>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100/80 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = getResultCount(tab.id)
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#1E56A0] shadow-md shadow-[#1E56A0]/10"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#1E56A0]" : "text-gray-400"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                    isActive
                      ? "bg-[#1E56A0]/10 text-[#1E56A0]"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Results */}
        <div className="space-y-3">
          {/* Results count */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-medium text-gray-500">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1E56A0]/30 border-t-[#1E56A0] rounded-full animate-spin" />
                  Searching...
                </span>
              ) : (
                `${filteredResults.length} result${filteredResults.length !== 1 ? "s" : ""} found`
              )}
            </h2>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-[#acc2ef] border-t-[#1E56A0] rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-3 border-transparent border-b-[#acc2ef]/50 rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }} />
              </div>
              <p className="text-sm text-gray-500">Searching across all content...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {query ? "No results found" : "Start your search"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {query ? "Try different keywords or check your spelling" : "Enter a search term to find content"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredResults.map((result, index) => {
                const TypeIcon = typeIcons[result.type]

                return (
                  <Link
                    href={result.url}
                    key={`${result.type}-${result.id}`}
                    className="block group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative flex items-center gap-4 p-4 rounded-xl border border-[#acc2ef]/60 bg-white hover:bg-gradient-to-r hover:from-white hover:to-[#acc2ef]/5 hover:border-[#1E56A0]/30 hover:shadow-lg hover:shadow-[#1E56A0]/5 transition-all duration-300 group-hover:-translate-y-0.5">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12 ring-0 ring-offset-0">
                        <AvatarImage
                          src={result.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${result.title}`}
                          alt={result.title}
                        />
                        <AvatarFallback className="text-sm">
                          {result.title.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#1E56A0] transition-colors truncate">
                            {result.title}
                          </h3>
                          <Badge variant={result.type} className="shrink-0">
                            <TypeIcon className="w-3 h-3 mr-1" />
                            {typeLabels[result.type]}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      {result.createdAt && (
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 shrink-0">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>{result.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                      )}

                      {/* Hover arrow indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-5 h-5 text-[#1E56A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
