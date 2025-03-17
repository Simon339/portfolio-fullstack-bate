'use server'

import { db } from "../db"
import { users } from "../schema";
import { eq } from "drizzle-orm";

export async function deleteUser(userId: string) {
  try {
    await db.delete(users).where(eq(users.id, userId));

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

