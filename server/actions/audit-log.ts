
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { Parser } from "json2csv"
import { auditLogs, users } from "../schema"
import { db } from "../db"
import { desc, eq, like, sql, and, isNull, isNotNull, gte, lt } from "drizzle-orm"

// Remove jsPDF import from server code
// import { jsPDF } from "jspdf"

export async function fetchLogs(page = 1, userFilter = "", actionFilter = "all", logsPerPage = 10) {
  // Build query with filters
  let query = db.select().from(auditLogs)

  // Apply filters
  if (userFilter) {
    query = query.where(like(auditLogs.userId, `%${userFilter}%`))
  }

  if (actionFilter !== "all") {
    query = query.where(eq(auditLogs.action, actionFilter))
  }

  // Count total logs for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(
      userFilter ? like(auditLogs.userId, `%${userFilter}%`) : undefined,
      actionFilter !== "all" ? eq(auditLogs.action, actionFilter) : undefined,
    )

  const totalLogs = countResult[0].count
  const totalPages = Math.ceil(totalLogs / logsPerPage)

  // Apply pagination
  const offset = (page - 1) * logsPerPage
  query = query.limit(logsPerPage).offset(offset)

  // Fetch logs that match the filters
  const logs = await query.orderBy(desc(auditLogs.timestamp))

  // Transform logs to match the expected format
  const formattedLogs = logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    userId: log.userId || "N/A",
    action: log.action,
    details: log.details ? JSON.stringify(log.details) : "N/A",
    tableName: log.tableName,
    recordId: log.recordId,
    ipAddress: log.ipAddress || "N/A",
    userAgent: log.userAgent || "N/A",
  }))

  return {
    logs: formattedLogs,
    totalPages,
    currentPage: page,
  }
}

export async function exportLogs(format: "json" | "csv", userFilter = "", actionFilter = "all") {
  // Build query with filters
  let query = db.select().from(auditLogs)

  // Apply filters
  if (userFilter) {
    query = query.where(like(auditLogs.userId, `%${userFilter}%`))
  }

  if (actionFilter !== "all") {
    query = query.where(eq(auditLogs.action, actionFilter))
  }

  // Fetch all logs that match the filters
  const logs = await query.orderBy(desc(auditLogs.timestamp))

  // Transform logs to match the expected format
  const formattedLogs = logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    userId: log.userId || "N/A",
    action: log.action,
    details: log.details ? JSON.stringify(log.details) : "N/A",
    tableName: log.tableName,
    recordId: log.recordId,
    ipAddress: log.ipAddress || "N/A",
    userAgent: log.userAgent || "N/A",
  }))

  // Export based on format
  switch (format) {
    case "json":
      return new Blob([JSON.stringify(formattedLogs, null, 2)], {
        type: "application/json",
      })

    case "csv":
      const parser = new Parser({
        fields: ["id", "timestamp", "userId", "action", "tableName", "recordId", "details", "ipAddress", "userAgent"],
      })
      const csv = parser.parse(formattedLogs)
      return new Blob([csv], { type: "text/csv" })

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

export async function getTrafficStats() {
  // Fetch total visits (count of all audit logs)
  const totalVisitsResult = await db.select({ count: sql<number>`count(*)` }).from(auditLogs)

  const totalVisits = totalVisitsResult[0].count

  // Fetch visits from the previous period (e.g., last month) for percent change calculation
  const previousPeriodVisitsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(sql`${auditLogs.timestamp} < NOW() - INTERVAL '1 month'`)

  const previousPeriodVisits = previousPeriodVisitsResult[0].count

  // Calculate percent change
  const percentChange =
    previousPeriodVisits > 0 ? ((totalVisits - previousPeriodVisits) / previousPeriodVisits) * 100 : 0

  const isPositive = percentChange >= 0

  // Fetch breakdown of visits
  const directVisitsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(isNotNull(auditLogs.userId)) // Direct visits have a userId

  const directVisits = directVisitsResult[0].count

  const socialVisitsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(isNull(auditLogs.userId)) // Social visits have no userId

  const socialVisits = socialVisitsResult[0].count

  const actionVisitsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(isNotNull(auditLogs.action)) // Action visits have an action

  const actionVisits = actionVisitsResult[0].count

  // Calculate percentages for breakdown
  const breakdown = [
    {
      label: "Direct",
      value: totalVisits > 0 ? Math.round((directVisits / totalVisits) * 100) : 0,
    },
    {
      label: "Action",
      value: totalVisits > 0 ? Math.round((actionVisits / totalVisits) * 100) : 0,
    },
    {
      label: "Social",
      value: totalVisits > 0 ? Math.round((socialVisits / totalVisits) * 100) : 0,
    },
  ]

  return {
    totalVisits,
    percentChange,
    isPositive,
    breakdown,
  }
}

export async function getYearlyAuditLogAnalytics() {
  const currentYear = new Date().getFullYear()
  const lastYear = currentYear - 1

  // Get the start and end of the current year
  const currentYearStart = new Date(currentYear, 0, 1)
  const currentYearEnd = new Date(currentYear, 11, 31)

  // Get the start and end of the last year
  const lastYearStart = new Date(lastYear, 0, 1)
  const lastYearEnd = new Date(lastYear, 11, 31)

  // Fetch current year audit logs
  const currentYearLogsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(and(gte(auditLogs.timestamp, currentYearStart), lt(auditLogs.timestamp, currentYearEnd)))

  const currentYearLogs = currentYearLogsResult[0].count

  // Fetch last year audit logs
  const lastYearLogsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditLogs)
    .where(and(gte(auditLogs.timestamp, lastYearStart), lt(auditLogs.timestamp, lastYearEnd)))

  const lastYearLogs = lastYearLogsResult[0].count

  // Calculate percentage change
  const percentageChange =
    lastYearLogs > 0 ? ((currentYearLogs - lastYearLogs) / lastYearLogs) * 100 : currentYearLogs > 0 ? 100 : 0 // Handle division by zero

  const isPositiveChange = percentageChange >= 0

  return {
    success: true,
    currentYearLogs,
    lastYearLogs,
    percentageChange,
    isPositiveChange,
  }
}

export async function getUserActivities() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const activities = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      tableName: auditLogs.tableName,
      recordId: auditLogs.recordId,
      userId: auditLogs.userId,
      timestamp: auditLogs.timestamp,
      userName: users.name,
      userSurname: users.surname,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(gte(auditLogs.timestamp, thirtyDaysAgo))
    .orderBy(desc(auditLogs.timestamp))

  return activities.map((activity) => ({
    id: activity.id,
    user: activity.userName && activity.userSurname ? `${activity.userName} ${activity.userSurname}` : "Unknown User",
    action: activity.action,
    time: activity.timestamp,
    iconType: getActionIconType(activity.action),
  }))
}

// Helper function to map actions to icon types (as strings)
function getActionIconType(action: string) {
  switch (action) {
    case "CREATE":
      return "plus"
    case "DELETE":
      return "trash"
    case "UPDATE":
      return "edit"
    default:
      return "alert"
  }
}

// Helper function for export
async function fetchLogsForExport(userFilter = "", actionFilter = "all") {
  const result = await fetchLogs(1, userFilter, actionFilter, 1000) // Get more logs for export
  return result.logs
}

