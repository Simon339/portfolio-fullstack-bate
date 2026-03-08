import * as z from "zod"

const phoneRegex = /^\+?[1-9]\d{1,14}$/

// Enhanced password validation with requirements for uppercase, special chars, and numbers
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter.")
  .refine((password) => /[0-9]/.test(password), "Password must contain at least one number.")
  .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character.")

export const SignUpSchema = z.object({
  password: passwordSchema,
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email format."),
  surname: z.string().min(3, "Surname must be at least 3 characters.")
})

