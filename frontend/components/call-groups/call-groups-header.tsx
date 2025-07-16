"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

export function CallGroupsHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Call Groups</h1>

      <Button className="bg-primary-600 hover:bg-primary-700 rounded-xl">
        <Icon icon="hugeicons:add-01" className="w-4 h-4 mr-2" />
        Create Call Group
      </Button>
    </div>
  )
}
