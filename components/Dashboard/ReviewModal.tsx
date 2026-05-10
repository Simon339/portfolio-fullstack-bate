"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormField, FormControl, FormMessage, FormLabel, FormItem } from "@/components/ui/form"
import { Loader2, Mail, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendReviewInvitation } from '@/server/actions/ratingaction';



const AddSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

const ReviewModal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof AddSchema>>({
    resolver: zodResolver(AddSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof AddSchema>) => {
    setIsLoading(true);
    try {
      const result = await sendReviewInvitation(data);
      if (result.success) {
        toast("Invitation sent", {
          description: "The invitation has been successfully added.",
        });
        form.reset();
        setIsOpen(false);
      } else {
        toast("Error", {
          description:
            result.error || "Failed to add invitation. Please try again.",
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
          className=" rounded-full border border-[#acc2ef] bg-white text-gray-700 shadow-sm hover:bg-[#acc2ef]/20 hover:text-gray-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-xl border border-[#acc2ef] bg-gray-50 text-gray-700 shadow-xl sm:max-w-[440px]">
        <DialogHeader className="flex flex-col items-center gap-2 text-center">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#acc2ef] bg-white text-gray-700"
            aria-hidden="true"
          >
            <Mail className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-700">
            Create new invitation
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Send an email invite so your customer can leave a review.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@company.com"
                      className="border-[#acc2ef] bg-white text-gray-700 placeholder:text-gray-400 focus-visible:border-[#acc2ef] focus-visible:ring-[#acc2ef]/40"
                      type="email"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="border-[#acc2ef] bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 border border-[#acc2ef] bg-[#acc2ef] text-gray-700 hover:bg-[#acc2ef]/80"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Send invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
