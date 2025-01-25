"use server"
import { revalidatePath } from "next/cache";
import { db } from "../db";


export const  getReviewInvitationTokenByEmail = async (email: string) => {
  try {
      const reviewInvitationToken = await db.token.findFirst({
          where: {email}
      });
      revalidatePath('/tokens')
      return reviewInvitationToken
  } catch {
      return null
  }
}