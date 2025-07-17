"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import type { ICallCenterProduct } from "@/app/types/api.types"
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog"
import { BulkUploadDialog } from "@/components/contacts/bulk-upload-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ContactsHeaderProps {
  selectedContactIds: string[]
  onRefreshContacts: () => void
  products: ICallCenterProduct[]
}

export function ContactsHeader({ selectedContactIds, onRefreshContacts, products }: ContactsHeaderProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false)

  const handleBulkUploadSuccess = () => {
    onRefreshContacts()
    setIsBulkUploadDialogOpen(false)
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">
            Manage your contacts and their information
            {selectedContactIds.length > 0 && (
              <span className="ml-2 text-blue-600">({selectedContactIds.length} selected)</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}
          <Button variant="outline" size="sm" onClick={onRefreshContacts}>
            <Icon icon="hugeicons:refresh" className="w-4 h-4" />
          </Button>

          {selectedContactIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="rounded-xl bg-transparent">
                Re-Assign
              </Button>
              <Button variant="outline" className="rounded-xl bg-transparent">
                Assign
              </Button>
            </div>
          )}

          {/* Add Contact Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Icon icon="hugeicons:add-01" className="w-4 h-4 mr-2" />
                Add Contacts
                <Icon icon="hugeicons:arrow-down-01" className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsCreateDialogOpen(true)}>
                <Icon icon="hugeicons:user-add-01" className="w-4 h-4 mr-2" />
                Add Single Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBulkUploadDialogOpen(true)}>
                <Icon icon="hugeicons:upload-01" className="w-4 h-4 mr-2" />
                Bulk Upload Contacts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Create Contact Dialog */}
      <CreateContactDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        products={products}
        onCreateSuccess={onRefreshContacts}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        isOpen={isBulkUploadDialogOpen}
        onClose={() => setIsBulkUploadDialogOpen(false)}
        products={products}
        onUploadSuccess={handleBulkUploadSuccess}
      />
    </>
  )
}
