"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Signinform from "@/components/Auth/Signinform"
import Signupform from "@/components/Auth/Signupform"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { authClient } from "@/hooks/getcurrectuser"

const SignIn: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    const data = await authClient.signIn.social({
      provider: provider,
    })
  }

  return (
    <section className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
      <Card className="w-full max-w-md border border-gray-200/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
        <CardContent className="p-0">
          {/* Header with Logo */}
          <div className="p-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center shadow-lg shadow-[#000B58]/10">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={38}
                  height={38}
                  className="rounded-lg"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600 mt-1.5">
              {activeTab === "signin"
                ? "Sign in to your account to continue"
                : "Create an account to get started"}
            </p>
          </div>

          {/* OAuth Buttons Section */}
          <div className="px-8 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                className="h-12 border border-[#000B58]/80 hover:border-[#000B58] bg-gray-50/90 hover:bg-gray-50/30 transition-all duration-200 rounded-lg font-medium text-gray-700 hover:text-[#000B58] hover:font-bold shadow-sm hover:shadow"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 262">
                  <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                  <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                  <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"></path>
                  <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                className="h-12 border border-[#000B58]/80 hover:border-[#000B58] bg-gray-50/90 hover:bg-gray-50/30 hover:text-[#000B58] hover:font-bold transition-all duration-200 rounded-lg font-medium text-gray-700 shadow-sm hover:shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="mr-2"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.60c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2" />
                </svg>
                GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full border-gray-300/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium tracking-wide">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Tabs for Sign In / Sign Up */}
          <div className="px-8">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-lg border border-gray-200/80 bg-gray-50/50">
                <TabsTrigger
                  value="signin"
                  className="relative rounded-md data-[state=active]:bg-white data-[state=active]:text-[#000B58] data-[state=active]:font-semibold data-[state=active]:shadow-sm py-3 text-sm font-medium transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="relative rounded-md data-[state=active]:bg-white data-[state=active]:text-[#000B58] data-[state=active]:font-semibold data-[state=active]:shadow-sm py-3 text-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <div className="pt-6 pb-4">
                <TabsContent value="signin" className="mt-0 space-y-4 animate-in fade-in duration-300">
                  <Signinform />
                  {/* <div className="text-center pt-2">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-[#000B58] hover:text-[#000B58]/80 transition-colors font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div> */}
                </TabsContent>
                <TabsContent value="signup" className="mt-0 animate-in fade-in duration-300">
                  <Signupform />
                </TabsContent>
              </div>
            </Tabs>

            {/* Terms and Footer */}
            <div className="pt-6 border-t border-gray-200/80">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-[#000B58] hover:text-[#000B58]/80 transition-colors font-semibold"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-[#000B58] hover:text-[#000B58]/80 transition-colors font-semibold"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-8 py-6 text-center bg-gray-50/40 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              &copy; {currentYear}{" "}
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors font-semibold"
              >
                Simon339 Inc.
              </Link>
              . All rights reserved.
            </p>
          </footer>
        </CardContent>
      </Card>
    </section>
  )
}

export default SignIn