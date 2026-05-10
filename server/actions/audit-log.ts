/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { Parser } from "json2csv"
import { auditLogs, user } from "../schema"
import { db } from "../db"
import { desc, eq, like, sql, and, isNull, isNotNull, gte, lt } from "drizzle-orm"

// Add proper error handling to all functions
export async function fetchLogs(page = 1, userFilter = "", actionFilter = "all", logsPerPage = 10) {
  try {
    // Build conditions array
    const conditions = []
    
    if (userFilter) {
      conditions.push(like(auditLogs.userId, `%${userFilter}%`))
    }
    
    if (actionFilter !== "all") {
      conditions.push(eq(auditLogs.action, actionFilter.toUpperCase()))
    }

    // Count total logs
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(auditLogs)
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions))
    }
    
    const countResult = await countQuery
    const totalLogs = Number(countResult[0]?.count) || 0
    const totalPages = Math.max(1, Math.ceil(totalLogs / logsPerPage))

    // Calculate offset
    const offset = (page - 1) * logsPerPage

    // Fetch logs with pagination
    let logsQuery = db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp))
    
    if (conditions.length > 0) {
      logsQuery = logsQuery.where(...conditions)
    }
    
    logsQuery = logsQuery.limit(logsPerPage).offset(offset)
    const logs = await logsQuery

    // Helper function to safely convert to ISO string
    const safeToISOString = (dateValue: any): string => {
      try {
        if (!dateValue) {
          return new Date().toISOString()
        }
        
        // If it's already a Date object
        if (dateValue instanceof Date) {
          return dateValue.toISOString()
        }
        
        // If it's a string, try to parse it
        if (typeof dateValue === 'string') {
          const parsedDate = new Date(dateValue)
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString()
          }
        }
        
        // If it's a number (timestamp)
        if (typeof dateValue === 'number') {
          const dateFromTimestamp = new Date(dateValue)
          if (!isNaN(dateFromTimestamp.getTime())) {
            return dateFromTimestamp.toISOString()
          }
        }
        
        // Fallback to current date
        return new Date().toISOString()
      } catch {
        return new Date().toISOString()
      }
    }

    // Transform logs
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: safeToISOString(log.timestamp),
      userId: log.userId || null,
      action: log.action?.toLowerCase() || "",
      details: log.details ? 
        (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : 
        null,
      tableName: log.tableName || null,
      recordId: log.recordId || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
    }))

    return {
      success: true,
      logs: formattedLogs,
      totalPages,
      currentPage: page,
      totalLogs,
    }
  } catch (error) {
    return { 
      success: false, 
      logs: [], 
      totalPages: 1, 
      currentPage: page,
      totalLogs: 0,
      error: "Failed to fetch logs" 
    }
  }
}

export async function exportLogs(format: "json" | "csv", userFilter = "", actionFilter = "all") {
  try {
    // Build conditions array
    const conditions = []
    
    if (userFilter) {
      conditions.push(like(auditLogs.userId, `%${userFilter}%`))
    }

    if (actionFilter !== "all") {
      conditions.push(eq(auditLogs.action, actionFilter))
    }

    // Build query with filters
    let query = db.select().from(auditLogs)
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    // Fetch all logs that match the filters
    const logs = await query.orderBy(desc(auditLogs.timestamp))

    // Transform logs to match the expected format
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      userId: log.userId || "N/A",
      action: log.action || "N/A",
      details: log.details ? JSON.stringify(log.details) : "N/A",
      tableName: log.tableName || "N/A",
      recordId: log.recordId || "N/A",
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
  } catch (error) {
    throw new Error("Failed to export logs")
  }
}

