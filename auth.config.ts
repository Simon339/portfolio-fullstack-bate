
import bcrypt from 'bcryptjs'
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { LoginSchema } from "@/types/vaildations/login"
import { getUserByEmail } from './server/data/user'


 
export default { 
    providers: [
        Credentials({
            async authorize(credentials) {
                const vaildatedFields = LoginSchema.safeParse(credentials);


                if (vaildatedFields.success) {
                    const {email, password} = vaildatedFields.data;
                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user
                }
                return null;
            }
        })
    ],

} satisfies NextAuthConfig