"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import type { ICallGroup } from "@/app/types/api.types"
import { callGroupAPI } from "@/lib/api-helpers"
import { toast } from "sonner"
import { Textarea } from "../ui/textarea"

interface EditCallGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  callGroup: ICallGroup | null
  onCallGroupUpdated: (callGroup: ICallGroup) => void
}

export function EditCallGroupDialog({ open, onOpenChange, callGroup, onCallGroupUpdated }: EditCallGroupDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (callGroup) {
      setName(callGroup.name || "")
    }
  }, [callGroup, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!callGroup) return
    setLoading(true)
    try {
      const updatedCallGroup = await callGroupAPI.update({
        uuid: callGroup.uuid,
        updates: {
          name
        },
      })
      onCallGroupUpdated(updatedCallGroup)
      toast.success(`Call group ${updatedCallGroup.name} has been updated.`)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update call group:", error)
      toast.error("Failed to update call group. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Call Group</DialogTitle>
          <DialogDescription>Edit the name and description for this call group. Click save when you're done.</DialogDescription>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 