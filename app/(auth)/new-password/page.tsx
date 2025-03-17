"use client"

import Link from "next/link"
import { Loader2, FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon, Eye, EyeOff } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useTransition } from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { NewPasswordAction } from "@/server/actions/reset"
import { FormError } from "@/components/Auth/FormError"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { ResetPasswordSchema } from "@/types/vaildations/resetP"

const NewPassword: React.FC = () => {
    const currentYear = new Date().getFullYear()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | undefined>("")
    const [success, setSuccess] = useState<string | undefined>("")
    const [isPending, startTransition] = useTransition()
     const router = useRouter();

    const form = useForm<z.infer<typeof ResetPasswordSchema>>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
        setError("")
        setSuccess("")
        startTransition(() => {
            NewPasswordAction(values, token).then((data) => {
                setError(data?.error)
                setSuccess(data?.success)
                if (data?.success) {
                    router.push('/auth');
                }
            })
        })
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <section className="flex items-center justify-center min-h-screen w-full bg-gradient-to-b from-gray-100 to-white px-4 py-12">
            <Card className="w-full max-w-md shadow-2xl bg-white rounded-xl">
                <CardContent className="p-2">
                    <Header />
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    disabled={isPending}
                                                    className="w-full px-3 py-2 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={toggleShowPassword}
                                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    id="confirmPassword"
                                                    type={showPassword ? "text" : "password"}
                                                    {...field}
                                                    disabled={isPending}
                                                    className="w-full px-3 py-2 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={toggleShowPassword}
                                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center justify-between">
                                <Link href="/auth" className="text-sm text-gray-700 hover:text-blue-500">
                                    Login
                                </Link>
                            </div>

                            <FormError message={error} />
                            <FormSuccess message={success} />
                            <Button
                                disabled={isPending}
                                className="w-full bg-[#000B58] border-[#0179FE] font-semibold rounded-md py-2 text-white transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                type="submit"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 size={20} className="mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Create Password"
                                )}
                            </Button>
                        </form>
                    </Form>

                    <Footer currentYear={currentYear} />
                </CardContent>
            </Card>
        </section>
    )
}

const Header: React.FC = () => (
    <header className="p-6 bg-white rounded-t-xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Create New Password</h1>
        <p className="text-center text-gray-600 mb-6">Please enter and confirm your new password</p>
    </header>
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

export default NewPassword

