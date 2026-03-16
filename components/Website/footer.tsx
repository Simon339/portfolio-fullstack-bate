"use client"

import Image from "next/image"
import Link from "next/link"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const version = "v2.1"

  return (
    <footer className="py-6 backdrop-blur-md bg-black-100/75 border-t border-white/10">
      <div className="max-w-screen-xl mx-auto px-4">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">

          {/* Brand */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md">

            <Link href="/" className="flex items-center gap-3 mb-3 group">
              <Image
                src="/logo.png"
                alt="Logo"
                width={42}
                height={42}
                className="border border-yellow-200/70 rounded-full object-cover group-hover:scale-105 transition"
              />

              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Malesela's Portfolio
                </span>

                <p className="text-xs text-zinc-400">
                  Web Developer & Designer
                </p>
              </div>
            </Link>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Building the future of web experiences with passion, creativity,
              and modern technologies.
            </p>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-center lg:items-end gap-5">

            {/* Social Icons */}
            <div className="flex items-center gap-3">

              {[ 
                { icon: FacebookIcon, label: "Facebook" },
                { icon: InstagramIcon, label: "Instagram" },
                { icon: LinkedinIcon, label: "LinkedIn" },
                { icon: GithubIcon, label: "GitHub" }
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <Link
                    key={i}
                    href="#"
                    aria-label={item.label}
                    className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4 text-zinc-400 hover:text-blue-400 transition-colors" />
                  </Link>
                )
              })}

            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-xs text-zinc-400">

              <Link href="/privacy" className="hover:text-blue-400 transition">
                Privacy
              </Link>

              <span className="opacity-30">|</span>

              <Link href="/terms" className="hover:text-blue-400 transition">
                Terms
              </Link>

              <span className="opacity-30">|</span>

              <Link href="/contact" className="hover:text-blue-400 transition">
                Contact
              </Link>

              {/* Version Badge */}
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md">
                {version}
              </span>

            </div>

            {/* Copyright */}
            <p className="text-xs text-zinc-500 text-center lg:text-right">
              © {currentYear}{" "}
              <Link
                href="/"
                className="text-blue-400 hover:text-blue-300 transition"
              >
                Simon339 Inc.
              </Link>
              . All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  )
}