/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession['user'] & {
  role: "ADMIN" | "USER" 
}

export type SAID = {
  surname: string;
}

export type CellPhone = {
  phone: string;
}

export type ExtendedUserWithSAID = ExtendedUser & SAID & CellPhone


declare module "next-auth" {
  interface Session {
    user: ExtendedUserWithSAID; 
  }
}
