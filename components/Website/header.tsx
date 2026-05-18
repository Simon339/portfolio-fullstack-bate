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

export default function Header() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { data: session, isPending, refetch } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut()
    refetch()
  }

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-xl bg-black-100/90 border-b border-white/10 shadow-lg"
          : "backdrop-blur-md bg-black-100/80 border-b border-white/10"
      )}
    >
      <nav className="w-full mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo - Left aligned */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative transition group-hover:scale-110">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-200/20 to-yellow-100/40 blur-md opacity-60 group-hover:opacity-100 transition" />
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                className="border border-[#FFF4B7] rounded-full object-cover w-8 h-8 sm:w-9 sm:h-9"
              />
            </div>

            <div className="leading-tight hidden sm:block">
              <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Malesela's
              </span>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-medium">
                Portfolio
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Center aligned on desktop, hidden on mobile */}
        <div className="hidden md:flex items-center justify-center flex-1 px-4">
          <ul className="flex items-center gap-1 lg:gap-2 xl:gap-6 text-sm font-medium">
            {ROUTES.map((route) => {
              const active =
                pathname === route.path ||
                pathname.startsWith(`${route.path}/`)

              return (
                <li key={route.id}>
                  <Link
                    href={route.path}
                    className={cn(
                      "relative px-2 lg:px-3 py-2 rounded-md transition whitespace-nowrap",
                      active
                        ? "text-[#FFF4B7]"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    {route.name}

                    {/* Active indicator */}
                    <span
                      className={cn(
                        "absolute left-1/2 -bottom-1 h-[2px] -translate-x-1/2 rounded-full bg-[#FFF4B7] transition-all",
                        active ? "w-4" : "w-0 group-hover:w-4"
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Right section - Auth buttons and mobile menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {session?.user ? (
            <div className="hidden md:block">
              <Dropdown
                placement="bottom-end"
                classNames={{
                  content: "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2",
                }}
              >
                <DropdownTrigger>
                  <button
                    className="flex items-center gap-1 sm:gap-2 rounded-lg p-1.5 hover:bg-white/5 transition-all duration-200 active:scale-95 group"
                    aria-label="User menu"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-[#FFF4B7]/50 group-hover:ring-[#FFF4B7]/80 transition-all duration-200">
                      <AvatarImage
                        src={
                          session.user.image ||
                          `https://api.dicebear.com/6.x/initials/svg?seed=${session.user.email}`
                        }
                        alt={session.user.name || "User avatar"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-medium text-xs">
                        {session.user.name?.slice(0, 2) || session.user.email?.slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/70 group-hover:text-white/90 transition-all duration-200 hidden sm:block group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownTrigger>

                <DropdownMenu
                  className="bg-[#000319] backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl min-w-[260px] overflow-hidden"
                  aria-label="User menu options"
                >
                  {/* User Info Section */}
                  <DropdownItem
                    key="profile"
                    className="cursor-default hover:bg-transparent opacity-100 px-4 py-3"
                    isReadOnly
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Avatar in dropdown */}
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-[#FFF4B7]/30">
                          <AvatarImage
                            src={
                              session.user.image ||
                              `https://api.dicebear.com/6.x/initials/svg?seed=${session.user.email}`
                            }
                            alt={session.user.name || "User avatar"}
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700">
                            {session.user.name?.slice(0, 2) || session.user.email?.slice(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Online status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-neutral-900" />
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-white font-semibold">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-white/60">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownItem>

                  {/* Navigation Section */}
                  <DropdownSection
                    className="border-t border-white/10 pt-2 mt-1"
                    aria-label="Navigation links"
                  >
                    <DropdownItem
                      key="dashboard"
                      href="/dashboard"
                      startContent={<Home className="w-4 h-4 text-[#FFF4B7]" />}
                      className="text-white/80 hover:text-white transition-all duration-200 data-[hover=true]:bg-white/10 data-[hover=true]:text-white"
                    >
                      Dashboard
                    </DropdownItem>

                    <DropdownItem
                      key="settings"
                      href="/dashboard/settings"
                      startContent={<UserCog className="w-4 h-4 text-[#FFF4B7]" />}
                      className="text-white/80 hover:text-white transition-all duration-200 data-[hover=true]:bg-white/10 data-[hover=true]:text-white"
                    >
                      Settings
                    </DropdownItem>
                  </DropdownSection>

                  {/* Danger Section */}
                  <DropdownSection
                    className="border-t border-white/10 pt-2 mt-1"
                    aria-label="Account actions"
                  >
                    <DropdownItem
                      key="logout"
                      onClick={handleLogout}
                      className="text-red-400 hover:text-red-300 transition-all duration-200 data-[hover=true]:bg-red-500/10"
                      startContent={<LogOut className="w-4 h-4" />}
                    >
                      Logout
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            </div>
          ) : (
            // Login button - visible on tablet and desktop
            <Link href="/auth" className="hidden md:block">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-[#FFF4B7] rounded-lg px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm transition active:scale-95 whitespace-nowrap">
                <CircleUserRound className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Login
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Mobnav />
          </div>
        </div>
      </nav>
    </header>
  )
}