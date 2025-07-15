"use client"
import { useEffect, useState, useCallback } from "react" // Import useCallback
import { useSelector } from "react-redux"
import { AgentsHeader } from "@/components/agents/agents-header"
import { AgentsList } from "@/components/agents/agents-list"
import { callGroupUserAPI } from "@/lib/api-helpers" // Assuming callGroupUserAPI is in api-helpers
import { selectSelectedInstitution } from "@/store/auth/selectors"

export default function AgentsPage() {
  const institution = useSelector(selectSelectedInstitution)
  const [filteredAgents, setFilteredAgents] = useState([])
  const [allAgents, setAllAgents] = useState([])
  const [loading, setLoading] = useState(true)

  // Wrap fetchAgents in useCallback to prevent unnecessary re-renders and ensure stable reference
  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      // Assuming institution.id is always available in a real scenario,
      // or handle the case where it's not (e.g., redirect or show error)
      if (!institution?.id) {
        console.warn("Institution ID not available, cannot fetch agents.")
        setAllAgents([])
        setFilteredAgents([])
        return
      }
      const response = await callGroupUserAPI.getByInstitution({ institutionId: institution.id })
      setAllAgents(response)
      setFilteredAgents(response)
    } catch (error) {
      console.error("Failed to load agents:", error)
      // Optionally show a toast or error message to the user
    } finally {
      setLoading(false)
    }
  }, [institution?.id]) // Depend on institution.id

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents]) // Depend on the memoized fetchAgents

  if (loading) {
    return <p className="text-gray-600">Loading agents...</p>
  }

  return (
    <div className="space-y-6 bg-white border rounded-xl p-4 border-gray-200">
      <AgentsHeader
        agents={allAgents}
        onFilteredAgentsChange={setFilteredAgents}
        totalAgents={allAgents.length}
        onAgentCreated={fetchAgents} // Pass the refresh function
        institutionId={institution?.id || 0} // Pass institutionId, default to 0 if not available
      />
      <AgentsList agents={filteredAgents} />
    </div>
  )
}
