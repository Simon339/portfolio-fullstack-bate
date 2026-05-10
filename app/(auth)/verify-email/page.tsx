"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { FormError } from "@/components/Auth/FormError"
import { motion } from "framer-motion"
import { authClient } from "@/hooks/getcurrectuser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const Page: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [userEmail, setUserEmail] = useState<string>("")
  const [showEmailInput, setShowEmailInput] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const onSubmit = useCallback(async () => {
    if (success || error || !token) {
      return
    }

    setIsLoading(true)
    try {
      // Try to verify the email
      const response = await authClient.verifyEmail({
        query: {
          token: token
        }
      })
      
      // If verification is successful
      setSuccess("Your email has been successfully verified!")
      
    } catch (err: any) {
      // Handle different error cases
      if (err.response?.data?.error) {
        setError(err.response.data.error)
        
        // Show email input for specific error types
        if (err.response.data.error.includes("expired") || 
            err.response.data.error.includes("invalid") || 
            err.response.data.error.includes("No token")) {
          setShowEmailInput(true)
          
          // Try to get email from localStorage
          const storedEmail = localStorage.getItem("verification_email")
          if (storedEmail) {
            setUserEmail(storedEmail)
          }
        }
      } else {
        setError("Verification failed. Please try again.")
        setShowEmailInput(true)
      }
    } finally {
      setIsLoading(false)
    }
  }, [token, success, error])

  const handleResendVerification = async () => {
    if (!userEmail.trim()) {
      setError("Please enter your email address.")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsResending(true)
    setError(undefined)
    
    try {
      await authClient.sendVerificationEmail({
        email: userEmail,
        callbackURL: window.location.origin + "/verify-email"
      })
      
      setSuccess("A new verification email has been sent to your email address.")
      setShowEmailInput(false)
      
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Failed to send verification email. Please try again later.")
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEmail(e.target.value)
    // Clear any previous errors when user starts typing
    if (error && error.includes("email")) {
      setError(undefined)
    }
  }

  useEffect(() => {
    if (token) {
      onSubmit()
    } else {
      setError("No verification token provided.")
      setShowEmailInput(true)
    }
  }, [onSubmit, token])

  return (
    <section className="flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4 py-12 min-h-screen w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full shadow-2xl bg-white rounded-xl min-h-screen overflow-hidden">
          <CardContent className="p-2 w-full">
            <Header />

            <motion.div
              className="flex flex-col items-center w-full justify-center p-6 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isLoading && <LoadingSpinner />}
              <FormSuccess message={success} />
              
              {!success && (
                <div className="w-full max-w-md space-y-4">
                  {error && !showEmailInput && <FormError message={error} />}
                  
                  {/* Show email input for resending verification */}
                  {showEmailInput && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-4 w-full"
                    >
                      <FormError message={error} />
                      
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Request New Verification Email</h3>
                        <p className="text-sm text-gray-600">
                          Enter your email address below to receive a new verification link.
                        </p>
                        
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={userEmail}
                            onChange={handleEmailChange}
                            placeholder="Enter your email address"
                            className="border-gray-300 focus:border-[#000B58] focus:ring-1 focus:ring-[#000B58] rounded-lg h-11 bg-white pr-10 transition-colors"
                            disabled={isResending}
                          />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={handleResendVerification}
                            disabled={isResending || !userEmail.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex-1"
                          >
                            {isResending ? (
                              <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending...
                              </>
                            ) : (
                              "Send Verification Email"
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => setShowEmailInput(false)}
                            variant="outline"
                            className="px-6 py-3 rounded-lg flex-1  bg-gray-100"
                            disabled={isResending}
                          >
                            Cancel
                          </Button>
                        </div>
                        
                        <div className="text-xs text-gray-500 space-y-1 pt-2">
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            Make sure to check your spam folder
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            The verification link expires in 24 hours
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Show resend trigger button for specific errors */}
                  {error && !showEmailInput && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center space-y-3"
                    >
                      <p className="text-sm text-gray-600">
                        Didn't receive the email or having trouble?
                      </p>
                      <Button
                        onClick={() => setShowEmailInput(true)}
                        variant="outline"
                        className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-6 py-2 rounded-lg transition-colors"
                      >
                        Request New Verification Email
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* Show login link when success */}
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <Link
                    href="/auth"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Continue to Login
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link
                href="/auth"
                className="block text-center py-4 text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
              >
                ← Back to Login
              </Link>
            </motion.div>

            <Footer currentYear={currentYear} />
          </CardContent>
        </Card>
      </motion.div>
    </section>
  )
}

const Header: React.FC = () => (
  <motion.header
    className="p-6 bg-indigo-600 text-white"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h1 className="text-3xl font-bold text-center mb-2">Email Verification</h1>
    <p className="text-center text-indigo-200">Confirming your email address</p>
  </motion.header>
)

const Footer: React.FC<{ currentYear: number }> = ({ currentYear }) => (
  <footer className="mt-8 text-center p-6 bg-gray-50">
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
    className="text-gray-400 transition duration-200 ease-in-out hover:text-indigo-600"
    aria-label={label}
  >
    <Icon className="h-5 w-5" />
  </Link>
)

const LoadingSpinner: React.FC = () => (
  <motion.div
    className="border-t-4 border-indigo-500 rounded-full w-12 h-12"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
  />
)

export default Page