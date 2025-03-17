/* eslint-disable @typescript-eslint/no-unused-vars */

'use server';

import { ContactFormSchema } from "@/lib/vaildationschema";
import { db } from "../db";
import * as z from "zod";
import { sendContactConfirmationEmail } from "@/lib/mail";
import { auditLogs, contactForms } from "../schema";
import { headers } from 'next/headers'; // Import headers to access request details

export async function ContactFormAction(data: z.infer<typeof ContactFormSchema>) {
  try {
    // Step 1: Validate input data
    ContactFormSchema.parse(data);

    // Step 2: Dynamically collect IP address and user agent
    const headersList =  await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Step 3: Create a new contact form entry using Drizzle ORM
    const newContact = await db.insert(contactForms).values({
      name: data.name,
      topic: data.topic,
      email: data.email,
      message: data.message,
    }).returning();

    // Step 4: Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'contact_forms',
      recordId: newContact[0].id,
      userId: null, // No user ID since the form can be submitted by anyone
      details: JSON.stringify({
        action: 'Contact form submitted',
        data: newContact[0],
      }),
      ipAddress: ipAddress, // Use dynamically collected IP address
      userAgent: userAgent, // Use dynamically collected user agent
    });

    // Step 5: Send confirmation email
    await sendContactConfirmationEmail(data.name, data.email, data.topic, data.message);

    return { success: "Your message has been successfully sent!" };
  } catch (error) {
    console.error("Error occurred during form submission:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }
    return { error: "An unexpected error occurred. Please try again later." };
  }
}