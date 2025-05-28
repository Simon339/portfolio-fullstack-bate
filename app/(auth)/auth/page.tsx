"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Signinform from "@/components/Auth/Signinform"
import Signupform from "@/components/Auth/Signupform"

const SignIn: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  return (
    <section className="flex items-center justify-center min-h-screen w-full bg-white px-4 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <header className="p-6 text-center">
            <h1 className="text-2xl font-medium text-gray-800">Welcome</h1>
            <p className="text-sm text-gray-500 mt-1">Continue to your account</p>
          </header>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-gray-100">
              <TabsTrigger
                value="signin"
                className="rounded-md data-[state=active]:bg-[#000B58] data-[state=active]:border-b-2 data-[state=active]:border-[#000B58] data-[state=active]:shadow-none py-3 text-sm font-[580]"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-md data-[state=active]:bg-[#000B58] hover:bg-[#000B58]/80] data-[state=active]:border-b-2 data-[state=active]:border-[#000B58] data-[state=active]:shadow-none py-3 text-sm font-[580]"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="signin" className="mt-0 pt-2">
                <Signinform />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 pt-2">
                <Signupform />
              </TabsContent>
            </div>
          </Tabs>

          <footer className="px-6 pb-6 pt-2 text-center">
            <p className="text-xs text-gray-400">
              &copy; {currentYear}{" "}
              <Link href="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                Simon339 Inc.
              </Link>
            </p>
          </footer>
        </CardContent>
      </Card>
    </section>
  )
}

export default SignIn
