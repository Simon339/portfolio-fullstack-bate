import * as z from "zod";


export const SettingsSchema = z.object({
  name: z.string().min(2, 'First name must be at least 2 characters'),
  surname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(["USER", "ADMIN"], { message: "Role must be either USER or ADMIN" }).optional(),
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
  firstname: z.string().min(2, { message: "Name must be at least 2 characters." }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters." }),
  role: z.enum(["user", "admin", "owner"], { message: "Role must be either user , admin or super admin" }),
  email: z.string().email({ message: "Invalid email address." }),
  // image: z
  //   .instanceof(File)
  //   .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  //   .refine(
  //     (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
  //     "Only .jpg, .png, and .webp formats are supported."
  //   )
  //   .optional(),
});

export const RatingSchema = z.object({
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5."),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  feedback: z.string().optional()
});

export const ServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email({ message: "Invalid email address." }),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  service: z.string().min(1, 'Service is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: z.object({
    unit: z.string().nullable().optional(),
    street: z.string().min(1, 'Street address is required'),
    subdivision: z.string().nullable().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required')
  })
});

// Schema for creating a new quotation (CREATE ONLY)
export const CreateQuotationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),
  address: z.object({
    unit: z.string().optional(),
    street: z.string().optional(),
    subdivision: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),

  // Quotation details
  service: z.string().min(1, "Service description is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),

  // Items
  items: z.array(z.object({
    description: z.string().min(1, "Item description is required"),
    quantity: z.number().positive("Quantity must be positive"),
    unit: z.string().min(1, "Unit is required"),
    unitPrice: z.string().min(1, "Unit price is required"),
    total: z.string().min(1, "Total is required"),
  })).min(1, "At least one item is required"),

  // Financials
  subtotal: z.string().min(1, "Subtotal is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  total: z.string().min(1, "Total is required"),
})


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

