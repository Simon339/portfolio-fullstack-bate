/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { z } from "zod";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { AddNewUserSchema } from "@/types";
import { revalidatePath } from "next/cache";
import { user, auditLogs, contactForms, serviceInquiries, projects, session, account, ratings } from "../schema"; 
import { eq, desc, and, gte, lt, count, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../auth";
import { randomBytes } from "crypto";
import { twoFactor } from "@/auth-schema";

function generateSecureLogId() {
  // Add timestamp to ensure uniqueness even with same random value
  const timestamp = Date.now().toString(36).slice(-4);
  const randomValue = randomBytes(4).toString("base64").toUpperCase();
  const logid = `log-${timestamp}-${randomValue}`;
  
  return logid;
}

export async function getUsers() {
  try {
    const Users = await db.select().from(user);
    revalidatePath('/users');
    return { count: Users.length, success: true };
  } catch (error) {
    return { count: 0, success: false };
  }
}

export async function getUserDetails(userId: string) {
  // Get basic user info
  const [userData] = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: user.emailVerified,
  })
  .from(user)
  .where(eq(user.id, userId));

  if (!userData) {
    throw new Error('User not found');
  }

  // Get user sessions
  const userSessions = await db.select({
    id: session.id,
    expiresAt: session.expiresAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    activeOrganizationId: session.activeOrganizationId,
    activeTeamId: session.activeTeamId,
  })
  .from(session)
  .where(eq(session.userId, userId))
  .orderBy(desc(session.createdAt));

  // Get linked accounts
  const linkedAccounts = await db.select({
    id: account.id,
    providerId: account.providerId,
    accountId: account.accountId,
    createdAt: account.createdAt,
    scope: account.scope,
  })
  .from(account)
  .where(eq(account.userId, userId));


  // Get user audit logs
  const userAuditLogs = await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    tableName: auditLogs.tableName,
    recordId: auditLogs.recordId,
    timestamp: auditLogs.timestamp,
    ipAddress: auditLogs.ipAddress,
    userAgent: auditLogs.userAgent,
    details: auditLogs.details,
  })
  .from(auditLogs)
  .where(eq(auditLogs.userId, userId))
  .orderBy(desc(auditLogs.timestamp))
  .limit(100);

  // Get current active session
  const currentSession = userSessions.find(session => 
    new Date(session.expiresAt) > new Date()
  );

  // Calculate derived stats
  const stats = {
    sessionCount: userSessions.length,
    activeSessionCount: userSessions.filter(s => new Date(s.expiresAt) > new Date()).length,
    linkedAccountCount: linkedAccounts.length,
    auditLogCount: userAuditLogs.length,
    lastActive: userAuditLogs[0]?.timestamp || userData.updatedAt,
  };

  // Get verification status
  const verification = {
    email: userData.emailVerified,
    accounts: linkedAccounts.length > 0,
    hasPassword: linkedAccounts.some(acc => acc.providerId === 'email'),
  };

  // Build complete user profile
  const userDetails = {
    ...userData,
    status: userData.emailVerified ? 'Verified' : 'Not Verified',
    verification,
    sessions: {
      all: userSessions,
      current: currentSession,
      stats: {
        total: stats.sessionCount,
        active: stats.activeSessionCount,
      },
    },
    accounts: linkedAccounts,
    activity: {
      auditLogs: userAuditLogs,
      stats: {
        totalActions: stats.auditLogCount,
        lastActive: stats.lastActive,
      },
    },
    stats,
   
  };

  return userDetails;
}

// Helper function to get permissions by role
function getPermissionsByRole(role: string) {
  const permissions = {
    member: ['view_projects', 'view_members', 'comment'],
    admin: ['view_projects', 'edit_projects', 'view_members', 'invite_members', 'manage_roles', 'comment'],
    owner: ['view_projects', 'edit_projects', 'delete_projects', 'view_members', 'invite_members', 'manage_roles', 'delete_members', 'transfer_ownership', 'comment'],
  };
  
  return permissions[role as keyof typeof permissions] || permissions.member;
}

