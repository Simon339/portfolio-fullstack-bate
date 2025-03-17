"use server"

import { db } from "@/server/db"
import { backups, systemSettings } from "@/server/schema"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const execAsync = promisify(exec)

type BackupFrequency = "daily" | "weekly" | "monthly" | "off"

// Function to create a backup of the entire database
export async function createBackup() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return { success: false, message: "Database URL not found in environment variables" };
    }

    const backupDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `backup-${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFileName);

    const url = new URL(dbUrl);
    const hostname = url.hostname;
    const port = url.port || "5432";
    const database = url.pathname.substring(1);
    const username = url.username;

    // Add SSL configuration for Neon
    const pgDumpCmd = `pg_dump "postgres://${username}:${url.password}@${hostname}:${port}/${database}?sslmode=require" -F c -f ${backupPath}`;

    await execAsync(pgDumpCmd, {
      env: {
        ...process.env,
        PGPASSWORD: url.password,
      },
    });

    const stats = fs.statSync(backupPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    const backupId = uuidv4();
    await db.insert(backups).values({
      id: backupId,
      filename: backupFileName,
      path: backupPath,
      size: `${fileSizeInMB}MB`,
      type: "manual",
      createdAt: new Date(),
      status: "completed",
    });

    revalidatePath("/settings/backup");

    return {
      success: true,
      message: "Backup created successfully",
      backupId,
      size: `${fileSizeInMB}MB`,
    };
  } catch (error) {
    console.error("Backup failed:", error);
    return { success: false, message: "Failed to create backup" };
  }
}
// Function to update backup settings
export async function updateBackupSettings(enabled: boolean, frequency: BackupFrequency) {
  try {
    // Get current system settings
    const currentSettings = await db.select().from(systemSettings).limit(1)

    if (currentSettings.length === 0) {
      // Create settings if they don't exist
      await db.insert(systemSettings).values({
        id: uuidv4(),
        siteName: "My Website",
        contactEmail: "admin@example.com",
        timezone: "UTC",
        backupEnabled: enabled,
        backupFrequency: frequency === "off" ? "daily" : frequency,
        updatedAt: new Date(),
      })
    } else {
      // Update existing settings
      await db
        .update(systemSettings)
        .set({
          backupEnabled: enabled,
          backupFrequency: frequency === "off" ? "daily" : frequency,
          updatedAt: new Date(),
        })
        .where(eq(systemSettings.id, currentSettings[0].id))
    }

    // Revalidate the backup page
    revalidatePath("/settings/backup")

    return { success: true, message: "Backup settings updated" }
  } catch (error) {
    console.error("Failed to update backup settings:", error)
    return { success: false, message: "Failed to update backup settings" }
  }
}

// Function to get backup history
export async function getBackupHistory() {
  try {
    // Get all backups ordered by creation date (newest first)
    const backupHistory = await db.select().from(backups).orderBy(backups.createdAt, "desc")

    // Get current backup settings
    const settings = await db.select().from(systemSettings).limit(1)

    return {
      success: true,
      data: backupHistory,
      settings:
        settings.length > 0
          ? {
              enabled: settings[0].backupEnabled,
              frequency: settings[0].backupFrequency,
            }
          : null,
    }
  } catch (error) {
    console.error("Failed to fetch backup history:", error)
    return { success: false, message: "Failed to fetch backup history" }
  }
}

// Function to restore from a backup
export async function restoreFromBackup(backupId: string) {
  try {
    // Get backup details
    const backupDetails = await db.select().from(backups).where(eq(backups.id, backupId)).limit(1)

    if (backupDetails.length === 0) {
      return { success: false, message: "Backup not found" }
    }

    const backup = backupDetails[0]

    // Check if backup file exists
    if (!fs.existsSync(backup.path)) {
      return { success: false, message: "Backup file not found" }
    }

    // Get database connection info from environment variables
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return { success: false, message: "Database URL not found in environment variables" }
    }

    // Extract connection details from DATABASE_URL
    const url = new URL(dbUrl)
    const hostname = url.hostname
    const port = url.port || "5432"
    const database = url.pathname.substring(1)
    const username = url.username

    // Create pg_restore command
    const pgRestoreCmd = `pg_restore -h ${hostname} -p ${port} -U ${username} -d ${database} -c ${backup.path}`

    // Execute pg_restore command
    await execAsync(pgRestoreCmd, {
      env: {
        ...process.env,
        PGPASSWORD: url.password, // Set password as environment variable for pg_restore
      },
    })

    // Revalidate the backup page
    revalidatePath("/settings/backup")

    return { success: true, message: "Database restored successfully" }
  } catch (error) {
    console.error("Restore failed:", error)
    return { success: false, message: "Failed to restore from backup" }
  }
}

