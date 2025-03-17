"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "../ui/button"
import { Menu } from "lucide-react"
import { ROUTES } from "@/data"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function MobNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOpen(false)
  }, [pathname])

  // Prevent hydration errors
  if (!mounted) {
    return (
      <div className="md:hidden">
        <Button className="bg-transparent border-none hover:bg-transparent p-1 h-8 w-8">
          <div className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button className="bg-transparent border-none hover:bg-transparent p-1 h-8 w-8">
          <Menu className="text-white hover:text-[#FFF4B7]" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[250px] bg-black-200 text-white">
        <nav className="flex flex-col gap-4 mt-8">
          {ROUTES.map((route) => (
            <Link
              key={route.id}
              href={route.path}
              className={cn(
                "text-sm hover:text-[#FFF4B7]",
                (pathname === route.path || pathname.startsWith(`${route.path}/`)) && "text-[#FFEAC6] font-medium",
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

