"use client"

import { useEffect, useState } from "react"
import { ROUTES } from "@/data"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Mobnav from "./mobnav"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CircleUserRound, Home, LogOut, UserCog } from "lucide-react"
import { useSession } from "next-auth/react"
import { logout } from "@/server/actions/logout"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown"
import { Avatar } from "@heroui/avatar"
import { useCurrentUser } from "@/hooks/useCurrentuser"

export default function Header() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { data: session } = useSession()
  const user = useCurrentUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration errors by not rendering until mounted
  if (!mounted) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 py-2 backdrop-blur-md bg-black-100/75">
        <nav className="container flex max-w-screen-xl justify-between items-center">
          <div className="w-10 h-10" />
          <div className="hidden md:block">
            <div className="h-4" />
          </div>
          <div className="w-8 h-8" />
        </nav>
      </header>
    )
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 py-2 backdrop-blur-md bg-black-100/75">
      <nav className="container flex max-w-screen-xl justify-between items-center">
        <Link href={"/"}>
          <Image src="/logo.png" alt="Logo" width={40} height={40} />
        </Link>

        <ul className="md:flex hidden items-center gap-4 text-sm font-medium text-white">
          {ROUTES.map((route) => (
            <li key={route.id}>
              <Link
                href={route.path}
                className={cn(
                  "hover:text-[#FFF4B7]",
                  (pathname === route.path || pathname.startsWith(`${route.path}/`)) && "text-[#FFEAC6] font-bold",
                )}
              >
                {route.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center space-x-2">
          {session ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  isBordered
                  as="button"
                  className="transition-transform"
                  src={user?.image || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-12 gap-1">
                  <p className="text-sm">{user?.email}</p>
                </DropdownItem>
                <DropdownItem key="home" href="/dashboard">
                  <Home className="mr-2 h-4 text-[#FFF4B7]" /> Dashboard
                </DropdownItem>
                <DropdownItem key="settings" href="/dashboard/settings">
                  <UserCog className="mr-2 h-4 text-[#FFF4B7]" />
                  Settings
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4" />
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/auth">
              <Button className="hover:bg-[#000B58] text-[#FFF4B7] bg-transparent rounded-md text-sm">
                <CircleUserRound className="mr-2 h-4" />
                Login
              </Button>
            </Link>
          )}
        </div>

        <Mobnav />
      </nav>
    </header>
  )
}

