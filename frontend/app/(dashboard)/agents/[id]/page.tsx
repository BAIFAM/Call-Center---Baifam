"use client"

import { useEffect, useState } from "react"
import { AgentDetailsHeader } from "@/components/agents/agent-details-header"
import { AgentDetailsInfo } from "@/components/agents/agent-details-info"
import { AgentDetailsTabs } from "@/components/agents/agent-details-tabs"
import { AgentCallHistory, AssignedContact } from "@/app/types/types.utils"
import { useParams } from "next/navigation"
import { agentsAPI } from "@/lib/api-helpers"
import { IAgent } from "@/app/types/api.types"
import { toast } from "sonner"



const mockCallHistory: AgentCallHistory[] = [
  {
    id: "1",
    date: "May 12, 2025 - 12:32 pm",
    client: "Alice Johnson",
    direction: "Outgoing",
    duration: "13:22",
    status: "Complete",
  },
  {
    id: "2",
    date: "May 12, 2025 - 11:22 am",
    client: "Michael Smith",
    direction: "Outgoing",
    duration: "8:54",
    status: "Complete",
  },
  {
    id: "3",
    date: "May 11, 2025 - 8:12 am",
    client: "Sophia Brown",
    direction: "Incoming",
    duration: "00:00",
    status: "Missed",
  },
  {
    id: "4",
    date: "May 12, 2025 - 12:32 pm",
    client: "Alice Johnson",
    direction: "Outgoing",
    duration: "13:22",
    status: "Complete",
  },
  {
    id: "5",
    date: "May 12, 2025 - 11:22 am",
    client: "Michael Smith",
    direction: "Outgoing",
    duration: "8:54",
    status: "Complete",
  },
  {
    id: "6",
    date: "May 11, 2025 - 8:12 am",
    client: "Sophia Brown",
    direction: "Incoming",
    duration: "00:00",
    status: "Missed",
  },
  {
    id: "7",
    date: "May 12, 2025 - 12:32 pm",
    client: "Alice Johnson",
    direction: "Outgoing",
    duration: "13:22",
    status: "Complete",
  },
  {
    id: "8",
    date: "May 12, 2025 - 11:22 am",
    client: "Michael Smith",
    direction: "Outgoing",
    duration: "8:54",
    status: "Complete",
  },
]

const mockAssignedContacts: AssignedContact[] = [
  {
    id: "1",
    name: "Roy Didanie Kasasa",
    phone: "+256752342992",
    product: "Valuation",
    calls: 21,
    status: "Active",
  },
  {
    id: "2",
    name: "Lutaaya Jamil",
    phone: "+256752776123",
    product: "Loan",
    calls: 3,
    status: "Inactive",
  },
  {
    id: "3",
    name: "Nanyondo Grace",
    phone: "+256789456123",
    product: "Valuation",
    calls: 5,
    status: "Active",
  },
  {
    id: "4",
    name: "Akatukunda Rita",
    phone: "+256787654321",
    product: "Valuation",
    calls: 9,
    status: "Active",
  },
  {
    id: "5",
    name: "Muwonge David",
    phone: "+256701234567",
    product: "Valuation",
    calls: 10,
    status: "Active",
  },
  {
    id: "6",
    name: "Akatukunda Rita",
    phone: "+256787654321",
    product: "Loan",
    calls: 2,
    status: "Active",
  },
  {
    id: "7",
    name: "Akatukunda Rita",
    phone: "+256787654321",
    product: "Valuation",
    calls: 12,
    status: "Active",
  },
  {
    id: "8",
    name: "Nanyondo Grace",
    phone: "+256789456123",
    product: "Valuation",
    calls: 5,
    status: "Active",
  },
]

export default function AgentDetailsPage() {
  const params = useParams();
  const agentUuid = params.id as string 
  const [activeTab, setActiveTab] = useState<"call-history" | "assigned-contacts">("call-history")
  const [agent, setAgent] = useState<IAgent|null>(null);

  useEffect(()=>{
    if(!agentUuid){return}
    handleFetchAgent({agentUuid})
  }, [agentUuid])

  const handleFetchAgent = async ({agentUuid}:{agentUuid:string}) =>{
    try {
      const response = await agentsAPI.getAgentDetails({agentUuid})
      console.log("\n\n Got the agent as : ", response)
      setAgent(response)
    } catch (error) {
      toast.error("Failed to fetch agent")
    }
  }

  return (
    <div className="space-y-6">
      <AgentDetailsHeader agent={agent}  />
      <AgentDetailsInfo agent={agent}  />
      <AgentDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        callHistory={mockCallHistory}
        assignedContacts={mockAssignedContacts}
      />
    </div>
  )
}
