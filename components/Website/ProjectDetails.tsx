
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import { fetchProjectById } from "@/server/data/projectactions"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type ProjectFeature = {
  name: string
  description: string
}

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
  features: ProjectFeature[]
}

interface ProjectDetailsProps {
  projectId: string
}

export default function ProjectDetails({ projectId }: ProjectDetailsProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true)
        const response = await fetchProjectById(projectId)

        if (response.success && response.data) {
          setProject(response.data)
        } else {
          setError(response.error || "Failed to load project")
        }
      } catch (err) {
        setError("An error occurred while fetching the project")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      getProject()
    }
  }, [projectId])

  if (loading) {
    return <ProjectDetailsSkeleton />
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
        <p className="text-gray-400 mb-6">{error || "Project not found"}</p>
        <Link href="/projects">
          <Button variant="outline" className="border-gray-700 bg-gray-800/50 hover:bg-gray-700/50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#000319] text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <Link href="/projects" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Project Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-800 bg-gray-900/20">
            {project.image ? (
              <Image
                src={project.image}
                alt={project.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <Image
                src="/coming-soonplaceholder.png"
                alt={project.name}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {project.category && (
                  <Badge
                    variant="outline"
                    className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                  >
                    {project.category.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{project.name}</h1>
              <p className="text-gray-300 leading-relaxed">{project.description}</p>
            </div>

            {/* Technologies */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {project.techstacks.map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-2 rounded-full bg-gray-800/50 border border-gray-700/50 px-3 py-1.5"
                  >
                    {tech.image && (
                      <div className="w-5 h-5 relative">
                        <Image
                          src={tech.image || "/placeholder.svg"}
                          alt={tech.name}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {project.features.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5"></div>
                      <div>
                        <h3 className="font-medium text-white">{feature.name}</h3>
                        {feature.description && <p className="text-gray-400 text-sm mt-1">{feature.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-4">
              {project.demo && (
                <Link href={project.demo} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    View Demo
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="border-gray-700 bg-gray-800/50 hover:bg-gray-700/50">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectDetailsSkeleton() {
  return (
    <div className="w-full bg-[#000319] text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center text-gray-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Skeleton className="h-4 w-24 bg-gray-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Project Image Skeleton */}
          <Skeleton className="aspect-video rounded-lg bg-gray-800/50" />

          {/* Project Details Skeleton */}
          <div className="space-y-8">
            <div>
              <Skeleton className="h-6 w-24 mb-2 bg-gray-800/50" />
              <Skeleton className="h-10 w-3/4 mb-4 bg-gray-800/50" />
              <Skeleton className="h-4 w-full mb-2 bg-gray-800/50" />
              <Skeleton className="h-4 w-full mb-2 bg-gray-800/50" />
              <Skeleton className="h-4 w-2/3 bg-gray-800/50" />
            </div>

            {/* Technologies Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-4 bg-gray-800/50" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full bg-gray-800/50" />
                ))}
              </div>
            </div>

            {/* Features Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4 bg-gray-800/50" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-700 mt-2.5"></div>
                    <div className="w-full">
                      <Skeleton className="h-5 w-1/3 mb-1 bg-gray-800/50" />
                      <Skeleton className="h-4 w-full bg-gray-800/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Skeleton */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Skeleton className="h-10 w-32 bg-gray-800/50" />
              <Skeleton className="h-10 w-32 bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

