"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import type { ICall } from "@/app/types/api.types"
import { formatDate } from "date-fns"
import { CallDetailsModal } from "./call-details-modal"

interface CallsListProps {
  calls: ICall[]
  onEdit: (call: ICall) => void
  onDelete: (call: ICall) => void
}

export function CallsList({ calls, onEdit, onDelete }: CallsListProps) {
  const [selectedCall, setSelectedCall] = useState<ICall | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const getStatusColor = (status: ICall["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "busy":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleViewDetails = (call: ICall) => {
    setSelectedCall(call)
    setIsDetailsModalOpen(true)
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calls.map((call) => (
                <tr key={call.uuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(new Date(call.made_on), "PPpp")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.contact.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.contact.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Badge variant="outline">{call.contact.product.name}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{call.made_by.fullname}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`rounded-full ${getStatusColor(call.status)}`}>{call.status}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-lg"
                        onClick={() => handleViewDetails(call)}
                      >
                        <Icon icon="hugeicons:view" className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2 rounded-lg" onClick={() => onEdit(call)}>
                        <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-lg text-red-600 hover:text-red-700"
                        onClick={() => onDelete(call)}
                      >
                        <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing 1-{calls.length} of {calls.length}
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Icon icon="hugeicons:arrow-left-01" className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              <Button variant="default" size="sm" className="w-8 h-8 rounded-lg bg-primary-600 text-white">
                1
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-lg">
                2
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-lg">
                3
              </Button>
              <span className="px-2 text-gray-500">...</span>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-lg">
                5
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              Next
              <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
            </Button>
          </div>
        </div> */}
      </div>

      <CallDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} call={selectedCall} />
    </>
  )
}
