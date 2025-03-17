import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    isDeleting: boolean;
    selectedUserNames: string;
}

const DeleteModal = ({ isOpen, onClose, onDelete, isDeleting, selectedUserNames }: DeleteDialogProps) => {
    
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      
      <DialogContent  className="sm:max-w-[425px] bg-[#0F1C2E] text-[#acc2ef]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the user {selectedUserNames}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteModal
