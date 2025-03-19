'use client'

import Link from 'next/link';
import {  Loader2, FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useTransition } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from 'zod';
import { ResetPasswordAction } from '@/server/actions/reset';
import { FormError } from '@/components/Auth/FormError';
import { FormSuccess } from '@/components/Auth/FormSuccess';
import { ResetSchema } from '@/types/vaildations/resetP';


const PasswordRest: React.FC = () => {
    const currentYear = new Date().getFullYear()
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");
        form.reset();
        // console.log(values)
        startTransition(() => {
            ResetPasswordAction(values)
                .then((data) => {
                    setError(data?.error);
                    setSuccess(data?.success);
                });
        });

    };
    return (
        <section className="flex items-center justify-center min-h-screen  w-full bg-gradient-to-b from-gray-100 to-white px-4 py-12">
            <Card className="w-full max-w-md shadow-2xl bg-white rounded-xl ">
                <CardContent className="p-2">
                    <Header />

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Email
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                disabled={isPending}
                                                className="w-full px-3 py-2 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                placeholder="Enter your email"
                                                type="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormError message={error} />
                            <FormSuccess message={success} />

                            <div className="flex pr-3 items-center justify-between">
                                <Link href="/auth" className="text-sm text-gray-700 hover:text-blue-500">
                                Remember your password?
                                </Link>
                            </div>


                            <Button disabled={isPending} className="w-full bg-[#000B58] border-[#0179FE] font-semibold  rounded-md py-2 text-white transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                {isPending ? (
                                    <>
                                        <Loader2 size={20} className="mr-2 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Send Reset Link"
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
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Reset Password</h1>
        <p className="text-center text-gray-600 mb-6">Enter your email to receive a password reset link</p>
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

export default PasswordRest