// If you want to get details for multiple users at once
export async function getbyUserDetails(userIds?: string[]) {
  try {
    let query = db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      role: user.role,
      banned: user.banned,
      twoFactorEnabled: user.twoFactorEnabled,
      banReason: user.banReason,
      banExpires: user.banExpires,
    })
    .from(user);

    if (userIds && userIds.length > 0) {
      query = query.where(inArray(user.id, userIds));
    }

    const users = await query;
    
    // Get session counts separately if needed
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const [sessionCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(session)
          .where(eq(session.userId, u.id));
        
        const [lastActive] = await db
          .select({ timestamp: auditLogs.timestamp })
          .from(auditLogs)
          .where(eq(auditLogs.userId, u.id))
          .orderBy(desc(auditLogs.timestamp))
          .limit(1);

        return {
          ...u,
          sessionCount: sessionCount?.count || 0,
          lastActive: lastActive?.timestamp || u.createdAt,
        };
      })
    );

    return usersWithStats;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Fix deleteUser function
export async function deleteUser(formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
  const userId = formData.get("userId") as string;
  
  if (!userId) {
    return { error: "User ID is required", success: false };
  }

  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    const loggedInUserId = session?.user?.id;
    
    if (!loggedInUserId) {
      return { error: "Not authenticated", success: false };
    }

    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Get user data before deletion
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      return { error: "User not found", success: false };
    }

    // Delete the user
    await db.delete(user).where(eq(user.id, userId));

    // Log the deletion
    await db.insert(auditLogs).values({
      action: 'DELETE',
      tableName: 'users',
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({ 
        action: 'User deleted', 
        deletedUserId: userId,
        deletedUserEmail: userData.email 
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    revalidatePath('/users');
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user", success: false };
  }
}

export async function getUserSignupAnalytics() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const lastYear = currentYear - 1;

  try {
    const currentYearSignups = await db.select({ count: count() })
      .from(user)
      .where(and(
        gte(user.createdAt, new Date(currentYear, 0, 1)),
        lt(user.createdAt, new Date(currentYear + 1, 0, 1))
      ));

    const lastYearSignups = await db.select({ count: count() })
      .from(user)
      .where(and(
        gte(user.createdAt, new Date(lastYear, 0, 1)),
        lt(user.createdAt, new Date(currentYear, 0, 1))
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
    const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
}) // Get the current session
    const userId = session?.user?.id; // Extract the user ID from the session

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Step 1: Handle image URL
    const imageUrl = data.image ? URL.createObjectURL(data.image) : undefined;

    // Step 2: Insert the new user into the database
    const [userdata] = await db
      .insert(user)
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

    // Step 3: Generate a verification token and send a verification email
    // const verificationToken = await generateVerificationToken(data.email.toLowerCase());
    const password = "defaultPassword";
    const email = data.email.toLowerCase();
    // await sendVerificationEmailForAddedUser(
    //   email,
    //   // verificationToken.token,
    //   password
    // );

    // Step 4: Dynamically collect IP address and user agent
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Step 5: Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'users',
      timestamp: new  Date(),
      recordId: generateSecureLogId(), // Use the newly created user's ID
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

type ServerActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function updateUserRole(
  userId: string,
  newRole:  "admin" | "owner"
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Update the user role in the database
    await db.update(user).set({ role: newRole }).where(eq(user.id, userId));

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
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
    const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Update the user email in the database
    await db.update(user).set({ email: newEmail }).where(eq(user.id, userId));

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      timestamp: new Date(),
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

export async function deleteUserPermanently(
  userId: string
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // First get the user data to store in deleted_users table
    const userToDelete = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Store user data in deleted_users table
    // await db.insert(deletedUsers).values({
    //   originalUserId: userId,
    //   email: userToDelete.email,
    //   userData: JSON.stringify(userToDelete),
    // });

    // Log the deletion
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "users",
      recordId: generateSecureLogId(),
      timestamp: new Date(),
      userId: loggedInUserId,
      details: JSON.stringify({ action: "User permanently deleted" }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Delete the user
    await db.delete(user).where(eq(user.id, userId));

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
  id: number
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
    const totalUsers = await db.select().from(user);
    revalidatePath("/dashboard");
    return totalUsers.length;
  } catch (error) {
    return 0;
  }
}

export async function getStaffCount() {
  try {
    const staff = await db
      .select()
      .from(user)

    return staff.length;
  } catch (error) {
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
    return 0;
  }
}

export async function getTotalProjects() {
  try {
    const totalProjects = await db.select().from(projects);
    return totalProjects.length;
  } catch (error) {
    return 0;
  }
}