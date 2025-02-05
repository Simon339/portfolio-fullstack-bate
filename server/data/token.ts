"use server"

import { revalidatePath } from "next/cache";
import { db } from "../db";

export const getVerificationTokenByEmail = async (email: string) => {
    try {
      const verificationToken = await db.verificationToken.findFirst({
        where: {
          email: email
        }
      })
      revalidatePath('/tokens')
      return verificationToken;
    } catch (error) {
      console.log(error);
    }
  
  }
  
  export const getVerificationTokenByToken = async (token: string) => {
    try {
      const verificationToken = await db.verificationToken.findFirst({
        where: {
          token: token
        }
      })
      revalidatePath('/tokens')
      return verificationToken;
    } catch (error) {
      console.log(error);
    }
  
  }

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token)

    if(!existingToken) {
        return { error: "Invalid token" }
    }

    const hasExpired = new Date(existingToken.expires) < new Date()

    if(hasExpired) {
        return { error: "Token has expired" }
    }

    const existingUser = await getUserByEmail(existingToken.email)


    if(!existingUser) {
        return { error: "User not found" }
    }   

    await db.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email
        }
    })

    await db.verificationToken.delete({
        where: {
            id: existingToken.id
        }
    })

    return { success: "Email verified" }
}

export const  getPasswordResetTokenByToken = async (token: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findUnique({
            where: {token}
        });
        revalidatePath('/tokens')
        return passwordResetToken
    } catch {
        return null
    }
}

export const  getPasswordResetTokenByEmail = async (email: string) => {
    try {
        const passwordResetToken = await db.passwordResetToken.findFirst({
            where: {email}
        });
        revalidatePath('/tokens')
        return passwordResetToken
    } catch {
        return null
    }
}

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