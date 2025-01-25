
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Footer ()  {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-6 bg-black-100">
      <div className="container max-w-screen-lg">
        <p className="text-xs text-center mt-8 md:order-1 md:mt-0 text-muted-foreground">&copy; {currentYear} <Link href='/' className='text-[#1E90FF]'>Simon339 Inc.</Link>  All rights reserved.</p>
        <nav className="flex justify-center space-x-6 md:order-2 py-3">
          <Link href="#" className="text-xs text-white hover:underline hover:bg-[#685189] rounded underline-offset-4" >
            <FacebookIcon className="w-4 h-4 mr-1 inline-block" />
          </Link>
          <Link href="#" className="text-xs text-white hover:underline hover:bg-[#685189] rounded underline-offset-4">
            <InstagramIcon className="w-4 h-4 mr-1 inline-block" />
          </Link>
          <Link href="#" className="text-xs text-white hover:underline hover:bg-[#685189] rounded underline-offset-4">
            <LinkedinIcon className="w-4 h-4 mr-1 inline-block" />
          </Link>
          <Link href="" className="text-xs text-white hover:underline hover:bg-[#685189] rounded underline-offset-4">
            <GithubIcon  className="w-4 h-4 mr-1 inline-block" />
          </Link>
          <div className="bg-slate-500 text-black px-2 py-1 rounded-full text-xs font-semibold">BETA</div>
        </nav>
        
      </div>
    </footer>
  )
}
