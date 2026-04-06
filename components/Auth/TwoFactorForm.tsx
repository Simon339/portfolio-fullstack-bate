"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Shield, Mail, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/hooks/getcurrectuser";

interface TwoFactorFormProps {
    onBack?: () => void;
    email?: string;
}

type VerificationMethod = "totp" | "otp";

const TwoFactorForm = ({ onBack, email = "" }: TwoFactorFormProps) => {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [otpCodeDigits, setOtpCodeDigits] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>("totp");
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    const router = useRouter();

    // Automatic focus when switching methods
    useEffect(() => {
        const focusInput = () => {
            if (verificationMethod === "totp" && inputRefs.current[0]) {
                inputRefs.current[0].focus();
            } else if (verificationMethod === "otp" && otpInputRefs.current[0]) {
                otpInputRefs.current[0].focus();
            }
        };
        
        setTimeout(focusInput, 50);
    }, [verificationMethod]);

    // Countdown timer for OTP resend
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleChange = (index: number, value: string, method: VerificationMethod = "totp") => {
        // Only allow numbers
        if (value && !/^\d*$/.test(value)) return;

        if (method === "otp") {
            const newCode = [...otpCodeDigits];
            newCode[index] = value.slice(0, 1);
            setOtpCodeDigits(newCode);

            // Auto-focus next input
            if (value && index < 5) {
                otpInputRefs.current[index + 1]?.focus();
            }
        } else {
            const newCode = [...code];
            newCode[index] = value.slice(0, 1);
            setCode(newCode);

            // Auto-focus next input
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, method: VerificationMethod = "totp") => {
        let currentValue = "";
        let refs;
        
        if (method === "otp") {
            currentValue = otpCodeDigits[index];
            refs = otpInputRefs;
        } else {
            currentValue = code[index];
            refs = inputRefs;
        }
        
        if (e.key === "Backspace" && !currentValue && index > 0) {
            refs.current[index - 1]?.focus();
        }
        
        // Submit on Enter key
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handlePaste = (e: React.ClipboardEvent, method: VerificationMethod = "totp") => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
        
        // Allow digits only
        if (/^\d+$/.test(pastedData)) {
            const digits = pastedData.split("");
            
            if (method === "otp") {
                const newCode = [...otpCodeDigits];
                digits.forEach((digit, idx) => {
                    if (idx < 6) newCode[idx] = digit;
                });
                setOtpCodeDigits(newCode);
                
                const lastFilledIndex = Math.min(digits.length - 1, 5);
                otpInputRefs.current[lastFilledIndex]?.focus();
                
                toast.info("Code pasted", {
                    description: `${digits.length}-digit code has been pasted`,
                    duration: 1500,
                });
            } else {
                const newCode = [...code];
                digits.forEach((digit, idx) => {
                    if (idx < 6) newCode[idx] = digit;
                });
                setCode(newCode);
                
                const lastFilledIndex = Math.min(digits.length - 1, 5);
                inputRefs.current[lastFilledIndex]?.focus();
                
                toast.info("Code pasted", {
                    description: `${digits.length}-digit code has been pasted`,
                    duration: 1500,
                });
            }
        } else {
            toast.error("Invalid paste content", {
                description: "Please paste a 6-digit numeric code only",
                duration: 2000,
            });
        }
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        setError(null);

        const loadingToast = toast.loading("Sending verification code...", {
            description: "Please wait while we send the OTP to your email",
        });

        try {
            const result = await authClient.twoFactor.sendOtp({});

            toast.dismiss(loadingToast);

            if (result?.error) {
                const errorMessage = result.error.message || "Failed to send OTP";
                setError(errorMessage);
                toast.error("Failed to send OTP", {
                    description: errorMessage,
                    icon: <XCircle className="w-4 h-4" />,
                    duration: 4000,
                });
            } else {
                setOtpSent(true);
                setResendTimer(60);
                toast.success("OTP Sent Successfully!", {
                    description: `Verification code sent to ${email ? email : "your registered email address"}.`,
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    duration: 5000,
                });
                
                setTimeout(() => {
                    otpInputRefs.current[0]?.focus();
                }, 100);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Send OTP error:", error);
            setError("An unexpected error occurred. Please try again.");
            toast.error("Failed to send OTP", {
                description: "Unable to send verification code. Please try again.",
                icon: <XCircle className="w-4 h-4" />,
                duration: 4000,
            });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        const verificationCode = otpCodeDigits.join("");
        
        if (verificationCode.length !== 6) {
            setError("Please enter the complete 6-digit verification code");
            toast.error("Incomplete Code", {
                description: "Please enter all 6 digits of the verification code",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const loadingToast = toast.loading("Verifying code...", {
            description: "Please wait while we verify your code",
        });

        try {
            const result = await authClient.twoFactor.verifyOtp({
                code: verificationCode,
                trustDevice: true,
            });

            toast.dismiss(loadingToast);

            if (result?.error) {
                const errorMessage = result.error.message || "Invalid OTP code";
                setError(errorMessage);
                toast.error("Verification Failed", {
                    description: errorMessage,
                    icon: <XCircle className="w-4 h-4" />,
                    duration: 4000,
                });
                setOtpCodeDigits(["", "", "", "", "", ""]);
                otpInputRefs.current[0]?.focus();
            } else {
                toast.success("Verification Successful!", {
                    description: "Redirecting to dashboard...",
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    duration: 3000,
                });
                
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("OTP verification error:", error);
            setError("An unexpected error occurred. Please try again.");
            toast.error("Verification Error", {
                description: "Unable to verify code. Please try again.",
                icon: <XCircle className="w-4 h-4" />,
                duration: 4000,
            });
            setOtpCodeDigits(["", "", "", "", "", ""]);
            otpInputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
     
        if (verificationMethod === "otp") {
            await handleVerifyOtp();
            return;
        }

        // Handle TOTP verification
        const verificationCode = code.join("");

        if (verificationCode.length !== 6) {
            setError("Please enter the complete 6-digit verification code");
            toast.error("Incomplete Code", {
                description: "Please enter all 6 digits from your authenticator app",
                duration: 3000,
            });
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const loadingToast = toast.loading("Verifying authenticator code...", {
            description: "Please wait while we verify your code",
        });

        try {
            const result = await authClient.twoFactor.verifyTotp({
                code: verificationCode,
            });

            toast.dismiss(loadingToast);

            if (result?.error) {
                setError(result.error.message || "Invalid verification code");
                toast.error("Verification Failed", {
                    description: result.error.message || "Please check your code and try again.",
                    icon: <XCircle className="w-4 h-4" />,
                    duration: 4000,
                });
                setCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                toast.success("Verification Successful!", {
                    description: "Redirecting to dashboard...",
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    duration: 3000,
                });
                
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }
        } catch (error: any) {
            toast.dismiss(loadingToast);
            console.error("2FA verification error:", error);
            setError("An unexpected error occurred. Please try again.");
            toast.error("Verification Error", {
                description: "Unable to verify code. Please try again.",
                icon: <XCircle className="w-4 h-4" />,
                duration: 4000,
            });
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const changeVerificationMethod = (method: VerificationMethod) => {
        setVerificationMethod(method);
        setError(null);
        setCode(["", "", "", "", "", ""]);
        setOtpCodeDigits(["", "", "", "", "", ""]);
        setOtpSent(false);
        setResendTimer(0);
        
        const methodNames = {
            totp: "authenticator app",
            otp: "email verification"
        };
        
        toast.info(`Switched to ${methodNames[method]}`, {
            description: `You can now enter your ${methodNames[method]} code`,
            duration: 2000,
        });
    };

    const getIcon = () => {
        switch (verificationMethod) {
            case "otp":
                return <Mail className="w-6 h-6 text-[#000B58]" />;
            default:
                return <Shield className="w-6 h-6 text-[#000B58]" />;
        }
    };

    const getTitle = () => {
        switch (verificationMethod) {
            case "otp":
                return "Email Verification";
            default:
                return "Two-Factor Authentication";
        }
    };

    const getDescription = () => {
        switch (verificationMethod) {
            case "otp":
                return otpSent 
                    ? "Enter the 6-digit verification code sent to your email" 
                    : "We'll send a verification code to your email address";
            default:
                return "Enter the 6-digit verification code from your authenticator app";
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#000B58]/10 flex items-center justify-center transition-all duration-300 hover:scale-110">
                        {getIcon()}
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {getTitle()}
                </h3>
                <p className="text-sm text-gray-600">
                    {getDescription()}
                </p>
                {verificationMethod === "totp" && (
                    <p className="text-xs text-gray-500 mt-1">
                        Open your authenticator app to get your code
                    </p>
                )}
                {verificationMethod === "otp" && email && (
                    <p className="text-xs text-gray-500 mt-1">
                        Sending to: <span className="font-medium">{email}</span>
                    </p>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                    {verificationMethod === "otp" ? (
                        otpCodeDigits.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => {
                                    otpInputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value, "otp")}
                                onKeyDown={(e) => handleKeyDown(index, e, "otp")}
                                onPaste={(e) => handlePaste(e, "otp")}
                                disabled={isLoading || !otpSent}
                                className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-[#000B58] focus:ring-2 focus:ring-[#000B58]/20 rounded-lg transition-all duration-200 hover:border-[#000B58]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label={`OTP digit ${index + 1}`}
                            />
                        ))
                    ) : (
                        code.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value, "totp")}
                                onKeyDown={(e) => handleKeyDown(index, e, "totp")}
                                onPaste={(e) => handlePaste(e, "totp")}
                                disabled={isLoading}
                                className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-[#000B58] focus:ring-2 focus:ring-[#000B58]/20 rounded-lg transition-all duration-200 hover:border-[#000B58]/50"
                                aria-label={`Digit ${index + 1}`}
                            />
                        ))
                    )}
                </div>

                {verificationMethod === "otp" && !otpSent && (
                    <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || isLoading}
                        className="w-full bg-[#000B58] hover:bg-[#000B58]/90 disabled:bg-gray-400 text-white font-semibold h-11 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSendingOtp ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Sending OTP...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Verification Code
                            </>
                        )}
                    </Button>
                )}

                {verificationMethod === "otp" && otpSent && resendTimer > 0 && (
                    <p className="text-xs text-gray-500 text-center">
                        ⏱️ Resend code in {resendTimer} seconds
                    </p>
                )}

                {verificationMethod === "otp" && otpSent && resendTimer === 0 && (
                    <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp || isLoading}
                        variant="ghost"
                        className="w-full text-[#000B58] hover:text-[#000B58]/80 hover:bg-[#000B58]/5"
                    >
                        Resend Code
                    </Button>
                )}

                <div className="space-y-3">
                    {/* Manual Verify Button - Auto-submit removed */}
                    <Button
                        type="submit"
                        disabled={isLoading || (verificationMethod === "otp" && !otpSent)}
                        className="w-full bg-[#000B58] hover:bg-[#000B58]/90 disabled:bg-gray-400 text-white font-semibold h-11 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Verifying...
                            </>
                        ) : (
                            "Verify Code"
                        )}
                    </Button>

                    <div className="space-y-2">
                        {verificationMethod !== "totp" && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => changeVerificationMethod("totp")}
                                disabled={isLoading}
                                className="w-full text-gray-600 hover:text-[#000B58] hover:bg-gray-50 transition-all duration-200"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Use Authenticator App
                            </Button>
                        )}

                        {verificationMethod !== "otp" && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => changeVerificationMethod("otp")}
                                disabled={isLoading}
                                className="w-full text-gray-600 hover:text-[#000B58] hover:bg-gray-50 transition-all duration-200"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Lost Access? Get Email Code
                            </Button>
                        )}
                    </div>

                    {onBack && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            disabled={isLoading}
                            className="w-full text-gray-600 hover:text-[#000B58] hover:bg-gray-50 transition-all duration-200"
                        >
                            Back to Sign In
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default TwoFactorForm;