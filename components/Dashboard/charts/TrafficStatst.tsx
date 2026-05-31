
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, LineChart, TrendingUp, TrendingDown, AlertCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getTrafficStats, getYearlyAuditLogAnalytics } from "@/server/actions/audit-log";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function TrafficStats() {
  const [trafficStats, setTrafficStats] = useState({
    totalVisits: 0,
    percentChange: 0,
    isPositive: true,
    breakdown: [
      { label: "Direct", value: 0 },
      { label: "Action", value: 0 },
      { label: "Social", value: 0 },
    ],
  });

  const [analytics, setAnalytics] = useState({
    success: false,
    currentYearLogs: 0,
    lastYearLogs: 0,
    percentageChange: 0,
    isPositiveChange: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, analyticsData] = await Promise.all([getTrafficStats(), getYearlyAuditLogAnalytics()]);
        setTrafficStats(statsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError("Failed to fetch traffic data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isPositiveChange = analytics.percentageChange >= 0;
  const changeText = isPositiveChange ? "up" : "down";
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;
  const trendColor = isPositiveChange ? "text-emerald-500" : "text-red-500";

  if (error) {
    return (
      <Card className="relative overflow-hidden bg-white text-gray-900 border-[#acc2ef] shadow-md w-full">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Traffic Stats</CardTitle>
              <CardDescription className="text-gray-500">Website visitor analytics</CardDescription>
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
    );
  }

  return (
    <Card className="relative overflow-hidden bg-white text-gray-900 border-[#acc2ef] shadow-md w-full group">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)' }} aria-hidden="true" />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/30">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">Traffic Stats</CardTitle>
              <CardDescription className="text-gray-500 text-sm">Website visitor analytics</CardDescription>
            </div>
          </div>
          {!loading && trafficStats.totalVisits > 0 && (
            <Badge
              variant="outline"
              className={cn(
                "ml-2 flex items-center gap-1 border",
                trafficStats.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 border-red-500/20"
              )}
            >
              {trafficStats.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(analytics.percentageChange).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="h-[300px] px-6 relative">
        {loading ? (
          <div className="space-y-6 h-[300px] py-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : trafficStats.totalVisits === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gray-200 blur-lg" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 border border-[#acc2ef]">
                <LineChart className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No traffic data available</p>
            <p className="text-xs text-gray-500 max-w-[200px]">Start tracking visitors to see analytics here</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold">{trafficStats.totalVisits.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total visits this month</p>
              </div>
              <LineChart className="h-10 w-10 text-purple-400 opacity-50" />
            </div>

            <div className="space-y-3 mt-6">
              {trafficStats.breakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">{item.value}%</span>
                  </div>
                  <Progress 
                    value={item.value} 
                    className="h-1.5 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-violet-600" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-6 right-6 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </CardContent>

      {!loading && analytics.success && trafficStats.totalVisits > 0 && (
        <CardFooter className="relative border-t border-[#acc2ef] bg-gray-100/50 px-6 py-4">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 0)`, backgroundSize: '16px 16px' }} aria-hidden="true" />
          <div className="relative space-y-2 w-full">
            <div className={cn("flex items-center gap-2 text-sm font-medium", trendColor)}>
              Audit logs {changeText} by {Math.abs(analytics.percentageChange).toFixed(1)}% this year
              <TrendIcon className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-500">
              {analytics.currentYearLogs.toLocaleString()} audit logs this year, compared to{" "}
              {analytics.lastYearLogs.toLocaleString()} last year
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
