/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession['user'] & {
  role: "ADMIN" | "USER" | "SUPER_USER"
}

export type SAID = {
  surname: string;
}

export type ApprovalStatus = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  approval: "PENDING" | "APPROVED" | "REJECTED";
}

export type CellPhone = {
  phone: string;
}

export type ExtendedUserWithSAID = ExtendedUser & SAID & CellPhone & ApprovalStatus


declare module "next-auth" {
  interface Session {
    user: ExtendedUserWithSAID; 
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    status: string
    emailVerified: Date | null
  }
}