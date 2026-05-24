import { useState } from "react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';
import { AddNewUserSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addUser, autoGenerateUsers } from "@/server/actions/user";

const UserModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof AddNewUserSchema>>({
        resolver: zodResolver(AddNewUserSchema),
        defaultValues: { firstname: "", surname: "", email: "", role: "user", image: undefined },
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: File) => void) => {
        const file = event.target.files?.[0];
        if (file) fieldChange(file);
    };

    const handleGenerate = async () => {
    setIsLoading(true);
    const response = await autoGenerateUsers();
   setIsLoading(false);
    
  };

    const onSubmit = async (data: z.infer<typeof AddNewUserSchema>) => {
        setIsLoading(true);
        try {
            const result = await addUser(data);
            if (result.success) {
                toast("User Added", { description: "The user has been successfully added." });
                form.reset();
                setIsOpen(false);
            } else {
                toast("Error", { description: result.error || "Failed to add user. Please try again." });
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast("Error", { description: "An unexpected error occurred. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="text-gray-600 bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95">
                    <UserPlus2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-50 border-[#acc2ef]">
                <DialogHeader className="flex flex-col gap-1 justify-center items-center text-lg font-bold">
                    <DialogTitle className="text-gray-900">Create New User</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="flex gap-4">
                            <FormField control={form.control} name="firstname" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="text-gray-700">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your name" type="text" {...field} disabled={isLoading} className="bg-gray-100 text-gray-900 border-[#acc2ef] focus:border-blue-400" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="surname" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="text-gray-700">Surname</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your surname" type="text" {...field} disabled={isLoading} className="bg-gray-100 text-gray-900 border-[#acc2ef] focus:border-blue-400" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-gray-700">Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your email" type="email" {...field} disabled={isLoading} className="bg-gray-100 text-gray-900 border-[#acc2ef] focus:border-blue-400" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex gap-4">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem className="w-[190px]">
                                    <FormLabel className="text-gray-700">Role</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                        <FormControl className="bg-gray-100 text-gray-900 border-[#acc2ef]">
                                            <SelectTrigger className="bg-gray-100 border-[#acc2ef]">
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-gray-50 border-[#acc2ef]">
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="owner">Super admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="image" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="text-gray-700">Image (Optional)</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, field.onChange)} disabled={isLoading} className="bg-gray-100 text-gray-900 border-[#acc2ef] file:bg-gray-200 file:border-[#acc2ef] file:text-gray-700" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <DialogFooter>
                            <Button disabled={isLoading} className="form-btn text-white bg-gray-700 hover:bg-gray-800 border border-[#acc2ef]">
                                {isLoading ? (<><Loader2 size={20} className="animate-spin" /> &nbsp; Loading...</>) : "Add User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UserModal;

/*
 <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Generating 10 Users..." : "Auto-Generate 10 Users"}
      </button>
      */