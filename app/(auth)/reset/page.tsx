'use client'

import Link from 'next/link';
import { Loader2, ArrowLeft } from "lucide-react"
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
import { FormError } from '@/components/Auth/FormError';
import { FormSuccess } from '@/components/Auth/FormSuccess';
import { ResetSchema } from '@/types/vaildations/resetP';
import { toast } from 'sonner';
import { authClient } from '@/hooks/getcurrectuser';
import Image from 'next/image';

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

    async function onSubmit(values: z.infer<typeof ResetSchema>) {
        setError("");
        setSuccess("");
        
        startTransition(() => {
            (async () => {
                const { error } = await authClient.requestPasswordReset({
                    email: values.email,
                    redirectTo: "/auth",
                });

                if (error) {
                    setError(error.message);
                    toast.error(error.message);
                } else {
                    const successMessage = "Password reset email sent. Please check your inbox.";
                    setSuccess(successMessage);
                    toast.success(successMessage);
                    form.reset();
                }
            })();
        });
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
                                Reset Password
                            </h1>
                            <p className="text-sm text-gray-600 mt-1.5">
                                Enter your email to receive a password reset link
                            </p>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="px-8 pb-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={isPending}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] bg-white transition-colors"
                                                    placeholder="you@example.com"
                                                    type="email"
                                                />
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
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
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

export default PasswordRest