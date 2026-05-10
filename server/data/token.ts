"use server"

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { verification } from "../schema";
import { z } from "zod";

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email))
      .limit(1);
    
    revalidatePath('/tokens');
    return verificationToken[0];
  } catch (error) {
    throw new Error("Failed to fetch verification token");
  }
}

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const verificationToken = await db
      .select()
      .from(verification)
      .where(eq(verification.value, token))
      .limit(1);
    
    revalidatePath('/tokens');
    return verificationToken[0];
  } catch (error) {
    throw new Error("Failed to fetch verification token");
  }
}


export const getReviewInvitationTokenByEmail = async (email: string) => {
  try {
    const reviewInvitationToken = await db
      .select()
      .from(verification)
      .where(eq(verification.identifier, email))
      .limit(1);
    
    revalidatePath('/tokens');
    return reviewInvitationToken[0];
  } catch {
    throw new Error("Failed to fetch review invitation token");
  }
}
