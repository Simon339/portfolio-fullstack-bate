import { v4 as uuidv4 } from 'uuid';
import { db } from "@/server/db";
import { getReviewInvitationTokenByEmail, getVerificationTokenByEmail } from '@/server/data/token';
import { verification } from '@/server/schemasql';
import { eq } from 'drizzle-orm';

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await db.delete(verification)
            .where(eq(verification.id, existingToken.id));
    }

    // Generate a proper ID for the verification record
    const verificationId = uuidv4();
    const now = new Date();

    // Insert the token
    await db.insert(verification)
        .values({
            id: verificationId,
            identifier: email,
            value: token,
            expiresAt: expires,
            createdAt: now,
            updatedAt: now,
        });

    // Return the token data explicitly with all required properties
    return {
        id: verificationId,
        identifier: email,
        value: token,
        expiresAt: expires,
        createdAt: now,
        updatedAt: now,
    };
}

export const generateReviewInvitationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

    const existingToken = await getReviewInvitationTokenByEmail(email);

    if (existingToken) {
        await db.delete(verification)
            .where(eq(verification.id, existingToken.id));
    }

    // Generate a proper ID for the verification record
    const verificationId = uuidv4();
    const now = new Date();

    // Insert the token
    await db.insert(verification)
        .values({
            id: verificationId,
            identifier: email,
            value: token,
            expiresAt: expires,
            createdAt: now,
            updatedAt: now,
        });

    // Return the token data explicitly with all required properties
    return {
        id: verificationId,
        identifier: email,
        value: token,
        expiresAt: expires,
        createdAt: now,
        updatedAt: now,
    };
}