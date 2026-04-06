"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Shield, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/hooks/getcurrectuser";

const TwoFactorPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [otpCodeDigits, setOtpCodeDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<"totp" | "otp">("totp");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from URL if passed
  const email = searchParams.get("email") || "";

  useEffect(() => {
    // Focus on first input based on method
    if (verificationMethod === "totp" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    } else if (verificationMethod === "otp" && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
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

  const handleChange = (index: number, value: string, method: "totp" | "otp" = "totp") => {
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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, method: "totp" | "otp" = "totp") => {
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
  };

  const handlePaste = (e: React.ClipboardEvent, method: "totp" | "otp" = "totp") => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
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
      } else {
        const newCode = [...code];
        digits.forEach((digit, idx) => {
          if (idx < 6) newCode[idx] = digit;
        });
        setCode(newCode);
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
      }
      
      toast.info("Code pasted", {
        description: `${digits.length}-digit code has been pasted`,
        duration: 1500,
      });
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
        });
      } else {
        setOtpSent(true);
        setResendTimer(60);
        toast.success("OTP Sent!", {
          description: `Verification code sent to your ${email ? "email" : "registered email address"}`,
        });
        // Focus on first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Send OTP error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Error", {
        description: "Unable to send OTP. Please check your connection.",
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
        toast.error("Verification failed", {
          description: errorMessage,
        });
        setOtpCodeDigits(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      } else {
        toast.success("Verification successful!", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("OTP verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Verification error", {
        description: "Unable to verify code. Please check your connection.",
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
        toast.error("Verification failed", {
          description: result.error.message || "Please check your code and try again.",
        });
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.success("Verification successful!", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("2FA verification error:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Verification error", {
        description: "Unable to verify code. Please check your connection.",
      });
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const changeVerificationMethod = (method: "totp" | "otp") => {
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
        return <Mail className="w-8 h-8 text-[#000B58]" />;
      default:
        return <Shield className="w-8 h-8 text-[#000B58]" />;
    }
  };

  const getIconBg = () => {
    switch (verificationMethod) {
      case "otp":
        return "bg-[#000B58]/10";
      default:
        return "bg-[#000B58]/10";
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
    <section className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-8">
      <Card className="w-full max-w-md border border-[#acc2ef] shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/95 transition-all duration-300">
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
                {getTitle()}
              </h1>
              <p className="text-sm text-gray-600 mt-1.5">
                {getDescription()}
              </p>
              {email && verificationMethod !== "otp" && (
                <p className="text-xs text-gray-500 mt-2">
                  Verifying for: <span className="font-medium">{email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-8 pt-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Two-Factor Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-16 h-16 rounded-full ${getIconBg()} flex items-center justify-center transition-all duration-200`}>
                  {getIcon()}
                </div>
              </div>

              {/* Input Fields */}
              <div className="flex justify-center gap-2">
                {verificationMethod === "otp" ? (
                  // OTP 6-digit input
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
                      className="w-12 h-12 text-center text-xl font-semibold border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg transition-all duration-200"
                      aria-label={`OTP digit ${index + 1}`}
                    />
                  ))
                ) : (
                  // TOTP 6-digit input
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
                      onPaste={index === 0 ? (e) => handlePaste(e, "totp") : undefined}
                      disabled={isLoading}
                      className="w-12 h-12 text-center text-xl font-semibold border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg transition-all duration-200"
                      aria-label={`Digit ${index + 1}`}
                    />
                  ))
                )}
              </div>

              {/* OTP Send Button */}
              {verificationMethod === "otp" && !otpSent && (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isLoading}
                  className="w-full bg-[#000B58] hover:bg-[#000B58]/90 disabled:bg-gray-400 text-white font-semibold h-11 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
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

              {/* OTP Resend Timer */}
              {verificationMethod === "otp" && otpSent && resendTimer > 0 && (
                <p className="text-xs text-gray-500 text-center">
                  Resend code in {resendTimer} seconds
                </p>
              )}

              {/* OTP Resend Button */}
              {verificationMethod === "otp" && otpSent && resendTimer === 0 && (
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isLoading}
                  variant="ghost"
                  className="w-full text-[#000B58] hover:text-[#000B58]/80"
                >
                  Resend Code
                </Button>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Manual Verify Button - Auto-submit removed */}
                <Button
                  type="submit"
                  disabled={isLoading || (verificationMethod === "otp" && !otpSent)}
                  className="w-full bg-[#000B58] hover:bg-[#000B58]/90 disabled:bg-gray-400 text-white font-semibold h-11 rounded-lg transition-all duration-200 shadow-sm hover:shadow"
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
                
              </div>

              {/* Help Text */}
              {verificationMethod === "totp" && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Having trouble?{" "}
                    <button
                      type="button"
                      onClick={() => changeVerificationMethod("otp")}
                      className="text-[#000B58] hover:underline font-medium"
                    >
                      Get a code by email
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <footer className="px-8 py-6 text-center bg-gray-50/40 border-t border-[#acc2ef]">
            <p className="text-xs text-gray-400">
              &copy; {currentYear}{" "}
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors font-semibold focus:outline-none focus:underline"
              >
                Simon339 Inc.
              </Link>
              . All rights reserved.
            </p>
          </footer>
        </CardContent>
      </Card>
    </section>
  );
};

export default TwoFactorPage;