"use client"

import { useState, useEffect } from "react"
import { CallGroupsHeader } from "@/components/call-groups/call-groups-header"
import { CallGroupsList } from "@/components/call-groups/call-groups-list"
import { ICallGroup } from "@/app/types/api.types"
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
        if(!currentInstitution){return}
      try {
        const groups = await callGroupAPI.getByInstitution({ institutionId: currentInstitution.id })

        setCallGroups(groups)
      } catch (error) {
        console.error("Error fetching call groups:", error)
      } finally {
        setLoading(false)
      }
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
      <CallGroupsHeader />
      <CallGroupsList callGroups={callGroups} />
    </div>
  )
}
