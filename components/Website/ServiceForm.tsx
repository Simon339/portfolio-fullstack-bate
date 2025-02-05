/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ServiceSchema } from '@/types'
import { Form, FormField, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { toast } from 'sonner'
import { serviceAction } from '@/server/actions/service'
import { FormError } from '../Auth/FormError'

interface ServiceFormProps {
    service: string
    setIsOpen: (isOpen: boolean) => void
}

const ServiceForm = ({ service, setIsOpen }: ServiceFormProps) => {
    const [error, setError] = useState<string | undefined>("");
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
        setIsSubmitting(true);
        try {
          const result = await serviceAction(data);
    
          if (result.success) {
            setIsOpen(false);
            toast.success("We'll get back to you soon!");
          } else {
            setError('Failed to submit. Please try again.');
            toast.error('Failed to submit the form. Please try again.');
          }
        } catch (error) {
          setError('Failed to submit. Please try again.');
          toast.error('An unexpected error occurred. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };
    



    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your full name" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your company's name" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter your company's name" {...field} value={service} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="(e.g. +27)" {...field} disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <FormError message={error} />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>

            </form>
        </Form>

    )
}

export default ServiceForm
