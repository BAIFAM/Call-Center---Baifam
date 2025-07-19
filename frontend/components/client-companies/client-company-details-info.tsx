"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { toast } from "sonner"
import type { IClientCompany } from "@/app/types/api.types"

interface ClientCompanyDetailsInfoProps {
  clientCompany: IClientCompany
}

export function ClientCompanyDetailsInfo({ clientCompany }: ClientCompanyDetailsInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Company Name</h3>
            <p className="text-gray-900">{clientCompany.company_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
            <Badge className={`rounded-full ${getStatusColor(clientCompany.status)}`}>{clientCompany.status}</Badge>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Email</h3>
            <p className="text-gray-900">{clientCompany.contact_email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Phone</h3>
            <p className="text-gray-900">{clientCompany.contact_phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Has System Integration</h3>
            <div className="flex items-center space-x-2">
              {clientCompany.has_system ? (
                <>
                  <Icon icon="hugeicons:check-circle" className="w-5 h-5 text-green-500" />
                  <span className="text-green-600">Yes</span>
                </>
              ) : (
                <>
                  <Icon icon="hugeicons:cancel-circle" className="w-5 h-5 text-red-500" />
                  <span className="text-red-600">No</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Callback URL</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">
                {clientCompany.callback_url}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(clientCompany.callback_url, "Callback URL")}
                className="rounded-lg bg-transparent"
              >
                <Icon icon="hugeicons:copy-01" className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">API Key</h3>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono">{clientCompany.api_key}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(clientCompany.api_key, "API Key")}
                className="rounded-lg bg-transparent"
              >
                <Icon icon="hugeicons:copy-01" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created Date</h3>
            <p className="text-gray-900">{formatDate(clientCompany.created_at)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
            <p className="text-gray-900">{formatDate(clientCompany.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
