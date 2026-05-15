/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { SubmitHandler } from "react-hook-form"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "../ui/button"
import { ContactFormSchema } from "@/lib/vaildationschema"
import { ContactFormAction } from "@/server/actions/contactform"
import { Form, FormControl, FormField, FormMessage, FormItem, FormLabel } from "../ui/form"
import { FormError } from "@/components/Auth/FormError"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { Send, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      topic: "",
    },
    mode: "onChange", // Validate on change for better UX
  })

  const onSubmit: SubmitHandler<z.infer<typeof ContactFormSchema>> = async (data) => {
    if (isLoading) return // Prevent double submission
    
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await ContactFormAction(data)

      if (response?.error) {
        setError(response.error)
        toast.error(response.error, {
          duration: 4000,
        })
      } else if (response?.success) {
        setSuccess(response.success)
        toast.success(response.success, {
          duration: 4000,
        })
        form.reset()
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again later."
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset success/error messages when form changes
  const handleFieldChange = () => {
    if (error || success) {
      setError("")
      setSuccess("")
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-md w-full h-full bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg"
    >
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 text-center text-white">Write to me</h3>
        <p className="text-sm text-white/60">
          Fill out the form below and I'll get back to you as soon as possible.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/80 mb-2 block">
                    Name <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
                      disabled={isLoading}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white w-full focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-white/40"
                      type="text"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleFieldChange()
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-2 text-red-400/90" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white/80 mb-2 block">
                    Email <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="your.email@example.com"
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white w-full focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-white/40"
                      type="email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleFieldChange()
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-2 text-red-400/90" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/80 mb-2 block">
                  Subject <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="What is this regarding?"
                    disabled={isLoading}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white w-full focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-white/40"
                    type="text"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange()
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs mt-2 text-red-400/90" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white/80 mb-2 block">
                  Message <span className="text-red-400">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    disabled={isLoading}
                    {...field}
                    placeholder="Tell me what's on your mind..."
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white w-full resize-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300 placeholder:text-white/40"
                    onChange={(e) => {
                      field.onChange(e)
                      handleFieldChange()
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs mt-2 text-red-400/90" />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={isLoading || !form.formState.isValid}
            className="w-full bg-white/10 hover:bg-white/20 mt-8 text-white rounded-lg py-3.5 text-sm font-medium flex items-center justify-center gap-3 transition-all duration-300 border border-white/10 hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Message
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  )
}