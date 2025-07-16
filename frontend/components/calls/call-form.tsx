"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icon } from "@iconify/react"
import type { ICall, IContact, ICallFormData } from "@/app/types/api.types"
import { toast } from "sonner"

interface CallFormProps {
  call?: ICall
  contacts: IContact[]
  onSubmit: (data: ICallFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  selectedContact?: IContact // For pre-selected contact
}

export function CallForm({ call, contacts, onSubmit, onCancel, isLoading, selectedContact }: CallFormProps) {
  const [contact, setContact] = useState<IContact | null>(selectedContact || call?.contact || null)
  const [status, setStatus] = useState<"failed" | "completed" | "busy">(call?.status || "completed")
  const [feedback, setFeedback] = useState<Record<string, any>>(
    typeof call?.feedback === "object" ? call?.feedback : {},
  )
  const [files, setFiles] = useState<Record<string, File>>({})

  const handleContactChange = (contactUuid: string) => {
    const selectedContact = contacts.find((c) => c.uuid === contactUuid)
    setContact(selectedContact || null)
    setFeedback({}) // Reset feedback when contact changes
    setFiles({}) // Reset files when contact changes
  }

  const handleFeedbackChange = (fieldName: string, value: any, fieldType: string) => {
    if (fieldType === "file") {
      if (value) {
        setFiles((prev) => ({ ...prev, [fieldName]: value }))
      } else {
        setFiles((prev) => {
          const newFiles = { ...prev }
          delete newFiles[fieldName]
          return newFiles
        })
      }
    } else {
      setFeedback((prev) => ({ ...prev, [fieldName]: value }))
    }
  }

  const handleCheckboxChange = (fieldName: string, option: string, checked: boolean) => {
    setFeedback((prev) => {
      const currentValues = prev[fieldName] || []
      if (checked) {
        return { ...prev, [fieldName]: [...currentValues, option] }
      } else {
        return { ...prev, [fieldName]: currentValues.filter((v: string) => v !== option) }
      }
    })
  }

  const handleStatusChange = (newStatus: "failed" | "completed" | "busy") => {
    setStatus(newStatus)
    if (newStatus !== "completed") {
      setFeedback({})
      setFiles({})
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contact) {
      toast.error("Please select a contact")
      return
    }

    // Only validate feedback fields when status is completed
    if (status === "completed") {
      const requiredFields = contact.product.feedback_fields.filter((field) => field.is_required)
      const feedbackObj =
        typeof call?.feedback === "object" && call?.feedback !== null ? (call.feedback as Record<string, any>) : {}

      for (const field of requiredFields) {
        if (field.type === "file") {
          if (!files[field.name] && !feedbackObj[field.name]) {
            toast.error(`${field.name} is required`)
            return
          }
        } else {
          if (!feedback[field.name] || (Array.isArray(feedback[field.name]) && feedback[field.name].length === 0)) {
            toast.error(`${field.name} is required`)
            return
          }
        }
      }
    }

    const formData: ICallFormData = {
      contact: contact.uuid,
      status,
      feedback: status === "completed" ? feedback : {},
      ...(status === "completed" ? files : {}),
    }

    await onSubmit(formData)
  }

  const renderField = (field: any) => {
    const fieldName = field.name
    const fieldValue = feedback[fieldName] || ""

    switch (field.type) {
      case "text":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              value={fieldValue}
              onChange={(e) => handleFeedbackChange(fieldName, e.target.value, field.type)}
              placeholder={`Enter ${fieldName}`}
              minLength={field.min_length}
              maxLength={field.max_length}
              required={field.is_required}
              className="rounded-xl"
            />
          </div>
        )

      case "number":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              value={fieldValue}
              onChange={(e) => handleFeedbackChange(fieldName, Number(e.target.value), field.type)}
              placeholder={`Enter ${fieldName}`}
              min={field.min_value}
              max={field.max_value}
              required={field.is_required}
              className="rounded-xl"
            />
          </div>
        )

      case "select":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleFeedbackChange(fieldName, value, field.type)}
              required={field.is_required}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={`Select ${fieldName}`} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case "checkbox":
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${fieldName}-${option}`}
                    checked={(fieldValue || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(fieldName, option, checked as boolean)}
                    className="rounded"
                  />
                  <Label htmlFor={`${fieldName}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )

      case "file":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              <Input
                id={fieldName}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  handleFeedbackChange(fieldName, file, field.type)
                }}
                required={field.is_required && !call?.feedback[fieldName]}
                className="rounded-xl"
              />
              {call?.feedback[fieldName] && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Icon icon="hugeicons:file-01" className="w-4 h-4" />
                  <span>Current: {(call.feedback[fieldName] as unknown as { file_name: string }).file_name}</span>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Selection - Always disabled when editing */}
      <div className="space-y-2">
        <Label htmlFor="contact">
          Contact <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={contact?.uuid || ""}
          onValueChange={handleContactChange}
          required
          disabled={true} // Always disabled since contact is pre-selected
        >
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {contacts.map((contact) => (
              <SelectItem key={contact.uuid} value={contact.uuid}>
                <div className="flex items-center justify-between w-full">
                  <span>{contact.name}</span>
                  <Badge variant="outline" className="ml-2 rounded-full">
                    {contact.product.name}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Selection */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select value={status} onValueChange={handleStatusChange} required>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Info Message */}
      {contact && status !== "completed" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <Icon icon="hugeicons:information-circle" className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800">Feedback is only required when call status is "Completed"</p>
          </div>
        </div>
      )}

      {/* Dynamic Feedback Fields - Only show when status is completed */}
      {contact && status === "completed" && contact.product.feedback_fields.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Feedback for {contact.product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">{contact.product.feedback_fields.map(renderField)}</CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 rounded-xl">
          {isLoading && <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />}
          {call ? "Update Call" : "Create Call"}
        </Button>
      </div>
    </form>
  )
}
