'use server';

import { RatingSchema } from "@/types";
import { db } from "../db";
import * as z from "zod";
import { generateReviewInvitationtoken } from "@/lib/token";
import { sendReviewInvitationToken } from "@/lib/mail";
import { auditLogs, ratings, tokens } from "../schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function RatingAction(data: z.infer<typeof RatingSchema>) {
  try {
    
    RatingSchema.parse(data);

    
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    console.log("Inserting rating into database..."); // Debugging line
    const newRating = await db.insert(ratings).values({
      rating: data.rating,
      feedback: data.feedback || null,
    }).returning();


    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'ratings',
      recordId: newRating[0].id,
      userId: null, // Set userId to null if not available
      details: JSON.stringify({ action: 'Rating submitted', data: newRating[0] }),
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
    console.error("Failed to fetch ratings:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
  }
}

export async function getReviewSchema() {
  return z.object({
    name: z.string().min(1, 'Company name is required'),
    rating: z.number().min(1).max(5),
    review: z.string().min(10, 'Review must be at least 10 characters long'),
  });
}

export async function submitReview(formData: FormData) {
  const token = formData.get("token");

  if (!token || typeof token !== "string") {
    return { success: false, error: "Invalid token" };
  }

  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  try {
    const validToken = await db.select().from(tokens).where(
      and(
        eq(tokens.token, token),
        gt(tokens.expires, new Date()) // Check if the token's expiration time is greater than the current time
      )
    ).then((result) => result[0]);

    if (!validToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    const rating = parseInt(formData.get("rating") as string, 10);
    const feedback = formData.get("feedback") as string;
    const name = formData.get("name") as string;

    if (isNaN(rating) || rating < 1 || rating > 5) {
      return { success: false, error: "Invalid rating" };
    }

    const review = await db.insert(ratings).values({
      rating,
      feedback: feedback || null,
      name: name || null,
    }).returning();

    await db.delete(tokens).where(eq(tokens.id, validToken.id));

    // Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'ratings',
      recordId: review[0].id,
      userId:'unknown', // Replace with actual user ID if available
      details: JSON.stringify({ action: 'Review submitted', data: review[0] }),
      ipAddress: ipAddress, // Use dynamically collected IP address
      userAgent: userAgent,
    });

    return { success: true, data: review[0] };
  } catch (error) {
    console.error("Failed to submit review:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function getAddSchema() {
  return z.object({
    email: z.string().email({ message: "Invalid email address." }),
  });
}

export async function sendReviewInvitation(data: z.infer<Awaited<ReturnType<typeof getAddSchema>>>) {
  const AddSchema = await getAddSchema();
  const validatedFields = AddSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Invalid email!" };
  }
  const { email } = validatedFields.data;

  const reviewInvitationToken = await generateReviewInvitationtoken(email);
  await sendReviewInvitationToken(
    reviewInvitationToken.email,
    reviewInvitationToken.token
  );

  return { success: "Invitation email sent!" };
}