// NEW: Get a single log entry by ID
export async function getLogEntry(id: string) {
  try {
    const result = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id))
      .limit(1)

    if (!result || result.length === 0) {
      throw new Error(`Log entry with id ${id} not found`)
    }

    const log = result[0]

    // Helper function to safely convert to ISO string
    const safeToISOString = (dateValue: any): string => {
      try {
        if (!dateValue) return new Date().toISOString()
        if (dateValue instanceof Date) return dateValue.toISOString()
        if (typeof dateValue === 'string') {
          const parsedDate = new Date(dateValue)
          if (!isNaN(parsedDate.getTime())) return parsedDate.toISOString()
        }
        if (typeof dateValue === 'number') {
          const dateFromTimestamp = new Date(dateValue)
          if (!isNaN(dateFromTimestamp.getTime())) return dateFromTimestamp.toISOString()
        }
        return new Date().toISOString()
      } catch {
        return new Date().toISOString()
      }
    }

    // Return formatted log entry
    return {
      id: log.id,
      timestamp: safeToISOString(log.timestamp),
      userId: log.userId || null,
      action: log.action?.toLowerCase() || "",
      details: log.details ? 
        (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : 
        null,
      tableName: log.tableName || null,
      recordId: log.recordId || null,
      ipAddress: log.ipAddress || null,
      userAgent: log.userAgent || null,
    }
  } catch (error) {
    throw new Error(`Failed to fetch log entry: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getTrafficStats() {
  try {
    // Fetch total visits (count of all audit logs)
    const totalVisitsResult = await db.select({ count: sql<number>`count(*)` }).from(auditLogs)

    const totalVisits = totalVisitsResult[0]?.count || 0

    // Calculate previous period (last month) for comparison
    const now = new Date()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Get current month start
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch visits from previous month
    const previousPeriodVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(and(gte(auditLogs.timestamp, lastMonthStart), lt(auditLogs.timestamp, lastMonthEnd)))

    const previousPeriodVisits = previousPeriodVisitsResult[0]?.count || 0

    // Calculate percent change
    let percentChange = 0
    if (previousPeriodVisits > 0) {
      percentChange = ((totalVisits - previousPeriodVisits) / previousPeriodVisits) * 100
    } else if (totalVisits > 0) {
      percentChange = 100 // If no previous visits but current has visits
    }

    const isPositive = percentChange >= 0

    // Fetch breakdown of visits with better categorization
    const directVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(isNotNull(auditLogs.userId))

    const directVisits = directVisitsResult[0]?.count || 0

    // Action visits - logs with specific actions
    const actionVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(sql`${auditLogs.action} IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN')`)

    const actionVisits = actionVisitsResult[0]?.count || 0

    // Social/other visits - logs without userId and not in common actions
    const socialVisitsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(and(
        isNull(auditLogs.userId),
        sql`${auditLogs.action} NOT IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN')`
      ))

    const socialVisits = socialVisitsResult[0]?.count || 0

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
  } catch (error) {
    // Return default values instead of throwing
    return {
      totalVisits: 0,
      percentChange: 0,
      isPositive: true,
      breakdown: [
        { label: "Direct", value: 0 },
        { label: "Action", value: 0 },
        { label: "Social", value: 0 },
      ],
    }
  }
}

export async function getYearlyAuditLogAnalytics() {
  try {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    // Get the start and end of the current year
    const currentYearStart = new Date(currentYear, 0, 1)
    const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999)

    // Get the start and end of the last year
    const lastYearStart = new Date(lastYear, 0, 1)
    const lastYearEnd = new Date(lastYear, 11, 31, 23, 59, 59, 999)

    // Fetch current year audit logs
    const currentYearLogsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(and(gte(auditLogs.timestamp, currentYearStart), lt(auditLogs.timestamp, currentYearEnd)))

    const currentYearLogs = currentYearLogsResult[0]?.count || 0

    // Fetch last year audit logs
    const lastYearLogsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(and(gte(auditLogs.timestamp, lastYearStart), lt(auditLogs.timestamp, lastYearEnd)))

    const lastYearLogs = lastYearLogsResult[0]?.count || 0

    // Calculate percentage change
    let percentageChange = 0
    if (lastYearLogs > 0) {
      percentageChange = ((currentYearLogs - lastYearLogs) / lastYearLogs) * 100
    } else if (currentYearLogs > 0) {
      percentageChange = 100
    }

    const isPositiveChange = percentageChange >= 0

    return {
      success: true,
      currentYearLogs,
      lastYearLogs,
      percentageChange,
      isPositiveChange,
    }
  } catch (error) {
    // Return default values instead of throwing
    return {
      success: false,
      currentYearLogs: 0,
      lastYearLogs: 0,
      percentageChange: 0,
      isPositiveChange: true,
    }
  }
}

export async function getUserActivities() {
  try {
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
        userName: user.name,
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.userId, user.id))
      .where(gte(auditLogs.timestamp, thirtyDaysAgo))
      .orderBy(desc(auditLogs.timestamp))
      .limit(50) // Limit to 50 recent activities

    return activities.map((activity) => ({
      id: activity.id,
      user: activity.userName || activity.userId || "Unknown User",
      action: `${activity.action} ${activity.tableName || ''}`.trim(),
      time: activity.timestamp,
      iconType: getActionIconType(activity.action),
    }))
  } catch (error) {
    return [] // Return empty array instead of throwing
  }
}

// Helper function to map actions to icon types (as strings)
function getActionIconType(action: string) {
  if (!action) return "alert"
  
  switch (action.toUpperCase()) {
    case "CREATE":
      return "plus"
    case "DELETE":
      return "trash"
    case "UPDATE":
      return "edit"
    case "LOGIN":
    case "LOGOUT":
      return "user"
    default:
      return "alert"
  }
}