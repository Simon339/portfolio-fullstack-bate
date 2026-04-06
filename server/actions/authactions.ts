"use server";

import { SignUpSchema } from "@/types/vaildations/register";
import * as z from "zod";
import { auth } from "../auth";
import { SignInSchema } from "@/types";
import { headers } from "next/headers";
// import { member, organization, user } from "../schema";

type Role = "admin" | "member" | "owner";

export async function RegisterAccount(data: z.infer<typeof SignUpSchema>) {
  try {
    const validatedData = SignUpSchema.parse(data);
    const fullname = validatedData.name + " " + validatedData.surname;

    // Make sure you're using the correct auth library
    const result = await auth.api.signUpEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(fullname)}`,
        name: fullname
      },
    });
     
    // If we get here without errors, assume success
    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };
  } catch (error) {
    // Handle validation or API errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.errors,
      };
    }
    
    // Handle authentication errors
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create account",
    };
  }
}

export async function LoginAccount(data: z.infer<typeof SignInSchema>) {
  try {
    const validatedData = SignInSchema.parse(data);

    const loginResult = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    // Handle different possible response structures
    const response = loginResult as any;

    if (response?.error) {
      const errorMessage = response.error?.message || "Login failed";

      // Check for specific authentication errors
      const lowerErrorMessage = errorMessage.toLowerCase();

      if (
        lowerErrorMessage.includes("invalid credentials") ||
        lowerErrorMessage.includes("incorrect password")
      ) {
        return {
          success: false,
          error: "Invalid email or password. Please try again.",
        };
      }

      if (
        lowerErrorMessage.includes("user not found") ||
        lowerErrorMessage.includes("account not found") ||
        lowerErrorMessage.includes("no user found")
      ) {
        return {
          success: false,
          error:
            "Account not found. Please check your email or register for a new account.",
        };
      }

      if (
        lowerErrorMessage.includes("email not verified") ||
        lowerErrorMessage.includes("verify your email")
      ) {
        // Store email for verification page
        if (typeof window !== 'undefined') {
          localStorage.setItem("pending_verification_email", validatedData.email);
          // Store the current time to handle resend cooldown
          localStorage.setItem("verification_request_time", Date.now().toString());
        }
        
        return {
          success: false,
          error: "Please verify your email address before logging in.",
          redirect: "/verify-email", // Add redirect for unverified users
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Check if user is verified (assuming response has user data)
    if (response?.user && !response.user.emailVerified) {
      // Store email for verification page
      if (typeof window !== 'undefined') {
        localStorage.setItem("pending_verification_email", validatedData.email);
        localStorage.setItem("verification_request_time", Date.now().toString());
      }
      
      return {
        success: false,
        error: "Please verify your email address before logging in.",
        redirect: "/verify-email", // Redirect to verification page
      };
    }

    return {
      success: true,
      redirect: "/dashboard",
    };
  } catch (error: any) {
    // Check error type and return appropriate message
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid input. Please check your email and password format.",
      };
    }

    // Handle specific error cases
    const errorMessage = error.message?.toLowerCase() || "";

    if (
      errorMessage.includes("user not found") ||
      errorMessage.includes("no account") ||
      errorMessage.includes("credentials invalid")
    ) {
      return {
        success: false,
        error: "Invalid email or password. Please try again.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to login. Please try again.",
    };
  }
}

export async function LogoutAccount() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true, redirect: "/" };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      error: "Failed to logout. Please try again.",
    };
  }
}