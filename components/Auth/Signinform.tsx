"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, EyeOff, Eye } from "lucide-react"
import { Form, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SignInForm, SignInSchema } from "@/types"
import Link from "next/link"
import { LoginAccount } from "@/server/actions/login"
import { useRouter } from "next/navigation"

const Signinform = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignInForm) => {
    try {
      setIsLoading(true)
      const result = await LoginAccount(data)

      if (result.success) {
        toast.success("Sign in successful")
        if (result.redirectTo) {
          router.push(result.redirectTo)
        } else {
          router.push("/dashboard")
        }
      } else if (result.error) {
        if (result.verificationRequired) {
          toast.error("Please verify your email before logging in.")
        } else if (result.accountDeletionRequested) {
          toast.error(
            "This account has been scheduled for deletion. Please contact support if you wish to cancel the deletion request.",
          )
        } else {
          toast.error(result.error || "Sign in failed")
        }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <div>
              <FormControl>
                <Input
                  placeholder="Email"
                  type="email"
                  disabled={isLoading}
                  className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs mt-1" />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <div>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs mt-1" />
            </div>
          )}
        />

        <div className="flex justify-end">
          <Link href="/reset" className="text-xs text-gray-500 hover:text-gray-800 transition-colors">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#000B58] hover:bg-[#000B58]/80 text-white font-medium h-11 rounded-md transition-colors"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Sign In"}
        </Button>
      </form>
    </Form>
  )
}

export default Signinform
