'use server'

import { SettingsSchema } from "@/types";
import * as z from "zod";
import { getUserById } from "@/server/data/user";
import { db } from "@/server/db";
import { currentUser } from "@/lib/auth";


export const Settings = async (
    values: z.infer<typeof SettingsSchema>
) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized!" }
    }

    const dbUser = await getUserById(user.id)

    if (!dbUser) {
        return { error: "Unauthorized!" }
    }

    await db.user.update({
        where: {
            id: dbUser.id,
        },
        data: {
            ...values,
        }
    });

    return { success: "Settings Updated" }
}