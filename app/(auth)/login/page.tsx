/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import { Form, FormField, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SignInSchema, type SignInForm } from "@/types/index"
import { signIn } from "@/lib/auth/login"

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const currentYear = new Date().getFullYear()

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
      const result = await signIn(data)

      if (result.success) {
        toast.success("Sign in successful")
        router.push("/dashboard")
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
    <section className="flex-center min-h-screen w-full bg-gradient-to-b from-gray-100 to-white px-4 py-12">
      <div className="auth-form w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Header />
        <AvatarSection />
        <SignInForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        <Footer currentYear={currentYear} />
      </div>
    </section>
  )
}

const Header: React.FC = () => (
  <header className="mb-8 flex flex-col gap-5">
    <Link href="/" className="flex cursor-pointer items-center gap-2">
      <Image src="/logo.png" width={34} height={34} alt="logo" className="rounded-full" />
      <h1 className="font-ibm-plex-serif text-2xl font-bold text-gray-900">MS Portfolio</h1>
    </Link>
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-semibold text-gray-800">Sign In</h2>
      <p className="text-sm text-gray-600">Welcome back! Please enter your credentials to continue.</p>
    </div>
  </header>
)

const AvatarSection: React.FC = () => (
  <div className="mb-6 flex flex-col items-center">
    <Avatar className="h-24 w-24">
      <AvatarImage src="/assets/placeholder.png" alt="User Avatar" />
      <AvatarFallback>User</AvatarFallback>
    </Avatar>
  </div>
)

const SignInForm: React.FC<{
  form: any
  onSubmit: (data: SignInForm) => Promise<void>
  isLoading: boolean
}> = ({ form, onSubmit, isLoading }) => (
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
              <Input
                placeholder="Enter your password"
                type="password"
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                {...field}
              />
            </FormControl>
            <FormMessage className="mt-1 text-xs text-red-500" />
          </div>
        )}
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-indigo-600 py-2 text-white transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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

