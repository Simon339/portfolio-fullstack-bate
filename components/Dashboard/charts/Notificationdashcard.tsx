"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getAllNotifications, markContactFormAsRead, markServiceInquiryAsRead, deleteRecords, getPendingUsers, updateUserStatus } from "@/server/actions/notification";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, MoreHorizontal, UserCheck, UserX, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'contact' | 'service';
  name: string;
  email?: string;
  topic?: string;
  service?: string;
  image?: string;
  createdAt: Date;
  read: boolean;
  archived?: boolean;
}

interface PendingUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  image: string;
  createdAt: Date;
}

const Notificationdashcard = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notificationsData, pendingUsersData] = await Promise.all([getAllNotifications(), getPendingUsers()]);
        setNotifications(notificationsData);
        setPendingUsers(
          pendingUsersData.map((user) => ({
            ...user,
            image: user.image || `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`,
          }))
        );
      } catch {
        throw new Error("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deleteNotification = async (id: string, type: 'contact' | 'service') => {
    if (type === 'contact') {
      await deleteRecords({ contactFormIds: [id] });
    } else {
      await deleteRecords({ serviceInquiryIds: [id] });
    }
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const markAsRead = async (id: string, type: 'contact' | 'service') => {
    if (type === 'contact') {
      await markContactFormAsRead(id);
    } else {
      await markServiceInquiryAsRead(id);
    }
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    );
  };

  // Calculate unread count (only unread notifications + pending users)
  const unreadCount = notifications.filter((n) => !n.read).length + pendingUsers.length;

  // Combine notifications and pending users for the "All" tab
  const allItems = [
    ...notifications.filter((n) => !n.read && !n.archived), // Only include unread and non-archived notifications
    ...pendingUsers.map((user) => ({
      id: user.id,
      type: "access" as const,
      name: `${user.name} ${user.surname}`,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    })),
  ];

  const handleApprove = async (id: string) => {
    await updateUserStatus(id, 'APPROVED');
    setPendingUsers(pendingUsers.filter((user) => user.id !== id));
  };

  const handleReject = async (id: string) => {
    await updateUserStatus(id, 'REJECTED');
    setPendingUsers(pendingUsers.filter((user) => user.id !== id));
  };

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="outline" className="ml-2 text-gray-800">
              {unreadCount}
            </Badge>
          )}
        </div>
        <CardDescription>Stay updated with recent activities</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="px-6 py-2">
              {/* All Tab */}
              <TabsContent value="all" className="m-0 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : allItems.length > 0 ? (
                  allItems.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-4 last:pb-0">
                      {item.type === "access" ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.image} alt="Avatar" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {item.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        !item.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        {item.type === "access" ? (
                          <>
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                            <p className="text-xs text-muted-foreground">Role: {item.role}</p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {item.type === "contact" ? item.topic : item.service}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.type === "access" ? (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(item.id)}>
                                <UserCheck className="mr-2 h-4 w-4" /> Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(item.id)}>
                                <UserX className="mr-2 h-4 w-4" /> Reject
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              {!item.read && (
                                <DropdownMenuItem onClick={() => markAsRead(item.id, item.type)}>
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => deleteNotification(item.id, item.type)}>
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </TabsContent>

              {/* Unread Tab */}
              <TabsContent value="unread" className="m-0 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : notifications.filter((n) => !n.read && !n.archived).length > 0 ? (
                  notifications
                    .filter((n) => !n.read && !n.archived)
                    .map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3 pb-4 last:pb-0" onClick={() => router.push(`/dashboard/mails`)}>
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{notification.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.type === "contact" ? notification.topic : notification.service}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => markAsRead(notification.id, notification.type)}>
                              Mark as read
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteNotification(notification.id, notification.type)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No unread notifications</p>
                  </div>
                )}
              </TabsContent>

              {/* Access Tab */}
              <TabsContent value="access" className="m-0 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center h-[200px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : pendingUsers.length > 0 ? (
                  pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-start gap-3 pb-4 last:pb-0" onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {`${user.name.charAt(0)}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                            <UserCheck className="mr-2 h-4 w-4" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(user.id)}>
                            <UserX className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <UserCheck className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No pending access requests</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 py-3">
        <Button variant="ghost" size="sm" className="w-full justify-between" onClick={() => router.push("/dashboard/mails")}>
          View all notifications
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Notificationdashcard;