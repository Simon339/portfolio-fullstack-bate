import { v4 as uuidv4 } from 'uuid';
import { db } from "@/server/db";
import { getPasswordResetTokenByEmail, getReviewInvitationTokenByEmail, getVerificationTokenByEmail } from '@/server/data/token';


export const generateVerificationToken = async (email: string) => {
    
    const token = uuidv4();
    const expires = new Date().getTime() + 1000 * 60 * 60 * 24; // 1 hours

    const existingToken = await getVerificationTokenByEmail(email)

    if(existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id
            }
        })
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            token,
            expires: new Date(expires)
        }
    })

    return verificationToken;
}


export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date().getTime() + 1000 * 60 * 60 * 1;

    const existingToken = await getPasswordResetTokenByEmail(email);

    if(existingToken) {
        await db.passwordResetToken.delete({
            where: {
                id: existingToken.id
            }
        })
    };

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email,
            token,
            expires: new Date(expires)
        }
    });

    return passwordResetToken;

}


export const generateReviewInvitationtoken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date().getTime() + 1000 * 60 * 60 * 24; //24hrs

    const existingToken = await getReviewInvitationTokenByEmail(email);

    if(existingToken) {
        await db.token.delete({
            where: {
                id: existingToken.id
            }
        })
    };

    const reviewInvitationToken = await db.token.create({
        data: {
            email,
            token,
            expires: new Date(expires)
        }
    });

    return reviewInvitationToken;

}