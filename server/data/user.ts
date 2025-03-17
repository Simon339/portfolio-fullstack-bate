"use server"

import { db } from "@/server/db"
import { users } from "@/server/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/server/auth" // Import the auth function from NextAuth.js
import type { User } from "next-auth"

interface CustomUser extends User {
  id: string
  name: string
  surname: string
  role: string
  phone: string
  status: string
}

export async function getCurrentUser(): Promise<CustomUser | null> {
  const session = await auth()
  return session?.user as CustomUser | null
}

// Get the current user ID from the session
async function getCurrentusersId() {
  const session = await auth() // Get the current session

  if (!session?.user?.id) {
    return null
  }

  // Use direct query instead of query builder
  const [userId] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1)

  return userId
}

export async function getCurrentUserId() {
  const userId = await getCurrentusersId()
  return userId?.id
}

// Get user by email
export const getUserByEmail = async (email: string) => {
  try {
    // Use direct query instead of query builder
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    revalidatePath("/users")
    return user
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

// Get user by ID
export const getUserById = async (id: string) => {
  try {
    // Use direct query instead of query builder
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)

    return user
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

// Request approval for a user
export async function requestApproval(email: string) {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      throw new Error("User not found")
    }

    if (user.role !== "USER") {
      throw new Error('Only users with "User" role can request approval')
    }

    const updatedUser = await db.update(users).set({ status: "PENDING" }).where(eq(users.email, email)).returning()

    revalidatePath("/users")
    return updatedUser[0]
  } catch (error) {
    console.error("Error requesting approval:", error)
    throw error
  }
}

// Update approval status for a user
export async function updateApprovalStatus(email: string, status: "APPROVED" | "REJECTED") {
  try {
    const user = await getUserByEmail(email)

    if (!user) {
      throw new Error("User not found")
    }

    if (user.role !== "USER") {
      throw new Error('Can only update approval status for users with "User" role')
    }

    const updatedUser = await db.update(users).set({ status }).where(eq(users.email, email)).returning()

    revalidatePath("/users")
    return updatedUser[0]
  } catch (error) {
    console.error("Error updating approval status:", error)
    throw error
  }
}

// Get user profile for the current user
export async function getUserProfile() {
  try {
    const userId = await getCurrentUserId() // Use session-based user ID
    if (!userId) return null

    return await getUserProfileById(userId)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

// Get user profile by ID
export async function getUserProfileById(userId: string) {
  try {
    if (!userId) {
      return null
    }

    // Use direct query instead of query builder and add the missing userId parameter
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    return user
  } catch (error) {
    console.error(`Error fetching user profile for ID ${userId}:`, error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  try {
    const userId = await getCurrentUserId() // Use session-based user ID
    if (!userId) {
      return { success: false, message: "User not authenticated" }
    }

    // Extract data from FormData
    const name = formData.get("name") as string
    const surname = formData.get("surname") as string
    const phone = formData.get("phone") as string
    const country = formData.get("country") as string
    const email = formData.get("email") as string
    const image = formData.get("image") as File

    // Validate required fields
    if (!name || !surname || !phone || !country || !email) {
      return { success: false, message: "All fields are required" }
    }

    // Check if email is already in use by another user
    const existingUser = await getUserByEmail(email)
    if (existingUser && existingUser.id !== userId) {
      return { success: false, message: "Email is already in use" }
    }

    // Handle image upload (mock implementation)
    let imageUrl = undefined
    if (image && image.size > 0) {
      imageUrl = `/uploads/${Date.now()}-${image.name}`
    }

    // Update user in database
    await db
      .update(users)
      .set({
        name,
        surname,
        phone,
        country,
        email,
        ...(imageUrl && { image: imageUrl }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    // Update last activity date
    await db.update(users).set({ lastActivityDate: new Date() }).where(eq(users.id, userId))

    revalidatePath(`/onboarding/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, message: "Failed to update profile" }
  }
}

// Delete user account
export async function deleteUserAccount() {
  try {
    const userId = await getCurrentUserId() // Use session-based user ID
    if (!userId) {
      return { success: false, message: "User not authenticated" }
    }

    await db
      .update(users)
      .set({
        deletionRequestedAt: new Date(),
        status: "REJECTED",
      })
      .where(eq(users.id, userId))

    // Clear session (if using NextAuth.js)
    await auth().signOut()

    return { success: true }
  } catch (error) {
    console.error("Error deleting user account:", error)
    return { success: false, message: "Failed to delete account" }
  }
}

// Logout user
export async function logoutUser() {
  try {
    // Clear the session (if using NextAuth.js)
    await auth().signOut()
    return { success: true }
  } catch (error) {
    console.error("Error logging out user:", error)
    return { success: false, message: "Failed to logout" }
  }
}

