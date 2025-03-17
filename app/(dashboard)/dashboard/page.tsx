"use client"

import { useEffect, useState } from "react"
import Notificationdashcard from "@/components/Dashboard/charts/Notificationdashcard"
import UserCard from "@/components/Dashboard/DashboardCards"
import RecentUsers from "@/components/Dashboard/charts/RecentUser"
import TrafficStatst from "@/components/Dashboard/charts/TrafficStatst"
import UserActivity from "@/components/Dashboard/charts/UserActivity"
import { getStaffCount, getTotalProjects, getTotalRequests, getTotalUsers } from "@/server/data/alldata"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton"

const Page = () => {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalRequests, setTotalRequests] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const users = await getTotalUsers()
      const projects = await getTotalProjects()
      const requests = await getTotalRequests()
      const staff = await getStaffCount()

      setTotalUsers(users)
      setTotalProjects(projects)
      setTotalRequests(requests)
      setStaffCount(staff)
    } catch {
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-6">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchData} variant="ghost" className="mt-4 flex items-center gap-2 border-[#acc2ef]">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="mx-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <UserCard type="Total Users" count={totalUsers} icon="users" />
        <UserCard type="Total Projects" count={totalProjects} icon="projects" />
        <UserCard type="Total Requests" count={totalRequests} icon="message" />
        <UserCard type="Total Staff" count={staffCount} icon="staff" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Notificationdashcard />
        <TrafficStatst />
        <UserActivity />
        <RecentUsers />
      </div>
    </div>
  )
}

export default Page

