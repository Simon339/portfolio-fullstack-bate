/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Plus, Trash2, Edit, AlertCircle, Clock, Activity, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getUserActivities } from "@/server/actions/audit-log"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface UserActivity {
  id: string
  user: string
  action: string
  time: Date
  iconType?: string
}

export default function UserActivity() {
  const [allActivities, setAllActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const data = await getUserActivities()
        setAllActivities(
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

  const recentActivities = useMemo(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return allActivities.filter(activity => {
      const activityDate = new Date(activity.time)
      return activityDate >= oneWeekAgo
    }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [allActivities])

  const getIconComponent = (iconType: string) => {
    const iconMap = {
      plus: { icon: Plus, gradient: "from-emerald-500/20 to-teal-600/20", border: "emerald-500/30", color: "text-emerald-600" },
      trash: { icon: Trash2, gradient: "from-red-500/20 to-orange-600/20", border: "red-500/30", color: "text-red-600" },
      edit: { icon: Edit, gradient: "from-blue-500/20 to-indigo-600/20", border: "blue-500/30", color: "text-blue-600" },
      default: { icon: AlertCircle, gradient: "from-orange-500/20 to-amber-600/20", border: "orange-500/30", color: "text-orange-600" }
    }
    
    const config = iconMap[iconType as keyof typeof iconMap] || iconMap.default
    const Icon = config.icon
    
    return (
      <div className="relative">
        <div className={cn("absolute inset-0 rounded-full blur-sm", `bg-${config.border.replace('/30', '')}/20`)} />
        <div className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br border",
          config.gradient,
          `border-${config.border}`
        )}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden bg-gray-50 text-gray-900 border-[#acc2ef] shadow-md w-full">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">User Activity</CardTitle>
              <CardDescription className="text-gray-500">Recent user interactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] w-full text-center px-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">Something went wrong</p>
          <p className="text-xs text-gray-500 max-w-[240px]">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden bg-gray-50 text-gray-900 border-[#acc2ef] shadow-md w-full group">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ background: 'radial-gradient(circle, rgba(249, 115, 22, 0.3), transparent)' }} aria-hidden="true" />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-orange-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/20 border border-orange-500/30">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">User Activity</CardTitle>
              <CardDescription className="text-gray-500 text-sm">Recent user interactions</CardDescription>
            </div>
          </div>
          {!loading && recentActivities.length > 0 && (
            <Badge 
              variant="outline" 
              className="bg-orange-500/10 text-orange-600 border border-orange-500/20"
            >
              {recentActivities.length} new
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-0 pb-0 h-[300px] relative">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 animate-pulse">
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
        ) : recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gray-200 blur-lg" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 border border-[#acc2ef]">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No recent activity</p>
            <p className="text-xs text-gray-500 max-w-[200px]">User interactions will appear here when they occur</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
                    {getIconComponent(activity.iconType ?? "")}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-medium leading-none truncate">{activity.user}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </CardContent>

        {recentActivities.length > 0 && (
      <CardFooter className="relative border-t border-[#acc2ef] bg-gray-100/50 px-6 py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => window.location.href = "/dashboard/reports"}
        >
          View all activity
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
        )}
    </Card>
  )
}