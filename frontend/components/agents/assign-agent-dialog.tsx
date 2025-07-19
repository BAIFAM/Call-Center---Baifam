"use client"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { callGroupAPI, agentsAPI } from "@/lib/api-helpers"
import type { IAgent, ICallGroup } from "@/app/types/api.types"

interface AssignAgentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agent: IAgent | null
    institutionId: number
    onAssigned: () => void
}

export function AssignAgentDialog({ open, onOpenChange, agent, institutionId, onAssigned }: AssignAgentDialogProps) {
    const [callGroups, setCallGroups] = useState<ICallGroup[]>([])
    const [selectedCallGroupUuid, setSelectedCallGroupUuid] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open && institutionId) {
            callGroupAPI.getByInstitution({ institutionId }).then(setCallGroups)
        }
        if (agent?.call_group?.uuid) {
            setSelectedCallGroupUuid(agent.call_group.uuid)
        } else {
            setSelectedCallGroupUuid("")
        }
    }, [open, institutionId, agent])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!agent || !selectedCallGroupUuid) return
        setLoading(true)
        try {
            if (agent.call_group) {
                // Re-assign
                await agentsAPI.updateAgent({
                    uuid: agent.uuid,
                    updates: { call_group: selectedCallGroupUuid, status: "active" }
                })
            } else {
                // Assign
                await agentsAPI.createAgent({
                    institutionId,
                    userData: { user: agent.user.id, call_group: selectedCallGroupUuid, status: "active" }
                })
            }
            onAssigned()
            onOpenChange(false)
        } catch (error) {
            // Handle error (toast, etc.)
            console.error("Failed to assign/re-assign agent:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{agent?.call_group ? "Re-assign Agent" : "Assign Agent"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Agent</label>
                        <input
                            type="text"
                            value={agent?.user.fullname || ""}
                            disabled
                            className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Call Group</label>
                        <Select value={selectedCallGroupUuid} onValueChange={setSelectedCallGroupUuid}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a call group" />
                            </SelectTrigger>
                            <SelectContent>
                                {callGroups.map((group) => (
                                    <SelectItem key={group.uuid} value={group.uuid}>
                                        {group.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !selectedCallGroupUuid}>
                            {loading ? "Saving..." : agent?.call_group ? "Re-assign" : "Assign"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}