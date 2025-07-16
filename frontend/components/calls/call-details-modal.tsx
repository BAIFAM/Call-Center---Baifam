"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import type { ICall } from "@/app/types/api.types"
import { formatDate } from "date-fns"

interface CallDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  call: ICall | null
}

export function CallDetailsModal({ isOpen, onClose, call }: CallDetailsModalProps) {
  if (!call) return null

  const getStatusColor = (status: ICall["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "busy":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderFeedbackValue = (field: any, value: any) => {
    if (field.type === "file" && value) {
      
      return (
        <div className="flex items-center space-x-2">
          <Icon icon="hugeicons:file-01" className="w-4 h-4" />
          <a href={`${process.env.NEXT_PUBLIC_BASE_URL}${value.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value.file_name}
          </a>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => (
            <Badge key={index} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      )
    }

    return <span>{value}</span>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[32rem] w-full max-w-[80svw] lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Call Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6  max-h-[90vh] overflow-y-auto">
          {/* Call Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date & Time</p>
                  <p className="text-sm">{formatDate(new Date(call.made_on), "PPpp")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={`rounded-full ${getStatusColor(call.status)}`}>{call.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Agent</p>
                  <p className="text-sm">{call.made_by.fullname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Agent Email</p>
                  <p className="text-sm">{call.made_by.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm">{call.contact.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-sm">{call.contact.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Country</p>
                  <p className="text-sm">{call.contact.country}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Product</p>
                  <Badge variant="outline">{call.contact.product.name}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Institution Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Institution Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Institution</p>
                  <p className="text-sm">{call.contact.product.institution.institution_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm">{call.contact.product.institution.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{call.contact.product.institution.institution_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{call.contact.product.institution.first_phone_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {call.contact.product.feedback_fields.map((field) => {
                const value = call.feedback[field['name']]
                if (value === undefined || value === null || value === "") return null

                return (
                  <div key={field.name}>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {field.name}
                      {field.is_required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <div className="text-sm">{renderFeedbackValue(field, value)}</div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
