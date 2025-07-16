"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Icon } from "@iconify/react"
import type { ICall } from "@/app/types/api.types"

interface DeleteCallDialogProps {
  isOpen: boolean
  onClose: () => void
  call: ICall | null
  onConfirm: () => Promise<void>
  isLoading?: boolean
}

export function DeleteCallDialog({ isOpen, onClose, call, onConfirm, isLoading }: DeleteCallDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Call</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the call with <span className="font-semibold">{call?.contact.name}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading && <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />}
            Delete Call
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
