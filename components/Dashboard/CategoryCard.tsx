
import React, { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2 } from 'lucide-react'
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface CategoryCardProps {
    id: string;
    name: string;
    //createdAt: Date;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onEdit: (id: string, data: FormData) => Promise<void>;
}

const CategoryCard = ({ id, name, isSelected, onSelect, onEdit }: CategoryCardProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editName, setEditName] = useState(name);
    const [isSubmitting, setIsSubmitting] = useState(false)
    

    const handleSelectChange = (checked: boolean) => {
        onSelect(id, checked);
    };

    const handleEdit = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (editName !== name) {
                formData.append('name', editName);
            }
            await onEdit(id, formData);
            toast.success("Category updated successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error updating Category:", error);
            toast.error("Failed to update Category");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 transition-colors mb-1 bg-blue-50">
            <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectChange}
                className="mb-4 border-gray-400 checkmark"
                onClick={(e) => e.stopPropagation()}
            />
            <div className="ml-2 space-y-1 flex-grow">
                <p className="text-sm font-medium leading-none">{name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>ID: {id}</span>
                </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[350px] bg-[#0F1C2E] text-[#acc2ef]">
                    <DialogHeader>
                         <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">Edit Category</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-1 py-4">
                        <div className="grid grid-cols-3 items-center gap-1">
                            <Label htmlFor="name" className="text-left">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} onClick={handleEdit}
            className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CategoryCard