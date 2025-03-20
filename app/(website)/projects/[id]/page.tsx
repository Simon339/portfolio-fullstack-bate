"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { fetchProjectById } from "@/server/data/projectactions"
import ProjectDetails from "@/components/Website/ProjectDetails"


// Define the project type based on the server response
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

const ProjectPage = () => {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getProject = async () => {
      try {
        setLoading(true)
        const projectId = params.id as string

        if (!projectId) {
          setError("Project ID is missing")
          return
        }

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

    getProject()
  }, [params.id])

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <section className="bg-[#000319] rounded-xl text-white shadow-md mt-4 px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            <p className="mt-4 text-lg">Loading project...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error || !project) {
    return (
      <section className="bg-[#000319] rounded-xl text-white shadow-md mt-4 px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <p className="text-gray-400 mb-6">{error || "The project you're looking for doesn't exist"}</p>
            <Button onClick={() => router.push("/projects")} className="bg-indigo-600 hover:bg-indigo-700">
              Back to Projects
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#000319] rounded-xl text-white shadow-md mt-4 px-4 overflow-hidden min-h-screen flex flex-col">
      
      <div className="flex-1">
        <ProjectDetails projectId={project.id} />
      </div>
    </section>
  )
}

export default ProjectPage

