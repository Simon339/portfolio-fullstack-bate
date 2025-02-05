"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { LoginSchema } from "@/types/vaildations/login";
import { getUserByEmail } from "../data/user";
import { signIn } from "../auth";

export const login = async (data: z.infer<typeof LoginSchema>) => {
 
  const validatedData = LoginSchema.safeParse(data);

  
  if (!validatedData.success) {
    return { error: "Invalid input data" };
  }

  
  const { email, password } = validatedData.data;

 
  const userExists = await getUserByEmail(email);

 
  if (!userExists || !userExists.email || !userExists.password) {
    return { error: "User does not exist" };
  }

  try {
    await signIn("credentials", {
      email: userExists.email,
      password: password,
      redirectTo: "/dashboard",
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