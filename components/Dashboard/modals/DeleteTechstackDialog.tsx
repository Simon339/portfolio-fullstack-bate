import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DeleteTechstackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isDeleting: boolean;
}

const DeleteTechstackDialog: React.FC<DeleteTechstackDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isDeleting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 justify-center items-center align-middle text-lg font-bold">Delete Techstack{selectedCount > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {selectedCount} selected techstack{selectedCount > 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTechstackDialog

