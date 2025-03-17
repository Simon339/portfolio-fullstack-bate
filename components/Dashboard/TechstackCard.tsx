import React, { useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Upload } from 'lucide-react'
import { Button } from '../ui/button';
import { toast } from "sonner"

interface TechstackCardProps {
    id: string;
    name: string;
    image: string;
    isSelected: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onEdit: (id: string, data: FormData) => Promise<void>;
}

const TechstackCard = ({ id, name, image, isSelected, onSelect, onEdit }: TechstackCardProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editImage, setEditImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>(image);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
            if (editImage) {
                formData.append('image', editImage);
            }
            await onEdit(id, formData);
            toast.success("Techstack updated successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error updating techstack:", error);
            toast.error("Failed to update techstack");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size should not exceed 5MB");
                return;
            }
            setEditImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.onerror = () => {
                toast.error("Error reading file");
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 transition-colors mb-1 bg-blue-50">
            <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectChange}
                className="mb-4 border-gray-400 checkmark"
                onClick={(e) => e.stopPropagation()}
            />
            <Avatar className="h-14 text-white w-14">
                <AvatarImage src={previewImage || `https://api.dicebear.com/6.x/initials/svg?seed=${name}`} alt="Avatar" />
                <AvatarFallback>{name.slice(0, 2) || ''}</AvatarFallback>
            </Avatar>
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
                         <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">Edit Techstack</DialogTitle>
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
                        <div className="grid grid-cols-3 items-center gap-1">
                            <Label className="text-left">Image</Label>
                            <div className="col-span-3 flex items-center gap-1">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={previewImage || `https://api.dicebear.com/6.x/initials/svg?seed=${editName}`} alt="Preview" />
                                    <AvatarFallback>{editName.slice(0, 2) || ''}</AvatarFallback>
                                </Avatar>
                                <Button onClick={triggerFileInput} type="button">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                </Button>
                                <Input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
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

export default TechstackCard

