"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import { IContact } from "@/app/types/api.types"
import Link from "next/link"
import { getContactStatusColor } from "@/lib/utils"

interface ContactsGridProps {
  contacts: IContact[]
  selectedContactIds: string[]
  onSelectionChange: (selectedIds: string[]) => void;
  onEditContact: (contact: IContact) => void;
  onDeleteContact: (contactId: string) => void;
}

export function ContactsGrid({ contacts, selectedContactIds, onSelectionChange, onEditContact, onDeleteContact }: ContactsGridProps) {


  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContactIds, contactId])
    } else {
      onSelectionChange(selectedContactIds.filter((id) => id !== contactId))
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((contact) => (
        <div
          key={contact.uuid}
          className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow relative ${selectedContactIds.includes(contact.uuid) ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
        >
          {/* Selection checkbox */}
          <div className="absolute top-4 left-4">
            <input
              type="checkbox"
              className="rounded"
              checked={selectedContactIds.includes(contact.uuid)}
              onChange={(e) => handleSelectContact(contact.uuid, e.target.checked)}
            />
          </div>

          <div className="flex items-start justify-between mb-4 ml-8">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{contact.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{contact.phone_number}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{contact.product.name}</span>
                <span>•</span>
                <span>{"Unassigned"}</span>
              </div>
            </div>
            <Badge className={`rounded-full ${getContactStatusColor(contact.status)}`}>{contact.status}</Badge>
          </div>

          <div className="flex items-center justify-between ml-8">
            <Button className="bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-xl flex-1 mr-2">
              <Icon icon="hugeicons:call" className="w-4 h-4 mr-2" />
              Call
            </Button>

            <div className="flex items-center space-x-1">
              <Link href={`/contacts/${contact.uuid}`}>
                <Button variant="ghost" size="sm" className="p-2 rounded-lg">
                  <Icon icon="hugeicons:view" className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => onEditContact(contact)} size="sm" className="p-2 rounded-lg">
                <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={() => onDeleteContact(contact.uuid)} size="sm" className="p-2 rounded-lg text-red-600 hover:text-red-700">
                <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
