/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Form, FormField, FormLabel, FormControl, FormMessage, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SignUpSchema } from "@/types/vaildations/register";
import { register } from "@/server/actions/register";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

const countries = [
    { code: "US", dialCode: "+1", flag: "🇺🇸" },
    { code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { code: "JP", dialCode: "+81", flag: "🇯🇵" },
    { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
]

const Signupform = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            password: "",
            surname: "",
            name: "",
            phone: "",
            email: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof SignUpSchema>) => {
        setIsLoading(true);
        register(data).then((res) => {
            if (res.error) {
                setError(res.error)
                setIsLoading(false)
            }
            if (res.success) {
                setSuccess(res.success)
                setIsLoading(false)
            }
            form.reset();
        })
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Name and Surname Fields */}
                <div className="flex relative">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <div className="pe-3 w-full">
                            <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading} placeholder="Enter your Names" type="text" {...field} className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </FormControl>
                            <FormMessage className="form-message mt-2" />
                        </div>
                    )} />
                    <FormField control={form.control} name="surname" render={({ field }) => (
                        <div className=" w-full">
                            <FormLabel className="text-sm font-medium text-gray-700 ">Surname</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading} placeholder="Enter your surname" type="text" {...field} className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </FormControl>
                            <FormMessage className="form-message mt-2" />
                        </div>
                    )} />
                </div>

                {/* Email, Phone Number, and Password Fields */}
                <FormField control={form.control} name="email" render={({ field }) => (
                    <div className="">
                        <FormLabel className="text-sm font-medium text-gray-700 ">Email</FormLabel>
                        <FormControl>
                            <Input disabled={isLoading} placeholder="Enter your email" type="email" {...field} className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </FormControl>
                        <FormMessage className="form-message mt-2" />
                    </div>
                )} />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <div className="">
                                    <FormLabel className="text-sm font-medium text-gray-700 ">Country</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                                            <SelectTrigger className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                                                <SelectValue placeholder="Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((country) => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        <span className="flex items-center">
                                                            <span className="mr-2">{country.flag}</span>
                                                            <span>{country.dialCode}</span>
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="phone" render={({ field }) => (
                        <div className="w-full">
                            <FormLabel className="text-sm font-medium text-gray-700 ">Phone Number</FormLabel>
                            <FormControl>
                                <Input disabled={isLoading} placeholder="+27123456789" type="tel" {...field} className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            </FormControl>
                            <FormMessage className="form-message mt-2" />
                        </div>
                    )} />
                </div>
                <FormField control={form.control} name="password" render={({ field }) => (
                    <div className="">
                        <FormLabel className="text-sm font-medium text-gray-700 ">Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input
                                    placeholder="Enter your password"
                                    type={showPassword ? "text" : "password"}
                                    disabled={isLoading}
                                    className="w-full px-3 py-1 border bg-slate-50 border-gray-400 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                        <PasswordStrengthIndicator password={field.value} />
                        <FormMessage className="form-message mt-2" />
                    </div>
                )} />

                {/* Sign Up Button */}
                <Button disabled={isLoading}  className="w-full bg-[#000B58] border-[#0179FE] font-semibold  rounded-md py-2 text-white transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                        </>
                    ) : "Sign Up"}
                </Button>

            </form>
        </Form>
    )
}

export default Signupform