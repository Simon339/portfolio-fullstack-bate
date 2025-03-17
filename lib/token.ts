import { v4 as uuidv4 } from 'uuid';
import { db } from "@/server/db";
import { getPasswordResetTokenByEmail, getReviewInvitationTokenByEmail, getVerificationTokenByEmail } from '@/server/data/token';
import { verificationTokens, passwordResetTokens, tokens } from '@/server/schema';
import { eq } from 'drizzle-orm';

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await db.delete(verificationTokens)
            .where(eq(verificationTokens.id, existingToken.id));
    }

    const verificationToken = await db.insert(verificationTokens)
        .values({
            email,
            token,
            expires
        })
        .returning();

    return verificationToken[0];
}

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 1);

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await db.delete(passwordResetTokens)
            .where(eq(passwordResetTokens.id, existingToken.id));
    }

    const passwordResetToken = await db.insert(passwordResetTokens)
        .values({
            email,
            token,
            expires
        })
        .returning();

    return passwordResetToken[0];
}

export const generateReviewInvitationtoken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

    const existingToken = await getReviewInvitationTokenByEmail(email);

    if (existingToken) {
        await db.delete(tokens)
            .where(eq(tokens.id, existingToken.id));
    }

    const reviewInvitationToken = await db.insert(tokens)
        .values({
            email,
            token,
            expires
        })
        .returning();

    return reviewInvitationToken[0];
}