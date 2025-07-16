"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CallForm } from "./call-form"
import type { ICall, IContact, ICallFormData } from "@/app/types/api.types"

interface CallModalProps {
  isOpen: boolean
  onClose: () => void
  call?: ICall | null
  contacts: IContact[]
  onSubmit: (data: ICallFormData) => Promise<void>
  isLoading?: boolean
  selectedContact?: IContact
}

export function CallModal({ isOpen, onClose, call, contacts, onSubmit, isLoading, selectedContact }: CallModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{call ? "Edit Call" : "Add New Call"}</DialogTitle>
        </DialogHeader>
        <CallForm
          call={call || undefined}
          contacts={contacts}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
          selectedContact={selectedContact}
        />
      </DialogContent>
    </Dialog>
  )
}
