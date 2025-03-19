import * as z from "zod"

export const ResetSchema = z.object({
  email: z.string().email("Invalid email format."),
})

// Enhanced password validation with requirements for uppercase, special chars, and numbers
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .refine((password) => /[A-Z]/.test(password), "Password must contain at least one uppercase letter.")
  .refine((password) => /[0-9]/.test(password), "Password must contain at least one number.")
  .refine((password) => /[^A-Za-z0-9]/.test(password), "Password must contain at least one special character.")

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

