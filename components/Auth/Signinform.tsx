"use client";

import React, { useState } from 'react';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, EyeOff, Eye } from "lucide-react"
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SignInForm, SignInSchema } from '@/types';
import Link from 'next/link';
import { LoginAccount } from '@/server/actions/login';


const Signinform = () => {
  const [isLoading, setIsLoading] = useState(false)

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
      } else {
        toast.error(result.error || "Sign in failed")
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <div>
            <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your email"
                type="email"
                disabled={isLoading}
                className="w-full px-3 py-2 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...field}
              />
            </FormControl>
            <FormMessage className="mt-1 text-xs text-red-500" />
          </div>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <div>
            <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
            <FormControl>
              <div className="relative">
              <Input
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                className="w-full px-3 py-2 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...field}
              /> <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
            </FormControl>
            <FormMessage className="mt-1 text-xs text-red-500" />
          </div>
        )}
      />

      <div className="flex items-center justify-between">
        <Link href="/reset" className="text-sm text-gray-700 hover:text-blue-500">
          Forgot your password?
        </Link><div className="flex items-end">
        <Link href="/new-verification" className="text-sm text-gray-700 hover:text-blue-500">
          Can&apos;t Login?
        </Link>
      </div>
      </div>

      

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#000B58] border-[#0179FE] font-semibold  rounded-md py-2 text-white transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  </Form>
  )
}

export default Signinform
