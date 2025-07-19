"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import type { IClientCompany } from "@/app/types/api.types"
import Link from "next/link"

interface ClientCompaniesListProps {
  clientCompanies: IClientCompany[]
  onEdit: (company: IClientCompany) => void
  onDelete: (company: IClientCompany) => void
}

export function ClientCompaniesList({ clientCompanies, onEdit, onDelete }: ClientCompaniesListProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Has System
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientCompanies.map((company) => (
              <tr key={company.uuid} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{company.company_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{company.contact_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{company.contact_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`rounded-full ${getStatusColor(company.status)}`}>{company.status}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {company.has_system ? (
                      <Icon icon="hugeicons:check-circle" className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon icon="hugeicons:cancel-circle" className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(company.created_at)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2 rounded-lg" asChild>
                      <Link href={`/client-companies/${company.uuid}`}>
                        <Icon icon="hugeicons:view" className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 rounded-lg" onClick={() => onEdit(company)}>
                      <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 rounded-lg text-red-600 hover:text-red-700"
                      onClick={() => onDelete(company)}
                    >
                      <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
