"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, EyeOff, Eye } from "lucide-react"
import { Form, FormField, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SignInForm, SignInSchema } from "@/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoginAccount } from "@/server/actions/authactions"

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
      
      const result = await LoginAccount(data);
      
      if (result.success) {
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
        })
        router.push("/dashboard")
      } else {
        toast.error("Sign in failed", {
          description: result.error || "Please check your credentials and try again.",
        })
      }
    } catch (error) {
      toast.error("Something went wrong", {
        description: "An unexpected error occurred. Please try again later.",
      })
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
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">Email Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  disabled={isLoading}
                  className="border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white transition-colors"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs mt-1.5" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                <Link
                  href="/reset"
                  className="text-xs text-[#000B58] hover:text-[#000B58]/80 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white pr-10 transition-colors"
                    {...field}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-xs mt-1.5" />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#000B58] hover:bg-[#000B58]/90 text-white font-semibold h-11 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth?tab=signup"
              className="text-[#000B58] hover:text-[#000B58]/80 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}

export default Signinform