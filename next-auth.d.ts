/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth, { type DefaultSession } from "next-auth"

export type Country = {
  code: string;
  dialCode: string;
  flag: string;
}

export type ExtendedUser = DefaultSession['user'] & {
  role: "ADMIN" | "USER";
}

export const countries: Country[] = [
  { code: "US", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
]

export type SURNAME = {
  surname: string;
}

export type ApprovalStatus = {
  approvalStatus?: 'approved' | 'rejected' | 'pending';
}

export type CellPhone = {
  phone: string;
  country: Country;
}

export type ExtendedUserWithSAID = ExtendedUser & SURNAME  & CellPhone & ApprovalStatus;

declare module "next-auth" {
  interface Session {
    user: ExtendedUserWithSAID;
  }
}
