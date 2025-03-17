"use server";

import type * as z from "zod";
import { LoginSchema } from "@/types/vaildations/login"
import { signIn } from "@/server/auth";
import { AuthError } from "next-auth";
import { getUserByEmail } from "../data/user";

export const LoginAccount = async (data: z.infer<typeof LoginSchema>) => {
  // Validate input fields
  const validatedFields = LoginSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  // Check if the user exists
  const userExists = await getUserByEmail(email);
  if (!userExists || !userExists.email || !userExists.password) {
    return { error: "User does not exist" };
  }

  // Check if the user has requested account deletion
  if (userExists.deletionRequestedAt) {
    return {
      error:
        "This account has been scheduled for deletion. Please contact support if you wish to cancel the deletion request.",
      accountDeletionRequested: true,
    };
  }

  // Check if the user's email is verified
  if (!userExists.emailVerified) {
    return { error: "Please verify your email before logging in", verificationRequired: true };
  }

  try {
    // Attempt to sign in the user
    await signIn("credentials", {
      email: userExists.email,
      password: password,
      redirect: false, // Prevent automatic redirection
    });

    // Determine the redirect path based on user status and role
    const userStatus = userExists.status;
    const userRole = userExists.role;

    let redirectTo = "/"; // Default redirect path

    if (userStatus === "APPROVED") {
      if (userRole === "USER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
        redirectTo = "/dashboard";
      }
    } else if (userStatus === "REJECTED" || userStatus === "PENDING") {
      redirectTo = "/onboarding/current";
    }

    // Return success response with redirect path
    return { success: "User logged in successfully", redirectTo };
  } catch (error) {
    // Handle authentication errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "An error occurred during login" };
      }
    }

    // Rethrow unexpected errors
    throw error;
  }
};
