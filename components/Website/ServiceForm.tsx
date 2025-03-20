/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { ServiceSchema } from "@/types"
import { Form, FormField, FormControl, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { serviceAction } from "@/server/actions/service"
import { FormError } from "../Auth/FormError"

interface ServiceFormProps {
  service: string
  setIsOpen: (isOpen: boolean) => void
}

const ServiceForm = ({ service, setIsOpen }: ServiceFormProps) => {
  const [error, setError] = useState<string | undefined>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof ServiceSchema>>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      name: "",
      companyName: "",
      service: service,
      email: "",
      phoneNumber: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof ServiceSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await serviceAction(data)

      if (result.success) {
        setIsOpen(false)
        toast.success("We'll get back to you soon!")
      } else {
        setError("Failed to submit. Please try again.")
        toast.error("Failed to submit the form. Please try again.")
      }
    } catch (error) {
      setError("Failed to submit. Please try again.")
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Name"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-transparent border border-[#685189]/50 focus:border-[#685189] rounded-none px-3 py-1 text-xs text-white focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Company"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-transparent border border-[#685189]/50 focus:border-[#685189] rounded-none px-3 py-1 text-xs text-white focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  value={service}
                  disabled
                  className="bg-transparent border border-[#685189]/20 rounded-none px-3 py-1 text-xs text-white/50"
                />
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-transparent border border-[#685189]/50 focus:border-[#685189] rounded-none px-3 py-1 text-xs text-white focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Phone"
                    {...field}
                    disabled={isSubmitting}
                    className="bg-transparent border border-[#685189]/50 focus:border-[#685189] rounded-none px-3 py-1 text-xs text-white focus:ring-0"
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        <FormError message={error} />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-transparent hover:bg-[#685189]/10 text-white text-xs py-1 rounded-none border border-[#685189] mt-4"
        >
          {isSubmitting ? "Sending..." : "Submit"}
        </Button>
      </form>
    </Form>
  )
}

export default ServiceForm

