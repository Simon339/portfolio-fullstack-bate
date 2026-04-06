"use server";

import { SettingsSchema } from "@/types";
import * as z from "zod";
import { getUserById } from "@/server/actions/user";
import { db } from "@/server/db";
import { auditLogs,  user } from "@/server/schema";
import { eq, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../auth";

export const Settings = async (values: z.infer<typeof SettingsSchema>) => {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})

  if (!session.user) {
    return { error: "Unauthorized!" };
  }

  
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  try {
    await db
      .update(user)
      .set({
        ...values,
      })
      .where(eq(user.id, session.user.id))
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
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  
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

export async function processAccountDeletions() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const usersToDelete = await db.select().from(users).where(lte(users.deletionRequestedAt, thirtyDaysAgo))
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  for (const user of usersToDelete) {
    await db.transaction(async (trx) => {
      await trx.insert(deletedUsers).values({
        originalUserId: user.id,
        email: user.email,
        userData: user,
      })

      // Delete user from users table
      await trx.delete(users).where(eq(users.id, user.id))

      // Log the deletion
      await trx.insert(auditLogs).values({
        action: "DELETE_ACCOUNT",
        tableName: "users",
        recordId: user.id,
        details: JSON.stringify({ deletedAt: new Date().toISOString() }),
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
    })
  }
}
