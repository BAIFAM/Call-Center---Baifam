"use client"

import { IAgent } from "@/app/types/api.types"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { Checkbox } from "../ui/checkbox"

interface AgentsListProps {
  agents: IAgent[],
  selectedAgent: IAgent | null,
  onSelectAgent: (agent: IAgent | null) => void
}

export function AgentsList({ agents, selectedAgent, onSelectAgent }: AgentsListProps) {
  return (
    <div className="bg-white rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Extension
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Id</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.map((agent) => (
              <tr key={agent.uuid} className={`hover:bg-gray-50 }`}>
                <td className="px-6 py-4">
                  <Checkbox checked={selectedAgent?.uuid === agent.uuid} onCheckedChange={() => onSelectAgent(selectedAgent?.uuid === agent.uuid ? null : agent)} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {agent.user.user.fullname}  
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{agent.user.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{agent.extension}</div> {/* Placeholder */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{agent.device_id}</div> {/* Placeholder */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2 rounded-lg" asChild>
                      <Link href={`/agents/${agent.uuid}`}>
                        <Icon icon="hugeicons:view" className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination UI (placeholder) */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">Showing 1–{agents.length} of {agents.length}</p>
        {/* You can wire real pagination logic later if needed */}
      </div>
    </div>
  )
}
