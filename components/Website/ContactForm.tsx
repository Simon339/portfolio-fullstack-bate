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
import { Form, FormControl, FormField, FormMessage } from "../ui/form"
import { FormError } from "@/components/Auth/FormError"
import { FormSuccess } from "@/components/Auth/FormSuccess"
import { Send } from "lucide-react"

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
  })

  const onSubmit: SubmitHandler<z.infer<typeof ContactFormSchema>> = async (data) => {
    setIsLoading(true)

    try {
      const response = await ContactFormAction(data)

      if (response?.error) {
        setError(response.error)
        toast.error(response.error)
      } else if (response?.success) {
        setSuccess(response.success)
        toast.success(response.success)
        form.reset()
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.")
      toast.error("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-md w-full h-full bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-5 text-white">Write to me</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div>
                  <FormControl>
                    <Input
                      placeholder="Name"
                      disabled={isLoading}
                      className="bg-transparent border border-white/10 rounded-md p-2 text-sm text-white w-full focus:border-white/30 focus:ring-0 transition-all"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1 text-red-400" />
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <div>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Email"
                      className="bg-transparent border border-white/10 rounded-md p-2 text-sm text-white w-full focus:border-white/30 focus:ring-0 transition-all"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs mt-1 text-red-400" />
                </div>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <div>
                <FormControl>
                  <Input
                    placeholder="Subject"
                    disabled={isLoading}
                    className="bg-transparent border border-white/10 rounded-md p-2 text-sm text-white w-full focus:border-white/30 focus:ring-0 transition-all"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1 text-red-400" />
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <div>
                <FormControl>
                  <Textarea
                    rows={4}
                    disabled={isLoading}
                    {...field}
                    placeholder="Your message"
                    className="bg-transparent border border-white/10 rounded-md p-2 text-sm text-white w-full resize-none focus:border-white/30 focus:ring-0 transition-all"
                  />
                </FormControl>
                <FormMessage className="text-xs mt-1 text-red-400" />
              </div>
            )}
          />

          {error && <FormError message={error} />}
          {success && <FormSuccess message={success} />}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white/10 hover:bg-white/20 mt-10 text-white rounded-md py-2 text-sm font-medium flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            {isLoading ? "Sending..." : "Send Message"}
            {!isLoading && <Send className="w-3 h-3" />}
          </Button>
        </form>
      </Form>
    </div>
  )
}

