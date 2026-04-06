import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormLabel, FormControl, FormMessage, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSchema } from "@/types";
import { Settings } from "@/server/actions/settings";
import { toast } from "sonner";

type FieldDialogProps = {
  title: string;
  fieldName: keyof User;
  currentValue: string;
  onUpdate: (value: string) => void;
  userId: string;
};

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
        <Button variant="ghost" size="icon">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name={fieldName}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{title}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={fieldName === "role"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={fieldName === "role"}>
              Save Changes
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldDialog;
