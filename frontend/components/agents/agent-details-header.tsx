"use client"

import { IAgent } from "@/app/types/api.types"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { useRouter } from "next/navigation"

interface AgentDetailsHeaderProps  {
  agent:IAgent|null
}

export function AgentDetailsHeader({agent}:AgentDetailsHeaderProps) {

  const router = useRouter()

  const handleBack = () =>{
    router.back()
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
        <Button variant="outline" className="rounded-xl">
          <Icon icon="hugeicons:call" className="w-4 h-4 mr-2" />
          Call
        </Button>
        <Button variant="outline" className="rounded-xl">
          <Icon icon="hugeicons:message-01" className="w-4 h-4 mr-2" />
          Message
        </Button>
        <Button variant="outline" className="rounded-xl">
          <Icon icon="hugeicons:edit-02" className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
          <Icon icon="hugeicons:user-remove-01" className="w-4 h-4 mr-2" />
          Deactivate
        </Button>
      </div>
    </div>
  )
}
