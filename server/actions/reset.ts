"use server"

import bcrypt from 'bcryptjs'
import * as z from "zod"
import { ResetpasswordSchema, ResetSchema } from "@/types/vaildations/resetP"
import { getUserByEmail } from "@/server/data/user"
import { generatePasswordResetToken } from "@/lib/token"
import { sendPasswordResetEmail } from "@/lib/mail"
import { db } from '@/server/db';
import { getPasswordResetTokenByToken } from '@/server/data/token'


export const ResetPasswordAction = async (values: z.infer<typeof ResetSchema>) => {
    const validatedFields = ResetSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid email!" };
    }
    const { email } = validatedFields.data;
    const userExists = await getUserByEmail(email);

    if (!userExists || !userExists.email) {
        return { error: "User does not exist" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token,
    )


    return { success: "Reset email sent!" }
}


export const NewPasswordAction = async (values: z.infer<typeof ResetpasswordSchema>, token?: string | null) => {
    if (!token) {
        return {error: "Missing Token!"}
    }
    const validatedFields = ResetpasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Invalid Field!" };
    }
    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "User does not exist" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) {
        return { error: "Token has expired!" }
    }
    const userExists = await getUserByEmail(existingToken.email);
    if (!userExists) {
        return { error: "Email does not exist" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: { id: userExists.id},
        data: { password: hashedPassword }
    });

    await db.passwordResetToken.delete({
        where: { id: existingToken.id }
    })

    return { success: "Password was updated!" }
}