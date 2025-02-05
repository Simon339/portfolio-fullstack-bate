
"use client"

import Link from "next/link"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Signinform from "@/components/Auth/Signinform"
import { useState } from "react"
import Signupform from "@/components/Auth/Signupform"

const SignIn: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  return (
    <section className="flex items-center justify-center min-h-screen  w-full bg-gradient-to-b from-gray-100 to-white px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl bg-white rounded-xl "> 
        <CardContent className="p-2">
          <Header />
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded">
              <TabsTrigger value="signin" className="rounded text-gray-700 font-medium data-[state=active]:bg-white data-[state=active]:text-gray-700">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded text-gray-700 font-medium data-[state=active]:bg-white data-[state=active]:text-gray-700">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <div className="p-2 bg-white rounded-b-xl">
              <TabsContent value="signin">
                <Signinform />
              </TabsContent>
              <TabsContent value="signup">
                <Signupform />
              </TabsContent>
            </div>
          </Tabs>
          <Footer currentYear={currentYear} />
        </CardContent>
      </Card>
    </section>
  )
}

const Header: React.FC = () => (
  <header className="p-6 bg-white rounded-t-xl">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome</h1>
    <p className="text-center text-gray-600 mb-6">Sign in to your account or create a new one</p>
  </header>
)

const Footer: React.FC<{ currentYear: number }> = ({ currentYear }) => (
  <footer className="mt-8 text-center">
    <nav className="mb-4 flex justify-center space-x-4">
      <SocialLink href="#" icon={FacebookIcon} label="Facebook" />
      <SocialLink href="#" icon={InstagramIcon} label="Instagram" />
      <SocialLink href="#" icon={LinkedinIcon} label="LinkedIn" />
      <SocialLink href="#" icon={GithubIcon} label="GitHub" />
    </nav>
    <p className="text-xs text-gray-500">
      &copy; {currentYear}{" "}
      <Link href="/" className="text-indigo-600 hover:underline">
        Simon339 Inc.
      </Link>{" "}
      All rights reserved.
    </p>
  </footer>
)

const SocialLink: React.FC<{ href: string; icon: React.ElementType; label: string }> = ({
  href,
  icon: Icon,
  label,
}) => (
  <Link
    href={href}
    className="text-gray-400 transition duration-200 ease-in-out hover:text-gray-600"
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
  </Link>
)

export default SignIn
