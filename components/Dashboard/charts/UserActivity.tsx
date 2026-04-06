/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Plus, Trash2, Edit, AlertCircle, UserRound, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getUserActivities } from "@/server/actions/audit-log"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define the activity interface
interface UserActivity {
  id: string
  user: string
  action: string
  time: Date
  iconType?: string
}

export default function UserActivity() {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const data = await getUserActivities()
        setUserActivities(
          data.map((activity: any) => ({
            ...activity,
            id: String(activity.id),
          }))
        )
      } catch (err) {
        setError("Failed to fetch user activities. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Function to get the appropriate icon component based on iconType
  const getIconComponent = (iconType: string) => {
    switch (iconType) {
      case "plus":
        return <Plus className="h-4 w-4 text-primary" />
      case "trash":
        return <Trash2 className="h-4 w-4 text-primary" />
      case "edit":
        return <Edit className="h-4 w-4 text-primary" />
      default:
        return <AlertCircle className="h-4 w-4 text-primary" />
    }
  }

  return (
    <Card className="bg-white border border-[#acc2ef] shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg font-medium">User Activity</CardTitle>
        <CardDescription>Recent user interactions</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : userActivities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[300px]">
            {userActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="mt-1 rounded-full bg-primary/10 p-2">{getIconComponent(activity.iconType ?? "")}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.action}</p>
                </div>
              </div>
            ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-[#acc2ef] bg-gray-50/50 py-3">
        <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => window.location.href = "/dashboard/reports"}>
          View all activity
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6 py-2 h-[300px]">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{message}</p>
      <p className="text-xs text-muted-foreground max-w-[250px] mt-2">
        Check your connection and try refreshing the page
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
      <div className="flex flex-col items-center gap-2">
        <Clock className="h-10 w-10 text-muted-foreground opacity-40" />
        <UserRound className="h-6 w-6 text-muted-foreground opacity-40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1 mt-3">No recent activity</p>
      <p className="text-xs text-muted-foreground max-w-[250px]">User interactions will appear here when they occur</p>
    </div>
  )
}

