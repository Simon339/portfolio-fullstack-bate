/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from "zod";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { AddNewUserSchema } from "@/types";
import { revalidatePath } from "next/cache";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail, sendVerificationEmailForAddedUser } from "@/lib/mail";
import { users, auditLogs, deletedUsers, contactForms, serviceInquiries, projects } from "../schema"; 
import { eq, desc, and, gte, lt, count, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../auth";


export async function getUsers() {
  try {
    const user = await db.select().from(users);
    revalidatePath('/users');
    return { count: user.length, success: true };
  } catch (error) {
    return { count: 0, success: false };
  }
}

export async function getbyUserDetails() {
  const Users = await db.select({
    id: users.id,
    name: users.name,
    surname: users.surname,
    email: users.email,
    phone: users.phone,
    country: users.country,
    image: users.image,
    role: users.role,
    createdAt: users.createdAt,
    emailVerified: users.emailVerified,
    approval: users.status,
  }).from(users);

  revalidatePath('/users');
  return Users.map(user => ({
    ...user,
    status: user.emailVerified ? 'Verified' : 'Not Verified',
    isSelected: false,
  }));
}

export async function getUserSignupAnalytics() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const lastYear = currentYear - 1;

  try {
    const currentYearSignups = await db.select({ count: count() })
      .from(users)
      .where(and(
        gte(users.createdAt, new Date(currentYear, 0, 1)),
        lt(users.createdAt, new Date(currentYear + 1, 0, 1))
      ));

    const lastYearSignups = await db.select({ count: count() })
      .from(users)
      .where(and(
        gte(users.createdAt, new Date(lastYear, 0, 1)),
        lt(users.createdAt, new Date(currentYear, 0, 1))
      ));

    const percentageChange = lastYearSignups[0].count !== 0
      ? ((currentYearSignups[0].count - lastYearSignups[0].count) / lastYearSignups[0].count) * 100
      : 100; 

    revalidatePath('/users');
    return {
      currentYearSignups: currentYearSignups[0].count,
      lastYearSignups: lastYearSignups[0].count,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      success: true,
    };
  } catch (error) {
    console.error("Error fetching user signup analytics:", error);
    return {
      currentYearSignups: 0,
      lastYearSignups: 0,
      percentageChange: 0,
      success: false,
    };
  }
}

export async function addUser(data: z.infer<typeof AddNewUserSchema>) {
  try {
    const session = await auth(); // Get the current session
    const userId = session?.user?.id; // Extract the user ID from the session

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Step 1: Handle image URL
    const imageUrl = data.image ? URL.createObjectURL(data.image) : undefined;

    // Step 2: Insert the new user into the database
    const [user] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        country: data.country,
        role: data.role,
        image: imageUrl,
        password: await bcrypt.hash("defaultPassword", 10), // Hash the default password
      })
      .returning();

    // Step 3: Generate a verification token and send a verification email
    const verificationToken = await generateVerificationToken(data.email.toLowerCase());
    const password = "defaultPassword";
    const email = data.email.toLowerCase();
    await sendVerificationEmailForAddedUser(
      email,
      verificationToken.token,
      password
    );

    // Step 4: Dynamically collect IP address and user agent
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Step 5: Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'users',
      recordId: user.id, // Use the newly created user's ID
      userId: userId, // Use the logged-in user's ID
      details: JSON.stringify({ action: 'User created', data: user }),
      ipAddress: ipAddress, // Use dynamically collected IP address
      userAgent: userAgent, // Use dynamically collected user agent
    });

    // Step 6: Revalidate the users page
    revalidatePath('/users');

    return { success: true, message: "User added successfully" };
  } catch (error) {
    console.error("Error adding user:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", "), success: false };
    }

    return { error: "Failed to add user", success: false };
  }
}


export async function deleteUser(formData: FormData) {
  const userId = formData.get("userId") as string;
  const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

  if (!userId) {
    return { error: "User ID is required", success: false };
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    await db.delete(users).where(eq(users.id, userId));

    await db.insert(auditLogs).values({
      action: 'DELETE',
      tableName: 'users',
      recordId: user.id,
      userId: userId,
      details: JSON.stringify({ action: 'User deleted', data: user }),
      ipAddress: ipAddress, // Use dynamically collected IP address
      userAgent: userAgent,
    });

  
    await db.insert(deletedUsers).values({
      originalUserId: userId,
      email: user.email,
      userData: JSON.stringify(user),
    });

    revalidatePath('/users');
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user", success: false };
  }
}

type ServerActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updateUserRole(
  userId: string,
  newRole: string
): Promise<ServerActionResponse> {
  try {
    const session = await auth();
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Update the user role in the database
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId));

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: userId,
      userId: loggedInUserId,
      details: JSON.stringify({ action: "User role updated", newRole }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Revalidate the users page to reflect changes
    revalidatePath("/users");

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

export async function updateUserEmail(
  userId: string,
  newEmail: string
): Promise<ServerActionResponse> {
  try {
    const session = await auth();
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Update the user email in the database
    await db.update(users).set({ email: newEmail }).where(eq(users.id, userId));

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: userId,
      userId: loggedInUserId,
      details: JSON.stringify({ action: "User email updated", newEmail }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Revalidate the users page to reflect changes
    revalidatePath("/users");

    return { success: true, message: "User email updated successfully" };
  } catch (error) {
    console.error("Failed to update user email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user email",
    };
  }
}

export async function updateApprovalStatus(
  userId: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<ServerActionResponse> {
  try {
    const session = await auth();
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Update the user approval status in the database
    await db
      .update(users)
      .set({ status: status }) // Use the correct field name from your schema
      .where(eq(users.id, userId));

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: userId,
      userId: loggedInUserId,
      details: JSON.stringify({ action: "User approval status updated", status }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Revalidate the users page to reflect changes
    revalidatePath("/users");

    return { success: true, message: `User status updated to ${status}` };
  } catch (error) {
    console.error("Failed to update approval status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update approval status",
    };
  }
}

export async function deleteUserPermanently(
  userId: string
): Promise<ServerActionResponse> {
  try {
    const session = await auth();
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // First get the user data to store in deleted_users table
    const userToDelete = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Store user data in deleted_users table
    await db.insert(deletedUsers).values({
      originalUserId: userId,
      email: userToDelete.email,
      userData: JSON.stringify(userToDelete),
    });

    // Log the deletion
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "users",
      recordId: userId,
      userId: loggedInUserId,
      details: JSON.stringify({ action: "User permanently deleted" }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    // Revalidate the users page to reflect changes
    revalidatePath("/users");

    return { success: true, message: "User permanently deleted" };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export type AuditLog = {
  id: string
  action: string
  tableName: string
  recordId: string
  userId: string | null
  timestamp: Date
  details: any
  ipAddress: string | null
  userAgent: string | null
}

export async function getUserAuditLogs(userId: string): Promise<AuditLog[]> {
  try {
    // Fetch logs where this user is the subject (recordId)
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.recordId, userId))
      .orderBy(desc(auditLogs.timestamp))

    return logs
  } catch (error) {
    console.error("Failed to fetch user audit logs:", error)
    return []
  }
}

export async function getTotalUsers() {
  try {
    const totalUsers = await db.select().from(users);
    revalidatePath("/dashboard");
    return totalUsers.length;
  } catch (error) {
    console.error("Failed to fetch total users:", error);
    return 0;
  }
}

export async function getStaffCount() {
  try {
    const staff = await db
      .select()
      .from(users)
      .where(inArray(users.role, ["ADMIN", "SUPER_ADMIN"])); 

    return staff.length;
  } catch (error) {
    console.error("Failed to fetch staff count:", error);
    return 0;
  }
}

export async function getTotalRequests() {
  try {
    const unreadContactForms = await db
      .select()
      .from(contactForms)
      .where(eq(contactForms.read, false));

    const unreadServiceInquiries = await db
      .select()
      .from(serviceInquiries)
      .where(eq(serviceInquiries.read, false));

    return unreadContactForms.length + unreadServiceInquiries.length;
  } catch (error) {
    console.error("Failed to fetch total requests:", error);
    return 0;
  }
}

export async function getTotalProjects() {
  try {
    const totalProjects = await db.select().from(projects);
    return totalProjects.length;
  } catch (error) {
    console.error("Failed to fetch total projects:", error);
    return 0;
  }
}