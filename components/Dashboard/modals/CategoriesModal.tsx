
"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CategoriesSchema } from "@/types/vaildations/project"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createCategory } from "@/server/data/projectactions"

const CategoriesModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof CategoriesSchema>>({
    resolver: zodResolver(CategoriesSchema),
    defaultValues: {
      name: "",
    },
  })

  const resetForm = () => {
    form.reset({
      name: "",
    })
  }

  const onSubmit = async (data: z.infer<typeof CategoriesSchema>) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("name", data.name)
      const result = await createCategory(formData)

      toast.success("Category Created successfully!", {
        duration: 3000,
      })
      resetForm()

      setTimeout(() => {
        setIsOpen(false)
      }, 500)
      console.log(result)
    } catch (error) {
      toast.error("Failed to create Category", {
        duration: 3000,
      })
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full border-[#acc2ef] hover:bg-[#cccbc8] text-gray-700">
          <Plus className="h-2 w-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[458px] bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">
            Create New Category
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-[#acc2ef]">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <div className="w-full">
                  <FormItem>
                    <FormLabel>Name:</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your category name" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CategoriesModal

