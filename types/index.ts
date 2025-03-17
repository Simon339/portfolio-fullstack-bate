import * as z from "zod";


export const SettingsSchema = z.object({
  name: z.string().min(2, 'First name must be at least 2 characters'),
  surname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  role: z.enum(["USER", "ADMIN"], { message: "Role must be either USER or ADMIN" }),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5000000, `Max image size is 5MB.`)
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
    .optional()
});

const countries = [
  { code: "US", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const AddNewUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters." }),
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"], { message: "Role must be either USER or ADMIN" }),
  email: z.string().email({ message: "Invalid email address." }),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
    .optional(),
  country: z.string().refine((val) => countries.some(country => country.code === val), {
    message: "Please select a valid country."
  }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number." }),
});

export const RatingSchema = z.object({
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5."),
  feedback: z.string().optional()
});

export const ServiceSchema= z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email({ message: "Invalid email address." }),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  service: z.string().min(1, 'Service is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});


export const ReplyFormSchema = z.object({
  subject: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export type ReplyFormData = z.infer<typeof ReplyFormSchema>

export const SignInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
})

export type SignInForm = z.infer<typeof SignInSchema>

