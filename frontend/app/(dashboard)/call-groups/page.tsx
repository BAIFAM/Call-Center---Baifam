"use client"

import { useState, useEffect } from "react"
import { CallGroupsHeader } from "@/components/call-groups/call-groups-header"
import { CallGroupsList } from "@/components/call-groups/call-groups-list"
import type { ICallGroup } from "@/app/types/api.types"
import { callGroupAPI } from "@/lib/api-helpers"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"

export default function CallGroupsPage() {
  const [callGroups, setCallGroups] = useState<ICallGroup[]>([])
  const [loading, setLoading] = useState(true)
  const currentInstitution = useSelector(selectSelectedInstitution)

  useEffect(() => {
    fetchCallGroups()
  }, [])

  const fetchCallGroups = async () => {
    if (!currentInstitution) return
    try {
      const groups = await callGroupAPI.getByInstitution({ institutionId: currentInstitution.id })
      setCallGroups(groups)
    } catch (error) {
      console.error("Error fetching call groups:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handler for when a new call group is created
  const handleCallGroupCreated = (newCallGroup: ICallGroup) => {
    setCallGroups((prev) => [newCallGroup, ...prev])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading call groups...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <CallGroupsHeader onCallGroupCreated={handleCallGroupCreated} />
      <CallGroupsList callGroups={callGroups} />
    </div>
  )
}
