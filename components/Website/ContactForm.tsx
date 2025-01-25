'use client';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler } from "react-hook-form";
import { toast } from "sonner";  
import { useForm } from 'react-hook-form';
import { useState } from 'react'; 
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "../ui/button";
import { ContactFormSchema } from "@/lib/vaildationschema";
import { ContactFormAction } from "@/server/actions/contactform";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "../ui/form";
import { FormError } from "@/components/Auth/FormError";
import { FormSuccess } from "@/components/Auth/FormSuccess";


export default function ContactForm() {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      topic: ''
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof ContactFormSchema>> = async (data) => {
    setIsLoading(true);
  
    try {
      const response = await ContactFormAction(data);
  
      if (response?.error) {
        setError(response.error); 
        toast.error(response.error); 
      } else if (response?.success) {
        setSuccess(response.success);
        toast.success(response.success);
        
        
        form.reset();  
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };
  

  return (
    <div className="contact_content">
      <h3 className="contact_title">Write to me</h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="contact_form">

          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <div className="form-item">
                <FormLabel className="text-white font-semibold mb-1">Full Name:</FormLabel>
                <FormControl>
                  <div className="contact_form-div">
                    <Input
                      placeholder="Enter your Full Name"
                      disabled={isLoading}
                      className="contact_form-input"
                      type="text"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            )}
          />

          {/* Subject field */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <div className="form-item">
                <FormLabel className="text-white font-semibold mb-1">Subject:</FormLabel>
                <FormControl>
                  <div className="contact_form-div">
                    <Input
                      placeholder="Enter the subject"
                      disabled={isLoading}
                      className="contact_form-input"
                      type="text"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            )}
          />

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <div className="form-item">
                <FormLabel className="text-white font-semibold mb-1">Email:</FormLabel>
                <FormControl>
                  <div className="contact_form-div">
                    <Input
                      disabled={isLoading}
                      placeholder="Enter your email"
                      className="contact_form-input"
                      type="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            )}
          />

          {/* Message field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <div className="form-item">
                <FormLabel className="text-white font-semibold mb-1">Message:</FormLabel>
                <FormControl>
                  <div className="contact_form-area-div contact_form-area">
                    <Textarea
                      id="message"
                      rows={6}
                      disabled={isLoading}
                      {...field}
                      placeholder="Write your message"
                      className="contact_form-area-input"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </div>
            )}
          />

            
          {/* Optional error and success messages */}
          <FormError message={error} />
          <FormSuccess message={success} />
          

          <div className="mt-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full disabled:opacity-50 bg-white-100 text-black hover:bg-[#685189] font-bold"
            >
              {isLoading ? 'Submitting...' : 'Contact Me'}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
