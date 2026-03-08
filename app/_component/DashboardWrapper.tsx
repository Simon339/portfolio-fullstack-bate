"use client";

import type * as React from "react";
import { Bell, LayoutDashboard, MailWarning, MessageCircleQuestion, CircleHelp, Users, LogOut, Settings, Check, Clock, X, ReceiptText, UserCheck, UserX, CheckCircle, MoreHorizontal } from "lucide-react";
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Footer from "@/components/Dashboard/Footer";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { countUnreadNotifications, markAllNotificationsAsRead, markNotificationAsRead, getNotificationCounts, getSimpleNotifications } from "@/server/actions/notification";
import { MdReport } from "react-icons/md";
import SearchInput from "@/components/Dashboard/SearchInput";
import { toast } from "sonner";
import { authClient } from "@/hooks/getcurrectuser";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define interfaces from Notificationdashcard.tsx
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

// Updated Notification interface for DashboardWrapper
interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date | string;
  metadata?: Record<string, any>;
  source?: 'contact_form' | 'service_inquiry' | 'access';
  originalId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface NotificationDetails {
  unreadContacts: number;
  unreadServices: number;
  unreadInvitations?: number; // Added missing property
}

// Constants for notification types
const NOTIFICATION_TYPES = {
  success: {
    icon: Check,
    colorClasses: 'bg-green-50 border-l-green-500',
    iconColor: 'text-green-500',
  },
  warning: {
    icon: Clock,
    colorClasses: 'bg-yellow-50 border-l-yellow-500',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: X,
    colorClasses: 'bg-red-50 border-l-red-500',
    iconColor: 'text-red-500',
  },
  info: {
    icon: Bell,
    colorClasses: 'bg-blue-50 border-l-blue-500',
    iconColor: 'text-blue-500',
  },
  contact: {
    icon: MailWarning,
    colorClasses: 'bg-blue-50 border-l-blue-500',
    iconColor: 'text-blue-500',
  },
  service: {
    icon: MessageCircleQuestion,
    colorClasses: 'bg-yellow-50 border-l-yellow-500',
    iconColor: 'text-yellow-500',
  },
  access: {
    icon: UserCheck,
    colorClasses: 'bg-green-50 border-l-green-500',
    iconColor: 'text-green-500',
  },
} as const;

// NotificationItem component with inherited functionality
const NotificationItem = ({ notification, onClick, onMarkAsRead, onAccept, onReject }: { notification: DashboardNotification; onClick: (id: string) => void; onMarkAsRead?: (id: string, type: "contact" | "service" | "access") => void; onAccept?: (id: string) => void; onReject?: (id: string) => void }) => {
  // Determine notification type based on source
  let notificationTypeKey: keyof typeof NOTIFICATION_TYPES = 'info';
  
  if (notification.source === 'contact_form') {
    notificationTypeKey = 'contact';
  } else if (notification.source === 'service_inquiry') {
    notificationTypeKey = 'service';
  } else if (notification.source === 'access') {
    notificationTypeKey = 'access';
  } else {
    notificationTypeKey = notification.type;
  }
  
  const notificationType = NOTIFICATION_TYPES[notificationTypeKey] || NOTIFICATION_TYPES.info;
  const Icon = notificationType.icon;

  return (
    <DropdownMenuItem
      className={cn(
        "flex flex-col items-start p-3 cursor-pointer border-l-4 transition-colors hover:bg-gray-50/80",
        notificationType.colorClasses,
        !notification.read && "font-medium"
      )}
      onClick={() => onClick(notification.id)}
    >
      <div className="flex items-start w-full gap-3">
        <Icon className={cn("h-4 w-4 shrink-0 mt-1", notificationType.iconColor)} />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 ml-2" />
            )}
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
            
            {/* Action buttons based on notification type */}
            {notification.source === 'access' && onAccept && onReject ? (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onAccept(notification.id);
                  }}
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onReject(notification.id);
                  }}
                >
                  <UserX className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            ) : (notification.source === 'contact_form' || notification.source === 'service_inquiry') && onMarkAsRead ? (
              <div className="flex gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Extract the type for mark as read
                      const type = notification.source === 'contact_form' ? 'contact' : 'service';
                      onMarkAsRead(notification.id, type);
                    }}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </DropdownMenuItem>
  );
};

