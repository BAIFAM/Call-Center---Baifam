"use client"

import { IAgent } from "@/app/types/api.types"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { EditAgentDialog } from "./edit-agent-dialog"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { toast } from "sonner"

interface AgentDetailsHeaderProps  {
  agent: IAgent | null;
  onDeactivateSuccess?: () => void;
}



export function AgentDetailsHeader({ agent, onDeactivateSuccess }: AgentDetailsHeaderProps) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const handleBack = () =>{
    router.back()
  }

  // Dummy callback for now, you can pass a real one if needed
  const handleAgentUpdated = () => {}

  const handleDeactivate = () => {
    setDeactivateOpen(true)
  }

  const handleConfirmDeactivate = () => {
    setDeactivateOpen(false)
    toast.info("Deactivation endpoint not yet implemented.")
    if (onDeactivateSuccess) {
      onDeactivateSuccess()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" className="p-2 !aspect-square !rounded-full" onClick={handleBack}>
          <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Agent details</h1>
      </div>

      <div className="flex items-center space-x-3">

        <Button variant="outline" className="rounded-xl" onClick={() => setEditOpen(true)}>
          <Icon icon="hugeicons:edit-02" className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeactivate}>
          <Icon icon="hugeicons:user-remove-01" className="w-4 h-4 mr-2" />
          Deactivate
        </Button>
      </div>
      {
        (agent && editOpen) && (
          <EditAgentDialog agent={agent} open={editOpen} onOpenChange={setEditOpen} onAgentUpdated={handleAgentUpdated} />
        )
      }
      <ConfirmationDialog
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Agent"
        description="Are you sure you want to deactivate this agent? This action can be reversed later."
        confirmText="Deactivate"
        cancelText="Cancel"
      />
    </div>
  )
}
