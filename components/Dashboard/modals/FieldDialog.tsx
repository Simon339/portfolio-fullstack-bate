import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormLabel, FormControl, FormMessage, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settings } from "@/server/actions/settings";
import { toast } from "sonner";

type FieldDialogProps = {
  title: string;
  fieldName: keyof Pick<User, 'name' | 'email' | 'image'>;
  currentValue: string;
  onUpdate: (value: string) => void;
  userId: string;
};

const SettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.instanceof(File)
    .refine((file) => file.size <= 5000000, `Max image size is 5MB.`)
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported."
    )
    .optional()
});

const FieldDialog = ({ title, fieldName, currentValue, onUpdate }: FieldDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(z.object({ [fieldName]: SettingsSchema.shape[fieldName] })),
    defaultValues: { [fieldName]: currentValue },
  });

  const onSubmit = async (data: { [key: string]: string }) => {
    const updatedValue = data[fieldName];
    try {
      await Settings({ [fieldName]: updatedValue });
      onUpdate(updatedValue);
      setIsOpen(false);
      toast.success(`${title} updated successfully!`);
    } catch (error) {
      console.error("Failed to update setting", error);
      toast.error(`Failed to update ${title}. Please try again.`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-xl shadow-xl border border-gray-200 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-gray-800 text-xl font-semibold">
            Edit {title}
          </DialogTitle>
          <p className="text-gray-500 text-sm mt-1">
            Make changes to your {title.toLowerCase()}
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-4 space-y-6">
            <FormField
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-sm font-medium">
                    {title}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400 transition-all duration-200"
                      placeholder={`Enter your ${title.toLowerCase()}`}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs mt-1" />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldDialog;