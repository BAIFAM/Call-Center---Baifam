"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

interface ClientCompaniesHeaderProps {
  onAddClick: () => void
}

export function ClientCompaniesHeader({ onAddClick }: ClientCompaniesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">Client Companies</h1>

      <Button onClick={onAddClick} className="bg-primary-600 hover:bg-primary-700 rounded-xl">
        <Icon icon="hugeicons:add-01" className="w-4 h-4 mr-2" />
        Add Client Company
      </Button>
    </div>
  )
}
