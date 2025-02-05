import * as z from "zod";

const phoneRegex = /^\+?[1-9]\d{1,14}$/

export const SignUpSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long."),
    name: z.string().min(3, "Name must be at least 3 characters."),
    email: z.string().email("Invalid email format."),
    surname: z.string().min(3, "Surname must be at least 3 characters."),
    country: z.string().nonempty("Country code is required"),
    phone: z
    .string()
    .nonempty("Phone number is required")
    .regex(phoneRegex, "Invalid phone number format")
    .refine(
      (value) => {
        const numericValue = value.replace(/\D/g, "")
        return numericValue.length >= 7 && numericValue.length <= 15
      },
      {
        message: "Phone number must be between 7 and 15 digits",
      }
    ),
});
