"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { IContact } from "@/app/types/types.utils"


interface ContactsFiltersProps {
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
  activeContactsCount: number
  archivedContactsCount: number
}

export function ContactsFilters({ viewMode, onViewModeChange, activeContactsCount, archivedContactsCount }: ContactsFiltersProps) {


  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-xl border-primary-200 text-primary-700">
            Active Contacts ({activeContactsCount})
          </Button>
          <Button variant="ghost" className="rounded-xl">
            Archived ({archivedContactsCount})
          </Button>
        </div>

        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={`rounded-lg `}
          >
            <Icon icon="hugeicons:menu-01" className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={`rounded-lg`}
          >
            <Icon icon="hugeicons:grid-view" className="w-4 h-4" />
            Grid
          </Button>
        </div>
      </div>


    </div>
  )
}
