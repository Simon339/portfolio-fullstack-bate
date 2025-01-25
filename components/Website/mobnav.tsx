import React from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { ROUTES } from "@/data";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MobNav() {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(!open);
    React.useEffect(() => {
        setOpen(false);
    }, [pathname]);

    

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden" onClick={handleOpen}>
                <Button className="bg-transparent border hover:text-[#FFF4B7] text-white font-bold border-full hover:bg-transparent ">
                    <Menu className="text-white font-bold hover:text-[#FFF4B7]"/>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-black-200 text-white backdrop-blur-md">
                <div className="max-w-sm mx-auto w-full mb-3">
                    <SheetHeader className="list-none  sm:space-y-2">
                        <SheetTitle>
                            <VisuallyHidden>Navigation Menu</VisuallyHidden> 
                            </SheetTitle>
                            <nav className="flex flex-col gap-4">
                                {ROUTES.map((route) => {
                            return (
                                <li key={route.id} className="hover:text-[#bda873] font-bold">
                                    <Link
                                        href={route.path}
                                        className={cn(
                                            "hover:text-[#a2790d] ",
                                             (pathname === route.path || pathname.startsWith(`${route.path}/`)) && "text-[#FFEAC6] font-bold"
                                        )}
                                    >
                                        {route.name}
                                    </Link>
                                </li>
                            );
                        })}
                            </nav>
                        
                    </SheetHeader>
                </div>
            </SheetContent>
        </Sheet>
    );
}
