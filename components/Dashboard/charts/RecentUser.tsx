/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import Userlist from "./Userlist";
import { useEffect, useState, useMemo } from "react";
import { AlertCircle, TrendingDown, TrendingUp, Users, UserPlus } from "lucide-react";
import { getbyUserDetails, getUserSignupAnalytics } from "@/server/data/alldata";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role?: "user" | "owner" | "admin" | "user";
  banned: boolean | null;
  twoFactorEnabled: boolean | null;
  emailVerified: Date | null;
  createdAt: Date;
  sessionCount?: number;
  lastActive?: Date;
}

const SkeletonUser = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-gray-200" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 rounded bg-gray-200" />
      <div className="h-3 w-48 rounded bg-gray-200/60" />
    </div>
    <div className="h-6 w-16 rounded-full bg-gray-200" />
  </div>
);

const RecentUsers = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    currentYearSignups: 0,
    lastYearSignups: 0,
    percentageChange: 0,
    success: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersData, analyticsData] = await Promise.all([getbyUserDetails(), getUserSignupAnalytics()]);
        setAllUsers(usersData as User[]);
        setAnalytics(analyticsData);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter users to show only those created within the last week
  const recentUsers = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return allUsers.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt >= oneWeekAgo;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allUsers]);

  const isPositiveChange = analytics.percentageChange >= 0;
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;

  if (error) {
    return (
      <Card className="relative overflow-hidden bg-white text-gray-900 border-[#acc2ef] shadow-md w-full">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20">
              <Users className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Users</CardTitle>
              <CardDescription className="text-gray-500">New users who joined recently</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] w-full text-center px-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">Something went wrong</p>
          <p className="text-xs text-gray-500 max-w-[240px]">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-white text-gray-900 border-[#acc2ef] shadow-md w-full group">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent)' }} aria-hidden="true" />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">Recent Users</CardTitle>
              <CardDescription className="text-gray-500 text-sm">New users who joined recently</CardDescription>
            </div>
          </div>
          {!loading && recentUsers.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-[#acc2ef]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-600">{recentUsers.length}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-0 h-[300px] relative">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(4)].map((_, i) => <SkeletonUser key={i} />)}
          </div>
        ) : recentUsers.length > 0 ? (
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1">
              {recentUsers.map((user, index) => (
                <div key={user.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}>
                  <Userlist id={user.id} name={user.name} email={user.email} image={user.image || ''} role={user.role || 'user'} banned={user.banned || false} twofactorenabled={user.twoFactorEnabled || false} status={user.emailVerified ? 'Verified' : 'Not Verified'} createdAt={user.createdAt} />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gray-200 blur-lg" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 border border-[#acc2ef]">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No users yet</p>
            <p className="text-xs text-gray-500 max-w-[200px]">New users who join will appear here</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </CardContent>
      {analytics.success && recentUsers.length > 0 && (
        <CardFooter className="relative border-t border-[#acc2ef] bg-gray-100/50 px-6 py-4">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`, backgroundSize: '16px 16px' }} aria-hidden="true" />
          <div className="relative space-y-2 w-full">
            <div className="flex items-center gap-2">
              <div className={cn("flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold", isPositiveChange ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20")}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{isPositiveChange ? '+' : ''}{analytics.percentageChange}%</span>
              </div>
              <span className="text-xs text-gray-500">vs last year</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-500"><span className="font-semibold text-gray-700">{analytics.currentYearSignups}</span> this year</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-gray-500"><span className="font-medium text-gray-600">{analytics.lastYearSignups}</span> last year</span>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecentUsers;
