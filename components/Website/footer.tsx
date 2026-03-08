"use client"

import Image from "next/image"
import Link from "next/link"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const version = "1.5"

  return (
    <footer className="py-4 backdrop-blur-md bg-black-100/75 border-t border-gray-800/30">
      <div className="container max-w-screen-xl  px-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          
          {/* Brand */}
          <div className="flex flex-col items-center lg:items-start">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="border-[#FFF4B7] border rounded-full object-cover"
              />
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Malesela's Portfolio
                </span>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Web Developer & Designer
                </p>
              </div>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center lg:text-left max-w-md">
              Building the future of web experiences with passion, creativity, and cutting-edge technology.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-[#1E90FF] transition-colors duration-200 p-1"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#1E90FF] transition-colors duration-200 p-1"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#1E90FF] transition-colors duration-200 p-1"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-[#1E90FF] transition-colors duration-200 p-1"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-center lg:text-right space-y-1">
              <div className="flex items-center justify-center lg:justify-end gap-2 text-xs text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-[#1E90FF] transition-colors duration-200"
                >
                  Privacy
                </Link>
                <div className="text-gray-600">•</div>
                <Link
                  href="/terms"
                  className="hover:text-[#1E90FF] transition-colors duration-200"
                >
                  Terms
                </Link>
                <div className="text-gray-600">•</div>
                <Link
                  href="/contact"
                  className="hover:text-[#1E90FF] transition-colors duration-200"
                >
                  Contact
                </Link>
                <div className="text-gray-600">•</div>
                <span className="relative hover:text-[#1E90FF] font-medium">
                  <span className="relative z-10">{version}</span>
                  <span className="absolute top-0 left-0 text-cyan-400 opacity-0 hover:opacity-0 animate-[electric2_1.7s_infinite_0.1s]">{version}</span>
                  <span className="absolute top-0 left-0 text-white opacity-0 hover:opacity-0 animate-[electric3_2.3s_infinite_0.3s]">{version}</span>
                </span>
              </div>

              <p className="text-xs text-gray-500">
                &copy; {currentYear}{" "}
                <Link
                  href="/"
                  className="text-[#1E90FF] hover:text-[#5cb0ff] transition-colors duration-200"
                >
                  Simon339 Inc.
                </Link>
                . All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}