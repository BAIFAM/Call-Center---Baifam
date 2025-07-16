"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ICallGroup, ICallGroupFormData } from "@/app/types/api.types"
import { callGroupAPI } from "@/lib/api-helpers" 
import { useToast } from "@/hooks/use-toast"

interface CreateCallGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCallGroupCreated: (callGroup: ICallGroup) => void
}

export function CreateCallGroupDialog({ open, onOpenChange, onCallGroupCreated }: CreateCallGroupDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const newCallGroup: ICallGroupFormData = {
          name,
          institution: 0
      }
      const createdCallGroup = await callGroupAPI.create({ institutionId: 1, groupData: newCallGroup }) // Assuming institutionId is needed for create
      onCallGroupCreated(createdCallGroup)
      toast({
        title: "Call Group Created",
        description: `${createdCallGroup.name} has been successfully added.`,
      })
      onOpenChange(false) // Close dialog
      setName("") // Reset form field
    } catch (error) {
      console.error("Failed to create call group:", error)
      toast({
        title: "Error",
        description: "Failed to create call group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Call Group</DialogTitle>
          <DialogDescription>Enter the name for the new call group. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Call Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
