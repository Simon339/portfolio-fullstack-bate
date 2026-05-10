/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "../db"
import { CategoriesSchema } from "@/types/vaildations/project"
import { auditLogs, categories, projects, techstacks, projectTechstacks } from "../schema"
import { eq, inArray, desc, and } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/server/auth" 
import { v4 as uuidv4 } from "uuid"
import { projectsData } from "@/data"

const TechstackSchema = z.object({
  name: z.string().min(1, "Techstack name is required"),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported.",
    )
    .optional(),
})

// Helper function to convert File to base64 string
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function fetchTechstacks() {
  return await db.select().from(techstacks)
}

export async function createTechstack(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const validatedFields = TechstackSchema.parse({
      name: formData.get("name"),
      image: formData.get("image"),
    })

    let imageString = ""
    if (validatedFields.image) {
      imageString = await fileToBase64(validatedFields.image)
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Generate UUID for the ID
    const techstackId = uuidv4()

    // Check if techstack with this name already exists
    const existingTechstack = await db
      .select()
      .from(techstacks)
      .where(eq(techstacks.name, validatedFields.name))
      .then((result) => result[0])

    if (existingTechstack) {
      return { 
        error: "Duplicate techstack", 
        details: `A techstack named "${validatedFields.name}" already exists.`
      }
    }

    // Insert with explicit ID and use  to get the created record
    const [newTechstack] = await db
      .insert(techstacks)
      .values({
        id: techstackId,
        name: validatedFields.name,
        image: imageString,
      })
      

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "techstacks",
      recordId: newTechstack.id,
      userId: userId,
      details: JSON.stringify({ 
        action: "Techstack created", 
        data: {
          id: newTechstack.id,
          name: newTechstack.name,
          hasImage: !!newTechstack.image
        } 
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/techstacks")
    
    // Return only serializable data
    return { 
      success: true,
      message: "Techstack created successfully", 
      data: {
        id: newTechstack.id,
        name: newTechstack.name,
        image: newTechstack.image
      }
    }
  } catch (error) {
    // Handle specific database errors
    if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
      return { 
        error: "Database error",
        details: "This techstack name might already exist or there's a database constraint issue."
      }
    }
    
    return { 
      error: "Failed to create techstack", 
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function editTechstack(id: string, data: FormData) {
  const session = await auth.api.getSession({
      headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const name = data.get("name") as string | null
    const image = data.get("image") as File | null

    const updateData: { name?: string; image?: string } = {}

    if (name) {
      updateData.name = name
    }

    if (image) {
      // Validate the image
      TechstackSchema.shape.image.parse(image)
      updateData.image = await fileToBase64(image)
    }

    // Update and return the updated record
    const [updatedTechstack] = await db
      .update(techstacks)
      .set(updateData)
      .where(eq(techstacks.id, id))
      

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "techstacks",
      recordId: id,
      userId: userId,
      details: JSON.stringify({ 
        action: "Techstack updated", 
        data: {
          id: updatedTechstack.id,
          name: updatedTechstack.name,
          hasImage: !!updatedTechstack.image
        }
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/techstacks")
    
    // Return only serializable data
    return { 
      success: true,
      message: "Techstack updated successfully", 
      data: {
        id: updatedTechstack.id,
        name: updatedTechstack.name,
        image: updatedTechstack.image
      }
    }
  } catch (error) {
    return { 
      success: false,
      error: "Failed to update techstack", 
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function deleteTechstacks(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const techstacksToDelete = await db.select().from(techstacks).where(inArray(techstacks.id, ids))

    await db.delete(techstacks).where(inArray(techstacks.id, ids))

    // Log the action in audit_logs
    for (const techstack of techstacksToDelete) {
      await db.insert(auditLogs).values({
        action: "DELETE",
        tableName: "techstacks",
        recordId: techstack.id,
        userId: userId, 
        details: JSON.stringify({ 
          action: "Techstack deleted", 
          data: {
            id: techstack.id,
            name: techstack.name
          }
        }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
    }

    revalidatePath("/techstacks")
    
    return { 
      success: true,
      message: "Techstacks deleted successfully" 
    }
  } catch (error) {
    return { 
      success: false,
      error: "Failed to delete techstacks",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

// Categories

export async function fetchCategories() {
  try {
    const categoryData = await db.select().from(categories)
    return categoryData
  } catch (error) {
    throw new Error("Something went wrong!!!")
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const validatedFields = CategoriesSchema.parse({
      name: formData.get("name"),
    })

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Generate a UUID for the ID
    const categoryId = uuidv4()

    // Insert with explicit ID and return the created record
    const [newCategory] = await db
      .insert(categories)
      .values({ 
        id: categoryId,
        name: validatedFields.name 
      })
      

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "categories",
      recordId: newCategory.id,
      userId: userId,
      details: JSON.stringify({ 
        action: "Category created", 
        data: {
          id: newCategory.id,
          name: newCategory.name
        } 
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/categories")
    
    return { 
      success: true,
      message: "Category created successfully",
      data: {
        id: newCategory.id,
        name: newCategory.name
      }
    }
  } catch (error) {
    // Check if it's a duplicate name error
    if (error?.code === 'ER_DUP_ENTRY' || error?.errno === 1062) {
      return { 
        success: false,
        error: "Category already exists with this name",
        details: "A category with this name already exists. Please use a different name."
      }
    }
    
    return { 
      success: false,
      error: "Failed to create category", 
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function editCategory(id: string, data: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const name = data.get("name") as string | null

    const updateData: { name?: string } = {}

    if (name) {
      updateData.name = name
    }

    // Update and return the updated record
    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "categories",
      recordId: id,
      userId: userId,
      details: JSON.stringify({ 
        action: "Category updated", 
        data: {
          id: updatedCategory.id,
          name: updatedCategory.name
        }
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    return { 
      success: true,
      message: "Category updated successfully", 
      data: {
        id: updatedCategory.id,
        name: updatedCategory.name
      }
    }
  } catch (error) {
    return { 
      success: false,
      error: "Failed to update category",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function deleteCategories(ids: string[]) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const categoriesToDelete = await db.select().from(categories).where(inArray(categories.id, ids))

    await db.delete(categories).where(inArray(categories.id, ids))

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Log the action in audit_logs
    for (const category of categoriesToDelete) {
      await db.insert(auditLogs).values({
        action: "DELETE",
        tableName: "categories",
        recordId: category.id,
        userId: userId,
        details: JSON.stringify({ 
          action: "Category deleted", 
          data: {
            id: category.id,
            name: category.name
          }
        }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
    }

    revalidatePath("/categories")

    return {
      success: true,
      message: `${ids.length} categories deleted successfully`,
      deletedCount: ids.length,
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete categories",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

// Create a new project
export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Extract data from FormData
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const demo = formData.get("demo") as string;
    const image = formData.get("image") as File | null;
    const features = JSON.parse(formData.get("features") as string);
    const categories = JSON.parse(formData.get("categories") as string);
    const techstacks = JSON.parse(formData.get("techstacks") as string);

    // Validate required fields
    if (!name || !description || categories.length === 0 || techstacks.length === 0) {
      throw new Error("Missing required fields");
    }

    // Handle image upload (convert to base64 for simplicity)
    let imageUrl = "";
    if (image) {
      imageUrl = await fileToBase64(image);
    }

    const projectId = uuidv4();

    // Insert the project and return the created record
    const [project] = await db
      .insert(projects)
      .values({
        id: projectId,
        name,
        description,
        demo: demo || "",
        image: imageUrl,
        categoryId: categories[0],
        features: JSON.stringify(features),
      })
      ;

    // Insert project-techstack relationships
    const techstackRelations = techstacks.map((techstackId: string) => ({
      projectId: project.id,
      techstackId,
    }));
    await db.insert(projectTechstacks).values(techstackRelations);

    // Dynamically collect IP address and user agent
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "projects",
      recordId: project.id,
      userId: userId,
      details: JSON.stringify({
        action: "Project created",
        data: {
          id: project.id,
          name: project.name,
          categoryId: project.categoryId
        },
        techstackIds: techstacks,
        features,
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    revalidatePath("/projects");
    
    // Return only serializable data
    return { 
      success: true, 
      message: "Project created successfully", 
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        demo: project.demo,
        image: project.image,
        categoryId: project.categoryId,
        features: JSON.parse(project.features || "[]"),
      }
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to create project",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Edit an existing project
export async function editProject(id: string, formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    // Extract data from FormData
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const demo = formData.get("demo") as string
    const imageData = formData.get("image")
    const features = JSON.parse(formData.get("features") as string)
    const categories = JSON.parse(formData.get("categories") as string)
    const techstacks = JSON.parse(formData.get("techstacks") as string)

    // Validate required fields
    if (!id || !name || !description || categories.length === 0 || techstacks.length === 0) {
      throw new Error("Missing required fields")
    }

    // Improved image handling
    let imageUrl = ""

    if (imageData instanceof File) {
      // Handle File object
      imageUrl = await fileToBase64(imageData)
    } else if (typeof imageData === "string" && imageData.startsWith('data:')) {
      // If it's already a base64 string, use it directly
      imageUrl = imageData
    }

    // Get the existing project to only update what's changed
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .then((result) => result[0])

    if (!existingProject) {
      throw new Error("Project not found")
    }

    // Create update object
    const updateData: any = {
      name,
      description,
      demo: demo || "",
      categoryId: categories[0],
      features: JSON.stringify(features),
    }

    // Only update image if we have a new one
    if (imageUrl) {
      updateData.image = imageUrl
    }

    // Update the project and get the updated record
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      

    // Update project-techstack relationships
    await db.delete(projectTechstacks).where(eq(projectTechstacks.projectId, id))
    const techstackRelations = techstacks.map((techstackId: string) => ({
      projectId: id,
      techstackId,
    }))
    await db.insert(projectTechstacks).values(techstackRelations)

    // Dynamically collect IP address and user agent
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "projects",
      recordId: id,
      userId: userId,
      details: JSON.stringify({
        action: "Project updated",
        data: {
          id: updatedProject.id,
          name: updatedProject.name,
          categoryId: updatedProject.categoryId,
        },
        techstackIds: techstacks,
        features,
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/projects")
    
    // Return only serializable data
    return { 
      success: true, 
      message: "Project updated successfully", 
      data: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        demo: updatedProject.demo,
        image: updatedProject.image,
        categoryId: updatedProject.categoryId,
        features: JSON.parse(updatedProject.features || "[]"),
        createdAt: updatedProject.createdAt?.toISOString(),
        updatedAt: updatedProject.updatedAt?.toISOString(),
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to update project",
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function fetchProject(pageIndex: number, rowsPerPage: number) {
  try {
    const projectsData = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        demo: projects.demo,
        image: projects.image,
        category: {
          id: categories.id,
          name: categories.name,
        },
        techstacks: {
          id: techstacks.id,
          name: techstacks.name,
          image: techstacks.image,
        },
        features: projects.features,
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(projectTechstacks, eq(projects.id, projectTechstacks.projectId))
      .leftJoin(techstacks, eq(projectTechstacks.techstackId, techstacks.id))
      .limit(rowsPerPage) 
      .offset(pageIndex * rowsPerPage);
    // Group techstacks by project
    const groupedProjects = projectsData.reduce((acc, project) => {
      const existingProject = acc.find((p) => p.id === project.id);
      if (existingProject) {
        if (project.techstacks && project.techstacks.id) {
          existingProject.techstacks.push(project.techstacks);
        }
      } else {
        acc.push({
          ...project,
          techstacks: project.techstacks && project.techstacks.id ? [project.techstacks] : [],
          features: project.features
            ? typeof project.features === "string"
              ? JSON.parse(project.features)
              : project.features
            : [],
        });
      }
      return acc;
    }, [] as any[]);

    return { success: true, data: groupedProjects };
  } catch (error) {
    return { success: false, error: "Failed to fetch projects" };
  }
}

export async function fetchProjectById(id: string) {
  try {
    const projectData = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        demo: projects.demo,
        image: projects.image,
        category: {
          id: categories.id,
          name: categories.name,
        },
        techstacks: {
          id: techstacks.id,
          name: techstacks.name,
          image: techstacks.image,
        },
        features: projects.features,
      })
      .from(projects)
      .where(eq(projects.id, id))
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(projectTechstacks, eq(projects.id, projectTechstacks.projectId))
      .leftJoin(techstacks, eq(projectTechstacks.techstackId, techstacks.id));

    if (!projectData.length) {
      return { success: false, error: "Project not found" };
    }

    // Transform the data
    const project: {
      id: string;
      name: string;
      description: string;
      demo: string;
      image: string | null;
      category: { id: string; name: string } | null;
      techstacks: { id: string; name: string; image: string | null }[];
      features: any[];
    } = {
      id: projectData[0].id,
      name: projectData[0].name,
      description: projectData[0].description,
      demo: projectData[0].demo,
      image: projectData[0].image,
      category: projectData[0].category || null,
      techstacks: [],
      features: projectData[0].features
        ? typeof projectData[0].features === "string"
          ? JSON.parse(projectData[0].features)
          : projectData[0].features
        : [],
    };

    // Add unique techstacks
    const uniqueTechstacks = new Map<string, { id: string; name: string; image: string | null }>();
    for (const item of projectData) {
      if (item.techstacks && item.techstacks.id && !uniqueTechstacks.has(item.techstacks.id)) {
        uniqueTechstacks.set(item.techstacks.id, item.techstacks);
      }
    }
    project.techstacks = Array.from(uniqueTechstacks.values());

    
    return { success: true, data: project };
  } catch (error) {
    return { success: false, error: "Failed to fetch project" };
  }
}

// Delete a project
export async function deleteProject(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    if (!id) {
      throw new Error("Project ID is required");
    }

    // Fetch the project before deleting it for audit logging
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .then((result) => result[0]);

    if (!project) {
      throw new Error("Project not found");
    }

    // Delete the project
    await db.delete(projects).where(eq(projects.id, id));

    // Dynamically collect IP address and user agent
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "projects",
      recordId: id,
      userId: userId,
      details: JSON.stringify({
        action: "Project deleted",
        data: {
          id: project.id,
          name: project.name,
          categoryId: project.categoryId
        },
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    revalidatePath("/projects");
    
    return { 
      success: true, 
      message: "Project deleted successfully" 
    };
  } catch (error) {
    return { 
      success: false, 
      error: "Failed to delete project",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Type definition for the Project object
type Project = {
  id: string
  name: string
  image?: string
  category: { id: string; name: string }
  techstacks: Array<{ id: string; name: string; image?: string }>
  description: string
  features: Array<{ name: string; description: string }>
  demo?: string
}

/**
 * Server action to export projects in different formats
 */
export async function exportProjects(projects: Project[], format: "csv" | "json" | "pdf") {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const userId = session?.user?.id

  if (!userId) {
    return {
      success: false,
      error: "User not authenticated",
    }
  }

  try {
    // Log the export action
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Create a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    let data: string
    let contentType: string
    let filename: string

    // Determine if this is a selected export or all projects
    const exportType = projects.length === 1 ? "single" : projects.length < 10 ? "selected" : "all"

    switch (format) {
      case "csv":
        data = generateCSV(projects)
        contentType = "text/csv"
        filename =
          exportType === "single"
            ? `project-${projects[0].name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.csv`
            : `projects-${exportType}-${timestamp}.csv`
        break
      case "json":
        data = generateJSON(projects)
        contentType = "application/json"
        filename =
          exportType === "single"
            ? `project-${projects[0].name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.json`
            : `projects-${exportType}-${timestamp}.json`
        break
      case "pdf":
        // For PDF, we'll return the formatted data that the client will use to generate the PDF
        data = generatePDFData(projects)
        contentType = "application/json"
        filename =
          exportType === "single"
            ? `project-${projects[0].name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.pdf`
            : `projects-${exportType}-${timestamp}.pdf`
        break
      default:
        throw new Error("Unsupported export format")
    }

    // Log the export action
    await db.insert(auditLogs).values({
      action: "EXPORT",
      tableName: "projects",
      recordId: "multiple",
      userId,
      details: JSON.stringify({
        action: `Projects exported as ${format}`,
        count: projects.length,
        format,
        exportType,
      }),
      ipAddress,
      userAgent,
    })

    revalidatePath("/dashboard/projects")

    return {
      success: true,
      data,
      contentType,
      filename,
      format,
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to export projects as ${format}`,
      details: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Generate CSV data from projects with improved formatting
 */
function generateCSV(projects: Project[]): string {
  // Define CSV headers with more detailed information
  const headers = [
    "ID",
    "Project Name",
    "Category",
    "Description",
    "Technologies",
    "Feature Names",
    "Feature Details",
    "Demo URL",
  ]

  // Convert projects to CSV rows with more detailed information
  const rows = projects.map((project) => {
    const techStacks = project.techstacks.map((tech) => tech.name).join("; ")
    const featureNames = project.features.map((feature) => feature.name).join("; ")
    const featureDetails = project.features
      .map((feature) => `${feature.name}: ${feature.description || "No description"}`)
      .join(" | ")

    return [
      project.id,
      project.name,
      project.category?.name || "Uncategorized",
      project.description,
      techStacks,
      featureNames,
      featureDetails,
      project.demo || "",
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" &&
          (cell.includes(",") || cell.includes(";") || cell.includes('"') || cell.includes("\n"))
            ? `"${cell.replace(/"/g, '""')}"`
            : cell,
        )
        .join(","),
    ),
  ].join("\n")

  return csvContent
}

/**
 * Generate JSON data from projects
 */
function generateJSON(projects: Project[]): string {
  // Format projects for export with more detailed information
  const formattedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category?.name || "Uncategorized",
    description: project.description,
    technologies: project.techstacks.map((tech) => ({
      name: tech.name,
      id: tech.id,
    })),
    features: project.features.map((feature) => ({
      name: feature.name,
      description: feature.description || "",
    })),
    demoUrl: project.demo || null,
    exportDate: new Date().toISOString(),
  }))

  // Add metadata to the JSON
  const jsonData = {
    metadata: {
      title: "Projects Export",
      generated: new Date().toISOString(),
      count: projects.length,
      type: projects.length === 1 ? "single" : projects.length < 10 ? "selected" : "all",
    },
    projects: formattedProjects,
  }

  return JSON.stringify(jsonData, null, 2)
}

/**
 * Generate data for PDF creation on the client
 */
function generatePDFData(projects: Project[]): string {
  // Format projects for PDF generation on the client
  const formattedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    category: project.category?.name || "Uncategorized",
    description: project.description,
    techStacks: project.techstacks.map((tech) => tech.name),
    features: project.features.map((feature) => ({
      name: feature.name,
      description: feature.description || "",
    })),
    demoUrl: project.demo || null,
    image: project.image || null,
  }))

  return JSON.stringify({
    title: "Projects Export",
    timestamp: new Date().toISOString(),
    count: projects.length,
    exportType: projects.length === 1 ? "single" : projects.length < 10 ? "selected" : "all",
    projects: formattedProjects,
  })
}

interface SeedResult {
  success: boolean
  message: string
  summary: {
    totalProjectsInData: number
    totalFeaturesInData: number
    categories: {
      total: number
      created: number
      skipped: number
    }
    techstacks: {
      total: number
      created: number
      skipped: number
    }
    projects: {
      total: number
      created: number
      skipped: number
    }
    features: {
      created: number
    }
  }
  details: {
    errors: string[]
    skippedItems: string[]
  }
}

// Enhanced tech icon mapping with ORMs and programming languages
function getTechIconUrl(techName: string): string {
  const techMap: Record<string, string> = {
    // Programming Languages
    'JavaScript': 'javascript',
    'TypeScript': 'typescript',
    'Python': 'python',
    'Java': 'java',
    'C++': 'cpp',
    'C#': 'csharp',
    'C': 'c',
    'Go': 'go',
    'Golang': 'go',
    'Rust': 'rust',
    'Ruby': 'ruby',
    'PHP': 'php',
    'Swift': 'swift',
    'Kotlin': 'kotlin',
    'Scala': 'scala',
    'Dart': 'dart',
    'Elixir': 'elixir',
    'Clojure': 'clojure',
    'Haskell': 'haskell',
    'Perl': 'perl',
    'R': 'r',
    'MATLAB': 'matlab',
    'Julia': 'julia',
    'Lua': 'lua',
    'Shell': 'bash',
    'Bash': 'bash',
    'PowerShell': 'powershell',
    
    // Frontend Frameworks & Libraries
    'React': 'react',
    'React.js': 'react',
    'ReactJS': 'react',
    'Next.js': 'nextjs',
    'NextJS': 'nextjs',
    'Vue.js': 'vue',
    'VueJS': 'vue',
    'Vue': 'vue',
    'Angular': 'angular',
    'AngularJS': 'angularjs',
    'Svelte': 'svelte',
    'SvelteKit': 'svelte',
    'Ember.js': 'ember',
    'jQuery': 'jquery',
    'jQuery UI': 'jquery',
    'Three.js': 'threejs',
    'D3.js': 'd3',
    'Chart.js': 'chartjs',
    'GSAP': 'gsap',
    
    // Backend Frameworks
    'Node.js': 'nodejs',
    'NodeJS': 'nodejs',
    'Express': 'express',
    'Express.js': 'express',
    'NestJS': 'nestjs',
    'Nest.js': 'nestjs',
    'Fastify': 'fastify',
    'Koa': 'koa',
    'Hapi': 'hapi',
    'AdonisJS': 'adonisjs',
    'Meteor': 'meteor',
    'Sails.js': 'sails',
    
    // Python Frameworks
    'Django': 'django',
    'Flask': 'flask',
    'FastAPI': 'fastapi',
    'Pyramid': 'pyramid',
    'Bottle': 'bottle',
    'Tornado': 'tornado',
    'Celery': 'celery',
    
    // Java Frameworks
    'Spring': 'spring',
    'Spring Boot': 'spring',
    'Spring MVC': 'spring',
    'Spring Security': 'spring',
    'Hibernate': 'hibernate',
    'Struts': 'struts',
    'Play Framework': 'play',
    'JUnit': 'junit',
    'Mockito': 'mockito',
    
    // Ruby Frameworks
    'Ruby on Rails': 'rails',
    'Rails': 'rails',
    'Sinatra': 'sinatra',
    'Rack': 'rack',
    
    // PHP Frameworks
    'Laravel': 'laravel',
    'Symfony': 'symfony',
    'CodeIgniter': 'codeigniter',
    'Yii': 'yii',
    'CakePHP': 'cakephp',
    'WordPress': 'wordpress',
    'Drupal': 'drupal',
    'Joomla': 'joomla',
    'Magento': 'magento',
    
    // .NET Frameworks
    '.NET': 'dotnet',
    '.NET Core': 'dotnet',
    'ASP.NET': 'dotnet',
    'ASP.NET Core': 'dotnet',
    'Entity Framework': 'dotnet',
    'Entity Framework Core': 'dotnet',
    'Blazor': 'blazor',
    'Xamarin': 'xamarin',
    'MAUI': 'maui',
    
    // Mobile Frameworks
    'React Native': 'react',
    'Flutter': 'flutter',
    'Ionic': 'ionic',
    'NativeScript': 'nativescript',
    'Cordova': 'cordova',
    'Capacitor': 'capacitor',
    'Expo': 'expo',
    'Android SDK': 'android',
    'iOS SDK': 'ios',
    'SwiftUI': 'swift',
    'UIKit': 'swift',
    
    // Databases
    'MySQL': 'mysql',
    'PostgreSQL': 'postgresql',
    'Postgres': 'postgresql',
    'MongoDB': 'mongodb',
    'Redis': 'redis',
    'SQLite': 'sqlite',
    'Oracle': 'oracle',
    'SQL Server': 'sqlserver',
    'MariaDB': 'mariadb',
    'Cassandra': 'cassandra',
    'CouchDB': 'couchdb',
    'Neo4j': 'neo4j',
    'Elasticsearch': 'elasticsearch',
    'Firebase': 'firebase',
    'Firestore': 'firebase',
    'Supabase': 'supabase',
    'CockroachDB': 'cockroachdb',
    'DynamoDB': 'dynamodb',
    'CosmosDB': 'cosmosdb',
    
    // ORMs (Object-Relational Mappers)
    'Prisma': 'prisma',
    'Prisma ORM': 'prisma',
    'Sequelize': 'sequelize',
    'TypeORM': 'typeorm',
    'Mongoose': 'mongoose',
    'MikroORM': 'mikroorm',
    'Waterline': 'waterline',
    'Bookshelf': 'bookshelf',
    'Objection.js': 'objection',
    'Knex.js': 'knex',
    'SQLAlchemy': 'sqlalchemy',
    'Django ORM': 'django',
    'Entity Framework': 'dotnet',
    'Hibernate': 'hibernate',
    'Eloquent': 'laravel',
    'Doctrine': 'symfony',
    'Active Record': 'rails',
    'GORM': 'go',
    'SQLx': 'rust',
    'Diesel': 'rust',
    'SeaORM': 'rust',
    
    // GraphQL
    'GraphQL': 'graphql',
    'Apollo': 'apollo',
    'Apollo Client': 'apollo',
    'Apollo Server': 'apollo',
    'Relay': 'relay',
    'Hasura': 'hasura',
    'GraphQL Yoga': 'graphql',
    
    // CSS Frameworks & Preprocessors
    'CSS3': 'css',
    'CSS': 'css',
    'Sass': 'sass',
    'SCSS': 'sass',
    'Less': 'less',
    'Stylus': 'stylus',
    'Tailwind CSS': 'tailwind',
    'Tailwind': 'tailwind',
    'Bootstrap': 'bootstrap',
    'Bulma': 'bulma',
    'Material-UI': 'mui',
    'MUI': 'mui',
    'Chakra UI': 'chakraui',
    'Ant Design': 'antd',
    'Styled Components': 'styledcomponents',
    'Emotion': 'emotion',
    'PostCSS': 'postcss',
    
    // Build Tools & Bundlers
    'Webpack': 'webpack',
    'Vite': 'vite',
    'Parcel': 'parcel',
    'Rollup': 'rollup',
    'Gulp': 'gulp',
    'Grunt': 'grunt',
    'Babel': 'babel',
    'ESLint': 'eslint',
    'Prettier': 'prettier',
    'Jest': 'jest',
    'Vitest': 'vitest',
    'Jasmine': 'jasmine',
    'Mocha': 'mocha',
    'Chai': 'chai',
    'Cypress': 'cypress',
    'Playwright': 'playwright',
    'Puppeteer': 'puppeteer',
    'Selenium': 'selenium',
    
    // DevOps & Cloud
    'Docker': 'docker',
    'Kubernetes': 'kubernetes',
    'Helm': 'helm',
    'Terraform': 'terraform',
    'Ansible': 'ansible',
    'AWS': 'aws',
    'Amazon Web Services': 'aws',
    'Azure': 'azure',
    'Google Cloud': 'gcp',
    'GCP': 'gcp',
    'Google Cloud Platform': 'gcp',
    'Firebase': 'firebase',
    'Vercel': 'vercel',
    'Netlify': 'netlify',
    'Heroku': 'heroku',
    'DigitalOcean': 'digitalocean',
    'Linode': 'linode',
    'Cloudflare': 'cloudflare',
    'NGINX': 'nginx',
    'Apache': 'apache',
    'Traefik': 'traefik',
    'Jenkins': 'jenkins',
    'GitHub Actions': 'githubactions',
    'GitLab CI': 'gitlab',
    'CircleCI': 'circleci',
    'Travis CI': 'travis',
    
    // Version Control
    'Git': 'git',
    'GitHub': 'github',
    'GitLab': 'gitlab',
    'Bitbucket': 'bitbucket',
    'SVN': 'svn',
    'Mercurial': 'mercurial',
    
    // Package Managers
    'npm': 'npm',
    'Yarn': 'yarn',
    'pnpm': 'pnpm',
    'pip': 'pip',
    'pipenv': 'pip',
    'poetry': 'poetry',
    'Maven': 'maven',
    'Gradle': 'gradle',
    'Cargo': 'rust',
    'NuGet': 'nuget',
    'Composer': 'composer',
    'Bundler': 'bundler',
    
    // IDEs & Editors
    'VS Code': 'vscode',
    'Visual Studio Code': 'vscode',
    'Visual Studio': 'visualstudio',
    'IntelliJ IDEA': 'intellij',
    'WebStorm': 'webstorm',
    'PyCharm': 'pycharm',
    'Android Studio': 'androidstudio',
    'Xcode': 'xcode',
    'Eclipse': 'eclipse',
    'Sublime Text': 'sublimetext',
    'Atom': 'atom',
    'Vim': 'vim',
    'Neovim': 'neovim',
    'Emacs': 'emacs',
    
    // Design Tools
    'Figma': 'figma',
    'Adobe XD': 'xd',
    'Sketch': 'sketch',
    'Photoshop': 'photoshop',
    'Illustrator': 'illustrator',
    'InVision': 'invision',
    'Zeplin': 'zeplin',
    
    // Project Management
    'Jira': 'jira',
    'Confluence': 'confluence',
    'Trello': 'trello',
    'Asana': 'asana',
    'ClickUp': 'clickup',
    'Notion': 'notion',
    'Slack': 'slack',
    'Discord': 'discord',
    'Microsoft Teams': 'teams',
    'Zoom': 'zoom',
    
    // API Tools
    'Postman': 'postman',
    'Insomnia': 'insomnia',
    'Swagger': 'swagger',
    'OpenAPI': 'openapi',
    'REST': 'rest',
    'SOAP': 'soap',
    'gRPC': 'grpc',
    
    // Content Management
    'Contentful': 'contentful',
    'Sanity': 'sanity',
    'Strapi': 'strapi',
    'Ghost': 'ghost',
    'Directus': 'directus',
    
    // Payment & E-commerce
    'Stripe': 'stripe',
    'PayPal': 'paypal',
    'Square': 'square',
    'Shopify': 'shopify',
    'WooCommerce': 'woocommerce',
    
    // Authentication & Security
    'Auth0': 'auth0',
    'OAuth': 'oauth',
    'JWT': 'jwt',
    'Passport.js': 'passport',
    'Keycloak': 'keycloak',
    'Okta': 'okta',
    
    // Monitoring & Analytics
    'Google Analytics': 'googleanalytics',
    'GTM': 'googleanalytics',
    'Google Tag Manager': 'googleanalytics',
    'Sentry': 'sentry',
    'Datadog': 'datadog',
    'New Relic': 'newrelic',
    'Prometheus': 'prometheus',
    'Grafana': 'grafana',
    'Logstash': 'logstash',
    'Kibana': 'kibana',
    'ELK Stack': 'elk',
  }

  // Clean and normalize tech name
  const cleanTechName = techName.trim()
  
  // Direct match
  if (techMap[cleanTechName]) {
    return `https://skillicons.dev/icons?i=${techMap[cleanTechName]}`
  }

  // Try case-insensitive match
  const lowerTechName = cleanTechName.toLowerCase()
  for (const [key, value] of Object.entries(techMap)) {
    if (key.toLowerCase() === lowerTechName) {
      return `https://skillicons.dev/icons?i=${value}`
    }
  }

  // Try contains match
  for (const [key, value] of Object.entries(techMap)) {
    if (lowerTechName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTechName)) {
      return `https://skillicons.dev/icons?i=${value}`
    }
  }

  // Try removing version numbers
  const techWithoutVersion = cleanTechName.replace(/\s*(?:v|version)?\s*\d+(\.\d+)*/, '').trim()
  if (techMap[techWithoutVersion]) {
    return `https://skillicons.dev/icons?i=${techMap[techWithoutVersion]}`
  }

  // Fallback: use the name directly
  const fallbackName = lowerTechName.replace(/\s+/g, '')
  return `https://skillicons.dev/icons?i=${fallbackName}`
}

export async function autoSeedAllData(): Promise<SeedResult> {
  try {
    const results = {
      categoriesCreated: 0,
      techstacksCreated: 0,
      projectsCreated: 0,
      featuresCreated: 0,
      errors: [] as string[],
      skippedItems: [] as string[]
    }

    // Step 1: Extract unique categories from projects
    const uniqueCategories = Array.from(new Set(projectsData.map(project => project.category)))

    // Create a map to store created category IDs
    const categoryMap = new Map<string, string>()

    // Create categories if they don't exist
    for (const categoryName of uniqueCategories) {
      try {
        // Check if category already exists
        const existingCategory = await db
          .select()
          .from(categories)
          .where(eq(categories.name, categoryName))
          .then(result => result[0])

        if (existingCategory) {
          categoryMap.set(categoryName, existingCategory.id)
          results.skippedItems.push(`Category "${categoryName}" already exists`)
        } else {
          const categoryId = uuidv4()
          await db
            .insert(categories)
            .values({
              id: categoryId,
              name: categoryName
            })
          
          categoryMap.set(categoryName, categoryId)
          results.categoriesCreated++
        }
      } catch (error) {
        const errorMsg = `Failed to create category "${categoryName}": ${error instanceof Error ? error.message : String(error)}`
        results.errors.push(errorMsg)
      }
    }

    // Step 2: Extract all unique tech stacks from all projects
    const allTechStacks = projectsData.flatMap(project => project.techStack)
    const uniqueTechStacks = Array.from(new Set(allTechStacks))

    // Create a map to store created tech stack IDs
    const techstackMap = new Map<string, string>()

    // Create tech stacks if they don't exist
    for (const techName of uniqueTechStacks) {
      try {
        // Check if tech stack already exists
        const existingTechstack = await db
          .select()
          .from(techstacks)
          .where(eq(techstacks.name, techName))
          .then(result => result[0])

        if (existingTechstack) {
          techstackMap.set(techName, existingTechstack.id)
          results.skippedItems.push(`Tech stack "${techName}" already exists`)
        } else {
          const techstackId = uuidv4()
          
          // Use the improved tech icon URL generator
          const techIconUrl = getTechIconUrl(techName)
          
          await db
            .insert(techstacks)
            .values({
              id: techstackId,
              name: techName,
              image: techIconUrl
            })
          
          techstackMap.set(techName, techstackId)
          results.techstacksCreated++
          
        }
      } catch (error) {
        const errorMsg = `Failed to create tech stack "${techName}": ${error instanceof Error ? error.message : String(error)}`
        results.errors.push(errorMsg)
      }
    }

    // Step 3: Create projects with detailed features
    for (const projectData of projectsData) {
      try {
        // Check if project already exists by name
        const existingProject = await db
          .select()
          .from(projects)
          .where(eq(projects.name, projectData.title))
          .then(result => result[0])

        if (existingProject) {
          results.skippedItems.push(`Project "${projectData.title}" already exists`)
          continue
        }

        const projectId = uuidv4()
        const categoryId = categoryMap.get(projectData.category)

        if (!categoryId) {
          throw new Error(`Category "${projectData.category}" not found in category map`)
        }

        // Format features array with name and description
        const formattedFeatures = projectData.features.map((feature: any) => ({
          name: feature.name,
          description: feature.description
        }))

        // Count features
        results.featuresCreated += formattedFeatures.length

        // Validate URLs
        const demoUrl = projectData.demoUrl || ""
        const imageUrl = projectData.image || ""

        // Insert the project
        await db
          .insert(projects)
          .values({
            id: projectId,
            name: projectData.title,
            description: projectData.description,
            demo: demoUrl,
            image: imageUrl,
            categoryId: categoryId,
            features: JSON.stringify(formattedFeatures)
          })

        // Create project-techstack relationships
        const techstackRelations = projectData.techStack
          .filter(techName => techstackMap.has(techName))
          .map(techName => ({
            projectId: projectId,
            techstackId: techstackMap.get(techName)!
          }))

        if (techstackRelations.length > 0) {
          await db.insert(projectTechstacks).values(techstackRelations)
        }

        results.projectsCreated++
      } catch (error) {
        const errorMsg = `Failed to create project "${projectData.title}": ${error instanceof Error ? error.message : String(error)}`
        results.errors.push(errorMsg)
      }
    }

    // Step 4: Revalidate paths
    revalidatePath("/categories")
    revalidatePath("/techstacks")
    revalidatePath("/projects")

    return {
      success: true,
      message: "Auto-seeding with detailed features completed successfully",
      summary: {
        totalProjectsInData: projectsData.length,
        totalFeaturesInData: projectsData.reduce((sum, project) => sum + project.features.length, 0),
        categories: {
          total: uniqueCategories.length,
          created: results.categoriesCreated,
          skipped: uniqueCategories.length - results.categoriesCreated
        },
        techstacks: {
          total: uniqueTechStacks.length,
          created: results.techstacksCreated,
          skipped: uniqueTechStacks.length - results.techstacksCreated
        },
        projects: {
          total: projectsData.length,
          created: results.projectsCreated,
          skipped: projectsData.length - results.projectsCreated
        },
        features: {
          created: results.featuresCreated
        }
      },
      details: {
        errors: results.errors,
        skippedItems: results.skippedItems
      }
    }

  } catch (error) {
    return {
      success: false,
      message: "Failed to auto-seed data with descriptions",
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Function to check if data already exists
export async function checkExistingData() {
  try {
    const [categoryCount, techstackCount, projectCount] = await Promise.all([
      db.select().from(categories).then(result => result.length),
      db.select().from(techstacks).then(result => result.length),
      db.select().from(projects).then(result => result.length)
    ])

    return {
      success: true,
      categories: categoryCount,
      techstacks: techstackCount,
      projects: projectCount,
      total: categoryCount + techstackCount + projectCount,
      hasData: categoryCount > 0 || techstackCount > 0 || projectCount > 0
    }
  } catch (error) {
    return {
      success: false,
      categories: 0,
      techstacks: 0,
      projects: 0,
      total: 0,
      hasData: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

// Function to clear all data (use with caution!)
export async function clearAllData() {
  try {
    // Delete in correct order due to foreign key constraints
    await db.delete(projectTechstacks)
    await db.delete(projects)
    await db.delete(techstacks)
    await db.delete(categories)

    revalidatePath("/categories")
    revalidatePath("/techstacks")
    revalidatePath("/projects")

    return {
      success: true,
      message: "All data cleared successfully"
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to clear data",
      error: error instanceof Error ? error.message : String(error)
    }
  }
}