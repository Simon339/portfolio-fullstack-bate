/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { ServiceSchema } from "@/types";
import * as z from "zod";
import { db } from "../db";
import { sendServiceInquiryConfirmationEmail } from "@/lib/mail";

export async function serviceAction(data: z.infer<typeof ServiceSchema>) {
    try {

        ServiceSchema.parse(data); 

        const newServiceInquiry = await db.serviceInquiry.create({
            data: {
                companyName: data.companyName,
                name: data.name,
                service: data.service,
                email: data.email,
                phoneNumber: data.phoneNumber,
            },
        });

       await sendServiceInquiryConfirmationEmail(data.name, data.companyName, data.service, data.email, data.phoneNumber);

        // Return success response
        return { success: "Your message has been successfully sent!" };

    } catch (error) {
        
        console.error("Error in serviceAction:", error);

        // If it's a Zod validation error, return the specific error messages
        if (error instanceof z.ZodError) {
            return { error: error.errors.map((e) => e.message).join(", ") };
        }

        // If it's another error (like database connection issues), return a generic message
        return { error: "An unexpected error occurred. Please try again later." };
    }
};

