"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { CreateCallGroupDialog } from "@/components/agents/create-call-group-dialog"
import type { ICallGroup } from "@/app/types/api.types"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface CallGroupsHeaderProps {
  onCallGroupCreated: (callGroup: ICallGroup) => void
}

export function CallGroupsHeader({ onCallGroupCreated }: CallGroupsHeaderProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">Call Groups</h1>
      </div>
      <div className="flex items-center justify-end gap-8">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/call-groups/my")}
        >
          <Icon icon="hugeicons:user-square" className="w-4 h-4 mr-2" />
          My Call Groups
        </Button>
        <Button
          className="bg-primary-600 hover:bg-primary-700 rounded-xl"
          onClick={() => setOpen(true)}
        >
          <Icon icon="hugeicons:add-01" className="w-4 h-4 mr-2" />
          Create Call Group
        </Button>
      </div>
      <CreateCallGroupDialog
        open={open}
        onOpenChange={setOpen}
        onCallGroupCreated={onCallGroupCreated}
      />
    </div>
  )
}