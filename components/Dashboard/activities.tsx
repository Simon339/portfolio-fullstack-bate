/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, formatDistanceToNow } from "date-fns"
import { Clock, UserCog, Mail, ShieldAlert, CheckCircle, XCircle, AlertCircle, User } from "lucide-react"

type AuditLog = {
  id: string
  action: string
  tableName: string
  recordId: string
  userId: string | null
  timestamp: Date
  details: any
  ipAddress: string | null
  userAgent: string | null
}

interface ActivitiesProps {
  auditLogs: AuditLog[]
}

const getActionIcon = (action: string, tableName: string) => {
  switch (action) {
    case "UPDATE":
      if (tableName === "users") {
        return <UserCog className="h-4 w-4 text-blue-500" />
      } else if (tableName.includes("email")) {
        return <Mail className="h-4 w-4 text-blue-500" />
      }
      return <Clock className="h-4 w-4 text-blue-500" />
    case "CREATE":
      return <User className="h-4 w-4 text-green-500" />
    case "DELETE":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "LOGIN":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "LOGOUT":
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    case "SECURITY":
      return <ShieldAlert className="h-4 w-4 text-purple-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getActionDescription = (log: AuditLog): string => {
  try {
    let details
    if (typeof log.details === "string") {
      details = JSON.parse(log.details)
    } else {
      details = log.details
    }

    switch (log.action) {
      case "UPDATE":
        if (log.tableName === "users") {
          if (details?.newRole) {
            return `Role updated to ${details.newRole}`
          } else if (details?.newEmail) {
            return `Email updated to ${details.newEmail}`
          } else if (details?.status) {
            return `Status updated to ${details.status}`
          }
          return `User information updated`
        }
        return `${log.tableName} updated`

      case "CREATE":
        return `${log.tableName} created`

      case "DELETE":
        return `${log.tableName} deleted`

      default:
        return details?.action || `${log.action} on ${log.tableName}`
    }
  } catch (error) {
    return `${log.action} on ${log.tableName}`
  }
}

const Activities = ({ auditLogs }: ActivitiesProps) => {
  if (!auditLogs || auditLogs.length === 0) {
    return <div className="text-sm text-gray-500 py-4 text-center">No activity records found</div>
  }

  return (
    <div className="w-full">
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 py-2 border-b  border-[#acc2ef] last:border-0">
            <div className="mt-0.5">{getActionIcon(log.action, log.tableName)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{getActionDescription(log)}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500">{format(new Date(log.timestamp), "MMM d, yyyy")}</p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">{format(new Date(log.timestamp), "h:mm a")}</p>
                <span className="text-xs text-gray-400">•</span>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Activities

