"use client"

import { useEffect, useState } from "react"
import { AgentDetailsHeader } from "@/components/agents/agent-details-header"
import { AgentDetailsInfo } from "@/components/agents/agent-details-info"
import { AgentDetailsTabs } from "@/components/agents/agent-details-tabs"
import { useParams } from "next/navigation"
import { agentsAPI, callGroupAPI, callsAPI, contactsAPI } from "@/lib/api-helpers"
import { IAgent, ICall, ICallGroup } from "@/app/types/api.types"
import { toast } from "sonner"





export default function AgentDetailsPage() {
  const params = useParams();
  const agentUuid = params.id as string 
  const [activeTab, setActiveTab] = useState<"call-history" | "call-groups">("call-history")
  const [agent, setAgent] = useState<IAgent|null>(null);
  const [callHistory, setCallHistory] = useState<ICall[]>([]);
  const [callGroups, setCallGroups] = useState<ICallGroup[]>([]);
  const [loadingCallHistory, setLoadingCallHistory] = useState(false);
  const [loadingCallGroups, setLoadingCallGroups] = useState(false);

  useEffect(()=>{
    if(!agentUuid){return}
    handleFetchAgent({agentUuid})
    handleFetchCallHistory({agentUuid})
    handleFetchCallGroups({agentUuid})
  }, [agentUuid])

  const handleFetchAgent = async ({agentUuid}:{agentUuid:string}) =>{
    try {
      const response = await agentsAPI.getAgentDetails({agentUuid})
      setAgent(response)
    } catch (error) {
      toast.error("Failed to fetch agent")
    }
  }

  const handleFetchCallHistory = async ({agentUuid}:{agentUuid:string}) =>{
    setLoadingCallHistory(true)
    try {
      const response = await contactsAPI.getAgentCalls({agentUuid})
      setCallHistory(response)
    } catch (error) {
      toast.error("Failed to fetch call history")
    } finally {
      setLoadingCallHistory(false)
    }
  }

  const handleFetchCallGroups = async ({agentUuid}:{agentUuid:string}) =>{
    setLoadingCallGroups(true)
    try {
      const response = await callGroupAPI.getAgentCallGroups({agentUuid})
      setCallGroups(response)
    } catch (error) {
      toast.error("Failed to fetch call groups")
    } finally {
      setLoadingCallGroups(false)
    }
  }

  return (
    <div className="space-y-6">
      <AgentDetailsHeader agent={agent} onDeactivateSuccess={() => handleFetchAgent({agentUuid})} />
      <AgentDetailsInfo agent={agent}  />
      <AgentDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        callHistory={callHistory}
        callGroups={callGroups}
        loadingCallHistory={loadingCallHistory}
        loadingCallGroups={loadingCallGroups}
      />
    </div>
  )
}
