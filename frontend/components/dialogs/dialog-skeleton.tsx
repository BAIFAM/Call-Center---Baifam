"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
interface DialogSkeletonProps {
  isOpen: boolean
  onClose: () => void,
  title: string
  children: React.ReactNode,
  className?:string,
  onConfirm: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  confirmDisabled?: boolean
}

export function DialogSkeleton({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmDisabled = false,
  
}: DialogSkeletonProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg ${className}`}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">{children}</div>

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={handleCancel} className="rounded-xl">
              {cancelText}
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="bg-purple-600 hover:bg-purple-700 rounded-xl"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

