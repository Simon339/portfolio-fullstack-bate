
'use client'

import { useEffect, useState } from 'react'
import { ROUTES } from '@/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Mobnav from './mobnav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CircleUserRound, Home, LogOut, UserCog } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { logout } from '@/server/actions/logout';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, } from '@heroui/dropdown';
import { Avatar } from "@heroui/avatar";
import { useCurrentUser } from '@/hooks/useCurrentuser';


export default function Header() {
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    const user = useCurrentUser();
    useEffect(() => {
        if (user) {
          setLoading(false);
        }
      }, [user]);
    const onClick = () => {
        logout();
    }

    return (
        <header className='fixed inset-x-0 top-0 z-50 py-2 backdrop-blur-md bg-black-100/75'>
            <nav className='container flex max-w-screen-xl justify-between items-center'>
                <Link href={'/'}>
                    <div>
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={45}
                            height={45}
                        />
                    </div>
                </Link>

                <ul className='md:flex hidden items-center gap-6 text-sm font-light text-muted-foreground'>
                    {ROUTES.map((route) => (
                        <li key={route.id} className="hover:text-[#FFF4B7] text-white/100 font-bold transition-colors">
                            <Link
                                href={route.path}
                                className={cn(
                                    "hover:text-[#FFF4B7]",
                                     (pathname === route.path || pathname.startsWith(`${route.path}/`)) && "text-[#FFEAC6] font-bold"
                                )}
                            >
                                {route.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className='flex items-center rounded-md p-1 space-x-4'>

                    {session ? (
                        <div className='flex items-center'>
                            <Dropdown placement="bottom-end">
                                <DropdownTrigger>
                                    <Avatar
                                        isBordered
                                        as="button"
                                        className="transition-transform"
                                        src={user?.image || 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'}
                                    />
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Profile Actions" variant="flat">
                                    <DropdownItem key="profile" className="h-14 gap-2">
                                        <p className="font-semibold">Signed in as</p>
                                        <p className="font-semibold">{user?.email}</p>
                                    </DropdownItem>
                                    <DropdownItem key="home" href="/dashboard">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Home className="mr-2 h-6 text-[#FFF4B7]" /> Dashboard
                                        </Button>
                                    </DropdownItem>

                                    <DropdownItem key="settings" href='/dashboard/settings'>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <UserCog className="mr-2 h-6 text-[#FFF4B7]" />My Settings
                                        </Button>
                                    </DropdownItem>

                                    <DropdownItem key="logout" color="danger">
                                        <Button
                                            variant="ghost"
                                            className='text-danger font-bold w-full hover:text-white  border-none bg-transparent hover:bg-danger'
                                            onClick={onClick}
                                        >
                                            <LogOut className="mr-2 h-6 text-danger" />
                                            Logout
                                        </Button>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>

                        </div>
                    ) : (
                        
                        <Link href='/auth'>
                            <Button className='hover:bg-[#000B58] text-[#FFF4B7] font-bold bg-transparent rounded-md'>

                                <CircleUserRound className="mr-2 h-16 text-[#FFF4B7] font-semibold hover:text-white" />

                                Login
                            </Button>
                        </Link>
                    )}
                </div>

                <Mobnav />
            </nav>
        </header>
    );
}