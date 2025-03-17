/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "../db"
import { CategoriesSchema } from "@/types/vaildations/project"
import { auditLogs, categories, projects, techstacks, projectTechstacks } from "../schema"
import { eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/server/auth" 

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

export async function fetchTechstacks() {
  return await db.select().from(techstacks)
}

export async function createTechstack(formData: FormData) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  const validatedFields = TechstackSchema.parse({
    name: formData.get("name"),
    image: formData.get("image"),
  })

  let imageString = ""
  if (validatedFields.image) {
    const arrayBuffer = await validatedFields.image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    imageString = `data:${validatedFields.image.type};base64,${buffer.toString("base64")}`
  }

  const headersList = await headers()
  const ipAddress = headersList.get("x-forwarded-for") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  const techstack = await db
    .insert(techstacks)
    .values({
      name: validatedFields.name,
      image: imageString,
    })
    .returning()

  // Log the action in audit_logs
  await db.insert(auditLogs).values({
    action: "CREATE",
    tableName: "techstacks",
    recordId: techstack[0].id,
    userId: userId, // Use the logged-in user's ID
    details: JSON.stringify({ action: "Techstack created", data: techstack[0] }),
    ipAddress: ipAddress,
    userAgent: userAgent,
  })

  revalidatePath("/techstacks")
  return { message: "Techstack created successfully", techstack }
}

export async function editTechstack(id: string, data: FormData) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  if (!id) {
    console.error("Techstack ID is required for editing")
  }

  const existingTechstack = await db
    .select()
    .from(techstacks)
    .where(eq(techstacks.id, id))
    .then((result) => result[0])

  if (!existingTechstack) {
    console.error("Techstack not found")
  }

  const name = data.get("name") as string | null
  const image = data.get("image") as File | null

  if (!name && !image) {
    console.error("At least one field (name or image) must be provided for update")
  }

  const headersList = await headers()
  const ipAddress = headersList.get("x-forwarded-for") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  const updateData: { name?: string; image?: string } = {}

  if (name) {
    updateData.name = name
  }

  if (image) {
    // Validate the image
    TechstackSchema.shape.image.parse(image)

    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    updateData.image = `data:${image.type};base64,${buffer.toString("base64")}`
  }

  const techstack = await db.update(techstacks).set(updateData).where(eq(techstacks.id, id)).returning()

  // Log the action in audit_logs
  await db.insert(auditLogs).values({
    action: "UPDATE",
    tableName: "techstacks",
    recordId: id,
    userId: userId, // Use the logged-in user's ID
    details: JSON.stringify({ action: "Techstack updated", data: techstack[0] }),
    ipAddress: ipAddress,
    userAgent: userAgent,
  })

  revalidatePath("/techstacks")
  return { message: "Techstack updated successfully", techstack }
}

export async function deleteTechstacks(ids: string[]) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  if (!ids || ids.length === 0) {
    console.error("At least one Techstack ID is required for deletion")
  }

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
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({ action: "Techstack deleted", data: techstack }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })
  }

  revalidatePath("/techstacks")
  return { message: "Techstacks deleted successfully" }
}

// Categories

export async function fetchCategories() {
  try {
    const categoryData = await db.select().from(categories)
    revalidatePath("/categories") // Adjust this path as needed
    return categoryData
  } catch (error) {
    console.error("Failed to fetch categories: ", error)
    return []
  }
}

export async function createCategory(formData: FormData) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    const validatedFields = CategoriesSchema.parse({
      name: formData.get("name"),
    })

    if (!validatedFields.name) {
      console.error("Category name is required")
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const category = await db
      .insert(categories)
      .values({
        name: validatedFields.name,
      })
      .returning()

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "categories",
      recordId: category[0].id,
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({ action: "Category created", data: category[0] }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/categories")
    return { message: "Category created successfully", category }
  } catch (error) {
    console.error("Failed to create category: ", error)
  }
}

