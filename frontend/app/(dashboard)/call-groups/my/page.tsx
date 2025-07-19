"use client"

import { useState, useEffect } from "react"
import { CallGroupsList } from "@/components/call-groups/call-groups-list"
import { callGroupAPI } from "@/lib/api-helpers"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import type { ICallGroup } from "@/app/types/api.types"

export default function MyCallGroupsPage() {
    const [callGroups, setCallGroups] = useState<ICallGroup[]>([])
    const [loading, setLoading] = useState(true)
    const currentInstitution = useSelector(selectSelectedInstitution)

    useEffect(() => {
        fetchMyCallGroups()
    }, [])

    const fetchMyCallGroups = async () => {
        if (!currentInstitution) return
        try {
            const groups = await callGroupAPI.getByCurrentUser({ institutionId: currentInstitution.id })
            setCallGroups(groups)
        } catch (error) {
            console.error("Error fetching my call groups:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading your call groups...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Call Groups</h1>
            <CallGroupsList callGroups={callGroups} />
        </div>
    )
}