"use client"

import type { ICallGroup } from "@/app/types/api.types"

interface CallGroupDetailsInfoProps {
  callGroup: ICallGroup
}

export function CallGroupDetailsInfo({ callGroup }: CallGroupDetailsInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-900">{callGroup.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Institution</h3>
          <p className="text-gray-900">{callGroup.institution.institution_name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Created Date</h3>
          <p className="text-gray-900">{formatDate(callGroup.created_at)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
          <p className="text-gray-900">{formatDate(callGroup.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}
