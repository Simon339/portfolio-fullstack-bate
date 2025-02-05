/* eslint-disable @typescript-eslint/no-unused-vars */
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export const logoutAccount = async () => {
    try {
        await signOut({ callbackUrl: '/' });

        toast.success('Successfully logged out!');
        return true;
    } catch (error) {
        toast.error('Logout failed, please try again.');
        return false;
    }
};