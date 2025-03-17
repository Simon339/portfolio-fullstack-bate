/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { ServiceSchema } from "@/types"
import * as z from "zod"
import { db } from "../db"
import { sendServiceInquiryConfirmationEmail } from "@/lib/mail"
import { auditLogs, serviceInquiries } from "../schema"
import { headers } from "next/headers"

export async function serviceAction(data: z.infer<typeof ServiceSchema>) {
  try {
    // Validate input data
    ServiceSchema.parse(data)
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Create a new service inquiry using Drizzle ORM
    const newServiceInquiry = await db
      .insert(serviceInquiries)
      .values({
        companyName: data.companyName,
        name: data.name,
        service: data.service,
        email: data.email,
        phoneNumber: data.phoneNumber,
      })
      .returning()

    await db.insert(auditLogs).values({
      action: "CREATE",
      tableName: "service_inquiries",
      recordId: newServiceInquiry[0].id,
      details: JSON.stringify({
        action: "Service inquiry submitted",
        data: {
          name: data.name,
          email: data.email,
          service: data.service,
          companyName: data.companyName,
        },
      }),
      ipAddress: ipAddress, // Use dynamically collected IP address
      userAgent: userAgent,
    })

    // Send confirmation email
    await sendServiceInquiryConfirmationEmail(data.name, data.companyName, data.service, data.email, data.phoneNumber)

    // Return success response
    return { success: "Your message has been successfully sent!" }
  } catch (error) {
    console.error("Error in serviceAction:", error)

    // If it's a Zod validation error, return the specific error messages
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((e) => e.message).join(", ") }
    }

    // If it's another error (like database connection issues), return a generic message
    return { error: "An unexpected error occurred. Please try again later." }
  }
}

