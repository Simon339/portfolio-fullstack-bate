"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { FormError } from "@/components/Auth/FormError"
import { newVerification } from "@/server/data/token"
import { motion } from "framer-motion"

const Page: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [error, setError] = useState<string | undefined>(undefined)
  const [success, setSuccess] = useState<string | undefined>(undefined)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const onSubmit = useCallback(() => {
    if (success || error) {
      return
    }

    if (!token) {
      setError("No token provided")
      return
    }

    newVerification(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success)
        }
        if (data.error) {
          setError(data.error)
        }
      })
      .catch((error) => {
        console.error(error)
        setError("An unexpected error occurred")
      })
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <section className="flex items-center justify-center bg-gradient-to-b from-indigo-100 to-white px-4 py-12 min-h-screen w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full shadow-2xl bg-white rounded-xl overflow-hidden">
          <CardContent className="p-2 w-full">
            <Header />

            <motion.div
              className="flex items-center w-full justify-center p-6 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {!success && !error && <LoadingSpinner />}
              <FormSuccess message={success} />
              {!success && <FormError message={error} />}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link
                href="/auth"
                className="block text-center py-4 text-indigo-600 hover:text-indigo-800 transition-colors"
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

