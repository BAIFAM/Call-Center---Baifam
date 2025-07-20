"use client"

import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import type { IClientCompany } from "@/app/types/api.types"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface ClientCompanyDetailsHeaderProps {
  clientCompany: IClientCompany
}

export function ClientCompanyDetailsHeader({ clientCompany }: ClientCompanyDetailsHeaderProps) {
    const router = useRouter()
    const handleBack = () =>{
        router.back()
    }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button onClick={handleBack} variant="ghost" size="sm" className="p-2" asChild>
            <Icon icon="hugeicons:arrow-left-01" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">{clientCompany.company_name}</h1>
      </div>

      <div className="flex items-center space-x-3">
        <Button variant="outline" className="rounded-xl bg-transparent">
          <Icon icon="hugeicons:edit-02" className="w-4 h-4 mr-2" />
          Edit Company
        </Button>
        <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 bg-transparent">
          <Icon icon="hugeicons:delete-02" className="w-4 h-4 mr-2" />
          Delete Company
        </Button>
      </div>
    </div>
  )
}
