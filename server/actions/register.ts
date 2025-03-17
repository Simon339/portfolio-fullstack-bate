"use server";

import * as z from "zod";
import { db } from "@/server/db"; 
import { auditLogs, users } from "@/server/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { SignUpSchema } from "@/types/vaildations/register";
import { headers } from "next/headers";

export const register = async (data: z.infer<typeof SignUpSchema>) => {
  try {
    const validatedData = SignUpSchema.parse(data);

    if (!validatedData) {
      return { error: "Invalid input data" };
    }

    const { email, name, password, surname, country, phone } = validatedData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute()
      .then((result) => result[0]);

    if (userExists) {
      return { error: "Email is already in use. Please try another one." };
    }

    const lowerCaseEmail = email.toLowerCase();

    const newUser = await db.insert(users).values({
      email: lowerCaseEmail,
      name,
      surname,
      country,
      phone,
      password: hashedPassword,
    }).returning();
    
    const verificationToken = await generateVerificationToken(email);
    const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

    await sendVerificationEmail(email, verificationToken.token);

    // Log the registration
    if (newUser.length > 0) {
      await db.insert(auditLogs).values({
        action: "REGISTER",
        tableName: "users",
        recordId: newUser[0].id,
        userId: newUser[0].id,
        details: JSON.stringify({ 
          action: "User registered",
          email: lowerCaseEmail,
          name,
          surname,
          country,
          verificationTokenId: verificationToken.id
        }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      });
    }

    return { success: "Email verification was sent" };
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
