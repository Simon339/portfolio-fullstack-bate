import NextAuth from "next-auth";
import bcrypt from 'bcryptjs';
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/types/vaildations/login";
import { getUserByEmail } from "./data/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);
          if (!user) return null;
          if (!user.password) return null;
          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth",
    signOut: "/signout",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.surname = user.surname;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.surname = token.surname as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
});