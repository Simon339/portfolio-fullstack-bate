/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TechstackSchema } from '@/types/vaildations/project'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from '@/components/ui/input'
import { createTechstack } from '@/server/data/projectactions'


const TechstackModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImages] = useState<File[]>([])

  const form = useForm<z.infer<typeof TechstackSchema>>({
    resolver: zodResolver(TechstackSchema),
    defaultValues: {
      name: '',
      image: [],
    },
  })

  const onSubmit = async (data: z.infer<typeof TechstackSchema>) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      image.forEach((image) => {
        formData.append('image', image)
      })

      const result = await createTechstack(formData)
      
      toast.success('Techstack Created successfully!', {
        duration: 3000,
      })

      setTimeout(() => {
        setIsOpen(false)
      }, 500)

      console.log(result)
    } catch (error) {
      toast.error('Failed to create Techstack', {
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      form.setValue('image', [...form.getValues('image'), ...newImages])
      setImages([...image, ...newImages])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className='rounded-full border-[#acc2ef] hover:bg-[#cccbc8] text-gray-700'>
          <Plus className="h-2 w-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[458px] bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">Create New Techstack
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
                      <Input placeholder="Enter Techstack Name" {...field} className='w-full' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="w-full">
                  <FormItem>
                    <FormLabel>Image:</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />
            <Button type="submit" disabled={isSubmitting}
              className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default TechstackModal