export async function editCategory(id: string, data: FormData) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  try {
    if (!id) {
      console.error("Category ID is required for editing")
    }

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .then((result) => result[0])

    if (!existingCategory) {
      console.error("Category not found")
    }

    const name = data.get("name") as string | null

    if (!name) {
      console.error("At least one field (name) must be provided for update")
    }

    const updateData: { name?: string } = {}

    if (name) {
      updateData.name = name
    }

    const category = await db.update(categories).set(updateData).where(eq(categories.id, id)).returning()

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "categories",
      recordId: id,
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({ action: "Category updated", data: category[0] }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    return { message: "Category updated successfully", category }
  } catch (error) {
    console.error("Failed to update category: ", error)
  }
}

export async function deleteCategories(ids: string[]) {
  const session = await auth() // Get the current session
  const userId = session?.user?.id // Extract the user ID from the session

  if (!userId) {
    throw new Error("User not authenticated")
  }

  if (!ids || ids.length === 0) {
    console.error("At least one Category ID is required for deletion")
  }

  try {
    const categoriesToDelete = await db.select().from(categories).where(inArray(categories.id, ids))

    const result = await db.delete(categories).where(inArray(categories.id, ids))

    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Log the action in audit_logs
    for (const category of categoriesToDelete) {
      await db.insert(auditLogs).values({
        action: "DELETE",
        tableName: "categories",
        recordId: category.id,
        userId: userId, // Use the logged-in user's ID
        details: JSON.stringify({ action: "Category deleted", data: category }),
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
    console.error("Failed to delete categories:", error)
    return {
      success: false,
      message: "Failed to delete categories. Please try again.",
    }
  }
}


// Create a new project
export async function createProject(formData: FormData) {
  const session = await auth(); // Get the current session
  const userId = session?.user?.id; // Extract the user ID from the session

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
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
    }

    // Insert the project
    const [project] = await db
      .insert(projects)
      .values({
        name,
        description,
        demo: demo || "",
        image: imageUrl,
        categoryId: categories[0], // Use the first category ID (or handle multiple categories if needed)
        features: JSON.stringify(features), // Add this line
      })
      .returning();

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
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({
        action: "Project created",
        data: project,
        techstackIds: techstacks,
        features, // Add this line
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    revalidatePath("/projects");
    return { success: true, message: "Project created successfully", project };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

// Edit an existing project
export async function editProject(id: string, formData: FormData) {
  const session = await auth()
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
      const arrayBuffer = await imageData.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      imageUrl = `data:${imageData.type};base64,${buffer.toString("base64")}`
    } else if (typeof imageData === "string") {
      // If it's already a string (URL or base64), use it directly
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

    // Create update object with only the fields that have changed
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

    // Update the project
    const [project] = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning()

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
        data: project,
        techstackIds: techstacks,
        features,
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    })

    revalidatePath("/projects")
    return { success: true, message: "Project updated successfully", project }
  } catch (error) {
    console.error("Failed to update project:", error)
    return { success: false, error: "Failed to update project" }
  }
}



export async function fetchProject() {
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
        features: projects.features, // Add this line
      })
      .from(projects)
      .leftJoin(categories, eq(projects.categoryId, categories.id))
      .leftJoin(projectTechstacks, eq(projects.id, projectTechstacks.projectId))
      .leftJoin(techstacks, eq(projectTechstacks.techstackId, techstacks.id));

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
    console.error("Failed to fetch projects:", error);
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
    console.error("Failed to fetch project:", error); // Debug log
    return { success: false, error: "Failed to fetch project" };
  }
}

// Delete a project
export async function deleteProject(id: string) {
  const session = await auth(); // Get the current session
  const userId = session?.user?.id; // Extract the user ID from the session

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
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({
        action: "Project deleted",
        data: project,
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    revalidatePath("/projects");
    return { success: true, message: "Project deleted successfully" };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project" };
  }
}