/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, formatDistanceToNow } from "date-fns"
import {
  Clock,
  UserCog,
  Mail,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Clock3,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    return (
      <div className="text-sm text-gray-500 py-6 text-center rounded-md bg-gray-50 border border-[#acc2ef]">
        No activity records found
      </div>
    )
  }

  return (
    <div className="w-full text-gray-900">
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <Card key={log.id} className="overflow-hidden border-[#acc2ef] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-gray-100 p-2 rounded-full">{getActionIcon(log.action, log.tableName)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{getActionDescription(log)}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-xs text-gray-800 font-normal border-[#acc2ef] px-2 py-0 flex items-center gap-1"
                    >
                      <Calendar className="h-3 w-3 text-gray-500" />
                      {format(new Date(log.timestamp), "MMM d, yyyy")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-xs text-gray-800 font-normal border-[#acc2ef] px-2 py-0 flex items-center gap-1"
                    >
                      <Clock3 className="h-3 w-3 text-gray-500" />
                      {format(new Date(log.timestamp), "h:mm a")}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-50 text-xs font-normal text-gray-800 border-[#acc2ef] px-2 py-0">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Activities

