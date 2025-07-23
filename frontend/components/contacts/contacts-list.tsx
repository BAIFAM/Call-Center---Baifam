"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { IContact } from "@/app/types/api.types"
import { getContactStatusColor } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { CALL_INTENTS } from "@/app/types/types.utils"

interface ContactsListProps {
  contacts: IContact[]
  selectedContactIds: string[]
  onSelectionChange: (selectedIds: string[]) => void;
  onEditContact: (contact: IContact) => void;
  onDeleteContact: (contactId: string) => void;
}

export function ContactsList({ contacts, selectedContactIds, onSelectionChange, onEditContact, onDeleteContact }: ContactsListProps) {

  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(contacts.map((contact) => contact.uuid))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedContactIds, contactId])
    } else {
      onSelectionChange(selectedContactIds.filter((id) => id !== contactId))
    }
  }

  const handleCallContact = (contactUuuid:string) =>{
    router.push(`/contacts/${contactUuuid}?intent=${CALL_INTENTS.LAUNCH_CALL}`)
  } 

  const isAllSelected = contacts.length > 0 && selectedContactIds.length === contacts.length
  const isIndeterminate = selectedContactIds.length > 0 && selectedContactIds.length < contacts.length

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden w-full !max-w-full">
      <div className="px-2 !max-w-full">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact, idx) => (
              <tr
                key={idx}
                className={`hover:bg-gray-50 ${selectedContactIds.includes(contact.uuid) ? "bg-blue-50" : ""}`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectedContactIds.includes(contact.uuid)}
                    onChange={(e) => handleSelectContact(contact.uuid, e.target.checked)}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.phone_number}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{"N/A"}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{contact.product.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge className={`rounded-full ${getContactStatusColor(contact.status)}`}>{contact.status}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link href={`/contacts/${contact.uuid}`}>
                      <Button variant="ghost" size="sm" className="p-2 rounded-lg">
                        <Icon icon="hugeicons:view" className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button onClick={()=> handleCallContact(contact.uuid)} variant="ghost" size="sm" className="p-2 rounded-lg">
                      <Icon icon="hugeicons:call" className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => onEditContact(contact)} variant="ghost" size="sm" className="p-2 rounded-lg">
                      <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" onClick={() => onDeleteContact(contact.uuid)} size="sm" className="p-2 rounded-lg text-red-600 hover:text-red-700">
                      <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
