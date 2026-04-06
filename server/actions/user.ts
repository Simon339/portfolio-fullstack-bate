"use server";

import { db } from "@/server/db";
import { AddNewUserSchema } from "@/types";
import { z } from "zod";
import {
  user,
  auditLogs,
  contactForms,
  serviceInquiries,
  projects,
  session,
  account,
  ratings,
} from "../schema";
import {
  eq,
  desc,
  and,
  gte,
  lt,
  count,
  inArray,
  sql,
  placeholder,
} from "drizzle-orm";
import { auth } from "@/server/auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { headers } from "next/headers";

type ServerActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type AuditLog = {
  id: number;
  action: string;
  tableName: string;
  recordId: string;
  userId: string | null;
  timestamp: Date;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
};

function generateSecureLogId() {
  const timestamp = Date.now().toString(36).slice(-4);
  const randomValue = randomBytes(4).toString("base64").toUpperCase();
  const logid = `log-${timestamp}-${randomValue}`;
  return logid;
}

export async function getUsers() {
  try {
    const Users = await db.select().from(user);
    return { count: Users.length, success: true };
  } catch (error) {
    return { count: 0, success: false };
  }
}

export async function getUserDetails(userId: string) {
  // Get basic user info
  const [userData] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      banned: user.banned,
      twoFactorEnabled: user.twoFactorEnabled,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      emailVerified: user.emailVerified,
    })
    .from(user)
    .where(eq(user.id, userId));

  if (!userData) {
    throw new Error("User not found");
  }

  // Get user sessions
  const userSessions = await db
    .select({
      id: session.id,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      impersonatedBy: session.impersonatedBy,
    })
    .from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.createdAt));

  // Get linked accounts
  const linkedAccounts = await db
    .select({
      id: account.id,
      providerId: account.providerId,
      accountId: account.accountId,
      password: account.password,
      createdAt: account.createdAt,
      scope: account.scope,
    })
    .from(account)
    .where(eq(account.userId, userId));

  // Get user audit logs
  const userAuditLogs = await db
    .select({
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
  const currentSession = userSessions.find(
    (session) => new Date(session.expiresAt) > new Date(),
  );

  // Calculate derived stats
  const stats = {
    sessionCount: userSessions.length,
    activeSessionCount: userSessions.filter(
      (s) => new Date(s.expiresAt) > new Date(),
    ).length,
    linkedAccountCount: linkedAccounts.length,
    auditLogCount: userAuditLogs.length,
    lastActive: userAuditLogs[0]?.timestamp || userData.updatedAt,
  };

  // Get verification status
  const verification = {
    email: userData.emailVerified,
    accounts: linkedAccounts.length > 0,
    hasPassword: linkedAccounts.some((acc) => acc.providerId === "email"),
  };

  // Build complete user profile
  const userDetails = {
    ...userData,
    status: userData.emailVerified ? "Verified" : "Not Verified",
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

// Impersonate user
export async function impersonateUser(
  userId: string,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Check if user is trying to impersonate themselves
    if (loggedInUserId === userId) {
      throw new Error("Cannot impersonate yourself");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Get user data before impersonation
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    // Impersonate the user
    const impersonationData = await auth.api.impersonateUser({
      body: {
        userId: userId,
      },
      headers: await headers(),
    });

    // Log the impersonation
    await db.insert(auditLogs).values({
      action: "IMPERSONATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "User impersonation started",
        impersonatedUserId: userId,
        impersonatedUserEmail: userData.email,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `Now impersonating ${userData.name || userData.email}`,
    };
  } catch (error) {
    console.error("Failed to impersonate user:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to impersonate user",
    };
  }
}

// Stop impersonating
export async function stopImpersonating(): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if currently impersonating
    if (!session?.session?.impersonatedBy) {
      throw new Error("Not currently impersonating anyone");
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const originalUserId = session.user.id;
    const impersonatedUserId = session.session.impersonatedBy;

    // Stop impersonating
    await auth.api.stopImpersonating({
      headers: await headers(),
    });

    // Log the stop impersonation
    await db.insert(auditLogs).values({
      action: "STOP_IMPERSONATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: originalUserId,
      details: JSON.stringify({
        action: "User impersonation stopped",
        impersonatedUserId: impersonatedUserId,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Stopped impersonating user",
    };
  } catch (error) {
    console.error("Failed to stop impersonating:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to stop impersonating",
    };
  }
}

// DeleteUser function
export async function deleteUser(
  formData: FormData,
): Promise<{ success: boolean; error?: string; message?: string }> {
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID is required", success: false };
  }

  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      return { error: "Not authenticated", success: false };
    }

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Get user data before deletion
    const [userData] = await db.select().from(user).where(eq(user.id, userId));

    if (!userData) {
      return { error: "User not found", success: false };
    }

    // Delete the user
    const deletedUser = await auth.api.removeUser({
      body: {
        userId: userId, // required
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    // Check if deletion was successful
    if (!deletedUser || deletedUser.error) {
      return {
        error: deletedUser?.error || "Failed to delete user",
        success: false,
      };
    }

    // Log the deletion
    await db.insert(auditLogs).values({
      action: "DELETE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "User deleted",
        deletedUserId: userId,
        deletedUserEmail: userData.email,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user", success: false };
  }
}

//Add new user function
export async function addUser(data: z.infer<typeof AddNewUserSchema>) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    }); // Get the current session
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Step 1: Handle image URL
    const imageUrl = data.image ? URL.createObjectURL(data.image) : undefined;

    // Step 2: Insert the new user into the database
    const newuser = await auth.api.createUser({
      body: {
        email: data.email.toLowerCase(),
        name: data.firstname + " " + data.surname,
        image: `https://api.dicebear.com/6.x/initials/svg?seed=${data.firstname + " " + data.surname || "user"}`,
        role: data.role || "user",
        password: await bcrypt.hash("defaultPassword", 10), // Hash the default password
      },
    });

    // Step 3: Generate a verification token and send a verification email
    // const verificationToken = await generateVerificationToken(data.email.toLowerCase());
    const password = "defaultPassword";
    const email = data.email.toLowerCase();
    // await sendVerificationEmailForAddedUser(
    //   email,
    //   verificationToken.token,
    //   password
    // );

    // Step 4: Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: userId,
      details: JSON.stringify({
        action: "User created",
        data: {
          email: data.email,
          firstname: data.firstname,
          surname: data.surname,
          role: data.role,
          // Add any other relevant fields you want to log
        },
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return { success: true, message: "User added successfully" };
  } catch (error) {
    console.error("Error adding user:", error);

    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    }

    return { error: "Failed to add user", success: false };
  }
}

// Update user role function
export async function updateUserRole(
  userId: string,
  newRole: "admin" | "owner" | "user",
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    const userId = session?.user?.id;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Update the user role in the database
    const data = await auth.api.setRole({
      body: {
        userId: userId,
        role: newRole,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: userId,
      details: JSON.stringify({ action: "User role updated", newRole }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return { success: true, message: "User role updated successfully" };
  } catch (error) {
    console.error("Failed to update user role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

// Update user email
export async function updateUserEmail(
  userId: string,
  newEmail: string,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Check if user is trying to update their own email
    if (loggedInUserId === userId) {
      throw new Error("Cannot update your own email through this endpoint");
    }

    // Get user data before updating
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    // Check if email is already taken
    const [existingUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, newEmail.toLowerCase()));

    if (existingUser) {
      throw new Error("Email already in use by another user");
    }

    // Update the user's email
    const data = await auth.api.adminUpdateUser({
      body: {
        userId: userId,
        data: { email: newEmail.toLowerCase() },
      },
      headers: await headers(),
    });

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      timestamp: new Date(),
      details: JSON.stringify({
        action: "User email updated",
        oldEmail: userData.email,
        newEmail: newEmail.toLowerCase(),
        targetUserId: userId,
        targetUserName: userData.name,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `Email updated from ${userData.email} to ${newEmail.toLowerCase()}`,
    };
  } catch (error) {
    console.error("Failed to update user email:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user email",
    };
  }
}

// Update user name
export async function updateUserName(
  userId: string,
  newName: string,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Get user data before updating
    const [userData] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    // Check if user is trying to update their own email
    if (loggedInUserId === userId) {
      throw new Error("Cannot update your own email through this endpoint");
    }

    // Update the user's email
    const data = await auth.api.adminUpdateUser({
      body: {
        userId: userId,
        data: { name: newName },
      },
      headers: await headers(),
    });

    // Log the action in the audit logs
    await db.insert(auditLogs).values({
      action: "UPDATE",
      tableName: "users",
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      timestamp: new Date(),
      details: JSON.stringify({
        action: "User name updated",
        oldName: userData.name,
        newName: newName,
        targetUserId: userId,
        targetUserName: newName,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `Name updated from ${userData.name} to ${newName}`,
    };
  } catch (error) {
    console.error("Failed to update user name:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update user name",
    };
  }
}

// Ban user function
export async function banUser(
  userId: string,
  banReason: string,
  banExpiresIn?: number,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Check if user is trying to ban themselves
    if (loggedInUserId === userId) {
      throw new Error("Cannot ban yourself");
    }

    // Get user data before banning
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    // Ban the user
    await auth.api.banUser({
      body: {
        userId: userId,
        banReason: banReason,
        banExpiresIn: banExpiresIn,
      },
      headers: await headers(),
    });

    // Log the ban action
    await db.insert(auditLogs).values({
      action: "BAN",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "User banned",
        bannedUserId: userId,
        bannedUserEmail: userData.email,
        banReason: banReason,
        banExpiresIn: banExpiresIn,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `User ${userData.name || userData.email} has been banned`,
    };
  } catch (error) {
    console.error("Failed to ban user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to ban user",
    };
  }
}

// Unban user function
export async function unbanUser(userId: string): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Get user data before unbanning
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    // Unban the user
    await auth.api.unbanUser({
      body: {
        userId: userId,
      },
      headers: await headers(),
    });

    // Log the unban action
    await db.insert(auditLogs).values({
      action: "UNBAN",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "User unbanned",
        unbannedUserId: userId,
        unbannedUserEmail: userData.email,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `User ${userData.name || userData.email} has been unbanned`,
    };
  } catch (error) {
    console.error("Failed to unban user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unban user",
    };
  }
}

// Revoke single user session
export async function revokeUserSession(
  sessionToken: string,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Revoke the session
    await auth.api.revokeUserSession({
      body: {
        sessionToken: sessionToken,
      },
      headers: await headers(),
    });

    // Log the revoke session action
    await db.insert(auditLogs).values({
      action: "REVOKE_SESSION",
      tableName: "sessions",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "User session revoked",
        sessionToken: sessionToken,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Session revoked successfully",
    };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to revoke session",
    };
  }
}

// Revoke all user sessions
export async function revokeAllUserSessions(
  userId: string,
): Promise<ServerActionResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const loggedInUserId = session?.user?.id;

    if (!loggedInUserId) {
      throw new Error("User not authenticated");
    }

    // Check if user is trying to revoke their own sessions
    if (loggedInUserId === userId) {
      throw new Error("Cannot revoke your own sessions while logged in");
    }

    // Get user data before revoking sessions
    const [userData] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId));

    if (!userData) {
      throw new Error("User not found");
    }

    // Revoke all sessions for the user
    await auth.api.revokeUserSessions({
      body: {
        userId: userId,
      },
      headers: await headers(),
    });

    // Log the revoke all sessions action
    await db.insert(auditLogs).values({
      action: "REVOKE_ALL_SESSIONS",
      tableName: "sessions",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: loggedInUserId,
      details: JSON.stringify({
        action: "All user sessions revoked",
        targetUserId: userId,
        targetUserEmail: userData.email,
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: `All sessions revoked for ${userData.name || userData.email}`,
    };
  } catch (error) {
    console.error("Failed to revoke all sessions:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to revoke all sessions",
    };
  }
}

// Auto-generate 10 users
export async function autoGenerateUsers() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const firstNames = [
      "John",
      "Jane",
      "Michael",
      "Sarah",
      "David",
      "Emma",
      "James",
      "Lisa",
      "Robert",
      "Maria",
    ];
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
    ];
    const roles = [
      "user",
      "user",
      "user",
      "user",
      "user",
      "user",
      "admin",
      "user",
      "manager",
      "user",
    ]; // 7 users, 2 admins, 1 manager

    const generatedUsers = [];

    // Generate 10 users
    for (let i = 0; i < 10; i++) {
      const firstname = firstNames[i % firstNames.length];
      const surname = lastNames[i % lastNames.length];
      const email = `${firstname.toLowerCase()}.${surname.toLowerCase()}${i > 0 ? i : ""}@example.com`;
      const role = roles[i % roles.length] as "user" | "admin" | "manager";
      const defaultPassword = "defaultPassword";

      // Create user using your existing auth.api.createUser
      const newUser = await auth.api.createUser({
        body: {
          email: email.toLowerCase(),
          name: `${firstname} ${surname}`,
          image: `https://api.dicebear.com/6.x/initials/svg?seed=${firstname}%20${surname}`,
          role: role,
          password: await bcrypt.hash(defaultPassword, 10),
        },
      });

      generatedUsers.push({
        email,
        name: `${firstname} ${surname}`,
        role,
        password: defaultPassword, // For display purposes
      });
    }

    // Log the bulk action in audit_logs
    await db.insert(auditLogs).values({
      action: "BULK_CREATE",
      tableName: "users",
      timestamp: new Date(),
      recordId: generateSecureLogId(),
      userId: userId,
      details: JSON.stringify({
        action: "Auto-generated 10 users",
        count: generatedUsers.length,
        users: generatedUsers.map((u) => ({ email: u.email, role: u.role })),
      }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Successfully generated 10 users",
      users: generatedUsers,
    };
  } catch (error) {
    console.error("Error auto-generating users:", error);

    if (error instanceof z.ZodError) {
      return {
        error: error.errors.map((e) => e.message).join(", "),
        success: false,
      };
    }

    return { error: "Failed to auto-generate users", success: false };
  }
}
