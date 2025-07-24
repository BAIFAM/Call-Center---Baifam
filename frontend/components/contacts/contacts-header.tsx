"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import type { ICallCenterProduct, IContact } from "@/app/types/api.types"
import { CreateContactDialog } from "@/components/contacts/create-contact-dialog"
import { BulkUploadDialog } from "@/components/contacts/bulk-upload-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AssignContactDialog } from "@/components/contacts/assign-contact-dialog"


interface ContactsHeaderProps {
  selectedContactIds: string[]
  onRefreshContacts: () => void
  products: ICallCenterProduct[]
  contacts?: IContact[] // Add this prop to get contact details
}

export function ContactsHeader({ selectedContactIds, onRefreshContacts, products, contacts = [] }: ContactsHeaderProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedContact = contacts.find(c => c.uuid === selectedContactIds[0])

  const handleBulkUploadSuccess = () => {
    onRefreshContacts()
    setIsBulkUploadDialogOpen(false)
  }

  const handleRefresh = () =>{
    setIsRefreshing(true);
    setTimeout(()=>{
      onRefreshContacts();
      setIsRefreshing(false)
    }, 2000)
  }

  const canAssign = selectedContact && !selectedContact.call_group
  const canReassign = selectedContact && !!selectedContact.call_group

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
          <Button disabled={isRefreshing} variant="outline" size="sm" onClick={handleRefresh}>
            <Icon icon="hugeicons:refresh" className={` w-4 h-4 ${isRefreshing ? "!animate-spin":""}`} />
          </Button>

          {selectedContactIds.length === 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="rounded-xl bg-transparent"
                disabled={!canReassign}
                onClick={() => setIsAssignDialogOpen(true)}
              >
                Re-Assign
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-transparent"
                disabled={!canAssign}
                onClick={() => setIsAssignDialogOpen(true)}
              >
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

      {/* Assign/Re-Assign Dialog */}
      {selectedContact && (
        <AssignContactDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          contact={selectedContact}
          onAssigned={onRefreshContacts}
        />
      )}
    </>
  )
}