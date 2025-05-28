/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useForm } from "react-hook-form"
import { useState } from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SignUpSchema } from "@/types/vaildations/register"
import { register } from "@/server/actions/register"

const Signupform = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      password: "",
      surname: "",
      name: "",
      phone: "",
      email: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
    setIsLoading(true)
    register(data).then((res) => {
      if (res.error) {
        setError(res.error)
        setIsLoading(false)
      }
      if (res.success) {
        setSuccess(res.success)
        setIsLoading(false)
      }
      form.reset()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="First name"
                    type="text"
                    {...field}
                    className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1" />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <div>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Last name"
                    type="text"
                    {...field}
                    className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1" />
              </div>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <div>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Email"
                  type="email"
                  {...field}
                  className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
                />
              </FormControl>
              <FormMessage className="text-xs mt-1" />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <div>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Phone number"
                  type="tel"
                  {...field}
                  className="border-gray-200 focus:border-gray-400 rounded-md h-11 bg-gray-50 focus:ring-0 focus:ring-offset-0"
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
              <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    field.value.length === 0
                      ? "w-0"
                      : field.value.length < 6
                        ? "w-1/4 bg-red-400"
                        : field.value.length < 8
                          ? "w-1/2 bg-yellow-400"
                          : "w-full bg-green-400"
                  }`}
                />
              </div>
              <FormMessage className="text-xs mt-1" />
            </div>
          )}
        />

        <Button
          disabled={isLoading}
          className="w-full bg-[#000B58] hover:bg-[#000B58]/80 text-white font-medium h-11 rounded-md transition-colors mt-2"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Create Account"}
        </Button>
      </form>
    </Form>
  )
}

export default Signupform
