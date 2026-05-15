/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Plus, Minus, X, LinkIcon } from "lucide-react"
import { createProject, editProject, fetchCategories, fetchTechstacks } from "@/server/data/projectactions"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ProjectSchema } from "@/types/vaildations/project"

interface ProjectData extends z.infer<typeof ProjectSchema> {
  id?: string
  techStackDetails?: Array<{ id: string; name: string; image?: string | null }>
}

interface AddProjectFormProps {
  initialData?: ProjectData
  isEditing?: boolean
}

interface Categories {
  id: string
  name: string
}

interface Techstacks {
  id: string
  name: string
  image?: string | null
}

interface Feature {
  name: string
  description: string
}

const ProjectForm = ({ initialData, isEditing = false }: AddProjectFormProps) => {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [image, setImage] = useState<string | undefined>(initialData?.image)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [features, setFeatures] = useState<Feature[]>(initialData?.features || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || [])
  const [selectedTechstacks, setSelectedTechstacks] = useState<string[]>(initialData?.techStack || [])
  const [categories, setCategories] = useState<Categories[]>([])
  const [techstacks, setTechstacks] = useState<Techstacks[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      demo: initialData?.demo || "",
      features: initialData?.features || [],
      techStack: initialData?.techStack || [],
      categories: initialData?.categories || [],
      image: initialData?.image || "",
    },
  })

  // Update form values when dynamic fields change
  useEffect(() => {
    form.setValue("features", features, { shouldValidate: false })
    form.setValue("techStack", selectedTechstacks, { shouldValidate: false })
    form.setValue("categories", selectedCategories, { shouldValidate: false })
  }, [features, selectedTechstacks, selectedCategories, form])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [categoriesData, techstacksData] = await Promise.all([fetchCategories(), fetchTechstacks()])
        setCategories(categoriesData)
        setTechstacks(techstacksData)

        // If editing, initialize selected values from initialData
        if (isEditing && initialData) {
          setSelectedCategories(initialData.categories || [])
          setSelectedTechstacks(initialData.techStack || [])
          setFeatures(initialData.features || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load form data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isEditing, initialData])

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

  const validateForm = () => {
    // Validate required fields
    if (!form.getValues("name")) {
      form.setError("name", { message: "Name is required" });
      return false;
    }
  
    if (!form.getValues("description")) {
      form.setError("description", { message: "Description is required" });
      return false;
    }
  
    // Validate demo URL
    const demoUrl = form.getValues("demo");
    if (demoUrl && !demoUrl.startsWith("http")) {
      form.setError("demo", { message: "Please enter a valid URL" });
      return false;
    }
  
    // Check for empty features
    if (features.length === 0) {
      toast.error("Please add at least one feature");
      return false;
    }
  
    if (features.some((f) => !f.name || !f.description)) {
      toast.error("Please fill in all feature fields or remove empty ones");
      return false;
    }
  
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return false;
    }
  
    if (selectedTechstacks.length === 0) {
      toast.error("Please select at least one technology");
      return false;
    }
  
    return true;
  };
  
  const onSubmit = async (values: z.infer<typeof ProjectSchema>) => {
    console.log("Form submitted with values:", values);
  
    if (!validateForm()) {
      return;
    }
  
    setFieldErrors({});
    startTransition(async () => {
      try {
        const data = new FormData();
        data.append("name", values.name);
        data.append("description", values.description);
        if (values.demo) {
          data.append("demo", values.demo);
        }
  
        // Add image if available (use the File object)
        if (imageFile) {
          data.append("image", imageFile);
        } else if (image) {
          // If we have a string image URL but no file (like from initialData)
          // Create a blob from the base64 string and append it
          try {
            const response = await fetch(image);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            data.append("image", file);
          } catch (error) {
            console.error("Error converting image URL to file:", error);
            // Just pass the image string if conversion fails
            data.append("image", image);
          }
        }
  
        // Add features as JSON string
        data.append("features", JSON.stringify(features));
  
        // Add categories and techstacks as JSON arrays
        data.append("categories", JSON.stringify(selectedCategories));
        data.append("techstacks", JSON.stringify(selectedTechstacks));
  
        if (isEditing && initialData?.id) {
          // For edit operation
          const result = await editProject(initialData.id, data);
  
          if (result.success) {
            toast.success("Project updated successfully");
            router.push(`/dashboard/projects`);
          } else {
            toast.error(
              typeof result.error === "string"
                ? result.error
                : "There was an error updating your project"
            );
          }
        } else {
          // For create operation
          const result = await createProject(data);
  
          if (result.success) {
            toast.success("Project created successfully");
            form.reset();
            setImage(undefined);
            setImageFile(null); // Reset the File object
            setFeatures([]);
            setSelectedCategories([]);
            setSelectedTechstacks([]);
            router.push(`/dashboard/projects`);
          } else {
            toast.error(
              typeof result.error === "string"
                ? result.error
                : "There was an error creating your project"
            );
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Store the actual File object
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImage(e.target.result as string);
          // Don't set the file to the form value, just set a string or null
          form.setValue("image", "image-selected");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white/50 backdrop-blur-sm border border-gray-100 min-h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#acc2ef]"></div>
      </div>
    )
  }

  return (
    <div className="w-full font-medium p-6 bg-white/50 backdrop-blur-sm border border-gray-100">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      className="bg-gray-50 border-[#acc2ef] text-gray-800 placeholder:text-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">Category</FormLabel>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(value) => {
                        if (!selectedCategories.includes(value)) {
                          const newCategories = [...selectedCategories, value]
                          setSelectedCategories(newCategories)
                          field.onChange(newCategories)
                        }
                      }}
                    >
                      <SelectTrigger className="bg-gray-50 border-[#acc2ef] text-gray-800">
                        <SelectValue placeholder="Select categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-50 border-[#acc2ef]">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                            disabled={selectedCategories.includes(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 p-2 ">
                        {selectedCategories.map((catId) => {
                          const category = categories.find((c) => c.id === catId)
                          return category ? (
                            <Badge
                              key={catId}
                              variant="secondary"
                              className="bg-[#acc2ef]/20 text-[#685189] border border-[#acc2ef]"
                            >
                              {category.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-[#685189] hover:text-[#685189]/80"
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
                  </div>
                  <FormMessage />
                </FormItem>
              )}
          />
          </div>

          <FormField
            control={form.control}
            name="demo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Demo URL</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-[#acc2ef]" />
                    </div>
                    <Input
                      placeholder="https://your-demo-url.com"
                      {...field}
                      className="bg-gray-50 border-[#acc2ef] text-gray-800 pl-10 placeholder:text-gray-400"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-gray-700 font-semibold">Tech Stack</FormLabel>
                    <div className="text-sm text-gray-500">{selectedTechstacks.length} selected</div>
                  </div>

                  <div className="bg-gray-50 p-4">
                    {selectedTechstacks.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2 p-3 bg-white rounded-md border border-[#acc2ef]/50">
                        {selectedTechstacks.map((techId) => {
                          const tech = techstacks.find((t) => t.id === techId)
                          return tech ? (
                            <Badge
                              key={techId}
                              variant="secondary"
                              className="bg-[#acc2ef]/20 text-[#685189] border border-[#acc2ef] flex items-center gap-1"
                            >
                              {tech.image && (
                                <img
                                  src={tech.image || "/placeholder.svg"}
                                  alt={tech.name}
                                  width={12}
                                  height={12}
                                  className="h-3 w-3 object-contain"
                                />
                              )}
                              {tech.name}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-[#685189] hover:text-[#685189]/80"
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

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {techstacks.map((tech) => (
                        <div key={tech.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={tech.id}
                            checked={selectedTechstacks.includes(tech.id)}
                            onCheckedChange={(checked) => {
                              const newTechstacks = checked
                                ? [...selectedTechstacks, tech.id]
                                : selectedTechstacks.filter((id) => id !== tech.id)
                              setSelectedTechstacks(newTechstacks)
                              field.onChange(newTechstacks)
                            }}
                            className="border-[#acc2ef] data-[state=checked]:bg-[#685189] data-[state=checked]:border-[#685189]"
                          />
                          <label
                            htmlFor={tech.id}
                            className="text-sm font-medium leading-none text-gray-700  flex items-center gap-2 cursor-pointer"
                          >
                            {tech.image && (
                              <img
                                src={tech.image || "/placeholder.svg"}
                                alt={tech.name}
                                width={16}
                                height={16}
                                className="h-4 w-4 object-contain"
                              />
                            )}
                            {tech.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Project Image</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="bg-gray-50 border-[#acc2ef] text-gray-800 file:bg-[#acc2ef]/20 file:text-[#685189] file:border-0 file:font-medium"
                    />

                    {image && (
                      <div className="relative bg-slate-50 rounded-lg border border-[#acc2ef]/30 p-3 overflow-hidden">
                        <div className="flex items-start gap-3">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#acc2ef]">
                            <img
                              src={image || "/placeholder.svg"}
                              alt="Project preview"
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">Selected image:</p>
                            <p className="text-sm text-gray-700 truncate">
                              {imageFile ? imageFile.name : "Project image"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => {
                              setImage(undefined)
                              setImageFile(null)
                              form.setValue("image", undefined)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your project..."
                    {...field}
                    className="bg-gray-50 border-[#acc2ef] text-gray-800 min-h-[120px] placeholder:text-gray-400"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-gray-700 font-semibold">Features</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={addFeature}
                      className="text-[#685189] border-[#acc2ef] hover:bg-[#acc2ef]/10"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {features.length === 0 ? (
                    <div className="p-8 border border-dashed border-[#acc2ef] rounded-lg bg-gray-50/50 text-center">
                      <p className="text-gray-500">No features added yet. Click &quot;Add&quot; to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Feature name"
                              value={feature.name}
                              onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                              className="bg-gray-50 border-[#acc2ef] text-gray-800 placeholder:text-gray-400"
                            />
                            <Input
                              placeholder="Feature description"
                              value={feature.description}
                              onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                              className="bg-gray-50 border-[#acc2ef] text-gray-800 placeholder:text-gray-400"
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
                    </div>
                  )}
                </div> 
                <FormMessage />
              </FormItem>
            )}
          />

            <div className="flex gap-4">
           <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold"
            >
              {isPending ? "Submitting..." : isEditing ? "Update Project" : "Create Project"}
            </Button>
          
            <Button
              type="button"
              disabled={isPending}
              className="w-32 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-bold"
            >
              {isPending ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default ProjectForm

