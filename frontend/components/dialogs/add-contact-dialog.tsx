"use client"

import { useState } from "react"
import { DialogSkeleton } from "@/components/dialogs/dialog-skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ICallCenterProduct, IContactFormData } from "@/app/types/api.types"
import { contactsAPI } from "@/lib/api-helpers"
import { toast } from "sonner"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { useSelector } from "react-redux"

interface AddContactDialogProps {
  isOpen: boolean
  onClose: () => void
  products: ICallCenterProduct[];
  onRefreshContacts: () => void
}

export function AddContactDialog({ isOpen, onClose, products, onRefreshContacts }: AddContactDialogProps) {

  const selectedInstitution = useSelector(selectSelectedInstitution)
  const [formData, setFormData] = useState<{ name: string; phone: string; product: string; country_code: string; country: string }>({
    name: "",
    phone: "",
    product: "",
    country_code: "+256",
    country: "Uganda",
  })

  const handleConfirm = () => {
    if (formData.name.trim() && formData.phone.trim() && formData.product) {
      handleAddContact(formData);
      setFormData({ name: "", phone: "", product: "", country_code: "+256", country: "Uganda" });
      onRefreshContacts()
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", phone: "", product: "", country_code: "+256", country: "Uganda" });
  }

  const handleAddContact = async (contactData: { name: string; phone: string; product: string, country_code: string, country: string }) => {
    if (!selectedInstitution) {
      return
    }
    const newContact: Omit<IContactFormData, "uuid" | "status"> = {
      name: contactData.name,
      phone_number: contactData.phone,
      product: contactData.product,
      country_code: contactData.country_code,
      country: contactData.country,
    }

    try {
      const createdContact = await contactsAPI.createForInstitution({
        institutionId: selectedInstitution.id,
        contactData: newContact,
      })
      // console.log("Contact created:", createdContact)
      onRefreshContacts()
    } catch (error) {
      console.error("Error creating contact:", error)
      toast.error("Failed to create contact. Please try again later.")
      return
    }
    // console.log("Added contact:", newContact)
  }

  const isFormValid = formData.name.trim() !== "" && formData.phone.trim() !== "" && formData.product !== ""

  const countries = [
    { value: 'Uganda', label: 'Uganda', code: '+256' },
    { value: 'Kenya', label: 'Kenya', code: '+254' },
    { value: 'Tanzania', label: 'Tanzania', code: '+255' },
    // ...other countries
  ];

  return (
    <DialogSkeleton
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contact"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText="Add Contact"
      confirmDisabled={!isFormValid}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact-name" className="text-sm font-medium">
            Name
          </Label>
          <Input
            id="contact-name"
            placeholder="Contact Name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="contact-phone" className="text-sm font-medium">
            Contact
          </Label>
          <Input
            id="contact-phone"
            placeholder="+256700000000"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="contact-product" className="text-sm font-medium">
            Product
          </Label>
          <Select
            value={formData.product}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, product: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Product" />
            </SelectTrigger>
            <SelectContent>
              {
                products.map((product) => (
                  <SelectItem key={product.uuid} value={product.uuid}>
                    {product.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contact-country" className="text-sm font-medium">
            Country
          </Label>
          <Select
            value={formData.country}
            onValueChange={(value) => {
              const selectedCountry = countries.find((c) => c.value === value);
              if (selectedCountry) {
                setFormData((prev) => ({
                  ...prev,
                  country: selectedCountry.value,
                  country_code: selectedCountry.code,
                }));
              } else {
                setFormData((prev) => ({
                  ...prev,
                  country: "Uganda",
                  country_code: "+256",
                }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </DialogSkeleton>
  )
}
