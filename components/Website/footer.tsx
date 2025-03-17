import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="py-4 backdrop-blur-md bg-black-100/75">
      <div className="container max-w-screen-lg">
        <p className="text-xs text-center text-muted-foreground">
          &copy; {currentYear}{" "}
          <Link href="/" className="text-[#1E90FF]">
            Simon339 Inc.
          </Link>{" "}
          All rights reserved.
        </p>
        <div className="flex justify-center space-x-4 py-2">
          <Link href="#" className="text-white hover:text-[#685189]">
            <FacebookIcon className="w-4 h-4" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="text-white hover:text-[#685189]">
            <InstagramIcon className="w-4 h-4" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-white hover:text-[#685189]">
            <LinkedinIcon className="w-4 h-4" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link href="#" className="text-white hover:text-[#685189]">
            <GithubIcon className="w-4 h-4" />
            <span className="sr-only">GitHub</span>
          </Link>
          <div className="bg-slate-500 text-black px-2 py-0.5 rounded-full text-xs font-medium">BETA</div>
        </div>
      </div>
    </footer>
  )
}

