"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { getUserByEmail, getUserById } from "../data/user";
import { eq } from "drizzle-orm";
import { verificationTokens, users, passwordResetTokens, tokens, auditLogs } from "../schema";
import { sendVerificationEmail } from "@/lib/mail";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { headers } from "next/headers";
import { currentUser } from "@/lib/auth";


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

  await sendVerificationEmail(email, token);

  return { success: "Verification email sent. Please check your inbox." };
}

export const Settings = async (values: {
    email: string;
    name: string;
    surname: string;
    phone: string;
    role: "USER" | "ADMIN";
    image?: File;
  }) => {
    const user = await currentUser();
  
    if (!user) {
      return { error: "Unauthorized!" };
    }
  
    const dbUser = await getUserById(user.id);
  
    if (!dbUser) {
      return { error: "Unauthorized!" };
    }
  
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
  
    try {
      await db
        .update(users)
        .set({
          ...values,
        })
        .where(eq(users.id, dbUser.id))
        .execute();
  
      await db.insert(auditLogs).values({
        action: "UPDATE",
        tableName: "users",
        recordId: dbUser.id,
        userId: dbUser.id,
        details: JSON.stringify({ 
          action: "Settings updated", 
          updatedFields: Object.keys(values) 
        }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      });
  
      return { success: "Settings Updated" };
    } catch (error) {
      console.error("Error updating settings:", error);
      return { error: "An error occurred while updating settings." };
    }
  };

  export async function requestAccountDeletion(userId: string) {
    const now = new Date()
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"
  
    const user = await getUserById(userId)
  
    if (!user) {
      return { error: "User not found" }
    }
  
    try {
      await db.update(users).set({ deletionRequestedAt: now }).where(eq(users.id, userId))
  
      // Insert an audit log entry
      await db.insert(auditLogs).values({
        action: "REQUEST_ACCOUNT_DELETION",
        tableName: "users",
        recordId: userId,
        userId: userId,
        details: JSON.stringify({ requestedAt: now.toISOString() }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
  
      return { success: "Account deletion requested" }
    } catch (error) {
      console.error("Error during account deletion request:", error)
      return { error: "Failed to request account deletion" }
    }
  }
  
  