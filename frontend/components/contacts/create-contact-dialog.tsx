"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { contactsAPI } from "@/lib/api-helpers"
import type { ICallCenterProduct } from "@/app/types/api.types"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"

interface CreateContactDialogProps {
  isOpen: boolean
  onClose: () => void
  products: ICallCenterProduct[]
  onCreateSuccess: () => void
}

interface ContactFormData {
  name: string
  phone_number: string
  product: string // Changed from product_uuid to product
  email?: string
  notes?: string
  country?: string
  country_code?: string
}

export function CreateContactDialog({ isOpen, onClose, products, onCreateSuccess }: CreateContactDialogProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone_number: "",
    product: "", // Changed from product_uuid to product
    email: "",
    notes: "",
    country: "",
    country_code: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedInstitution = useSelector(selectSelectedInstitution)

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInstitution) {
      toast.error("No institution selected")
      return
    }

    if (!formData.name.trim() || !formData.phone_number.trim() || !formData.product) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await contactsAPI.createForInstitution({
        institutionId: selectedInstitution.id,
        contactData: {
          name: formData.name.trim(),
          phone_number: formData.phone_number.trim(),
          product: formData.product,
          email: formData.email?.trim() ?? "",
          notes: formData.notes?.trim(),
          country: formData.country?.trim() ?? "",
          country_code: formData.country_code?.trim() ?? "",
        },
      })

      toast.success("Contact created successfully")
      onCreateSuccess()
      handleClose()
    } catch (error: any) {
      console.error("Error creating contact:", error)
      toast.error(error.message || "Failed to create contact")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: "",
      phone_number: "",
      product: "", // Changed from product_uuid to product
      email: "",
      notes: "",
      country: "",
      country_code: "",
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Contact</DialogTitle>
          <DialogDescription>Add a new contact to your institution.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone_number}
              onChange={(e) => handleInputChange("phone_number", e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select value={formData.product} onValueChange={(value) => handleInputChange("product", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.uuid} value={product.uuid}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Enter country (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_code">Country Code</Label>
            <Input
              id="country_code"
              value={formData.country_code}
              onChange={(e) => handleInputChange("country_code", e.target.value)}
              placeholder="Enter country code (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes (optional)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}