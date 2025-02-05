import * as z from "zod";

export const ResetSchema = z.object({
    email: z.string().email("Invalid email format.")
});


export const ResetpasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long."),
});