// EmptyState component
const EmptyState = ({ message = "No notifications yet", submessage = "Check back later for updates" }) => (
  <div className="py-8 text-center">
    <div className="relative inline-flex items-center justify-center mb-4">
      {/* Multiple ring waves */}
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_infinite]" />
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_0.5s_infinite]" />
      <div className="absolute h-12 w-12 rounded-full border-2 border-muted-foreground opacity-0 animate-[ring_2s_ease-out_1s_infinite]" />
      
      <Bell className="relative h-8 w-8 text-muted-foreground opacity-40" />
    </div>
    <p className="text-sm text-muted-foreground font-medium">{message}</p>
    <p className="text-xs text-muted-foreground mt-1">{submessage}</p>
  </div>
);

// NotificationsDropdown component with proper empty state
const NotificationsDropdown = ({ notifications, notificationsOpen, setNotificationsOpen, unreadNotificationsCount, notificationDetails, fetchNotifications, handleNotificationClick, handleMarkAllAsRead, handleAcceptInvitation, handleRejectInvitation }: { notifications: DashboardNotification[]; notificationsOpen: boolean; setNotificationsOpen: (open: boolean) => void; unreadNotificationsCount: number; notificationDetails?: NotificationDetails; fetchNotifications: () => void; handleNotificationClick: (id: string) => void; handleMarkAllAsRead: () => void; handleAcceptInvitation: (id: string) => void; handleRejectInvitation: (id: string) => void }) => {
  const router = useRouter();
  const hasUnread = notifications.some(n => !n.read);

  return (
    <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 hover:bg-gray-100"
          onClick={() => fetchNotifications()}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          {unreadNotificationsCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-xs text-white font-bold min-w-5"
              aria-label={`${unreadNotificationsCount} unread notifications`}
            >
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 shadow-lg border border-gray-200"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="space-y-2">
            <span className="font-semibold text-gray-900">Notifications</span>
            {notificationDetails && notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {notificationDetails.unreadContacts} messages
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {notificationDetails.unreadServices} inquiries
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {notificationDetails.unreadInvitations || 0} invites
                </Badge>
              </div>
            )}
          </div>
          {hasUnread && notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto px-2 py-1 text-xs hover:bg-gray-200"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        {notifications.length === 0 ? (
          <EmptyState 
            message="No notifications" 
            submessage="You're all caught up!"
          />
        ) : (
          <>
            <ScrollArea className="max-h-[350px]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <NotificationItem
                    notification={notification}
                    onClick={handleNotificationClick}
                    onAccept={handleAcceptInvitation}
                    onReject={handleRejectInvitation}
                  />
                </div>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center py-3 text-sm text-blue-600 cursor-pointer hover:text-blue-800 hover:bg-blue-50"
              onClick={() => {
                setNotificationsOpen(false);
                router.push("/dashboard/mails");
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notificationDetails, setNotificationDetails] = useState<NotificationDetails | null>(null);
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();

  const pathname = usePathname();
  const router = useRouter();

  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession();

  // Fetch notifications data including pending invitations
  const fetchNotificationsWithInvitations = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [count, notificationList, details, ] = await Promise.all([
        countUnreadNotifications(),
        getNotificationCounts(),
      ]);

      const simpleNotifications = await getSimpleNotifications({ limit: 200 });

      // Ensure notificationList is an array
      const safeNotificationList = Array.isArray(notificationList) ? notificationList : [];
      
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

      // Transform simple notifications to DashboardNotification format
      const transformedSimpleNotifications: DashboardNotification[] = simpleNotifications.map((notif: any) => {
        const originalId = notif.id.replace(/^(contact_|service_|invite_)/, '');
        const source = notif.source === 'contact_form' ? 'contact_form' : 
                      notif.source === 'service_inquiry' ? 'service_inquiry' : 'access';
        
        return {
          id: notif.id,
          originalId: originalId,
          title: notif.title || 'Notification',
          message: notif.message || '',
          type: source === 'contact_form' ? 'info' : 
                source === 'service_inquiry' ? 'warning' : 'success',
          read: notif.read || false,
          createdAt: new Date(notif.createdAt),
          metadata: notif,
          source: source
        };
      });

      // Transform invitations to DashboardNotification format
      const transformedInvitations: DashboardNotification[] = invitationsData.map((inv: PendingInvitation) => ({
        id: `invite_${inv.id}`,
        title: 'Access Invitation',
        message: `${inv.name} invited you to join`,
        type: 'success',
        read: false,
        createdAt: inv.createdAt,
        source: 'access',
        metadata: { invitation: inv }
      }));

      // Combine all notifications
      const allNotifications = [
        ...transformedSimpleNotifications,
        ...transformedInvitations
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Calculate unread count (simple notifications count + unread invitations)
      const unreadInvitationsCount = invitationsData.length; // Assuming all invitations are unread initially
      const totalUnreadCount = count + unreadInvitationsCount;
      
      setUnreadNotificationsCount(totalUnreadCount);
      setNotifications(allNotifications);
      
      // Update notification details with invitations count
      if (details) {
        setNotificationDetails({
          ...details,
          unreadInvitations: unreadInvitationsCount
        });
      }
    } catch (error) {
      toast.error("Failed to load notifications");
    }
  }, [organizations]);

  // Handle invitation acceptance inherited from Notificationdashcard.tsx
  const handleAcceptInvitation = async (id: string) => {
    try {
      const cleanId = id.replace('invite_', '');
      const { data, error } = await authClient.organization.acceptInvitation({
        invitationId: cleanId,
      });
      
      if (!error) {
        setNotifications(prev => prev.filter((notif) => notif.id !== id));
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
        toast.success("Invitation accepted");
      } else {
        toast.error("Failed to accept invitation");
      }
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  // Handle invitation rejection inherited from Notificationdashcard.tsx
  const handleRejectInvitation = async (id: string) => {
    try {
      const cleanId = id.replace('invite_', '');
      const { error } = await authClient.organization.rejectInvitation({
        invitationId: cleanId,
      });
      
      if (!error) {
        setNotifications(prev => prev.filter((notif) => notif.id !== id));
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
        toast.success("Invitation rejected");
      } else {
        toast.error("Failed to reject invitation");
      }
    } catch (error) {
      toast.error("Failed to reject invitation");
    }
  };

  useEffect(() => {
    if (!sessionLoading && !session?.user?.id) {
      router.push("/auth");
      return;
    }

    if (session?.user) {
      const userWithCustomFields = session.user as any;
      setUser({
        id: session.user.id,
        name: session.user.name || userWithCustomFields.name,
        email: session.user.email,
        image: session.user.image || "",
      });
    }

    setLoading(false);
  }, [session, sessionLoading, router]);

  // Fetch notifications when component mounts and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotificationsWithInvitations();
      // Set up interval for polling
      const intervalId = setInterval(fetchNotificationsWithInvitations, 30000);
      return () => clearInterval(intervalId);
    }
  }, [session?.user?.id, fetchNotificationsWithInvitations]);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Mark as read if it's not an access notification
      if (notification.source !== 'access' && notification.originalId) {
        await markNotificationAsRead(notification.originalId);
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Update count if the notification was unread
      if (!notification.read) {
        setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.source === 'contact_form' || notification.source === 'service_inquiry') {
        router.push("/dashboard/mails");
      } else if (notification.source === 'access') {
        // For access notifications, we don't navigate, just handle via accept/reject
        return;
      }

      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to update notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all non-access notifications as read
      await markAllNotificationsAsRead();
      
      // Update local state - mark all non-access notifications as read
      setNotifications(prev =>
        prev.map(notif => {
          if (notif.source === 'access') {
            return notif; 
          }
          return { ...notif, read: true };
        })
      );
      
      // Update count - only count unread access notifications
      const unreadAccessNotifications = notifications.filter(n => n.source === 'access' && !n.read).length;
      setUnreadNotificationsCount(unreadAccessNotifications);
      
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  const initials = user?.name ? `${user.name.charAt(0)}`.toUpperCase() : "N/A";

  const navItems = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: 2, name: "Users", icon: Users, href: "/dashboard/users" },
    { id: 3, name: "Mails", icon: MailWarning, href: "/dashboard/mails" },
    { id: 4, name: "Surveys", icon: MessageCircleQuestion, href: "/dashboard/surveys" },
    { id: 5, name: "Projects", icon: PiProjectorScreenChartDuotone, href: "/dashboard/projects" },
    { id: 6, name: "Quotations", icon: ReceiptText, href: "/dashboard/invoice" },
    { id: 7, name: "Manage", icon: MdReport, href: "/dashboard/manage" },
    { id: 8, name: "Settings", icon: Settings, href: "/dashboard/settings" },
    { id: 9, name: "Help", icon: CircleHelp, href: "/dashboard/help" },
  ];

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/auth");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-[#1E56A0] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Session Error</h3>
          <p className="text-gray-600 mb-4">Failed to load your session. Please try again.</p>
          <Button onClick={() => refetchSession()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return (
    <SidebarProvider className="min-h-screen bg-white">
      <div className="flex grow min-h-screen text-gray-800 bg-gray-50 overflow-hidden">
        <Sidebar className="w-64 bg-white shadow-sm border-r border-gray-200">
          <SidebarHeader className="bg-white border-b border-gray-200">
            <div className="flex items-center h-14 px-4">
              <span className="text-sm font-semibold text-gray-900 truncate">
                MS Portfolio{activeOrganization ? ` - ${activeOrganization.name}` : " - Create/Join org"}
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent className="mt-1 bg-white border-gray-200">
            <div className="flex flex-col items-center py-3">
              <Avatar className="w-24 h-24 mb-1 border-2 border-gray-200">
                <AvatarImage
                  src={user?.image || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'user'}`}
                  alt={user?.name || "User avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-600 text-white">
                  {initials || user?.name?.slice(0, 2)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-sm font-medium text-gray-800">{`${user?.name || "User"}`}</h2>
              <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
            </div>
            <SidebarGroup className="mt-3 text-gray-700 bg-white">
              <SidebarGroupContent className="bg-white">
                <SidebarMenu className="text-gray-700 bg-white">
                  {navItems.map((route) => {
                    const isActive =
                      route.href === "/dashboard" ? pathname === route.href : pathname.startsWith(route.href);

                    return (
                      <SidebarMenuItem key={route.name}>
                        <SidebarMenuButton
                          asChild
                          className={cn(
                            "w-full justify-start py-2 px-4 rounded-lg transition-colors duration-200 mx-2",
                            isActive
                              ? "bg-[#1E56A0] text-white shadow-sm"
                              : "hover:bg-[#092a57] hover:text-gray-300"
                          )}
                        >
                          <a href={route.href}>
                            <route.icon className="h-4 w-4 mr-2 transition-all duration-300 hover:scale-125 hover:text-blue-500" />
                            <span>{route.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
          <SidebarFooter className="text-gray-800 bg-white border-t border-gray-200">
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm hover:bg-red-50 hover:text-red-600 py-3"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-12 items-center bg-white text-gray-800 border-b border-gray-200 justify-between px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 text-gray-500 hover:text-gray-700" />
              <div className="relative hidden sm:block">
                <SearchInput />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <NotificationsDropdown
                  notifications={notifications}
                  notificationsOpen={notificationsOpen}
                  setNotificationsOpen={setNotificationsOpen}
                  unreadNotificationsCount={unreadNotificationsCount}
                  notificationDetails={notificationDetails || undefined}
                  fetchNotifications={fetchNotificationsWithInvitations}
                  handleNotificationClick={handleNotificationClick}
                  handleMarkAllAsRead={handleMarkAllAsRead}
                  handleAcceptInvitation={handleAcceptInvitation}
                  handleRejectInvitation={handleRejectInvitation}
                />
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'user'}`}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-blue-600 text-white">
                    {initials || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-gray-700">{user?.name || "User"}</span>
              </div>
            </div>
          </header>
          <main className="grow overflow-y-auto text-gray-800 bg-gray-50">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}