"use client";

import type * as React from "react";
import {
  Bell,
  LayoutDashboard,
  MailWarning,
  MessageCircleQuestion,
  CircleHelp,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Footer from "@/components/Dashboard/Footer";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@mui/material/Badge";
import { useState, useEffect } from "react";
import { countUnreadNotifications } from "@/server/actions/notification";
import { MdReport } from "react-icons/md";
import { useCurrentUser } from "@/hooks/useCurrentuser";
import { logout } from "@/server/actions/logout";
import SearchInput from "@/components/Dashboard/SearchInput";

interface User {
  name?: string;
  surname?: string;
  image?: string;
  email?: string;
}


export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const user = useCurrentUser() as User | null;
  const pathname = usePathname();

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);
  
  const fetchNotifications = async () => {
    try {
      const count = await countUnreadNotifications();
      setUnreadNotificationsCount(count);
    } catch {
      throw new Error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  const getInitials = (name?: string, surname?: string): string => {
    if (!name || !surname) return "N/A";
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const initials = user ? getInitials(user?.name, user?.surname) : "N/A";

  const navItems = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: 2, name: "Users", icon: Users, href: "/dashboard/users" },
    { id: 3, name: "Mails", icon: MailWarning, href: "/dashboard/mails" },
    { id: 4, name: "Surveys", icon: MessageCircleQuestion, href: "/dashboard/surveys" },
    { id: 5, name: "Projects", icon: PiProjectorScreenChartDuotone, href: "/dashboard/projects" },
    { id: 6, name: "Manage", icon: MdReport, href: "/dashboard/manage" },
    { id: 7, name: "Settings", icon: Settings, href: "/dashboard/settings" },
    { id: 8, name: "Help", icon: CircleHelp, href: "/dashboard/help" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-5 h-5 border-t border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <SidebarProvider className="min-h-screen bg-white">
      <div className="flex grow min-h-screen text-gray-800 bg-gray-200 overflow-hidden">
        <Sidebar className="w-64 bg-white shadow-sm border-r border-[#acc2ef]">
          <SidebarHeader className="bg-white">
            <div className="flex items-center justify-center h-12 bg-white">
              <span className="text-sm font-medium text-gray-800">MS Portfolio</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="mt-2 bg-white">
            <div className="flex flex-col items-center py-4">
              <Avatar className="w-24 text-white h-24 mb-2">
                <AvatarImage
                  src={user?.image || `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`}
                  alt={`${user?.name || "User"}`}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <h2 className="text-sm font-medium text-gray-800">{`${user?.name || "User"}`}</h2>
              <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
            </div>
            <SidebarGroup className="mt-4 text-gray-700 bg-white">
              <SidebarGroupContent className="bg-white">
                <SidebarMenu className="text-gray-700 bg-white">
                  {navItems.map((route) => {
                    const isActive =
                      route.href === "/dashboard" ? pathname === route.href : pathname.startsWith(route.href);

                    return (
                      <SidebarMenuItem key={route.name}>
                        <SidebarMenuButton
                          asChild
                          className={`w-full justify-start py-2 px-4 rounded-lg transition-colors duration-200 
                            ${isActive ? "bg-[#1E56A0] text-white" : "hover:bg-[#34495E] hover:text-white"}`}
                        >
                          <a href={route.href}>
                            <route.icon className="h-4 w-4 mr-2" />
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
          <SidebarFooter className="text-gray-800 bg-white">
            <SidebarMenu>
              <SidebarMenuItem>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-12 items-center bg-white text-gray-800 border-b border-[#acc2ef] justify-between px-4">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 text-gray-500" />
              <div className="relative hidden sm:block">
                <SearchInput />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge badgeContent={unreadNotificationsCount} color="info">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bell className="h-4 w-4 text-gray-500" />
                </Button>
              </Badge>
              <span className="text-xs font-medium">{user?.name || "User"}</span>
            </div>
          </header>
          <main className="grow overflow-y-auto text-gray-800 bg-gray-200 p-4">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}