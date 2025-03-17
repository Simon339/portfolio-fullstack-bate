/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import type React from "react"

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useEffect, useState } from "react"
import { Edit, Minus, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectSchema } from "@/types/vaildations/project"
import { createProject, editProject, fetchCategories, fetchTechstacks } from "@/server/data/projectactions"
import { useTransition } from "react"
import { Badge } from "@/components/ui/badge"

interface ProjectModalProps {
  mode?: "create" | "edit"
  project?: any
}

interface Category {
  id: string
  name: string
}

interface Techstack {
  id: string
  name: string
}

const ProjectModal = ({ mode = "create", project }: ProjectModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categories, setCategories] = useState<Category[]>([])
  const [techstacks, setTechstacks] = useState<Techstack[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [features, setFeatures] = useState<Feature[]>(project?.features || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(project?.categories || [])
  const [selectedTechstacks, setSelectedTechstacks] = useState<string[]>(project?.techstacks || [])

  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      demo: project?.demo || "",
      image: undefined,
      techstacks: project?.techstacks || [],
      categories: project?.categories || [],
    },
  })

  // Update form values when project changes (for edit mode)
  useEffect(() => {
    if (mode === "edit" && project) {
      form.reset({
        name: project.name || "",
        description: project.description || "",
        demo: project.demo || "",
        image: undefined,
        techstacks: project.techstacks || [],
        categories: project.categories || [],
      })
      setFeatures(project.features || [])
      setSelectedCategories(project.categories || [])
      setSelectedTechstacks(project.techstacks || [])
    }
  }, [project, mode, form])

  const addFeature = () => {
    setFeatures([...features, { name: "", description: "" }])
  }

  const removeFeature = (index: number) => {
    const newFeatures = [...features]
    newFeatures.splice(index, 1)
    setFeatures(newFeatures)
  }

  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const newFeatures = [...features]
    newFeatures[index][field] = value
    setFeatures(newFeatures)
  }

  const onSubmit = async (values: z.infer<typeof ProjectSchema>) => {
    if (features.some((f) => !f.name || !f.description)) {
      toast.error("Please fill in all feature fields or remove empty ones")
      return
    }

    setFieldErrors({})
    startTransition(async () => {
      const formData = new FormData()

      // Add basic fields
      formData.append("name", values.name)
      formData.append("description", values.description)
      formData.append("demo", values.demo)

      // Add categories and techstacks
      selectedCategories.forEach((cat) => formData.append("categories[]", cat))
      selectedTechstacks.forEach((tech) => formData.append("techstacks[]", tech))

      // Add image if present
      if (values.image) {
        formData.append("image", values.image)
      }

      // Add features
      formData.append("features", JSON.stringify(features))

      try {
        const result = mode === "create" ? await createProject(formData) : await editProject(project.id, formData)

        if (result.success) {
          toast.success(mode === "create" ? "Created a new project" : "Updated project successfully")
          setIsOpen(false)
          form.reset()
          setFeatures([])
          setSelectedCategories([])
          setSelectedTechstacks([])
        } else {
          throw new Error(result.error || `Failed to ${mode} project`)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : `Failed to ${mode} project`)
      }
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const result = ProjectSchema.shape.image.safeParse(file)
      if (result.success) {
        form.setValue("image", file)
      } else {
        toast.error(result.error.errors[0].message)
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, techstacksData] = await Promise.all([fetchCategories(), fetchTechstacks()])
        setCategories(categoriesData)
        setTechstacks(techstacksData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load categories and techstacks")
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border-[#acc2ef] hover:bg-[#cccbc8] text-gray-700"
          >
            <Plus className="h-2 w-2" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="border-[#acc2ef] text-gray-700">
            
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-[#acc2ef]">
            <div className="flex gap-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Project name" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage>{fieldErrors.name?.[0]}</FormMessage>
                    </FormItem>
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Categories</FormLabel>                     
                      <Select
                      onValueChange={(value) => {
                        if (!selectedCategories.includes(value)) {
                          const newCategories = [...selectedCategories, value]
                          setSelectedCategories(newCategories)
                          field.onChange(newCategories)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCategories.map((catId) => {
                          const category = categories.find((c) => c.id === catId)
                          return category ? (
                            <Badge key={catId} variant="secondary" className="flex items-center gap-1">
                              {category.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  const newCategories = selectedCategories.filter((id) => id !== catId)
                                  setSelectedCategories(newCategories)
                                  field.onChange(newCategories)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                    <FormMessage>{fieldErrors.categories?.[0]}</FormMessage>
                  </FormItem>
                  </div>
                )}
              />
            </div>

            <div className="flex gap-1">
              <FormField
                control={form.control}
                name="demo"
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Demo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter url" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage>{fieldErrors.demo?.[0]}</FormMessage>
                    </FormItem>
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="techstacks"
                render={({ field }) => (
                  <div className="w-full">
                    <FormItem>
                      <FormLabel>Tech Stack</FormLabel>
                      <Select
                      onValueChange={(value) => {
                        if (!selectedTechstacks.includes(value)) {
                          const newTechstacks = [...selectedTechstacks, value]
                          setSelectedTechstacks(newTechstacks)
                          field.onChange(newTechstacks)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tech stack" />
                      </SelectTrigger>
                      <SelectContent>
                        {techstacks.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTechstacks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTechstacks.map((techId) => {
                          const tech = techstacks.find((t) => t.id === techId)
                          return tech ? (
                            <Badge key={techId} variant="secondary" className="flex items-center gap-1">
                              {tech.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => {
                                  const newTechstacks = selectedTechstacks.filter((id) => id !== techId)
                                  setSelectedTechstacks(newTechstacks)
                                  field.onChange(newTechstacks)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                    <FormMessage>{fieldErrors.techstacks?.[0]}</FormMessage>
                  </FormItem>
                  </div>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="w-full">
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input type="file" onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp" />
                    </FormControl>
                    {mode === "edit" && project?.image && (
                      <div className="mt-2">
                      <p className="text-xs">Current image path:</p>
                      <div className="text-sm mt-1 p-2 bg-slate-50 rounded border overflow-hidden text-ellipsis">
                        
                      </div>
                    </div>
                    )}
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your project..." {...field} />
                  </FormControl>
                  <FormMessage>{fieldErrors.description?.[0]}</FormMessage>
                </FormItem>
              )}
            />

             {/* Add Features Section */}
             <div className="space-y-2">
              <FormLabel>Features</FormLabel>
              {features.map((feature, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Feature name"
                      value={feature.name}
                      onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Feature description"
                      value={feature.description}
                      onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addFeature}
                className="text-[#acc2ef] hover:bg-[#685189]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
            >
              {isPending ? "Submitting..." : mode === "create" ? "Create Project" : "Update Project"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectModal

