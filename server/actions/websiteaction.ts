"use server"

import { eq } from "drizzle-orm"
import { db } from "../db"
import { systemSettings } from "../schema"


export async function saveSettings(formData: FormData) {
    const siteName = formData.get("siteName") as string
    const siteDescription = formData.get("siteDescription") as string
    const contactEmail = formData.get("contactEmail") as string
    const timezone = formData.get("timezone") as string
    const maintenanceMode = formData.get("maintenanceMode") === "true"
    const backupFrequency = formData.get("backupFrequency") as "daily" | "weekly" | "monthly"
    const fontFamily = formData.get("fontFamily") as string
    const logo = formData.get("logo") as File | null
  
    try {
      const [existingSettings] = await db.select().from(systemSettings).limit(1)
  
      if (existingSettings) {
        await db
          .update(systemSettings)
          .set({
            siteName,
            siteDescription,
            contactEmail,
            timezone,
            maintenanceMode,
            backupFrequency,
            fontFamily,
            updatedAt: new Date(),
          })
          .where(eq(systemSettings.id, existingSettings.id))
      } else {
        await db.insert(systemSettings).values({
          siteName,
          siteDescription,
          contactEmail,
          timezone,
          maintenanceMode,
          backupFrequency,
          fontFamily,
        })
      }
  
      if (logo) {
        console.log("Logo upload not implemented")
      }
  
      return { success: true }
    } catch (error) {
      console.error("Error saving settings:", error)
      throw new Error("Failed to save settings")
    }
}

