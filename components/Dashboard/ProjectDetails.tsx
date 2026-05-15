"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, ExternalLink, Globe, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { deleteProject } from "@/server/data/projectactions"
import DeleteConfirmationModal from "./modals/DeleteProjectModal"

interface ProjectDetailsProps {
  project: {
    id: string
    name: string
    description: string
    demo: string
    image: string
    category: {
      id: string
      name: string
    }
    techstacks: Array<{
      id: string
      name: string
      image: string
    }>
    features: any
    status: string
  }
}

const ProjectDetailsClient = ({ project }: ProjectDetailsProps) => {
  const router = useRouter()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectDetailsProps["project"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [parsedFeatures, setParsedFeatures] = useState<Array<{ name: string; description: string }>>([])

  // Helper function to parse features
  const parseFeatures = (featuresValue: any): Array<{ name: string; description: string }> => {
    let featuresArray: Array<{ name: string; description: string }> = []

    try {
      if (typeof featuresValue === 'string') {
        const featuresStr = featuresValue.trim()

        if (featuresStr.startsWith('[') && featuresStr.endsWith(']')) {
          // Parse as JSON array
          const parsed = JSON.parse(featuresStr)

          // Handle both array of strings and array of objects
          if (Array.isArray(parsed)) {
            featuresArray = parsed.map(item => {
              if (typeof item === 'string') {
                return { name: item, description: '' }
              } else if (typeof item === 'object' && item !== null) {
                return {
                  name: item.name || item.Name || 'Feature',
                  description: item.description || item.Description || ''
                }
              }
              return { name: 'Feature', description: '' }
            })
          }
        } else if (featuresStr.includes(',')) {
          // Comma-separated string
          featuresArray = featuresStr.split(',').map(item => ({
            name: item.trim(),
            description: ''
          }))
        } else if (featuresStr !== '') {
          // Single feature string
          featuresArray = [{ name: featuresStr, description: '' }]
        }
      } else if (Array.isArray(featuresValue)) {
        // Already an array
        featuresArray = featuresValue.map(item => {
          if (typeof item === 'string') {
            return { name: item, description: '' }
          } else if (typeof item === 'object' && item !== null) {
            return {
              name: item.name || item.Name || 'Feature',
              description: item.description || item.Description || ''
            }
          }
          return { name: 'Feature', description: '' }
        })
      }
    } catch (error) {
    }

    return featuresArray
  }

  useEffect(() => {
    if (project) {
      // Parse features when project data is available
      const parsed = parseFeatures(project.features)
      setParsedFeatures(parsed)
      setLoading(false)
    }
  }, [project])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const handleBack = () => {
    router.push("/dashboard/projects")
  }

  const handleDeleteClick = (project: ProjectDetailsProps["project"]) => {
    setProjectToDelete(project)
    setDeleteModalOpen(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      const result = await deleteProject(projectToDelete.id)
      if (result.success) {
        toast.success("Project deleted successfully")
        router.push("/dashboard/projects")
      } else {
        toast.error(result.error || "Failed to delete project")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the project")
    } finally {
      setDeleteModalOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 md:p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/projects/edit/${project.id}`}>
              <Button variant="ghost" size="icon" className="size-8 border-[#acc2ef] text-gray-700">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit project</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleDeleteClick(project)}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        <Card className="border h-full w-full border-[#acc2ef] bg-white shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">{project.name}</h1>
                <div className="flex flex-wrap gap-2">
                {project.category?.name && (
                  <Badge variant="outline" className="bg-[#acc2ef]/10 border-[#acc2ef] text-gray-700">
                    {project.category.name}
                  </Badge>
                )}

                {project.status && (
                  <Badge
                    variant="outline"
                    className={
                      project.status.toLowerCase() === "published"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : project.status.toLowerCase() === "draft"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {project.status}
                  </Badge>
                )}
                </div>
              </div>

              {project.demo && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="border-[#acc2ef] text-gray-700 hover:bg-[#acc2ef]/10 self-start"
                >
                  <Link href={project.demo} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-1.5 h-4 w-4" />
                    Live Demo
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>

            <Separator className="my-6 bg-gray-100" />

            <div className="grid md:grid-cols-[280px_1fr] gap-8">
              <div className="space-y-6">
                <div className="rounded-lg overflow-hidden border border-[#acc2ef]/30 bg-white">
                  <img
                    src={project.image || "/coming-soonplaceholder.png"}
                    alt={project.name || "Project Image"}
                    width={280}
                    height={280}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techstacks && project.techstacks.length > 0 ? (
                      project.techstacks.map((tech) => (
                        <div
                          key={tech.id}
                          className="flex items-center gap-2 bg-gray-50 border border-[#acc2ef]/30 px-3 py-1.5 rounded-md"
                        >
                          {tech.image && (
                            <img
                              src={tech.image || "/placeholder.svg?height=16&width=16"}
                              alt={tech.name || "Tech Image"}
                              width={16}
                              height={16}
                              className="rounded-sm object-cover"
                            />
                          )}
                          <span className="text-sm text-gray-700">{tech.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No technologies specified</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Description</h3>
                <div className="bg-gray-50 border border-[#acc2ef]/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
                <div className="space-y-4">
                  {parsedFeatures.length > 0 ? (
                    parsedFeatures.map((feature, index) => (
                      <div key={index} className="bg-gray-50 border border-[#acc2ef]/20 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-800 mb-2">{feature.name}</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                          {feature.description || "No description provided"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 border border-[#acc2ef]/20 rounded-lg p-4">
                      <p className="text-sm text-gray-500">No features specified</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
          itemName={projectToDelete?.name || ""}
        />
      </div>
    </div>
  )
}

export default ProjectDetailsClient