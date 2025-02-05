/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import * as z from "zod";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { SignUpSchema } from "@/types/vaildations/register";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";

export const register = async (data: z.infer<typeof SignUpSchema>) => {
  try {
    const validatedData = SignUpSchema.parse(data);

    if (!validatedData) {
      return { error: "Invalid input data" };
    }

    const { email, name, password,surname, country, phone } = validatedData;

    
    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await db.user.findFirst({
      where: {
        email,
      },
    });

    
    if (userExists) {
      return { error: "Email already is in use. Please try another one." };
    }

    const lowerCaseEmail = email.toLowerCase();

    
    const user = await db.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        surname,
        country,
        phone,
        password: hashedPassword,
      },
    });

  
    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmail(email, verificationToken.token)

    return { success: "Email Verification was sent" };
  } catch (error) {

    if ((error as { code: string }).code === "ETIMEDOUT") {
      return {
        error: "Unable to connect to the database. Please try again later.",
      };
    } else if ((error as { code: string }).code === "503") {
      return {
        error: "Service temporarily unavailable. Please try again later.",
      };
    } else {
      return { error: "An unexpected error occurred. Please try again later." };
    }
  }
};