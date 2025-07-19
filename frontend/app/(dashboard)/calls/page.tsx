"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { CallsFilters } from "@/components/calls/calls-filters"
import { CallsList } from "@/components/calls/calls-list"
import { CallModal } from "@/components/calls/call-modal"
import { DeleteCallDialog } from "@/components/calls/delete-call-dialog"
import type { ICall, IContact, ICallFormData } from "@/app/types/api.types"
import { callsAPI, contactsAPI } from "@/lib/api-helpers"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { useSelector } from "react-redux"
import { toast } from "sonner"

export default function CallsPage() {
  const [calls, setCalls] = useState<ICall[]>([])
  const [filteredCalls, setFilteredCalls] = useState<ICall[]>([])
  const [contacts, setContacts] = useState<IContact[]>([])
  const [isCallModalOpen, setIsCallModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<ICall | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const selectedInstitution = useSelector(selectSelectedInstitution)

  const handleFetchCalls = async () => {
    if (!selectedInstitution) return

    try {
      const response = await callsAPI.getByInstitution({
        institutionId: selectedInstitution.id,
      })
      setCalls(response)
      setFilteredCalls(response)
    } catch (error) {
      toast.error("Failed to fetch calls. Please try again later.")
      console.error("Error fetching calls:", error)
    }
  }

  const handleFetchContacts = async () => {
    if (!selectedInstitution) return

    try {
      const response = await contactsAPI.getContactsByInstitution({
        institutionId: selectedInstitution.id,
      })
      setContacts(response)
    } catch (error) {
      toast.error("Failed to fetch contacts. Please try again later.")
      console.error("Error fetching contacts:", error)
    }
  }

  useEffect(() => {
    handleFetchCalls()
    handleFetchContacts()
  }, [selectedInstitution])

  const handleAddCall = () => {
    setSelectedCall(null)
    setIsCallModalOpen(true)
  }

  const handleEditCall = (call: ICall) => {
    setSelectedCall(call)
    setIsCallModalOpen(true)
  }

  const handleDeleteCall = (call: ICall) => {
    setSelectedCall(call)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitCall = async (data: ICallFormData) => {
    if (!selectedInstitution) return

    setIsLoading(true)
    try {
      if (selectedCall) {
        // Update existing call
        await callsAPI.updateCall({
          callUuid: selectedCall.uuid,
          callData: data,
        })
        toast.success("Call updated successfully")
      } else {
        // Create new call
        await callsAPI.createCall({
          institutionId: selectedInstitution.id,
          callData: data,
        })
        toast.success("Call created successfully")
      }

      setIsCallModalOpen(false)
      setSelectedCall(null)
      await handleFetchCalls()
    } catch (error) {
      toast.error(selectedCall ? "Failed to update call" : "Failed to create call")
      console.error("Error submitting call:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedCall) return

    setIsLoading(true)
    try {
      // You'll need to implement the delete API call
      await callsAPI.deleteCall({ callUuid: selectedCall.uuid })
      toast.success("Call deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedCall(null)
      await handleFetchCalls()
    } catch (error) {
      toast.error("Failed to delete call")
      console.error("Error deleting call:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
          <p className="text-gray-600">Manage and track all your calls</p>
        </div>
        <Button onClick={handleAddCall} className="flex items-center space-x-2">
          <Icon icon="hugeicons:add-01" className="w-4 h-4" />
          <span>Add Call</span>
        </Button>
      </div>

      {/* Filters */}
      <CallsFilters totalCalls={calls.length} calls={calls} onFilteredCallsChange={setFilteredCalls} />

      {/* Calls List */}
      <CallsList calls={filteredCalls} onEdit={handleEditCall} onDelete={handleDeleteCall} />

      {/* Modals */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={() => {
          setIsCallModalOpen(false)
          setSelectedCall(null)
        }}
        call={selectedCall}
        contacts={contacts}
        onSubmit={handleSubmitCall}
        isLoading={isLoading}
      />

      <DeleteCallDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedCall(null)
        }}
        call={selectedCall}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </div>
  )
}
