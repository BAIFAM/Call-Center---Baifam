"use client"
import type { IAgent } from "@/app/types/api.types"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog" // Import all Dialog components
import { CreateAgentForm } from "./create-agent-form"

interface AgentsHeaderProps {
  totalAgents: number
  agents: IAgent[]
  onFilteredAgentsChange: (agents: IAgent[]) => void
  onAgentCreated: () => void
  institutionId: number
}

export function AgentsHeader({
  totalAgents,
  agents,
  onFilteredAgentsChange,
  onAgentCreated,
  institutionId,
}: AgentsHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false)

  useEffect(() => {
    let filtered = agents
    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.user.email.toLowerCase().includes(searchTerm.toLowerCase()) 
      )
    }
    if (companyFilter !== "all") {
      filtered = filtered.filter((agent) => agent.call_group.name === companyFilter)
    }
    onFilteredAgentsChange(filtered)
  }, [searchTerm, companyFilter, statusFilter, agents, onFilteredAgentsChange])

  const uniqueCallGroupNames = Array.from(new Set(agents.map((agent) => agent.call_group.name)))

  return (
    <div className="flex items-center justify-between bg-transparent rounded-xl p-4">
      <h1 className="text-2xl font-bold text-gray-900 pr-4">Agents ({totalAgents})</h1>
      <div className="flex items-center justify-center gap-4 px-6">
        <div className="flex items-center space-x-4">
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-40 rounded-xl">
              <SelectValue placeholder="All Call Groups" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Call Groups</SelectItem>
              {uniqueCallGroupNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="relative">
          <Icon
            icon="hugeicons:search-01"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
          />
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 rounded-xl"
          />
        </div>
        <Dialog open={isCreateAgentDialogOpen} onOpenChange={setIsCreateAgentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-700 rounded-xl text-white pl-4">
              <Icon icon="hugeicons:add-01" className="w-4 h-4 text-white" />
              <span className="ml-2">Add Agent</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {" "}
            {/* DialogContent now wraps the form */}
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>Assign a user to a call group and set their status.</DialogDescription>
            </DialogHeader>
            <CreateAgentForm
              institutionId={institutionId}
              onAgentCreated={onAgentCreated}
              onClose={() => setIsCreateAgentDialogOpen(false)}
            />
            {/* No DialogFooter here, as the form itself contains the submit button */}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
