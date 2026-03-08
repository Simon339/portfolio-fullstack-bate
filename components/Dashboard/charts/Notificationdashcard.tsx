"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getSimpleNotifications, deleteRecords, markNotificationAsRead, markAllNotificationsAsRead, } from "@/server/actions/notification";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, MoreHorizontal, UserCheck, UserX, Bell, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/hooks/getcurrectuser';

interface Notification {
  id: string;
  type: 'contact' | 'service' | 'access';
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

interface PendingInvitation {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  createdAt: Date;
}

const Notificationdashcard = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingInvitation, setPendingInvitation] = useState<PendingInvitation[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get organizations using the hook at the top level
  const { data: organizations } = authClient.useListOrganizations();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch notifications
        const simpleNotifications = await getSimpleNotifications({ limit: 200 });
        
        // Fetch pending invitations
        let invitationsData: PendingInvitation[] = [];
        try {
          const organizationId = organizations?.[0]?.id || "";
          
          if (organizationId) {
            const { data: invitations, error } = await authClient.organization.listInvitations({
              query: {
                organizationId: organizationId,
              },
            });
            
            if (!error && invitations) {
              invitationsData = invitations.map((inv: any) => ({
                id: inv.id,
                name: inv.invitee?.name  || 'Unknown',
                createdAt: new Date(inv.createdAt || Date.now()),
                logo: inv.logo,
                slug: inv.slug
              }));
            }
          }
        } catch (invitationError) {
        }

        // Transform notifications
        const transformedNotifications: Notification[] = simpleNotifications.map((notif: any) => {
          // Extract the original ID from the prefixed one
          const originalId = notif.id.replace(/^(contact_|service_|invite_)/, '');
          
          return {
            id: notif.id,
            originalId: originalId,
            type: notif.source === 'contact_form' ? 'contact' : 
                  notif.source === 'service_inquiry' ? 'service' : 'access',
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

        setNotifications(transformedNotifications);
        setPendingInvitation(invitationsData);
        
        // Calculate unread count from notifications + pending invitations
        const unreadNotifications = transformedNotifications.filter(n => !n.read).length;
        setUnreadCount(unreadNotifications + invitationsData.length);
      } catch (error) {
        // Fallback to empty arrays
        setNotifications([]);
        setPendingInvitation([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organizations]); // Add organizations as dependency

  const deleteNotification = async (id: string, type: 'contact' | 'service') => {
    try {
      // Extract original ID
      const originalId = id.replace(/^(contact_|service_)/, '');
      
      if (type === 'contact') {
        await deleteRecords({ contactFormIds: [originalId] });
      } else {
        await deleteRecords({ serviceInquiryIds: [originalId] });
      }
      setNotifications(notifications.filter((notification) => notification.id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
    }
  };

  const markAsRead = async (id: string, type: 'contact' | 'service' | 'access') => {
    try {
      // Extract original ID
      const originalId = id.replace(/^(contact_|service_)/, '');
      
      if (type === 'contact' || type === 'service') {
        await markNotificationAsRead(originalId);
      }
      
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      // Only reset notification unread count, keep pending invitations
      setUnreadCount(pendingInvitation.length);
    } catch (error) {
    }
  };

  // Combine notifications and pending invitations for the "All" tab
  const allItems = [
    ...notifications.filter((n) => !n.read && !n.archived),
    ...pendingInvitation.map((inv) => ({
      id: inv.id,
      type: "access" as const,
      name: inv.name,
      slug: inv.slug,
      logo: inv.logo || '/placeholder.png',
      createdAt: inv.createdAt,
      read: false, // Add required property
    })),
  ];

  const handleAccept = async (id: string) => {
    try {
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId: id,
      });
      
      if (!error) {
        setPendingInvitation(pendingInvitation.filter((inv) => inv.id !== id));
        setUnreadCount(prev => prev - 1);
      } else {
      }
    } catch (error) {
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: id,
      });
      
      if (!error) {
        setPendingInvitation(pendingInvitation.filter((inv) => inv.id !== id));
        setUnreadCount(prev => prev - 1);
      } else {
      }
    } catch (error) {
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Notifications</CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
            {notifications.filter(n => !n.read).length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
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
                    <div key={`${item.type}_${item.id}`} className="flex items-start gap-3 pb-4 last:pb-0">
                      {item.type === "access" ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={item.logo} alt="Avatar" />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {item.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        !item.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.name}</p>
                        {item.type === "access" ? (
                          <>
                            <p className="text-xs text-muted-foreground">{item.slug || ""}</p>
                            <p className="text-xs text-muted-foreground">
                              Invited {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {item.type === "contact" ? item.topic : item.service}
                          </p>
                        )}
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
                              <DropdownMenuItem onClick={() => handleAccept(item.id)}>
                                <UserCheck className="mr-2 h-4 w-4" /> Accept
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
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(item.id, item.type)}
                                className="text-red-600"
                              >
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
                    <div className="relative inline-flex items-center justify-center">
      {/* Multiple ring waves */}
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_infinite]" />
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_0.5s_infinite]" />
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_1s_infinite]" />
      
      <Bell className="relative h-8 w-8 text-muted-foreground opacity-40" />
    </div>            <p className="text-sm text-muted-foreground">No notifications</p>
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
                      <div key={notification.id} className="flex items-start gap-3 pb-4 last:pb-0" 
                           onClick={() => router.push(`/dashboard/mails`)}>
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{notification.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {notification.type === "contact" ? notification.topic : notification.service}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
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
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification.id, notification.type)}
                              className="text-red-600"
                            >
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
                ) : pendingInvitation.length > 0 ? (
                  pendingInvitation.map((invitation) => (
                    <div key={invitation.id} className="flex items-start gap-3 pb-4 last:pb-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {invitation.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {invitation.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Slug: {invitation.slug || ""}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
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
                          <DropdownMenuItem onClick={() => handleAccept(invitation.id)}>
                            <UserCheck className="mr-2 h-4 w-4" /> Accept
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReject(invitation.id)}>
                            <UserX className="mr-2 h-4 w-4" /> Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <UserCheck className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">No pending invitions</p>
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