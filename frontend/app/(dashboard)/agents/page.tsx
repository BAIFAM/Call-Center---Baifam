"use client"
import { useEffect, useState, useCallback } from "react"
import { useSelector } from "react-redux"
import { AgentsHeader } from "@/components/agents/agents-header"
import { AgentsList } from "@/components/agents/agents-list"
import { agentsAPI } from "@/lib/api-helpers" // Assuming agentsAPI is in api-helpers
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { IAgent } from "@/app/types/api.types"
import { toast } from "sonner"
import FixedLoader from "@/components/common/fixed-loader"

export default function AgentsPage() {
  const currentInstitution = useSelector(selectSelectedInstitution)
  const [filteredAgents, setFilteredAgents] = useState<IAgent[]>([])
  const [allAgents, setAllAgents] = useState<IAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null)

  // Wrap fetchAgents in useCallback to prevent unnecessary re-renders and ensure stable reference
  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      if (!currentInstitution?.id) {
        toast.info("No institution available, cannot fetch agents.")
        setAllAgents([])
        setFilteredAgents([])
        return
      }
      const response = await agentsAPI.getByInstitution({ institutionId: currentInstitution.id })
      setAllAgents(response)
      setFilteredAgents(response)
    } catch (error) {
      toast.error("Failed to load agents:")
    } finally {
      setLoading(false)
    }
  }, [currentInstitution?.id]) // Depend on currentInstitution.id

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents]) // Depend on the memoized fetchAgents

  if (loading) {
    return <div className="max-h-[70svh] my-auto relative">
      <FixedLoader fixed={false} />
    </div>
  }

  return (
    <div className="space-y-6 bg-white border rounded-xl p-4 border-gray-200">
      <AgentsHeader
        agents={allAgents}
        onFilteredAgentsChange={setFilteredAgents}
        totalAgents={allAgents.length}
        onAgentCreated={fetchAgents}
        institutionId={currentInstitution?.id || 0}
        selectedAgent={selectedAgent}
        onAssignOrReassign={fetchAgents}
      />
      <AgentsList
        agents={filteredAgents}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />
    </div>
  )
}
