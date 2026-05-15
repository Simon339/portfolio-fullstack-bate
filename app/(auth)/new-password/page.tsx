"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useTransition } from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { FormError } from "@/components/Auth/FormError"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { ResetPasswordSchema } from "@/types/vaildations/resetP"
import { PasswordStrengthIndicator } from "@/components/Auth/PasswordStrengthIndicator"
import { authClient } from "@/hooks/getcurrectuser"

const NewPassword: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const password = form.watch("password")

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    setError("")
    setSuccess("")

    startTransition(async () => {
      try {
        const result = await authClient.resetPassword({
          newPassword: values.password, 
          token: token || "",
        })

        if (result.error) {
          setError(result.error.message || "Failed to reset password")
          return
        }

        setSuccess("Password reset successfully!")
        setTimeout(() => {
          router.push("/auth")
        }, 2000)
        
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred")
      }
    })
  }

  return (
    <section className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
      <Card className="w-full max-w-md border border-gray-200/80 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95">
        <CardContent className="p-0">
          {/* Header with Logo and Back Button */}
          <div className="p-8 pb-6">
            <div className="mb-4">
              <Link
                href="/auth"
                className="inline-flex items-center text-sm text-gray-600 hover:text-[#000B58] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>

            <div className="text-center">
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
                Create New Password
              </h1>
              <p className="text-sm text-gray-600 mt-1.5">
                Please enter and confirm your new password
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 pb-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            disabled={isPending}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] bg-white pr-10 transition-colors"
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      {password && <PasswordStrengthIndicator password={password} />}
                      <FormMessage className="text-xs mt-1.5" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            disabled={isPending}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] bg-white pr-10 transition-colors"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs mt-1.5" />
                    </FormItem>
                  )}
                />

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button
                  disabled={isPending}
                  className="w-full bg-[#000B58] hover:bg-[#000B58]/90 text-white font-semibold h-12 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
                  type="submit"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link
                      href="/auth"
                      className="text-[#000B58] hover:text-[#000B58]/80 font-semibold transition-colors"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
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

export default NewPassword