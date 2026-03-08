"use client"

import { useEffect, useState } from "react"
import { ROUTES } from "@/data"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { usePathname } from "next/navigation"
import Mobnav from "./mobnav"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CircleUserRound, Home, LogOut, UserCog, ChevronDown } from "lucide-react"
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient } from "@/hooks/getcurrectuser"

interface UsersProps {
    name: string
    image: string
    email: string
}

export default function Header({ name, email, image }: UsersProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Use the authClient hook for session management
  const {
    data: session,
    isPending, // loading state
    error, // error object
    refetch, // refetch the session
  } = authClient.useSession()

  const handleLogout = async () => {
    try {
      // Use the authClient logout method
      await authClient.signOut()
      // Optionally refetch session to update UI
      refetch()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Show loading state only on initial load or when session is loading
  if (!mounted || (isPending && !session)) {
    return (
      <header className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 backdrop-blur-md bg-black-100/80 border-b border-white/10"
      )}>
        <nav className="container flex max-w-screen-xl mx-auto justify-between items-center px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="hidden lg:block w-32 h-4 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>

          <ul className="md:flex hidden items-center gap-5">
            {[1, 2, 3, 4].map(i => (
              <li key={i}>
                <div className="w-12 h-4 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded" />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <div className="w-20 h-8 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="md:hidden w-8 h-8 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 transition-all duration-300",
      scrolled
        ? "py-2 backdrop-blur-lg bg-black-100/90 border-b border-white/10"
        : "py-3 backdrop-blur-md bg-black-100/80"
    )}>
      <nav className="container flex max-w-screen-xl mx-auto justify-between items-center px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFEAC6]/20 to-[#FFF4B7]/40 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="border-[#FFF4B7] border rounded-full object-cover drop-shadow-md"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Malesela's
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Portfolio
            </span>
          </div>
        </Link>

        <ul className="md:flex hidden items-center gap-5 text-sm font-medium text-white">
          {ROUTES.map((route) => (
            <li key={route.id}>
              <Link
                href={route.path}
                className={cn(
                  "relative px-3 py-2 transition-all duration-200 group",
                  (pathname === route.path || pathname.startsWith(`${route.path}/`))
                    ? "text-[#FFEAC6] font-bold"
                    : "text-white/90 hover:text-[#FFF4B7]"
                )}
              >
                {route.name}
                <span className={cn(
                  "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-300",
                  (pathname === route.path || pathname.startsWith(`${route.path}/`))
                    ? "w-4 bg-[#FFF4B7]"
                    : "w-0 group-hover:w-4 bg-[#FFF4B7]/70"
                )} />
                <span className="absolute inset-0 bg-white/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger  className="ring-[#FFF4B7]/50" >
                <button
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFF4B7] ring-[#FFF4B7]/50"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-[#FFF4B7]">
                    <AvatarImage
                      src={ session.user.image || `https://api.dicebear.com/6.x/initials/svg?seed=${session.user.email}`}
                      alt={session.user.name || "User avatar"}
                    />
                     <AvatarFallback className="bg-blue-600 text-white">
                        {session.user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-white/60 transition-colors group-hover:text-[#FFF4B7]" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Profile Actions"
                variant="flat"
                className="bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-xl min-w-[220px] py-2"
                classNames={{
                  base: "rounded-xl"
                }}
              >
                <DropdownItem
                  key="profile"
                  className="h-12 px-4 py-3 cursor-default hover:bg-transparent"
                  textValue={`${session.user.name || "User"} - ${session.user.email}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-white font-semibold text-sm truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-white/50 text-xs truncate">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownItem>

                <DropdownSection aria-label="Navigation" className="border-t border-white/5 pt-2 mt-1">
                  <DropdownItem
                    key="dashboard"
                    href="/dashboard"
                    className="h-10 px-4 hover:bg-white/5 data-[hover=true]:bg-white/5"
                    startContent={
                      <Home className="w-4 h-4 text-[#FFF4B7]/80" />
                    }
                  >
                    <span className="text-white text-sm font-medium">Dashboard</span>
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    href="/dashboard/settings"
                    className="h-10 px-4 hover:bg-white/5 data-[hover=true]:bg-white/5"
                    startContent={
                      <UserCog className="w-4 h-4 text-[#FFF4B7]/80" />
                    }
                  >
                    <span className="text-white text-sm font-medium">Settings</span>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Account" className="border-t border-white/5 pt-2">
                  <DropdownItem
                    key="logout"
                    className="h-10 px-4 text-red-400 hover:bg-red-500/10 data-[hover=true]:bg-red-500/10"
                    onClick={handleLogout}
                    startContent={
                      <LogOut className="w-4 h-4" />
                    }
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/auth" className="no-underline">
              <Button
                className="bg-white/5 hover:bg-white/10 text-[#FFF4B7] border border-white/10 hover:border-[#FFF4B7]/40 rounded-lg text-sm px-4 h-9 transition-all active:scale-95 flex items-center gap-2"
                aria-label="Login"
              >
                <CircleUserRound className="w-4 h-4 transition-transform group-hover:scale-110" />
                Login
              </Button>
            </Link>
          )}

          <Mobnav />
        </div>
      </nav>
    </header>
  )
}