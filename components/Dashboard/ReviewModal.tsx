"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendReviewInvitation } from '@/server/actions/ratingaction';


const AddSchema = z.object({
    email: z.string().email({ message: "Invalid email address." }),
})

const ReviewModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof AddSchema>>({
        resolver: zodResolver(AddSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = async (data: z.infer<typeof AddSchema>) => {
        setIsLoading(true);
        try {
            const result = await sendReviewInvitation(data);
            if (result.success) {
                toast("Invitation sent", {
                    description: "The Invitation has been successfully added.",
                });
                form.reset();
                setIsOpen(false);
            } else {
                toast("Error", {
                    description: result.error || "Failed to add Invitation. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error adding Invitation:", error);
            toast("Error", {
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="text-gray-600 hover:bg-[#fff] rounded-full hover:border-[#acc2ef] bg-[#fff] border-[#acc2ef]"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#0F1C2E] sm:max-w-[425px] text-[#acc2ef]">
                <DialogHeader className="flex flex-col gap-1 justify-center items-center text-lg font-bold">
                    <DialogTitle>Create New Invitation</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* Email Field */}
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <div className="form-item">
                                <FormLabel className="form-label">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter your email"
                                        type="email"
                                        {...field}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                            </div>
                        )} />

                        <DialogFooter>
                            <Button
                                disabled={isLoading}
                                className="form-btn text-black bg-slate-600 hover:bg-[#34495E]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                                    </>
                                ) : "Add Invitation"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default ReviewModal
