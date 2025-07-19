"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icon } from "@iconify/react"
import { toast } from "sonner"
import type { IClientCompany, IClientCompanyFormData } from "@/app/types/api.types"

interface ClientCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit:
    | ((data: IClientCompanyFormData) => Promise<void>)
    | ((data: Partial<IClientCompanyFormData>) => Promise<void>)
  isLoading?: boolean
  institutionId: number
  company?: IClientCompany | null
  mode: "add" | "edit"
}

export function ClientCompanyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  institutionId,
  company,
  mode,
}: ClientCompanyModalProps) {
  const [formData, setFormData] = useState<IClientCompanyFormData>({
    institution: institutionId,
    company_name: "",
    contact_email: "",
    contact_phone: "",
    callback_url: "",
    api_key: "",
  })

  useEffect(() => {
    console.log("\n\n Received company on edit : ", company)
    if (company && mode === "edit") {
      setFormData({
        institution: company.institution.id,
        company_name: company.company_name,
        contact_email: company.contact_email,
        contact_phone: company.contact_phone,
        callback_url: company.callback_url,
        api_key: company.api_key,
      })
    } else {
      setFormData({
        institution: institutionId,
        company_name: "",
        contact_email: "",
        contact_phone: "",
        callback_url: "",
        api_key: "",
      })
    }
  }, [company, institutionId, isOpen, mode])

  const handleInputChange = (field: keyof IClientCompanyFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.company_name.trim()) {
      toast.error("Company name is required")
      return
    }

    if (!formData.contact_email.trim()) {
      toast.error("Contact email is required")
      return
    }

    if (!formData.contact_phone.trim()) {
      toast.error("Contact phone is required")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.contact_email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (mode === "add") {
      await (onSubmit as (data: IClientCompanyFormData) => Promise<void>)(formData)
    } else {
      await (onSubmit as (data: Partial<IClientCompanyFormData>) => Promise<void>)(formData)
    }
  }

  const generateApiKey = () => {
    const prefix = formData.company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 3)
    const randomString = Math.random().toString(36).substring(2, 15)
    const apiKey = `${prefix}_live_sk_${randomString}`
    handleInputChange("api_key", apiKey)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Client Company" : "Add Client Company"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange("company_name", e.target.value)}
                placeholder="Enter company name"
                className="rounded-xl"
                required
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange("contact_email", e.target.value)}
                placeholder="contact@company.com"
                className="rounded-xl"
                required
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contact_phone">
                Contact Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                placeholder="+256700000000"
                className="rounded-xl"
                required
              />
            </div>

            {/* Callback URL */}
            <div className="space-y-2">
              <Label htmlFor="callback_url">Callback URL</Label>
              <Input
                id="callback_url"
                type="url"
                value={formData.callback_url}
                onChange={(e) => handleInputChange("callback_url", e.target.value)}
                placeholder="https://company.com/api/callback"
                className="rounded-xl"
              />
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="api_key"
                value={formData.api_key}
                onChange={(e) => handleInputChange("api_key", e.target.value)}
                placeholder="API key will be generated automatically"
                className="rounded-xl flex-1"
              />
              <Button type="button" variant="outline" onClick={generateApiKey} className="rounded-xl bg-transparent">
                <Icon icon="hugeicons:refresh" className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700 rounded-xl">
              {isLoading && <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "edit" ? "Update Company" : "Create Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
