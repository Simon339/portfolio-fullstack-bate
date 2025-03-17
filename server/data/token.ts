"use server"

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { getUserByEmail } from "./user";
import { eq } from "drizzle-orm";
import { verificationTokens, users, passwordResetTokens, tokens } from "../schema";
import { sendVerificationEmail } from "@/lib/mail";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.email, email))
      .limit(1);
    
    revalidatePath('/tokens');
    return verificationToken[0];
  } catch (error) {
    console.log(error);
  }
}

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(verificationTokens)
      .where(eq(verificationTokens.token, token))
      .limit(1);
    
    revalidatePath('/tokens');
    return verificationToken[0];
  } catch (error) {
    console.log(error);
  }
}

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "Invalid token" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "User not found" };
  }

  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      email: existingToken.email
    })
    .where(eq(users.id, existingUser.id));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.id, existingToken.id));

  return { success: "Email verified" };
}

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);
    
    revalidatePath('/tokens');
    return passwordResetToken[0];
  } catch {
    return null;
  }
}

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.email, email))
      .limit(1);
    
    revalidatePath('/tokens');
    return passwordResetToken[0];
  } catch {
    return null;
  }
}

export const getReviewInvitationTokenByEmail = async (email: string) => {
  try {
    const reviewInvitationToken = await db
      .select()
      .from(tokens)
      .where(eq(tokens.email, email))
      .limit(1);
    
    revalidatePath('/tokens');
    return reviewInvitationToken[0];
  } catch {
    return null;
  }
}

export async function requestVerificationToken(data: z.infer<typeof schema>) {
  const validatedFields = schema.safeParse(data);
  
  if (!validatedFields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validatedFields.data;

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user[0]) {
    return { error: "User not found" };
  }

  if (user[0].emailVerified) {
    return { error: "Email already verified" };
  }


  await db.delete(verificationTokens).where(eq(verificationTokens.email, email));

 
  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000); // 1 hour from now

  await db.insert(verificationTokens).values({
    email,
    token,
    expires,
  });

  // Send verification email
  await sendVerificationEmail(email, token);

  return { success: "Verification email sent. Please check your inbox." };
}