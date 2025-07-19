"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isLoading?: boolean
  companyName: string
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  companyName,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon icon="hugeicons:alert-triangle" className="w-5 h-5 text-red-500" />
            <span>Confirm Deletion</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            Are you sure you want to delete <strong>{companyName}</strong>? This action cannot be undone and will
            permanently remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} variant="destructive" className="rounded-xl">
            {isLoading && <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />}
            Delete Company
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
