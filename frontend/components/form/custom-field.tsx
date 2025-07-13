"use client"

import { useState } from "react"
import type { CustomField } from "@/app/types/types.utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Icon } from "@iconify/react"

interface CustomFieldProps {
  field: CustomField
  onEdit: (fieldId: string) => void
  onDelete: (fieldId: string) => void
  onValueChange: (fieldId: string, value: any) => void
}

export function CustomFieldComponent({ field, onEdit, onDelete, onValueChange }: CustomFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            type={field.type}
            value={field.value || ""}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="flex-1 rounded-xl"
          />
        )
      case "textarea":
        return (
          <Textarea
            value={field.value || ""}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="flex-1 rounded-xl"
          />
        )
      case "date":
        return (
          <Input
            type="date"
            value={field.value || ""}
            onChange={(e) => onValueChange(field.id, e.target.value)}
            className="flex-1 rounded-xl"
          />
        )
      case "file":
        return (
          <Input
            type="file"
            onChange={(e) => {
              if (!e.target.files || e.target.files.length === 0) return
              onValueChange(field.id, e.target.files[0])
            }}
            className="flex-1 rounded-xl"
          />
        )
      case "checkbox":
        if (field.options && field.options.length > 0) {
          return (
            <div className="flex-1 space-y-2">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    checked={Array.isArray(field.value) ? field.value.includes(option) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(field.value) ? field.value : []
                      const newValues = checked ? [...currentValues, option] : currentValues.filter((v) => v !== option)
                      onValueChange(field.id, newValues)
                    }}
                  />
                  <span className="text-sm">{option}</span>
                </div>
              ))}
            </div>
          )
        } else {
          return (
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                checked={field.value || false}
                onCheckedChange={(checked) => onValueChange(field.id, checked)}
              />
              <span className="text-sm">{field.name}</span>
            </div>
          )
        }
      case "select":
        return (
          <Select value={field.value || ""} onValueChange={(value) => onValueChange(field.id, value)}>
            <SelectTrigger className="flex-1 rounded-xl">
              <SelectValue placeholder={`Select ${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.length > 0 ? (
                field.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex items-center space-x-2 p-2 px-4 bg-gray-200 rounded-2xl w-full">
      <div className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {field.description && (
              <TooltipProvider>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full bg-black !aspect-square italic hover:bg-black/90 text-sm text-white hover:text-white"
                      onClick={() => setShowTooltip(!showTooltip)}
                    >
                      i
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{field.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {field.type && <span className="text-sm font-medium text-gray-700">{field.name}</span>}
          </div>
          {/* {renderField()} */}
        </div>
      </div>

      <div className="flex space-x-1">
        <Button variant="ghost" size="sm" onClick={() => onEdit(field.id)} className="h-8 w-8 p-0 rounded-xl">
          <Icon icon="hugeicons:edit-02" className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(field.id)}
          className="h-8 w-8 p-0 rounded-xl text-red-500 hover:text-red-700"
        >
          <Icon icon="hugeicons:delete-02" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
