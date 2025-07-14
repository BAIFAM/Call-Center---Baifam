"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { AgentsHeader } from "@/components/agents/agents-header"
import { AgentsList } from "@/components/agents/agents-list"
import { callGroupUserAPI } from "@/lib/api-helpers"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { ICallGroupUser } from "@/app/types/api.types"

export default function AgentsPage() {
  const institution = useSelector(selectSelectedInstitution)
  const [filteredAgents, setFilteredAgents] = useState<ICallGroupUser[]>([])
  const [allAgents, setAllAgents] = useState<ICallGroupUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        if (!institution?.id) return
        const response = await callGroupUserAPI.getByInstitution({ institutionId: institution.id })

        setAllAgents(response)
        setFilteredAgents(response)
      } catch (error) {
        console.error("Failed to load agents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [institution])

  if (loading) {
    return <p className="text-gray-600">Loading agents...</p>
  }

  return (
    <div className="space-y-6 bg-white border rounded-xl p-4 border-gray-200">
      <AgentsHeader
        agents={allAgents}
        onFilteredAgentsChange={setFilteredAgents}
        totalAgents={allAgents.length}
      />
      <AgentsList agents={filteredAgents} />
    </div>
  )
}
