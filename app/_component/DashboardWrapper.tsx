/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import * as React from 'react'
import { Bell, LayoutDashboard, MailWarning, MessageCircleQuestion, CircleHelp, Search, Settings, Users, User2, ChevronUp, LogOut, HelpCircle, CircleUserRound } from 'lucide-react'
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import Footer from '@/components/Dashboard/Footer';
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Badge from '@mui/material/Badge';
import { Dropdown, DropdownMenu, DropdownSection, DropdownItem, DropdownTrigger } from '@heroui/react';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { countUnreadNotifications, getUnreadNotifications, markContactFormAsRead, } from '@/server/actions/notification';
import NotificationNavCard from '@/components/Dashboard/NotificationNavCard';
import { MdReport } from 'react-icons/md'
import { useCurrentUser } from '@/hooks/useCurrentuser';
import { logout } from '@/server/actions/logout';


export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();
  const pathname = usePathname();
  const iconClasses = "h-4 w-4 mr-2 pointer-events-none flex-shrink-0";

  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const limitedNotifications = unreadNotifications.slice(0, 3)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const notifications = await getUnreadNotifications();
    const count = await countUnreadNotifications();
    setUnreadNotifications(notifications);
    setUnreadNotificationsCount(count);
  };

  const handleMarkAsRead = async (id: number) => {
    await markContactFormAsRead(id);
    fetchNotifications();
  };


  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);


  const onClick = () => {
    logout();
  };

  const getInitials = (user: { name?: string, surname?: string }): string => {
    const initials = [
      user?.name?.split(' ')?.map(n => n[0]).join(''),
      user?.surname?.charAt(0) || ''
    ]
      .join('')
      .toUpperCase() || '';

    return initials;
  };

  const initials = getInitials(user);


  const navItems = [
    { id: 1, name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: 2, name: "Mails", icon: MailWarning, href: "/dashboard/mails" },
    { id: 3, name: "Surveys & Reviews", icon: MessageCircleQuestion, href: "/dashboard/surveys" },
    { id: 4, name: "Reports", icon: MdReport, href: "/dashboard/reports" },
  ];


  return (
    <SidebarProvider className="min-h-screen border-none">
      <div className="flex grow min-h-screen bg-gray-200 overflow-hidden">
        <Sidebar className="w-64 bg-zinc-100 shadow-lg border-none">
          <SidebarHeader className=''>
            <div className="flex items-center justify-center h-1">
              <span className="text-base font-bold text-gray-800">MS Portfolio</span>
            </div>
          </SidebarHeader>
          <SidebarContent className='mt-2'>
            <div className="flex flex-col items-center py-4">
              <Avatar className="w-24 text-white h-24 mb-2">
                <AvatarImage src={user?.image || `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`} alt={`${user?.name}`} />
                <AvatarFallback>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-medium text-gray-800">
                {`${user?.name}`}
              </h2>
              <p className="text-sm text-gray-600">
                {user?.email}
              </p>
            </div>
            <SidebarGroup className='mt-5 text-gray-700'>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className='text-gray-700'>
                  {navItems.map((route) => {
                    const isActive =
                      route.href === '/dashboard'
                        ? pathname === route.href
                        : pathname.startsWith(route.href);

                    return (
                      <SidebarMenuItem key={route.name}>
                        <SidebarMenuButton
                          asChild
                          className={`w-full justify-start py-2 px-4 rounded-lg transition-colors duration-200 
                          ${isActive ? 'bg-[#1E56A0] text-white' : 'hover:bg-[#34495E] hover:text-white'}`}
                        >
                          <a href={route.href}>
                            <route.icon />
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
          <SidebarFooter className='text-gray-800'>
            <SidebarMenu>
              <SidebarMenuItem>
                <Dropdown className='bg-[#0F1C2E] text-[#acc2ef] font-semibold'>
                  <DropdownTrigger>
                    <SidebarMenuButton>
                      <User2 /> {`${user?.name}`}
                      <ChevronUp className="ml-auto" />
                    </SidebarMenuButton>
                  </DropdownTrigger>
                  <DropdownMenu
                    variant="faded"
                    aria-label="Static Actions"
                    className='border-[#acc2ef]'
                  >
                    <DropdownSection title="Account & Support" showDivider>
                      <DropdownItem
                        key="account"
                        startContent={<CircleUserRound className={iconClasses} />}
                        description="Manage your account settings."

                      >
                        Account
                      </DropdownItem>
                      <DropdownItem
                        key="help"
                        startContent={<HelpCircle className={iconClasses} />}
                        description="Get help and access resources."
                      >
                        Help
                      </DropdownItem>
                    </DropdownSection>
                    <DropdownSection title="Log Out" showDivider>
                      <DropdownItem
                        key="logout"
                        color="danger"
                        startContent={<LogOut className={iconClasses} />}
                        description="Log out and end your session"
                        onClick={onClick}
                      >
                        Sign out
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-11 items-center backdrop-blur-md text-gray-800 font-semibold border-none justify-between p-4 border-b">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4 text-gray-800" />
              <div className="relative m-auto">
                <Search className="absolute left-2 top-1/2 sm:w-auto sm:h-auto h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 bg-gray-100 sm:w-auto"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge badgeContent={unreadNotificationsCount} color="primary" className='mt-4'>
                <Dropdown className='bg-gray-200 text-gray-800 font-semibold'>
                  <DropdownTrigger>
                    <Button variant="ghost" size="icon" className='bg-transparent border-none'>
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    variant="faded"
                    aria-label="Static Actions"
                    className='border-[#acc2ef] p-1'
                  >
                    <DropdownSection title="Notifications">
                      {unreadNotifications.length > 0 ? (
                        unreadNotifications.map((notification) => (
                          <DropdownItem key={notification.id} className='w-80 hover:border-[#acc2ef] hover:bg-[#0F1C2E] hover:text-[#acc2ef]'>
                            <NotificationNavCard {...notification} onRead={() => handleMarkAsRead(notification.id)} />
                          </DropdownItem>
                        ))
                      ) : (
                        <DropdownItem key={''}>
                          <p className="text-sm">No notifications available</p>
                        </DropdownItem>
                      )}
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </Badge>
              <span className="text-sm font-medium mt-2">Welcome, {user?.name}!</span>
            </div>
          </header>
          <main className="grow overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-[#788978] text-gray-800 p-3">
            {children}
            <ToasterProvider />
          </main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  )
}

function ToasterProvider() {

  return (
    <Toaster
      position="top-right"
    />
  );
}