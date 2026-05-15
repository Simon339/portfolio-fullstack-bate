"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, EyeOff, Eye, AlertCircle, Mail, Lock } from "lucide-react"
import { Form, FormField, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SignInForm, SignInSchema } from "@/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/hooks/getcurrectuser"
import { motion, AnimatePresence } from "framer-motion"

interface SigninformProps {
  setActiveTab?: (tab: "signin" | "signup") => void
}

const Signinform = ({ setActiveTab }: SigninformProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  const { isDirty, isValid } = form.formState

  useEffect(() => {
    const subscription = form.watch(() => {
      if (submitError) setSubmitError(null)
    })
    return () => subscription.unsubscribe()
  }, [form, submitError])

  const onSubmit = async (values: SignInForm) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
      })
      
      if (!error) {
        toast.success("Welcome back!", {
          description: "You have successfully signed in.",
          duration: 3000,
        })
        router.push("/dashboard")
        router.refresh()
        form.reset()
      } else {
        toast.error("Invalid email or password. Please try again.")
        form.setFocus("email")
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.")
      form.reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {submitError && (
            <motion.div
              className="p-3 bg-red-50 border border-red-200 rounded-lg shadow-sm"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              role="alert"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 leading-snug">{submitError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="you@example.com"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!fieldState.error}
                    className={`border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white ${
                      fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1.5 text-red-600" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="•••••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      className={`border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white pr-10 ${
                        fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                    </button>
                  </div>
                </FormControl>

                <FormMessage className="text-xs mt-1.5 text-red-600" />
              </FormItem>
            )}
          />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading || !isDirty || !isValid}
            className="w-full bg-[#000B58] hover:bg-[#000B58]/90 hover:shadow-lg disabled:bg-gray-300 text-white font-semibold h-11 rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#000B58]/50 focus:ring-offset-2"
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
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => setActiveTab?.("signup")}
              className="text-[#000B58] hover:text-[#000B58]/80 font-semibold transition-colors focus:outline-none focus:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </Form>
  )
}

export default Signinform
