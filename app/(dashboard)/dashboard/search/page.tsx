"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { searchAll, type SearchResult } from "@/server/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, Cpu, FolderOpen, Mail, Search, Logs, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const typeIcons = {
  project: FolderOpen,
  techstack: Cpu,
  inquiry: Mail,
  user: Users,
  category: FolderOpen,
  contact: Mail,
}

const typeLabels = {
  project: "Project",
  techstack: "Technology",
  inquiry: "Inquiry",
  user: "User",
  category: "Category",
  contact: "Contact",
}

const typeColors: Record<string, string> = {
  project: "bg-violet-50 text-violet-700 border-violet-200",
  techstack: "bg-sky-50 text-sky-700 border-sky-200",
  inquiry: "bg-amber-50 text-amber-700 border-amber-200",
  user: "bg-emerald-50 text-emerald-700 border-emerald-200",
  category: "bg-purple-50 text-purple-700 border-purple-200",
  contact: "bg-orange-50 text-orange-700 border-orange-200",
}


const typeAccents: Record<string, string> = {
  project: "from-violet-500/10",
  techstack: "from-sky-500/10",
  inquiry: "from-amber-500/10",
  user: "from-emerald-500/10",
  category: "from-purple-500/10",
  contact: "from-orange-500/10",
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      performSearch(query)
    }
  }, [query])

  // Debounced search for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2 && searchQuery !== query) {
        performSearch(searchQuery)
      } else if (searchQuery.trim().length < 2 && searchQuery !== query) {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

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
      throw "Something went wrong while searching. Please try again later."
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery)
      window.history.pushState({}, "", url.toString())
      performSearch(searchQuery)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setResults([])
    inputRef.current?.focus()
    const url = new URL(window.location.href)
    url.searchParams.delete("q")
    window.history.pushState({}, "", url.toString())
  }

  const filteredResults =
    activeTab === "all"
      ? results
      : results.filter((result) => result.type === activeTab)

  const tabs = [
    { id: "all", label: "All", icon: Logs },
    { id: "project", label: "Projects", icon: FolderOpen },
    { id: "techstack", label: "Technologies", icon: Cpu },
    { id: "inquiry", label: "Inquiries", icon: Mail },
    { id: "user", label: "Users", icon: Users },
    { id: "category", label: "Categories", icon: FolderOpen },
    { id: "contact", label: "Contacts", icon: Mail },
  ]


  const getResultCount = (tabId: string) => {
    if (tabId === "all") return results.length
    return results.filter((r) => r.type === tabId).length
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#f8f9fc] to-[#f0f2f5]">
      <div className="relative mx-auto px-4 py-8 md:py-12 space-y-6 md:space-y-8">

        {/*  Header with animation  */}
        <header className="space-y-2 text-center animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center justify-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Search
            </h1>
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Find projects, technologies, inquiries and users
          </p>
        </header>

        {/*  Search form with clear button  */}
        <form onSubmit={handleSearch} className="flex gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for anything…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                pl-10 pr-10 h-12 text-sm bg-white/80 backdrop-blur-sm
                border border-[#acc2ef] rounded-xl
                shadow-sm hover:shadow-md
                focus-visible:ring-2 focus-visible:ring-[#1E56A0]/30
                focus-visible:border-[#acc2ef]/60
                placeholder:text-gray-300
                transition-all duration-200
              `}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="
              h-12 px-6 rounded-xl text-sm font-medium
              bg-[#1E56A0] hover:bg-[#174a8c]
              shadow-md shadow-[#1E56A0]/20
              hover:shadow-lg hover:shadow-[#1E56A0]/30
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#acc2ef]/30 border-t-[#acc2ef] rounded-full animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {/*  Tabs with better UX  */}
        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 delay-200">
            <div className="flex items-center gap-1 border-b border-[#acc2ef] overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const count = getResultCount(tab.id)
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-2.5 text-sm
                      font-medium transition-all duration-150 whitespace-nowrap
                      hover:bg-gray-50 rounded-t-lg
                      ${isActive ? "text-[#1E56A0]" : "text-gray-500 hover:text-gray-700"}
                    `}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label[0]}</span>
                    {count > 0 && (
                      <span
                        className={`
                          px-1.5 py-px text-[10px] font-semibold rounded-full
                          transition-colors duration-150
                          ${isActive
                            ? "bg-[#1E56A0]/10 text-[#1E56A0]"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
                        `}
                      >
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1E56A0]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/*  Results area  */}
        <div className="space-y-3">

          {/* Status line with animation */}
          {!loading && (results.length > 0 || query) && (
            <div className="animate-in fade-in duration-300">
              <p className="text-xs text-gray-400 px-0.5 pb-1 flex items-center justify-between">
                <span>
                  {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}{" "}
                  {query && <span>for <span className="font-medium text-gray-600">"{query}"</span></span>}
                </span>
                {activeTab !== "all" && filteredResults.length > 0 && (
                  <button
                    onClick={() => setActiveTab("all")}
                    className="text-xs text-[#1E56A0] hover:underline"
                  >
                    View all
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="space-y-2 animate-in fade-in duration-300">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-[#acc2ef] bg-white animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            /* Empty state with better UX */
          ) : filteredResults.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 gap-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-[#acc2ef] shadow-sm flex items-center justify-center">
                {query ? (
                  <Search className="w-8 h-8 text-gray-300" />
                ) : (
                  <Search  className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-medium text-gray-600">
                  {query ? "No results found" : "Ready to search"}
                </p>
                <p className="text-sm text-gray-400 max-w-sm">
                  {query
                    ? "Try different keywords or check your spelling"
                    : "Enter a search term above to find content"}
                </p>
                {query && (
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-sm text-[#1E56A0] hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            /* Results list with staggered animation */
          ) : (
            <ul className="space-y-2">
              {filteredResults.map((result, index) => {
                const TypeIcon = (typeIcons as Record<string, any>)[result.type] || FolderOpen
                const colorClass = typeColors[result.type] ?? "bg-gray-50 text-gray-600 border-[#acc2ef]"
                const accentClass = typeAccents[result.type] ?? "from-gray-500/5"

                return (
                  <li
                    key={`${result.type}-${result.id}`}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  >
                    <Link href={result.url} className="block group">
                      <div
                        className={`
                          relative flex items-center gap-4 p-4
                          rounded-xl border border-[#acc2ef] bg-white/80 backdrop-blur-sm
                          hover:border-[#acc2ef]
                          hover:bg-gradient-to-r ${accentClass} hover:to-transparent
                          hover:shadow-lg hover:shadow-gray-100/50
                          transition-all duration-300
                          group-hover:-translate-y-0.5
                          cursor-pointer
                        `}
                      >
                        {/* Avatar with hover effect */}
                        <Avatar className="h-10 w-10 rounded-xl shrink-0 ring-1 ring-gray-100 transition-transform duration-200 group-hover:scale-105">
                          <AvatarImage
                            src={
                              result.image ||
                              `https://api.dicebear.com/7.x/shapes/svg?seed=${result.title}`
                            }
                            alt={result.title}
                          />
                          <AvatarFallback className="rounded-xl text-xs font-semibold bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600">
                            {result.title.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[#1E56A0] transition-colors truncate">
                              {result.title}
                            </h3>
                            <span
                              className={`
                                inline-flex items-center gap-1 px-2 py-0.5
                                text-[10px] font-semibold rounded-full border
                                transition-all duration-200
                                group-hover:scale-105
                                ${colorClass}
                              `}
                            >
                              <TypeIcon className="w-2.5 h-2.5" />
                              {(typeLabels as Record<string, string>)[result.type] || result.type}
                            </span>
                          </div>
                          {result.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate group-hover:text-gray-500 transition-colors">
                              {result.description}
                            </p>
                          )}
                        </div>

                        {/* Date with better formatting */}
                        {result.createdAt && (
                          <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors shrink-0">
                            <CalendarIcon className="h-3 w-3" />
                            <span className="font-mono">
                              {result.createdAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Arrow with enhanced animation */}
                        <ArrowRight
                          className="
                            w-4 h-4 text-gray-300 shrink-0
                            group-hover:text-[#1E56A0] group-hover:translate-x-1
                            transition-all duration-300
                          "
                        />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
