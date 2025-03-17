"use server";

import bcrypt from 'bcryptjs';
import * as z from "zod";
import { ResetPasswordSchema, ResetSchema } from "@/types/vaildations/resetP";
import { generatePasswordResetToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/mail";
import { db } from '@/server/db';
import { getPasswordResetTokenByToken } from '@/server/data/token';
import { passwordResetTokens, users, auditLogs } from '../schema'; // Import auditLogs
import { eq } from "drizzle-orm";
import { headers } from "next/headers"; // Import headers to collect IP and user agent

export const ResetPasswordAction = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }
  const { email } = validatedFields.data;

  const userExists = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .then((result) => result[0]);

  if (!userExists || !userExists.email) {
    return { error: "User does not exist" };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  // Dynamically collect IP address and user agent
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Log the password reset request in audit_logs
  await db.insert(auditLogs).values({
    action: 'PASSWORD_RESET_REQUEST',
    tableName: 'users',
    recordId: userExists.id, // ID of the user requesting the password reset
    userId: userExists.id, // ID of the user requesting the password reset
    details: JSON.stringify({
      action: 'Password reset requested',
      email: email,
      tokenId: passwordResetToken.id, // ID of the generated token
    }),
    ipAddress: ipAddress, // Use dynamically collected IP address
    userAgent: userAgent, // Use dynamically collected user agent
  });

  return { success: "Reset email sent!" };
};

export const NewPasswordAction = async (
  values: z.infer<typeof ResetPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: "Missing Token!" };
  }
  const validatedFields = ResetPasswordSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Field!" };
  }
  const { password } = validatedFields.data;

  // Fetch the password reset token using Drizzle ORM
  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: "User does not exist" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired!" };
  }

  // Fetch the user using Drizzle ORM
  const userExists = await db
    .select()
    .from(users)
    .where(eq(users.email, existingToken.email))
    .then((result) => result[0]);

  if (!userExists) {
    return { error: "Email does not exist" };
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password using Drizzle ORM
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userExists.id));

  // Delete the used token using Drizzle ORM
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, existingToken.id));

  // Dynamically collect IP address and user agent
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Log the password update in audit_logs
  await db.insert(auditLogs).values({
    action: 'PASSWORD_RESET_COMPLETE',
    tableName: 'users',
    recordId: userExists.id, // ID of the user whose password was updated
    userId: userExists.id, // ID of the user whose password was updated
    details: JSON.stringify({
      action: 'Password reset completed',
      email: userExists.email,
      tokenId: existingToken.id, // ID of the used token
    }),
    ipAddress: ipAddress, // Use dynamically collected IP address
    userAgent: userAgent, // Use dynamically collected user agent
  });

  return { success: "Password was updated!" };
};