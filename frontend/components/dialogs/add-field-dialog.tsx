"use client"

import { useState } from "react"
import { DialogSkeleton } from "@/components/dialogs/dialog-skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AddFieldFormData, FieldType } from "@/app/types/types.utils"
import { Icon } from "@iconify/react"
import { Button } from "@/components/ui/button"

interface AddFieldDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddField: (field: AddFieldFormData) => void
  initialFieldValues?: AddFieldFormData
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File" },
]

export function AddFieldDialog({ isOpen, onClose, onAddField, initialFieldValues }: AddFieldDialogProps) {
  const [formData, setFormData] = useState<AddFieldFormData>(initialFieldValues || {
    title: "",
    description: "",
    fieldType: "text",
    options: [],
  })

  const [currentOption, setCurrentOption] = useState("")

  const addOption = () => {
    if (currentOption.trim() && !formData.options?.includes(currentOption.trim())) {
      setFormData((prev) => ({
        ...prev,
        options: [...(prev.options || []), currentOption.trim()],
      }))
      setCurrentOption("")
    }
  }

  const removeOption = (optionToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((option) => option !== optionToRemove) || [],
    }))
  }

  const handleConfirm = () => {
    if (formData.title.trim()) {
      onAddField(formData)
      setFormData({ title: "", description: "", fieldType: "text", options: [] })
    }
  }

  const handleCancel = () => {
    setFormData({ title: "", description: "", fieldType: "text", options: [] })
    setCurrentOption("")
  }

  const isFormValid = formData.title.trim() !== ""

  return (
    <DialogSkeleton
      isOpen={isOpen}
      onClose={onClose}
      title="Add Field"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText="Add Field"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-4 h-full !w-full !max-w-xl max-h-[40svh] overflow-y-auto my-6 px-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">
            Title
          </Label>
          <Input
            id="title"
            placeholder="Field Title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Input
            id="description"
            placeholder="Field Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="fieldType" className="text-sm font-medium">
            Field Type
          </Label>
          <Select
            value={formData.fieldType}
            onValueChange={(value: FieldType) => setFormData((prev) => ({ ...prev, fieldType: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Field Type" />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {(formData.fieldType === "select" || formData.fieldType === "checkbox") && (
          <div>
            <Label className="text-sm font-medium">Options</Label>
            <div className="space-y-2 mt-1">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add option"
                  value={currentOption}
                  onChange={(e) => setCurrentOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                  className="flex-1 rounded-xl"
                />
                <Button type="button" onClick={addOption} variant="outline" size="sm" className="rounded-xl">
                  <Icon icon="hugeicons:add-01" className="h-4 w-4" />
                </Button>
              </div>
              {formData.options && formData.options.length > 0 && (
                <div className="space-y-1">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                      <span className="text-sm">{option}</span>
                      <Button
                        type="button"
                        onClick={() => removeOption(option)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Icon icon="hugeicons:delete-02" className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogSkeleton>
  )
}
