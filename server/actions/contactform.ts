
'use server';

import { ContactFormSchema } from "@/lib/vaildationschema";
import { db } from "../db";
import * as z from "zod";
import { sendContactConfirmationEmail } from "@/lib/mail";

export async function ContactFormAction(data: z.infer<typeof ContactFormSchema>) {
  try {
    ContactFormSchema.parse(data);

    const newContact = await db.contactForm.create({
      data: {
        name: data.name,
        topic: data.topic,
        email: data.email,
        message: data.message,
      },
    });

    await sendContactConfirmationEmail(data.name, data.email, data.topic, data.message);

    return { success: "Your message has been successfully sent!" };
  } catch (error) {
    console.error("Error occurred during form submission:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => e.message).join(", ") };
    }
    return { error: "An unexpected error occurred. Please try again later." };
  }
}