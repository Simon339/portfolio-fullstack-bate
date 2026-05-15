"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "../ui/button"
import { CircleUserRound, Menu, X, Home, UserCog, LogOut } from "lucide-react"
import { ROUTES } from "@/data"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Avatar } from "@heroui/react"
import { authClient } from "@/hooks/getcurrectuser"

export default function MobNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Use the authClient hook for session management
  const { 
    data: session, 
    isPending, // loading state
    error, // error object
    refetch, // refetch the session
  } = authClient.useSession()

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      refetch()
      setOpen(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  useEffect(() => {
    setMounted(true)
    setOpen(false)
  }, [pathname])

  // Prevent hydration errors
  if (!mounted || (isPending && !session)) {
    return (
      <div className="md:hidden">
        <Button className="bg-transparent border-none hover:bg-transparent p-1 h-8 w-8">
          <div className="h-5 w-5 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded" />
        </Button>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button className="bg-white/5 border border-white/10 hover:bg-white/10 p-1.5 h-8 w-8 rounded-md hover:border-[#FFF4B7]/30 transition-all">
          {open ? (
            <X className="text-white hover:text-[#FFF4B7] h-4 w-4" />
          ) : (
            <Menu className="text-white hover:text-[#FFF4B7] h-4 w-4" />
          )}
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent 
        side="left" 
        className="w-[260px] bg-black-100/95 backdrop-blur-xl border-r border-white/10 p-0"
      >
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="drop-shadow-lg"
            />
            <span className="text-white font-semibold text-sm">Malesela's Portfolio</span>
          </div>
        </div>
        
        {session?.user && (
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                isBordered
                size="sm"
                className="w-9 h-9"
                src={session.user.image || "/default-avatar.png"}
                name={session.user.name || session.user.email}
              />
              <div className="flex flex-col">
                <p className="text-white font-medium text-sm">
                  {session.user.name || "User"}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm text-white hover:bg-white/10"
              >
                <Home className="h-3.5 w-3.5 text-[#FFF4B7]" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm text-white hover:bg-white/10"
              >
                <UserCog className="h-3.5 w-3.5 text-[#FFF4B7]" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}
        
        <nav className="flex flex-col p-3">
          {ROUTES.map((route) => (
            <Link
              key={route.id}
              href={route.path}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-md transition-all text-sm",
                (pathname === route.path || pathname.startsWith(`${route.path}/`)) 
                  ? "text-[#FFEAC6] font-medium bg-white/5" 
                  : "text-white/90 hover:bg-white/10 hover:text-[#FFF4B7]"
              )}
            >
              <span className="flex items-center gap-2">
                {route.name}
                {(pathname === route.path || pathname.startsWith(`${route.path}/`))}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-0 border-t border-white/10">
          {session?.user ? (
            <Button
              onClick={handleLogout}
              className="w-full hover:bg-red-500/20 text-red-400 bg-white/5 text-xs px-3 h-8 rounded-none"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Logout
            </Button>
          ) : (
            <Link href="/auth" onClick={() => setOpen(false)}>
              <Button className="w-full hover:bg-[#000B58]/30 text-[#FFF4B7] bg-white/5 text-xs px-3 h-8 rounded-none">
                <CircleUserRound className="mr-1.5 h-3.5 w-3.5" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}