"use client"
import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SignUpSchema } from "@/types/vaildations/register"
import { authClient } from "@/hooks/getcurrectuser"
import { toast } from "sonner"

interface SignupformProps {
  setActiveTab?: (tab: "signin" | "signup") => void
}

const Signupform = ({ setActiveTab }: SignupformProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    color: "bg-gray-200",
    text: "",
    isStrong: false
  })
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(true)

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      password: "",
      name: "",
      email: "",
    },
    mode: "onChange",
  })

  const password = form.watch("password")
  const isFormValid = form.formState.isValid

  useEffect(() => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        color: "bg-gray-200",
        text: "",
        isStrong: false
      })
      setShowPasswordRequirements(true)
      return
    }

    let score = 0
    const hasLowercase = /[a-z]/.test(password)
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    if (hasLowercase) score++
    if (hasUppercase) score++
    if (hasNumbers) score++
    if (hasSpecial) score++
    if (isLongEnough) score++

    let color = "bg-red-500"
    let text = "Very weak"
    let isStrong = false

    if (score >= 4) {
      color = "bg-green-500"
      text = "Strong"
      isStrong = true
      setShowPasswordRequirements(false)
    } else if (score >= 3) {
      color = "bg-yellow-500"
      text = "Moderate"
      setShowPasswordRequirements(true)
    } else if (score >= 2) {
      color = "bg-orange-500"
      text = "Weak"
      setShowPasswordRequirements(true)
    } else if (score >= 1) {
      text = "Very weak"
      setShowPasswordRequirements(true)
    }

    setPasswordStrength({
      score,
      color,
      text,
      isStrong
    })
  }, [password])

  const onSubmit = async (value: z.infer<typeof SignUpSchema>) => {
    setIsLoading(true)

    try {
      // const { data, error } = await authClient.signUp.email({
      //   email: value.email,
      //   password: value.password,
      //   name: value.name,
      //   image: `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(value.name)}` 
      // })

      // if (error) {
      //   toast.error(error.message ||  "An unexpected error occurred. Please try again.")
      // } else if (data) {
      //   form.reset()
      //   toast.success("Account created successfully! Please verify your email.")
      //   setTimeout(() => {
      //     setActiveTab?.("signin")
      //   }, 3000)
      // }

      form.reset()
      toast.info("Feature Not Available", {
        description: "Please Contact the Admin to Create Account for yourself.",
      })
      setTimeout(() => {
        setActiveTab?.("signin")
      }, 3000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      toast.error(errorMessage)
      form.reset()
    } finally {
      setIsLoading(false)
    }
}
  
  const passwordRequirements = [
    { label: "At least 8 characters", check: password.length >= 8 },
    { label: "Contains lowercase letter", check: /[a-z]/.test(password) },
    { label: "Contains uppercase letter", check: /[A-Z]/.test(password) },
    { label: "Contains number", check: /\d/.test(password) },
    { label: "Contains special character", check: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  return (
    <div className="space-y-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
           <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="John"
                      type="text"
                      autoComplete="given-name"
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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address <span className="text-red-500">*</span>
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
                  Password <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Create a strong password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isLoading}
                      aria-invalid={!!fieldState.error}
                      className={`border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white pr-10 ${
                        fieldState.error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                      {...field}
                      onFocus={() => {
                        if (!passwordStrength.isStrong) {
                          setShowPasswordRequirements(true)
                        }
                      }}
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

                {password && showPasswordRequirements && (
                  <div className="mt-3 space-y-2 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Password strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-600' :
                        passwordStrength.score >= 3 ? 'text-yellow-600' :
                        passwordStrength.score >= 2 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {req.check ? (
                            <CheckCircle size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <XCircle size={14} className="text-gray-300 shrink-0" />
                          )}
                          <span className={`text-xs ${req.check ? 'text-gray-600' : 'text-gray-400'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {password && !showPasswordRequirements && passwordStrength.isStrong && (
                  <div className="mt-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Password strength</span>
                      <span className="text-xs font-medium text-green-600">
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      <span className="text-xs text-gray-600">Password meets all requirements</span>
                    </div>
                  </div>
                )}
                <FormMessage className="text-xs mt-1.5 text-red-600" />
              </FormItem>
            )}
          />

          <div className="pt-3">
            <Button
              disabled={isLoading || !isFormValid || !passwordStrength.isStrong}
              className="w-full bg-[#000B58] hover:bg-[#000B58]/90 disabled:bg-gray-400 text-white font-semibold h-11 rounded-lg transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#000B58]/50 focus:ring-offset-2"
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setActiveTab?.("signin")}
            className="text-[#000B58] hover:text-[#000B58]/80 font-semibold transition-colors focus:outline-none focus:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signupform
