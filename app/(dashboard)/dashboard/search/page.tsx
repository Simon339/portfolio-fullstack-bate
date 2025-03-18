"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { searchAll, type SearchResult } from "@/server/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (query) {
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

  const filteredResults = activeTab === "all" ? results : results.filter((result) => result.type === activeTab)

  const tabs = [
    { id: "all", label: "All Results" },
    { id: "projects", label: "Projects" },
    { id: "technologies", label: "Technologies" },
    { id: "mails", label: "Inquiries" },
    { id: "user", label: "Users" },
  ]

  return (
    <div className="w-full h-full bg-gray-50 border-[#acc2ef] p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        
        <h1 className="text-xl font-medium text-center flex-1">Search</h1>
        <div className="w-8"></div> 
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white border-[#acc2ef] text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" className="bg-[#1E56A0] hover:bg-[#1E56A0]/90">
          Search
        </Button>
      </form>

      <div className="flex overflow-x-auto py-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-sm rounded-md whitespace-nowrap  border border-[#acc2ef] ${
              activeTab === tab.id ? "bg-[#1E56A0] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <h2 className="text-sm font-medium text-gray-500 mb-4">
          {loading ? "Searching..." : `${filteredResults.length} results found`}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 border-2 border-[#acc2ef] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            {query ? "No results found" : "Enter a search term"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <Link href={result.url} key={`${result.type}-${result.id}`} className="block">
                <div className="flex items-center gap-3 p-3 rounded-md border border-[#acc2ef] hover:bg-gray-50 transition-colors">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={result.image || `https://api.dicebear.com/6.x/initials/svg?seed=${result.title}`} alt={result.title} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {result.title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">{result.title}</h3>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-[#acc2ef]">
                        {result.type === "user" ? "User" : result.type}
                      </Badge>
                    </div>
                    {result.description && <p className="text-xs text-gray-500 truncate">{result.description}</p>}
                  </div>

                  {result.createdAt && (
                    <div className="text-xs text-gray-400 flex items-center whitespace-nowrap">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {result.createdAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


