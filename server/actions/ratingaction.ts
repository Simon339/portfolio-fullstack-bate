"use server";

import { RatingSchema } from "@/types";
import { db } from "../db";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";
import { generateReviewInvitationToken } from "@/lib/token";
import { sendReviewInvitationToken } from "@/lib/mail";
import { auditLogs, ratings, verification } from "../schema";
import { eq, and, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "../auth";

export async function RatingAction(data: z.infer<typeof RatingSchema>) {
  try {
    RatingSchema.parse(data);

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";
    const newRating = await db.insert(ratings).values({
      id: uuidv4(),
      rating: data.rating,
      feedback: data.feedback || null,
      name: data.name || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Extract the ID from the insert result
    const ratingId = newRating[0].insertId || newRating[0].id;

    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "ratings",
      timestamp: new Date(),
      recordId: ratingId,
      userId: null,
      details: JSON.stringify({ action: "Rating submitted" }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    return { success: "Your rating has been submitted successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function FetchRatings() {
  try {
    const allRatings = await db.select().from(ratings);
    return { success: true, data: allRatings };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getReviewSchema() {
  return z.object({
    name: z.string().min(1, "Company name is required"),
    rating: z.number().min(1).max(5),
    review: z.string().min(10, "Review must be at least 10 characters long"),
  });
}

export async function submitReview(formData: FormData) {
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return { success: false, error: "Invalid token" };
  }

  const headersList = await headers();
  const ipAddress = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  try {
    const validToken = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.value, token),
          gt(verification.expiresAt, new Date()),
        ),
      )
      .then((result) => result[0]);

    if (!validToken || validToken.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired token" };
    }

    const rating = parseInt(formData.get("rating") as string, 10);
    const feedback = formData.get("feedback") as string;
    const name = formData.get("name") as string;

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { success: false, error: "Invalid rating" };
    }

    // Generate IDs for both rating and audit log
    const ratingId = uuidv4();
    const auditLogId = uuidv4(); // Generate ID for audit log too
    const now = new Date();

    // Insert the review
    await db.insert(ratings).values({
      id: ratingId,
      rating,
      feedback: feedback || null,
      name: name || null,
      createdAt: now,
      updatedAt: now,
    });

    // Delete the used token
    await db.delete(verification).where(eq(verification.id, validToken.id));

    // Log the action in audit_logs with its own ID
    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "ratings",
      recordId: ratingId,
      timestamp: new Date(),
      userId: null,
      details: JSON.stringify({ action: "Review submitted", rating, name }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Return success response
    return {
      success: true,
      data: {
        id: ratingId,
        name: name || null,
        rating,
        feedback: feedback || null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to submit review" };
  }
}

export async function getAddSchema() {
  return z.object({
    email: z.string().email({ message: "Invalid email address." }),
  });
}

export async function sendReviewInvitation( data: z.infer<Awaited<ReturnType<typeof getAddSchema>>>) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return { error: "User not authenticated" };
    }

    // Check if user has permission to issue invitations
    const permissionCheck = await auth.api.userHasPermission({
      body: {
        userId: userId,
        permissions: {
          project: ["create"],
        },
      },
    });

    // Check permission first before proceeding with other operations
    if (!permissionCheck.success) {
      return { error: "You don't have permission to send review invitations" };
    }

    // Validate the input data
    const addSchema = await getAddSchema();
    const validatedFields = addSchema.safeParse(data);
    
    if (!validatedFields.success) {
      return { error: "Invalid email!" };
    }
    
    const { email } = validatedFields.data;

    // Generate review invitation token
    const reviewInvitationToken = await generateReviewInvitationToken(email);

    // Send the invitation email
    await sendReviewInvitationToken(
      reviewInvitationToken.identifier,
      reviewInvitationToken.value
    );

    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "invitations",
      recordId: reviewInvitationToken.value,
      timestamp: new Date(),
      userId: userId,
      details: JSON.stringify({ action: "Review invitation sent", email }),
      ipAddress: session?.session?.ipAddress || "unknown",
      userAgent: session?.session?.userAgent || "unknown",
    });
    
    return { success: true };
    
  } catch (error) {
    return { error: "Failed to send review invitation" };
  }
}