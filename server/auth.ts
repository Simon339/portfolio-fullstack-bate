import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config"
import { db } from "./db"
import { getUserById } from "./data/user"
import { UserRole } from "@prisma/client"



export const  {
  handlers: { GET, POST }, signIn, signOut, auth
} = NextAuth({
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }

      const existingUser = await getUserById(user.id ?? "");

      if (!existingUser?.emailVerified) {
        return false;
      }

      return true
    },
    async session({ token, session }) {
      // console.log("token in session", token);
      // console.log("session in session", session);
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.surname && session.user) {
        session.user.surname = token.surname as string;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.cellphone && session.user) {
        session.user.phone = token.phone as string;
      }

      return session;
    },
    async jwt({ token }) {

      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.surname = existingUser.surname;
      token.phone = existingUser.phone;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,  // Session expiration (in seconds)
    updateAge: 60,  // Session cookie update frequency 
  },
  ...authConfig,
})