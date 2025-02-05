"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FormSuccess } from "@/components/Auth/FormSuccess";
import { FormError } from "@/components/Auth/FormError";
import { newVerification } from "@/server/data/token";

const Page = () => { 
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<string | undefined>(undefined);
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) {
            return;
        }

        if (!token) {
            setError("No token provided");
            return;
        }

        newVerification(token).then((data) => {
            if (data.success) {
                setSuccess(data.success);
            }
            if (data.error) {
                setError(data.error);
            }
        }).catch((error) => {
            console.error(error);
            setError("An unexpected error occurred");
        });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);  // Add onSubmit to the dependency array to avoid ESLint warning

    return (
        <section className="flex-center size-full max-sm:px-6">
            <section className="auth-form">
                <header className="flex flex-col gap-5 md:gap-8">
                    <Link href="/" className="cursor-pointer flex items-center gap-1">
                        <Image src="/logo.png" width={34} height={34} alt="logo" />
                        <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">MS Portfolio</h1>
                    </Link>
                    <div className="flex flex-col gap-1 md:gap-3">
                        <h1 className="text-24 lg:text-36 font-semibold">Verification Email</h1>
                        <p className="text-16 font-normal">Confirming your email address</p>
                    </div>
                </header>
                <div className="flex items-center w-full justify-center">
                    {!success && !error && <p>Loading</p>}
                    <FormSuccess message={success} />
                    {!success && <FormError message={error} />}
                </div>

                <footer className="justify-center">
                    <div className="flex justify-center gap-2">
                        <p className="text-sm font-normal text-gray-600">Go back To</p>
                        <Link href="/sign-in" className="form-link">Sign in</Link>
                    </div>
                </footer>
            </section>
        </section>
    );
};

export default Page; 
