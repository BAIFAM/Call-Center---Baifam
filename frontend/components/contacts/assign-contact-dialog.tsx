"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { callGroupAPI, contactsAPI } from "@/lib/api-helpers"
import type { IContact, ICallGroup, ICallGroupContactFormData } from "@/app/types/api.types"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { useSelector } from "react-redux"

interface AssignContactDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contact: IContact
    onAssigned: () => void
}

export function AssignContactDialog({ open, onOpenChange, contact, onAssigned }: AssignContactDialogProps) {
    const [callGroups, setCallGroups] = useState<ICallGroup[]>([])
    const [selectedCallGroupUuid, setSelectedCallGroupUuid] = useState("")
    const [loading, setLoading] = useState(false);
    const currentInstitution = useSelector(selectSelectedInstitution);
    const callGroupContactFormData: ICallGroupContactFormData = {
        call_group: selectedCallGroupUuid,
        contact: contact.uuid,
        status: "not_attended"
    }

    useEffect(() => {
        if (open && currentInstitution) {
            callGroupAPI.getByInstitution({ institutionId: currentInstitution.id }).then(setCallGroups)
        }
        if (contact?.call_group) {
            setSelectedCallGroupUuid(contact.call_group as string)
        } else {
            setSelectedCallGroupUuid("")
        }
    }, [open, currentInstitution, contact])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!contact || !selectedCallGroupUuid || !currentInstitution) return

        setLoading(true)
        try {
            await contactsAPI.assignToCallGroup({
                institutionId: currentInstitution.id,
                callGroupContactData: callGroupContactFormData,
            })
            onAssigned()
            onOpenChange(false)
        } catch (error) {
            // Handle error (toast, etc.)
            console.error("Failed to assign/re-assign contact:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{contact?.call_group ? "Re-assign Contact" : "Assign Contact"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Contact</label>
                        <input
                            type="text"
                            value={contact?.name || ""}
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
                            {loading ? "Saving..." : contact?.call_group ? "Re-assign" : "Assign"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}