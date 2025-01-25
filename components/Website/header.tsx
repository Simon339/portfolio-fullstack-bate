'use client'

import { useState } from 'react'
import { ROUTES } from '@/data';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Mobnav from './mobnav';
import Link from 'next/link';


export default function Header() {
    const pathname = usePathname();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(true);

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

                <div ></div>
               
                <Mobnav />
            </nav>
        </header>
    );
}


/*
  https://www.youtube.com/watch?v=0QPXqRifh-c

  https://github.com/hqasmei/youtube-tutorials/blob/main/collapsible-side-nav/src/app/header.tsx

*/