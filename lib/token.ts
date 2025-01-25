import { v4 as uuidv4 } from 'uuid';
import { db } from "@/server/db";
import { getReviewInvitationTokenByEmail } from '@/server/data/token';


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