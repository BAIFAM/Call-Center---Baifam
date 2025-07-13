"use client"

import { IContact } from "@/app/types/api.types"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type ContactDetailsHeaderProps = {
  onTriggerDelete: () => void
  onTriggerEdit: () => void
  onArchive: () => void
  contact: IContact | null
}

export function ContactDetailsHeader({ contact, onArchive, onTriggerEdit, onTriggerDelete }: ContactDetailsHeaderProps) {
  const [isArchiving, setIsArchiving] = useState(false)


  const router = useRouter();
  const handleBack = () => {
    router.back()
  }

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      onArchive();
    } catch (error) {
      toast.error("Failed to archive contact");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="default" className="p-2 !aspect-square !rounded-full" onClick={handleBack}>
          <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Contact details</h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={onTriggerEdit} className="rounded-xl">
          <Icon icon="hugeicons:edit-02" className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button onClick={handleArchive} variant="outline" disabled={!contact || contact.status === "archived" || isArchiving} className="rounded-xl">
          <Icon icon="hugeicons:archive" className="w-4 h-4 mr-2" />
          Archive
        </Button>
        <Button variant="outline" onClick={onTriggerDelete} className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
          <Icon icon="hugeicons:delete-02" className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}
