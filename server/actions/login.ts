"use server"

import type * as z from "zod"
import { LoginSchema } from "@/types/vaildations/login"
import { signIn } from "@/server/auth"
import { AuthError } from "next-auth"
import { getUserByEmail } from "../data/user"

export const LoginAccount = async (data: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }
  const { email, password } = validatedFields.data

  const userExists = await getUserByEmail(email)

  if (!userExists || !userExists.email || !userExists.password) {
    return { error: "User does not exist" }
  }

  // Check if the user has requested account deletion
  if (userExists.deletionRequestedAt) {
    return {
      error:
        "This account has been scheduled for deletion. Please contact support if you wish to cancel the deletion request.",
      accountDeletionRequested: true,
    }
  }

  if (!userExists.emailVerified) {
    return { error: "Please verify your email before logging in", verificationRequired: true }
  }

  
   try {
    await signIn("credentials", {
      email: userExists.email,
      password: password,
      redirectTo: "/redirect",
    });
  } catch (error) {
    if (error instanceof AuthError) {
     
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Please confirm yours email address" };
      }
    }

    throw error;
  }

  return { success: "User logged in successfully" };
}