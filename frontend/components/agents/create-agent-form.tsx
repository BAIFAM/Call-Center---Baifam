"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ICallGroup, ICallGroupUserFormData, IUser, IUserProfile } from "@/app/types/api.types"
import { callGroupAPI, agentsAPI, institutionAPI, userAPI } from "@/lib/api-helpers"
import { Icon } from "@iconify/react"
import { CreateUserDialog } from "./create-user-dialog"
import { CreateCallGroupDialog } from "./create-call-group-dialog"
import { useToast } from "@/hooks/use-toast"

interface CreateAgentFormProps {
  institutionId: number
  onAgentCreated: () => void
  onClose: () => void 
}

export function CreateAgentForm({ institutionId, onAgentCreated, onClose }: CreateAgentFormProps) {
  const [userProfles, setUserProfles] = useState<IUserProfile[]>([])
  const [callGroups, setCallGroups] = useState<ICallGroup[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedCallGroupUuid, setSelectedCallGroupUuid] = useState<string>("")
  const [status, setStatus] = useState<string>("active")
  const [loading, setLoading] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isCreatingCallGroup, setIsCreatingCallGroup] = useState(false)
  const { toast } = useToast()

  const fetchUsersAndCallGroups = async () => {
    setLoading(true)
    try {
      const [fetchedUsers, fetchedCallGroups] = await Promise.all([
        institutionAPI.getUsersProfiles({institutionId}),
        callGroupAPI.getByInstitution({ institutionId }),
      ])
      setUserProfles(fetchedUsers)
      setCallGroups(fetchedCallGroups)
      // Pre-select first available if any
      if (fetchedUsers.length > 0 && !selectedUserId) {
        setSelectedUserId(String(fetchedUsers[0].id))
      }
      if (fetchedCallGroups.length > 0 && !selectedCallGroupUuid) {
        setSelectedCallGroupUuid(fetchedCallGroups[0].uuid)
      }
    } catch (error) {
      console.error("Failed to fetch users or call groups:", error)
      toast({
        title: "Error",
        description: "Failed to load users or call groups.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersAndCallGroups()
  }, [institutionId]) 

  const handleUserCreated = (newUser: IUserProfile) => {
    setUserProfles((prev) => [...prev, newUser])
    setSelectedUserId(String(newUser.id)) 
    setIsCreatingUser(false)
  }

  const handleCallGroupCreated = (newCallGroup: ICallGroup) => {
    setCallGroups((prev) => [...prev, newCallGroup])
    setSelectedCallGroupUuid(newCallGroup.uuid) 
    setIsCreatingCallGroup(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !selectedCallGroupUuid) {
      toast({
        title: "Validation Error",
        description: "Please select a user and a call group.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const payload: ICallGroupUserFormData = {
          user: Number(selectedUserId),
          call_group: selectedCallGroupUuid,
          status: status,
          uuid: ""
      }
      await agentsAPI.createUser({ institutionId, userData: payload })
      console.log("Payload being sent:", payload)
      toast({
        title: "Agent Created",
        description: "The new agent has been successfully added.",
      })
      onAgentCreated() 
      onClose() 
    } catch (error) {
      console.error("Failed to create agent:", error)
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user-select" className="text-right">
              User
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading}>
                <SelectTrigger id="user-select" className="flex-1">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {userProfles.length === 0 && (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  )}
                  {userProfles.map((userProfile) => (
                    <SelectItem key={userProfile.user.id} value={String(userProfile.user.id)}>
                      {userProfile.user.fullname} ({userProfile.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsCreatingUser(true)}
                disabled={loading}
              >
                <Icon icon="hugeicons:add-01" className="w-4 h-4" />
                <span className="sr-only">Create New User</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="call-group-select" className="text-right">
              Call Group
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={selectedCallGroupUuid} onValueChange={setSelectedCallGroupUuid} disabled={loading}>
                <SelectTrigger id="call-group-select" className="flex-1">
                  <SelectValue placeholder="Select a call group" />
                </SelectTrigger>
                <SelectContent>
                  {callGroups.length === 0 && (
                    <SelectItem value="no-groups" disabled>
                      No call groups available
                    </SelectItem>
                  )}
                  {callGroups.map((group) => (
                    <SelectItem key={group.uuid} value={group.uuid}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsCreatingCallGroup(true)}
                disabled={loading}
              >
                <Icon icon="hugeicons:add-01" className="w-4 h-4" />
                <span className="sr-only">Create New Call Group</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status-select" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
            <Select value={status} onValueChange={setStatus} disabled={loading}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Agent..." : "Create Agent"}
          </Button>
        </div>
      </form>

      <CreateUserDialog open={isCreatingUser} onOpenChange={setIsCreatingUser} onUserCreated={handleUserCreated} />
      <CreateCallGroupDialog
        open={isCreatingCallGroup}
        onOpenChange={setIsCreatingCallGroup}
        onCallGroupCreated={handleCallGroupCreated}
      />
    </>
  )
}
