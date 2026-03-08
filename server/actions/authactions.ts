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
        email: validatedData.email.trim().toLowerCase(),
        password: validatedData.password,
        name: fullname,
        // role: "user",
      },
    });
    // If result is undefined or null
    if (!result) {
      return {
        success: false,
        error: "No response received from server. Please check your network connection.",
      };
    }

    // Check for response data structure
    if (result.data) {
      
      if (result.data.error) {
        return {
          success: false,
          error: result.data.error.message || "Registration failed",
        };
      }
      
      if (result.data.user) {
        return {
          success: true,
          message: "Account created! Please check your email to verify your account.",
        };
      }
    }

    // Handle direct error property
    if ((result as any).error) {
      const error = (result as any).error;
      
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    }

    // If we get here without errors, assume success
    return {
      success: true,
      message: "Account created! Please check your email to verify your account.",
    };

  } catch (error: any) {
    console.error("Registration error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: "Network error. Please check your internet connection.",
      };
    }

    // Zod validation errors
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => e.message).join(', ');
      return {
        success: false,
        error: `Validation error: ${errors}`,
      };
    }

    // Check for duplicate email
    if (
      error.message?.toLowerCase().includes("already exists") ||
      error.message?.toLowerCase().includes("duplicate") ||
      error.message?.toLowerCase().includes("email exists") ||
      error.code === 409
    ) {
      return {
        success: false,
        error: "This email is already registered. Please use a different email or try logging in.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
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
