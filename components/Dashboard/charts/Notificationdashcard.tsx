"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getNotifications, deleteRecords, markNotificationAsRead, markAllNotificationsAsRead, } from "@/server/actions/notification";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, MoreHorizontal, Bell, CheckCircle, Mail, MessageSquare, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: string;
  type: 'contact' | 'service';
  name: string;
  email?: string;
  topic?: string;
  service?: string;
  companyName?: string;
  phoneNumber?: string;
  message?: string;
  logo: string;
  slug?: string;
  createdAt: Date;
  read: boolean;
  archived?: boolean;
  isSelected?: boolean;
  isRead?: boolean;
  originalId?: string;
}

const Notificationdashcard = () => {
  const router = useRouter();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const simpleNotifications = await getNotifications({ limit: 200 });

        const transformedNotifications: Notification[] = simpleNotifications.map((notif: any) => {
          const originalId = notif.id.replace(/^(contact_|service_|invite_)/, '');

          return {
            id: notif.id,
            originalId: originalId,
            type: notif.source === 'contact_form' ? 'contact' :
              notif.source === 'service_inquiry' ? 'service' : 'contact',
            name: notif.message?.split('From: ')[1]?.split(' - ')[0] ||
              notif.message?.split('New Invite: ')[1]?.split(' (')[0] ||
              'Unknown',
            topic: notif.title?.includes('Contact') ? notif.message?.split(' - ')[1] : undefined,
            service: notif.title?.includes('Service') ? notif.message?.split('Service: ')[1]?.split(' - ')[0] : undefined,
            companyName: notif.title?.includes('Service') ? notif.message?.split('Company: ')[1] : undefined,
            message: notif.message,
            createdAt: new Date(notif.createdAt),
            read: notif.read || false,
            archived: false,
            logo: '/placeholder.png',
          };
        });

        setAllNotifications(transformedNotifications);
      } catch (error) {
        setError("Failed to load notifications");
        setAllNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const unreadRecentNotifications = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return allNotifications.filter(notification => {
      const notificationDate = new Date(notification.createdAt);
      return !notification.read && !notification.archived && notificationDate >= oneWeekAgo;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allNotifications]);

  const deleteNotification = async (id: string, type: 'contact' | 'service') => {
    try {
      const originalId = id.replace(/^(contact_|service_)/, '');

      if (type === 'contact') {
        await deleteRecords({ contactFormIds: [originalId] });
      } else {
        await deleteRecords({ serviceInquiryIds: [originalId] });
      }
      setAllNotifications(allNotifications.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAsRead = async (id: string, type: 'contact' | 'service') => {
    try {
      const originalId = id.replace(/^(contact_|service_)/, '');

      if (type === 'contact' || type === 'service') {
        await markNotificationAsRead(originalId);
      }

      setAllNotifications(
        allNotifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setAllNotifications(
        allNotifications.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: 'contact' | 'service') => {
    return type === 'contact' ? (
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-sm" />
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30">
          <Mail className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    ) : (
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-sm" />
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30">
          <MessageSquare className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card className="relative overflow-hidden bg-gray-50 text-gray-900 border-[#acc2ef] shadow-md w-full">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-red-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-600/20 border border-red-500/30">
                <Bell className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Notifications</CardTitle>
              <CardDescription className="text-gray-500">Stay updated with recent activities</CardDescription>
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
    <Card className="relative overflow-hidden bg-gray-50 text-gray-900 border-[#acc2ef] shadow-md w-full group">
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent)' }} aria-hidden="true" />
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-sm" />
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">Notifications</CardTitle>
              <CardDescription className="text-gray-500 text-sm">Stay updated with recent activities</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && unreadRecentNotifications.length > 0 && (
              <>
                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20">
                  {unreadRecentNotifications.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-0 h-[300px] relative">
        {loading ? (
          <div className="space-y-1 px-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : unreadRecentNotifications.length > 0 ? (
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1">
              {unreadRecentNotifications.map((notification, index) => (
                <div 
                  key={notification.id} 
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                >
                  <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium leading-none truncate">{notification.name}</p>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-0.5">
                        {notification.type === "contact" ? notification.topic : notification.service}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => markAsRead(notification.id, notification.type)}>
                          Mark as read
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (notification.type === "contact" || notification.type === "service") {
                              deleteNotification(notification.id, notification.type);
                            }
                          }}
                          className="text-red-600"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center px-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-2xl bg-gray-200 blur-lg" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 border border-[#acc2ef]">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">All caught up!</p>
            <p className="text-xs text-gray-500 max-w-[200px]">No unread notifications from the past week</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      </CardContent>
       {unreadRecentNotifications.length > 0 && (
      <CardFooter className="relative border-t border-[#acc2ef] bg-gray-100/50 px-6 py-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => router.push("/dashboard/mails")}
        >
          View all notifications
          <ChevronRight className="h-4 w-4 text-[#acc2ef]" />
        </Button>
      </CardFooter>
      )}
    </Card>
  );
};

export default Notificationdashcard;