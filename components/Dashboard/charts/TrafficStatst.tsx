
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, LineChart, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { getTrafficStats, getYearlyAuditLogAnalytics } from "@/server/actions/audit-log";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <Card className="bg-white border border-[#acc2ef] shadow-sm overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Traffic Stats</CardTitle>
          {!loading && !error && (
            <Badge
              variant={trafficStats.isPositive ? "outline" : "destructive"}
              className={`ml-2 flex items-center gap-1 border-[#acc2ef] ${
                trafficStats.isPositive
                  ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                  : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              }`}
            >
              {trafficStats.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(analytics.percentageChange).toFixed(1)}%
            </Badge>
          )}
        </div>
        <CardDescription>Website visitor analytics</CardDescription>
      </CardHeader>

      <CardContent className="h-[300px]">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : trafficStats.totalVisits === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold">{trafficStats.totalVisits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total visits this month</p>
              </div>
              <LineChart className="h-10 w-10 text-muted-foreground opacity-70" />
            </div>

            <div className="space-y-2 mt-6">
              {trafficStats.breakdown.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {!loading && !error && analytics.success && (
        <CardFooter className="border-t border-[#acc2ef] bg-gray-50/50 px-6 py-4">
          <div className="space-y-2 w-full">
            <div className={`flex items-center gap-2 text-sm font-medium ${trendColor}`}>
              Audit logs {changeText} by {Math.abs(analytics.percentageChange).toFixed(1)}% this year
              <TrendIcon className="h-4 w-4" />
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.currentYearLogs.toLocaleString()} audit logs this year, compared to{" "}
              {analytics.lastYearLogs.toLocaleString()} last year
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function LoadingState() {
  return (
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
  );
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
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
      <LineChart className="h-10 w-10 text-muted-foreground  mb-3 opacity-40" />
      <p className="text-sm font-medium text-muted-foreground mb-1">No traffic data available</p>
      <p className="text-xs text-muted-foreground max-w-[250px]">Start tracking visitors to see analytics here</p>
    </div>
  );
}