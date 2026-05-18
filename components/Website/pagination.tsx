"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import ReactPaginate from "react-paginate"
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, Filter, X, Search, AlertCircle, Sparkles, FolderOpen, Code2, ArrowUpRight, Grid3x3, LayoutList, Clock, TrendingUp, CheckCircle2, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchProject } from "@/server/data/projectactions"
import { Badge } from "@/components/ui/badge"

// Define the project type
type Project = {
  id: string
  name: string
  description: string
  demo: string
  image: string | null
  category: {
    id: string
    name: string
  } | null
  techstacks: Array<{
    id: string
    name: string
    image: string | null
  }>
  features: Array<{
    name: string
    description: string
  }>
}

// View mode type
type ViewMode = "grid" | "list"

// Project card component with improved UX
const ProjectCard = ({ project, onClick, viewMode = "grid" }: { project: Project; onClick: () => void; viewMode?: ViewMode }) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="group rounded-xl overflow-hidden border border-indigo-900/30 hover:border-indigo-700/50 transition-all duration-300 shadow-lg hover:shadow-indigo-900/30 cursor-pointer"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative h-48 md:h-auto md:w-48 flex-shrink-0 overflow-hidden">
            <img
              src={imageError || !project.image ? "/coming-soonplaceholder.png" : project.image}
              alt={project.name}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 192px"
            />
            {project.category && (
              <div className="absolute top-3 right-3 md:left-3 md:right-auto">
                <Badge className="bg-indigo-600/90 backdrop-blur-sm shadow-lg gap-1 text-xs">
                  <FolderOpen className="h-3 w-3" />
                  {project.category.name}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-indigo-400" />
                  {project.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {project.techstacks.length} technologies
                  </span>
                </div>
              </div>
              {project.demo && (
                <a
                  href={project.demo}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-indigo-300 transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Demo
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {project.techstacks.slice(0, 6).map((tech) => (
                <span key={tech.id} className="text-xs px-2 py-1 bg-indigo-900/30 rounded-full text-indigo-300">
                  {tech.name}
                </span>
              ))}
              {project.techstacks.length > 6 && (
                <span className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">
                  +{project.techstacks.length - 6} more
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group bg-gradient-to-br from-[#0a0e29] to-[#06081a] rounded-xl overflow-hidden border border-indigo-900/30 hover:border-indigo-700/50 transition-all duration-300 shadow-lg hover:shadow-indigo-900/30 cursor-pointer hover:translate-y-[-4px]"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageError || !project.image ? "/coming-soonplaceholder.png" : project.image}
          alt={project.name}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e29] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {project.category && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-sm shadow-lg gap-1">
              <FolderOpen className="h-3 w-3" />
              {project.category.name}
            </Badge>
          </div>
        )}

        {project.demo && (
          <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <a
              href={project.demo}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-white/20 transition-all group"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live Demo</span>
              <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h3 className="text-lg font-bold line-clamp-1 text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
          <Code2 className="h-4 w-4 text-indigo-400" />
          {project.name}
        </h3>

        <p className="text-gray-300 text-sm line-clamp-2">{project.description}</p>

        <div className="flex items-center pt-2">
          <div className="flex items-center">
            {project.techstacks.slice(0, 4).map((tech, index) => (
              <div
                key={tech.id}
                className="border-2 border-[#0a0e29] rounded-full bg-gradient-to-br from-indigo-900 to-purple-900 w-8 h-8 flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:z-10 cursor-help"
                style={{ transform: `translateX(-${6 * index}px)` }}
                title={tech.name}
              >
                {tech.image ? (
                  <div className="relative w-6 h-6">
                    <img
                      src={tech.image}
                      alt={tech.name}
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-bold text-indigo-200">
                    {tech.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            ))}

            {project.techstacks.length > 4 && (
              <div
                className="border-2 border-[#0a0e29] rounded-full bg-gradient-to-br from-gray-700 to-gray-800 w-8 h-8 flex items-center justify-center shadow-lg cursor-help"
                style={{ transform: `translateX(-${6 * 4}px)` }}
                title={`${project.techstacks.length - 4} more technologies`}
              >
                <span className="text-xs font-bold text-gray-300">+{project.techstacks.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader component
const ProjectCardSkeleton = ({ viewMode = "grid" }: { viewMode?: ViewMode }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-[#0a0e29] rounded-xl overflow-hidden border border-indigo-900/30 animate-pulse">
        <div className="flex flex-col md:flex-row">
          <div className="h-48 md:h-auto md:w-48 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
          <div className="flex-1 p-6 space-y-3">
            <div className="h-6 bg-indigo-900/50 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-indigo-900/50 rounded w-full" />
              <div className="h-4 bg-indigo-900/50 rounded w-2/3" />
            </div>
            <div className="flex gap-2 pt-4">
              <div className="h-6 bg-indigo-900/50 rounded w-16" />
              <div className="h-6 bg-indigo-900/50 rounded w-16" />
              <div className="h-6 bg-indigo-900/50 rounded w-16" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0a0e29] rounded-xl overflow-hidden border border-indigo-900/30 animate-pulse">
      <div className="h-48 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 relative">
      </div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-indigo-900/50 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-indigo-900/50 rounded w-full" />
          <div className="h-4 bg-indigo-900/50 rounded w-2/3" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="w-8 h-8 bg-indigo-900/50 rounded-full" />
          <div className="w-8 h-8 bg-indigo-900/50 rounded-full" />
          <div className="w-8 h-8 bg-indigo-900/50 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const Pagination = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [showFilters, setShowFilters] = useState(false)
  
  const projectsPerPage = 6
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Ctrl/Cmd + F to toggle filters
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowFilters(!showFilters)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showFilters])

  // Fetch projects
  useEffect(() => {
    const getProjects = async () => {
      try {
        setLoading(true)
        const response = await fetchProject(0, 100)

        if (response.success && response.data) {
          setProjects(response.data)
          const uniqueCategories = Array.from(
            new Set(response.data.map((project) => project.category?.name).filter(Boolean) as string[])
          )
          setCategories(uniqueCategories)
          setPageCount(Math.ceil(response.data.length / projectsPerPage))
        } else {
          setError(response.error || "Failed to fetch projects")
        }
      } catch (err) {
        setError("An error occurred while fetching projects")
      } finally {
        setLoading(false)
      }
    }

    getProjects()
  }, [])

  // Filter and sort logic
  const filteredProjects = useMemo(() => {
    let filtered = projects

    if (selectedCategory) {
      filtered = filtered.filter((project) => project.category?.name === selectedCategory)
    }

    if (debouncedSearch.trim()) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          project.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          project.techstacks.some((tech) => tech.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "oldest":
        // Assuming older projects have smaller IDs (adjust based on your data)
        filtered.sort((a, b) => a.id.localeCompare(b.id))
        break
      case "newest":
      default:
        filtered.sort((a, b) => b.id.localeCompare(a.id))
        break
    }

    return filtered
  }, [projects, selectedCategory, debouncedSearch, sortBy])

  // Pagination logic
  const currentProjects = useMemo(() => {
    const start = currentPage * projectsPerPage
    const end = start + projectsPerPage
    return filteredProjects.slice(start, end)
  }, [filteredProjects, currentPage, projectsPerPage])

  // Update page count when filters change
  useEffect(() => {
    const newPageCount = Math.ceil(filteredProjects.length / projectsPerPage)
    setPageCount(newPageCount)
    setCurrentPage(0)
  }, [filteredProjects.length])

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected)
    // Smooth scroll to top with offset for header
    const element = document.getElementById('projects-grid')
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSearchQuery("")
    setSortBy("newest")
  }

  const getFilterStats = () => {
    let activeFilters = 0
    if (selectedCategory) activeFilters++
    if (searchQuery) activeFilters++
    if (sortBy !== "newest") activeFilters++
    return activeFilters
  }

  if (loading) {
    return (
      <div className="min-h-screen  text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProjectCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-5xl mx-auto px-4"
        >
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Projects</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Loader2 className="h-4 w-4" />
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen  text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
       
        {/* Search and Filter Bar with improved UX */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 space-y-4"
          id="projects-grid"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input with keyboard shortcut hint */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search projects... (⌘K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-[#0a0e29] border border-indigo-900/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                aria-label="Search projects"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Action Buttons Group */}
            <div className="flex gap-2">
              {/* View Mode Toggle */}
              <div className="flex bg-[#0a0e29] rounded-lg border border-indigo-900/50 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid" 
                      ? "bg-indigo-600 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list" 
                      ? "bg-indigo-600 text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
              </div>

              {/* Filter Toggle Button with count */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a0e29] rounded-lg border border-indigo-900/50 hover:border-indigo-600 transition-all relative"
                aria-label="Toggle filters"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {getFilterStats() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full text-xs flex items-center justify-center">
                    {getFilterStats()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0a0e29]/50 backdrop-blur-sm rounded-lg border border-indigo-900/30 p-4 space-y-4">
                  {/* Categories */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={selectedCategory === null ? "default" : "outline"}
                        className={`cursor-pointer px-3 py-1.5 text-sm transition-all gap-1 ${
                          selectedCategory === null
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                            : "bg-[#131b41] border-indigo-900/50 hover:bg-indigo-900/30"
                        }`}
                        onClick={() => setSelectedCategory(null)}
                      >
                        <Star className="h-3 w-3" />
                        All
                        <span className="ml-1 text-xs opacity-75">({filteredProjects.length})</span>
                      </Badge>

                      {categories.map((category) => (
                        <Badge
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          className={`cursor-pointer capitalize text-white px-3 py-1.5 text-sm transition-all gap-1 ${
                            selectedCategory === category
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                              : "bg-[#131b41] border-indigo-900/50 hover:bg-indigo-900/30"
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          <FolderOpen className="h-3 w-3" />
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Sort by
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "newest", label: "Newest", icon: TrendingUp },
                        { value: "oldest", label: "Oldest", icon: Clock },
                        { value: "name", label: "Name", icon: Code2 },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSortBy(option.value as any)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                            sortBy === option.value
                              ? "bg-indigo-600 text-white"
                              : "bg-[#131b41] text-gray-300 hover:bg-indigo-900/30"
                          }`}
                        >
                          <option.icon className="h-3 w-3" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {getFilterStats() > 0 && (
                    <div className="pt-2 border-t border-indigo-900/30">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Summary with loading skeleton */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Showing {currentProjects.length} of {filteredProjects.length} projects
            {selectedCategory && <span className="text-indigo-400">in {selectedCategory}</span>}
          </p>
          {viewMode === "list" && currentProjects.length > 0 && (
            <p className="text-xs text-gray-500">Click any project to view details</p>
          )}
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We couldn't find any projects matching your criteria. Try adjusting your search or filter settings.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: viewMode === "grid" ? 0.1 : 0.05,
                    delayChildren: 0.2,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                : "space-y-4 mb-12"
              }
            >
              <AnimatePresence mode="wait">
                {currentProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    viewMode={viewMode}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Enhanced Pagination with accessibility */}
            {pageCount > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="text-sm text-gray-400">
                  Page {currentPage + 1} of {pageCount}
                </div>
                <ReactPaginate
                  nextLabel={
                    <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#131b41] to-[#0a0e29] rounded-lg border border-indigo-900/50 hover:border-indigo-600 transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  }
                  onPageChange={handlePageChange}
                  pageCount={pageCount}
                  forcePage={currentPage}
                  previousLabel={
                    <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#131b41] to-[#0a0e29] rounded-lg border border-indigo-900/50 hover:border-indigo-600 transition-all">
                      <ChevronLeft className="h-5 w-5" />
                    </span>
                  }
                  containerClassName="flex items-center justify-center gap-2 flex-wrap"
                  pageClassName="block border border-indigo-900/50 hover:bg-indigo-900/30 w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#131b41] to-[#0a0e29] transition-all hover:border-indigo-600"
                  activeClassName="bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-600"
                  pageLinkClassName="w-full h-full flex items-center justify-center"
                  previousLinkClassName="w-full h-full flex items-center justify-center"
                  nextLinkClassName="w-full h-full flex items-center justify-center"
                  disabledClassName="opacity-50 cursor-not-allowed hover:border-indigo-900/50"
                  breakLabel="..."
                  breakClassName="w-10 h-10 flex items-center justify-center text-gray-400"
                  aria-label="Pagination navigation"
                />
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Pagination
