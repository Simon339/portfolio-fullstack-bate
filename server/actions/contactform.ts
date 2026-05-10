'use server';

import { ContactFormSchema } from "@/lib/vaildationschema";
import { db } from "../db";
import * as z from "zod";
import { sendContactConfirmationEmail } from "@/lib/mail";
import { auditLogs, contactForms } from "../schema";
import { headers } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function ContactFormAction(data: z.infer<typeof ContactFormSchema>) {
  try {
    // Step 1: Validate input data
    ContactFormSchema.parse(data);

    // Step 2: Dynamically collect IP address and user agent
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Step 3: Create a new contact form entry using Drizzle ORM
    const newContact = await db.insert(contactForms).values({
      id: uuidv4(),
      name: data.name,
      topic: data.topic,
      email: data.email,
      message: data.message,
      createdAt: new Date(),
      isRead: false
    })

    // Extract the ID from the insert result
    const contactFormId = newContact[0].insertId || newContact[0].id;

    // Step 4: Log the action in audit_logs
    await db.insert(auditLogs).values({
      action: 'CREATE',
      tableName: 'contact_forms',
      recordId:  newContact[0].id,
      userId: null,
      details: JSON.stringify({
        action: 'Contact form submitted',
        data: {
          id:  newContact[0].id,
          name: data.name,
          topic: data.topic,
          email: data.email,
        },
      }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    // Step 5: Send confirmation email
    await sendContactConfirmationEmail(data.name, data.email, data.topic, data.message);

    return { success: "Your message has been successfully sent!" };
  } catch (error) {

    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") };
    }
    
    // More detailed error handling
    if (error instanceof Error && 'code' in error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return { error: "A database error occurred. Please try again." };
      }
    }
    
    return { error: "An unexpected error occurred. Please try again later." };
  }
}