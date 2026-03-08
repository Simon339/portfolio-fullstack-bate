/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import Userlist from "./Userlist";
import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Users } from "lucide-react";
import { getbyUserDetails, getUserSignupAnalytics } from "@/server/data/alldata";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: number
  name: string
  surname: string
  image: string
  email: string
  status?: 'Verified' | 'Not Verified';
  createdAt: Date
}


const RecentUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState({
    currentYearSignups: 0,
    lastYearSignups: 0,
    percentageChange: 0,
    success: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersData, analyticsData] = await Promise.all([getbyUserDetails(), getUserSignupAnalytics()])
        setUsers(usersData)
        setAnalytics(analyticsData)
      } catch (err) {
        setError("Failed to fetch data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (error) {
    return (
      <Card className="bg-white w-full border-0 shadow-sm">
        <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Users</CardTitle>
          </div>
          <CardDescription>New users who joined recently</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] w-full text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const isPositiveChange = analytics.percentageChange >= 0
  const changeText = isPositiveChange ? 'up' : 'down'
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown
  const trendColor = isPositiveChange ? 'text-green-500' : 'text-red-500'

  return (
    <Card className="bg-white text-black-200 border-[#cee8ff] shadow-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Recent Users</CardTitle>
        <CardDescription>New users who joined recently</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 flex-1 pb-0 text-black-100 h-[300px] mx-auto w-full">
        {loading ? (
          <div className="flex justify-center items-center h-[200px] w-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        ) : users.length > 0 ? (
          <ScrollArea className="flex-1 pb-0 text-black-100 h-[300px] mx-auto w-full">
              {users.map((user) => (
                <Userlist key={user.id} {...user} />
              ))}
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
            <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm font-medium text-muted-foreground mb-1">No users yet</p>
            <p className="text-xs text-muted-foreground max-w-[200px]">New users who join will appear here</p>
          </div>
        )}
      </CardContent>
      {analytics.success && users.length > 0 && (
        <CardFooter className="border-t bg-gray-50/50 px-6 py-4">
          <div className="space-y-2 w-full">
            <div className={`flex items-center gap-2 text-sm font-medium ${trendColor}`}>
              User signups {changeText} by {Math.abs(analytics.percentageChange)}% this year
              <TrendIcon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.currentYearSignups} new users this year, compared to {analytics.lastYearSignups} last year
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecentUsers;
