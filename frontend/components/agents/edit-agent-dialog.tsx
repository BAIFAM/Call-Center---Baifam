import { IAgent } from "@/app/types/api.types"
import { agentsAPI } from "@/lib/api-helpers"

import { useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"


export function EditAgentDialog({ agent, open, onOpenChange, onAgentUpdated }: { agent: IAgent, open: boolean, onOpenChange: (open: boolean) => void, onAgentUpdated: () => void }) {

    console.log("\n\n Agent to edit : ", agent)
    const [status, setStatus] = useState<"active" | "disabled">(agent.is_active ? "active" : "disabled")
    const [extension, setExtension] = useState(agent.extension)
    const [deviceId, setDeviceId] = useState(agent.device_id)
    const [loading, setLoading] = useState(false)
  
    if (!agent) return null
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      try {
        await agentsAPI.updateAgent({
          uuid: agent.uuid,
          updates: {
            is_active: status === "active",
            extension: extension.trim(),
            device_id: deviceId.trim(),
          },
        })
        toast.success("Agent updated successfully")
        onAgentUpdated()
        onOpenChange(false)
      } catch (error) {
        toast.error("Failed to update agent. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>Edit agent details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">User</Label>
                <Input
                  className="col-span-3"
                  value={agent.user.user.fullname + " (" + agent.user.user.email + ")"}
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="extension" className="text-right">Extension</Label>
                <Input
                  id="extension"
                  value={extension}
                  onChange={e => setExtension(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="device-id" className="text-right">Device ID</Label>
                <Input
                  id="device-id"
                  value={deviceId}
                  onChange={e => setDeviceId(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status-select" className="text-right">Status</Label>
                <div className="col-span-3">
                  <Select
                    value={status}
                    onValueChange={value => setStatus(value as "active" | "disabled")}
                    disabled={loading}
                  >
                    <SelectTrigger id="status-select">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
  