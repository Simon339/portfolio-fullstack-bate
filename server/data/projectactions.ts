'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '../db'
import { CategoriesSchema } from '@/types/vaildations/project'

const TechstackSchema = z.object({
  name: z.string().min(1, "Techstack name is required"),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
    )
    .optional(),
})

export async function fetchTechstacks() {
  return await db.techstack.findMany()
  
}

export async function createTechstack(formData: FormData) {
  const validatedFields = TechstackSchema.parse({
    name: formData.get('name'),
    image: formData.get('image'),
  })

  let imageString = ''
  if (validatedFields.image) {
    const arrayBuffer = await validatedFields.image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    imageString = `data:${validatedFields.image.type};base64,${buffer.toString('base64')}`
  }

  const techstack = await db.techstack.create({
    data: {
      name: validatedFields.name,
      image: imageString,
    },
  })

  revalidatePath('/techstacks')
  return { message: 'Techstack created successfully', techstack }
}

export async function editTechstack(id: string, data: FormData) {
  if (!id) {
    console.error('Techstack ID is required for editing')
  }

  const existingTechstack = await db.techstack.findUnique({
    where: { id },
  })

  if (!existingTechstack) {
    console.error('Techstack not found')
  }

  const name = data.get('name') as string | null
  const image = data.get('image') as File | null

  if (!name && !image) {
    console.error('At least one field (name or image) must be provided for update')
  }

  const updateData: { name?: string; image?: string } = {}

  if (name) {
    updateData.name = name
  }

  if (image) {
    // Validate the image
    TechstackSchema.shape.image.parse(image)

    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    updateData.image = `data:${image.type};base64,${buffer.toString('base64')}`
  }

  const techstack = await db.techstack.update({
    where: { id },
    data: updateData,
  })

  revalidatePath('/techstacks')
  return { message: 'Techstack updated successfully', techstack }
}

export async function deleteTechstacks(ids: string[]) {
  if (!ids || ids.length === 0) {
    console.error('At least one Techstack ID is required for deletion')
  }

  await db.techstack.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  })

  revalidatePath('/techstacks')
  return { message: 'Techstacks deleted successfully' }
}

// Categories

export async function fetchCategories() {
  try {
    const categories = await db.category.findMany();
    revalidatePath('/categories') // Adjust this path as needed
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories: ', error);
  }
}

export async function createCategory(formData: FormData) {
  try {
    const validatedFields = CategoriesSchema.parse({
      name: formData.get('name'),
    });

    if (!validatedFields.name) {
      console.error('Category name is required');
    }

    const category = await db.category.create({
      data: {
        name: validatedFields.name,
      },
    });
    revalidatePath('/categories') // Adjust this path as needed
    return { message: 'Category created successfully', category };
  } catch (error) {
    console.error('Failed to create category: ', error);
  }
}

export async function editCategory(id: string, data: FormData) {
  try {
    if (!id) {
      console.error('Category ID is required for editing');
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      console.error('Category not found');
    }

    const name = data.get('name') as string | null;


    if (!name) {
      console.error('At least one field (name) must be provided for update');
    }

    const updateData: { name?: string } = {};

    if (name) {
      updateData.name = name;
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
    });

    return { message: 'Category updated successfully', category };
  } catch (error) {
    console.error('Failed to update category: ', error);
  }
}

export async function deleteCategories(ids: string[]) {
  if (!ids || ids.length === 0) {
    console.error('At least one Category ID is required for deletion')
  }

  try {
    const result = await db.category.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })

    revalidatePath('/categories') // Adjust this path as needed

    return {
      success: true,
      message: `${result.count} categories deleted successfully`,
      deletedCount: result.count
    }
  } catch (error) {
    console.error('Failed to delete categories:', error)
    return {
      success: false,
      message: 'Failed to delete categories. Please try again.'
    }
  }
}

//Project

export async function fetchProjects() {
  try {
    const projects = await db.project.findMany();
    revalidatePath('/projects')
    return projects;
  } catch (error) {
    console.error('Failed to fetch projects: ', error);
  }
}


const ProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  demo: z.string().url().optional(),
  categoryId: z.array(z.string().min(1)),
  techstacks: z.array(z.string().min(1)),
  image: z.any(),
});

export async function createProject(formData: FormData) {
  try {
    const validatedFields = ProjectSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      demo: formData.get('demo'),
      image: formData.get('image'),
      techstacks: formData.getAll('techstacks'),
      categoryId: formData.get('categoryId')
    })

    if (!validatedFields.success) {
      return { error: validatedFields.error.flatten().fieldErrors }
    }

    const { name, description, demo, image, techstacks, categoryId } = validatedFields.data
    const imageUrl = await uploadImage(image)


    const project = await db.project.create({
      data: {
        name,
        description,
        demo: demo || '',
        image: imageUrl,
        techstacks: {
          connect: techstacks.map((id) => ({ id: id })),
        },
        category: {
          connect: { id: categoryId[0] },
        },
      },
      include: {
        techstacks: true,
        category: true,
      }
    })

    revalidatePath('/projects')

    return { success: true, project }
  } catch (error) {
    console.error('Failed to create project:', error)
    return { success: false, error: 'Failed to create project. Please try again.' }
  }
}

async function uploadImage(file: File): Promise<string> {

  return '/placeholder-image.jpg'
}
