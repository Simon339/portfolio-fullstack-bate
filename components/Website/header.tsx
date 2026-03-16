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

  const { data: session, isPending, refetch } = authClient.useSession()

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
          : "backdrop-blur-md bg-black-100/80"
      )}
    >
      <nav className="max-w-screen-xl mx-auto flex items-center justify-between px-4 lg:px-8 h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative transition group-hover:scale-110">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-200/20 to-yellow-100/40 blur-md opacity-60 group-hover:opacity-100 transition" />
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="border border-[#FFF4B7] rounded-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Malesela's
            </span>
            <p className="text-[11px] text-zinc-400 font-medium">
              Portfolio
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
          {ROUTES.map((route) => {
            const active =
              pathname === route.path ||
              pathname.startsWith(`${route.path}/`)

            return (
              <li key={route.id}>
                <Link
                  href={route.path}
                  className={cn(
                    "relative px-3 py-2 rounded-md transition",
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

        {/* Right section */}
        <div className="flex items-center gap-3">

          {session?.user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/5 transition">
                  <Avatar className="h-8 w-8 ring-1 ring-[#FFF4B7]/70">
                    <AvatarImage
                      src={
                        session.user.image ||
                        `https://api.dicebear.com/6.x/initials/svg?seed=${session.user.email}`
                      }
                    />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {session.user.name?.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>

                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>
              </DropdownTrigger>

              <DropdownMenu
                className="bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl min-w-[220px]"
              >
                <DropdownItem
                  key="profile"
                  className="cursor-default hover:bg-transparent"
                >
                  <div className="flex flex-col">
                    <p className="text-sm text-white font-semibold truncate">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownItem>

                <DropdownSection className="border-t border-white/5 pt-2">
                  <DropdownItem
                    key="dashboard"
                    href="/dashboard"
                    startContent={<Home className="w-4 h-4 text-yellow-200" />}
                  >
                    Dashboard
                  </DropdownItem>

                  <DropdownItem
                    key="settings"
                    href="/dashboard/settings"
                    startContent={<UserCog className="w-4 h-4 text-yellow-200" />}
                  >
                    Settings
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection className="border-t border-white/5 pt-2">
                  <DropdownItem
                    key="logout"
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/10"
                    startContent={<LogOut className="w-4 h-4" />}
                  >
                    Logout
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <Link href="/auth">
              <Button className="bg-white/5 hover:bg-white/10 border border-white/10 text-[#FFF4B7] rounded-lg px-4 h-9 text-sm transition active:scale-95">
                <CircleUserRound className="w-4 h-4 mr-1" />
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