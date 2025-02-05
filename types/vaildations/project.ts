import * as z from "zod";

// Define the form schema with Zod
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const FileSchema = z.instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png, .webp and .gif formats are supported."
  );

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  demo: z.string().url('Must be a valid URL'),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5000000, `Max image size is 5MB.`)
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
  techstacks: z.array(z.string()).min(1, 'At least one techstack is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
})

export type ProjectFormData = z.infer<typeof ProjectSchema>

export const TechstackSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  image: z
    .array(
      z.union([
        FileSchema,
        z.object({
          file: FileSchema,
        }),
      ])
    )
    .min(1, 'At least one image is required'),
})

export const CategoriesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})