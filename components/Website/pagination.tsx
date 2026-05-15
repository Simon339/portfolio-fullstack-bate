"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import ReactPaginate from "react-paginate"
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchProject } from "@/server/data/projectactions"
import { Badge } from "@/components/ui/badge"

// Define the project type based on the server response
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

const Pagination = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pageNumber, setPageNumber] = useState(0)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const projectsPerPage = 6

  const router = useRouter()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  const paginationVariants = {
    hidden: {
      opacity: 0,
      y: 100,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 2,
      },
    },
  }

  // Fetch projects from the server
  useEffect(() => {
    const getProjects = async () => {
      try {
        setLoading(true)
        const response = await fetchProject(0, 100) // Fetch all projects, we'll handle pagination client-side

        if (response.success && response.data) {
          setProjects(response.data)

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(response.data.map((project) => project.category?.name).filter(Boolean) as string[]),
          )

          setCategories(uniqueCategories)
          setPageCount(Math.ceil(response.data.length / projectsPerPage))
        } else {
          setError(response.error || "Failed to fetch projects")
        }
      } catch (err) {
        setError("An error occurred while fetching projects")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    getProjects()
  }, [])

  const changePage = ({ selected }: { selected: number }) => {
    setPageNumber(selected)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Filter projects by category
  const filteredProjects = selectedCategory
    ? projects.filter((project) => project.category?.name === selectedCategory)
    : projects

  // Calculate the projects to display on the current page
  const pagesVisited = pageNumber * projectsPerPage
  const displayProjects = filteredProjects.slice(pagesVisited, pagesVisited + projectsPerPage)

  // Update page count when filtering changes
  useEffect(() => {
    setPageCount(Math.ceil(filteredProjects.length / projectsPerPage))
    setPageNumber(0) // Reset to first page when filter changes
  }, [filteredProjects.length])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#000319] text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="mt-4 text-lg">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#000319] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Projects</h2>
          <p className="text-gray-400 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#000319] text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Projects Found</h2>
          <p className="text-gray-400">There are no projects available at the moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#000319] text-white min-h-screen mx-auto px-4">
      <motion.div variants={paginationVariants} initial="hidden" animate="visible" className="mx-auto px-4">
        {/* Category Filter - Centered */}
        {categories.length > 0 && (
          <div className="mb-8 flex justify-center">
            <div className="flex flex-wrap gap-2 justify-center text-white">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  selectedCategory === null
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-[#131b41] border-indigo-900/50 hover:bg-indigo-900/30"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Badge>

              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    selectedCategory === category
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-[#131b41] border-indigo-900/50 hover:bg-indigo-900/30"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {displayProjects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              className="bg-[#0a0e29] rounded-xl overflow-hidden border border-indigo-900/30 hover:border-indigo-700/50 transition-all duration-300 shadow-lg hover:shadow-indigo-900/20 cursor-pointer h-full"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.name}
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <img
                    src="/coming-soonplaceholder.png"
                    alt={project.name}
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                )}

                {/* Category badge */}
                {project.category && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-indigo-600/80 hover:bg-indigo-700/80 backdrop-blur-sm">
                      {project.category.name}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3 flex flex-col h-[calc(100%-12rem)]">
                <h2 className="text-lg font-bold line-clamp-1 text-white">{project.name}</h2>

                <p className="text-gray-300 text-sm line-clamp-2 flex-grow">{project.description}</p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    {project.techstacks.slice(0, 3).map((tech, index) => (
                      <div
                        key={tech.id}
                        className="border border-indigo-900/50 rounded-full bg-[#131b41] w-8 h-8 flex justify-center items-center"
                        style={{ transform: `translateX(-${4 * index}px)` }}
                      >
                        {tech.image ? (
                          <img
                            width={20}
                            height={20}
                            src={tech.image || "/placeholder.svg"}
                            alt={tech.name}
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-bold text-indigo-300">
                            {tech.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}

                    {project.techstacks.length > 3 && (
                      <div
                        className="border border-indigo-900/50 rounded-full bg-[#131b41] w-8 h-8 flex justify-center items-center"
                        style={{ transform: `translateX(-${4 * 3}px)` }}
                      >
                        <span className="text-xs font-bold text-indigo-300">+{project.techstacks.length - 3}</span>
                      </div>
                    )}
                  </div>

                  {project.demo && (
                    <a
                      href={project.demo}
                      className="flex items-center text-indigo-300 hover:text-indigo-200 text-sm"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="mr-1">View</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {pageCount > 1 && (
          <ReactPaginate
            nextLabel={
              <span className="w-10 h-10 flex items-center justify-center bg-[#131b41] rounded-md border border-indigo-900/50 hover:bg-indigo-900/30">
                <ChevronRight className="h-5 w-5" />
              </span>
            }
            onPageChange={changePage}
            pageCount={pageCount}
            previousLabel={
              <span className="w-10 h-10 flex items-center justify-center bg-[#131b41] rounded-md border border-indigo-900/50 hover:bg-indigo-900/30 mr-4">
                <ChevronLeft className="h-5 w-5" />
              </span>
            }
            containerClassName="flex items-center justify-center mt-12"
            pageClassName="block border border-indigo-900/50 hover:bg-indigo-900/30 w-10 h-10 flex items-center justify-center rounded-md mr-4 bg-[#131b41]"
            activeClassName="bg-indigo-700 border-indigo-600 text-white"
            pageLinkClassName="w-full h-full flex items-center justify-center"
            previousLinkClassName="w-full h-full flex items-center justify-center"
            nextLinkClassName="w-full h-full flex items-center justify-center"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        )}
      </motion.div>
    </div>
  )
}

export default Pagination

