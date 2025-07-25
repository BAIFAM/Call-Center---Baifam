"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import type { ICallGroup } from "@/app/types/api.types"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { EditCallGroupDialog } from "./edit-call-group-dialog"
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog"
import { callGroupAPI } from "@/lib/api-helpers"

interface CallGroupDetailsHeaderProps {
  callGroup: ICallGroup
}

export function CallGroupDetailsHeader({ callGroup }: CallGroupDetailsHeaderProps) {
  const router = useRouter()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentGroup, setCurrentGroup] = useState(callGroup)

  const handleBack = () => {
    router.back()
  }

  const handleEditClick = () => {
    setEditDialogOpen(true)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleCallGroupUpdated = (updatedGroup: ICallGroup) => {
    setCurrentGroup(updatedGroup)
    setEditDialogOpen(false)
  }

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true)
    try {
      await callGroupAPI.delete({ uuid: currentGroup.uuid })
      setDeleteDialogOpen(false)
      router.push("/call-groups")
    } catch (error) {
      alert("Failed to delete call group. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button onClick={handleBack} variant="ghost" size={"lg"} className="!p-2 !min-w-7 !min-h-min" asChild>
          <Icon icon="hugeicons:arrow-left-01" className="!w-7 !h-7 text-black " />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{currentGroup.name}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" className="rounded-xl bg-transparent" onClick={handleEditClick}>
          <Icon icon="hugeicons:edit-02" className="w-4 h-4 mr-2" />
          Edit Group
        </Button>
        <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 bg-transparent" onClick={handleDeleteClick}>
          <Icon icon="hugeicons:delete-02" className="w-4 h-4 mr-2" />
          Delete Group
        </Button>
      </div>
      <EditCallGroupDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        callGroup={currentGroup}
        onCallGroupUpdated={handleCallGroupUpdated}
      />
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="Delete Call Group"
        description={`Are you sure you want to delete call group '${currentGroup.name}'? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
