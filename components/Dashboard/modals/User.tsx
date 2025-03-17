import { useState } from "react";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { z } from 'zod';
import { AddNewUserSchema } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { addUser } from "@/server/data/alldata";

const countries = [
    { code: "US", dialCode: "+1", flag: "🇺🇸" },
    { code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { code: "JP", dialCode: "+81", flag: "🇯🇵" },
    { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
];

const UserModal = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm<z.infer<typeof AddNewUserSchema>>({
        resolver: zodResolver(AddNewUserSchema),
        defaultValues: {
            name: "",
            surname: "",
            email: "",
            phone: "",
            country: "",
            role: "",
            image: undefined,
        },
    });

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        fieldChange: (value: File) => void
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            fieldChange(file);
        }
    };

    const onSubmit = async (data: z.infer<typeof AddNewUserSchema>) => {
        setIsLoading(true);
        try {
            const result = await addUser(data);
            if (result.success) {
                toast("User Added", {
                    description: "The user has been successfully added.",
                });
                form.reset();
                setIsOpen(false);
            } else {
                toast("Error", {
                    description: result.error || "Failed to add user. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error adding user:", error);
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
                    variant="ghost"
                    className="text-gray-600 bg-[#fff] border-[#acc2ef] hover:bg-[#fff] rounded-full hover:border-[#acc2ef]"
                >
                    <UserPlus2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#0F1C2E] sm:max-w-[425px] text-[#acc2ef]">
                <DialogHeader className="flex flex-col gap-1 justify-center items-center text-lg font-bold">
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Name and Surname Fields */}
                        <div className="flex gap-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <div className="form-item">
                                    <FormLabel className="form-label">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your name"
                                            type="text"
                                            {...field}
                                            disabled={isLoading}
                                            className="bg-gray-200 text-muted-foreground border-gray-200"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                                </div>
                            )} />
                            <FormField control={form.control} name="surname" render={({ field }) => (
                                <div className="form-item">
                                    <FormLabel className="form-label">Surname</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your surname"
                                            type="text"
                                            {...field}
                                            disabled={isLoading}
                                            className="bg-gray-200 text-muted-foreground border-gray-200"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.surname?.message}</FormMessage>
                                </div>
                            )} />
                        </div>

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
                                        className="bg-gray-200 text-muted-foreground border-gray-200"
                                    />
                                </FormControl>
                                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                            </div>
                        )} />

                        {/* Country Select and Phone Field */}
                        <div className="flex gap-4">
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <div className="form-item w-[179px]">
                                    <FormLabel className="form-label">Country</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading}>
                                        <FormControl className="bg-gray-200 text-muted-foreground border-gray-200">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem key={country.code} value={country.code}>
                                                    {country.flag} {country.dialCode} {country.code}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.country?.message}</FormMessage>
                                </div>
                            )} />

                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <div className="form-item">
                                    <FormLabel className="form-label">Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+27123456789"
                                            type="tel"
                                            {...field}
                                            disabled={isLoading}
                                            className="bg-gray-200 text-muted-foreground border-gray-200"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
                                </div>
                            )} />
                        </div>

                        {/* Role Select & Image Upload Field */}
                        <div className="flex gap-4">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <div className="form-item w-[190px]">
                                    <FormLabel className="form-label">Role</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                                        <FormControl className="bg-gray-200 text-muted-foreground border-gray-200">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="USER">User</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="SUPER_ADMIN">Super admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage>{form.formState.errors.role?.message}</FormMessage>
                                </div>
                            )} />

                            <FormField control={form.control} name="image" render={({ field }) => (
                                <div className="form-item ">
                                    <FormLabel className="form-label">Image (Optional)</FormLabel>
                                    <FormControl className="text-muted-foreground">
                                        <Input
                                            type="file"
                                            accept="image/png, image/jpeg, image/webp"
                                            onChange={(e) => handleFileChange(e, field.onChange)}
                                            disabled={isLoading}
                                            className="bg-gray-200 text-muted-foreground border-gray-200"
                                        />
                                    </FormControl>
                                    <FormMessage>{form.formState.errors.image?.message}</FormMessage>
                                </div>
                            )} />
                        </div>

                        <DialogFooter>
                            <Button
                                disabled={isLoading}
                                className="form-btn text-black bg-slate-600 hover:bg-[#34495E]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                                    </>
                                ) : "Add User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default UserModal;