import { countryAPI, contactsAPI } from "@/lib/api-helpers"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { CountryCode, isValidPhoneNumber } from "libphonenumber-js"
import { Input } from "../ui/input"
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { ICallCenterProduct } from "@/app/types/api.types"
import { Label } from "@/components/ui/label"
import { ICountry } from "@/app/types/types.utils"
import CountrySelect from "../common/country-select"


interface CreateContactDialogProps {
  isOpen: boolean
  onClose: () => void
  products: ICallCenterProduct[]
  onCreateSuccess: () => void
}

interface ContactFormData {
  name: string
  phone_number: string
  product: string
  email?: string
  notes?: string
  country?: string
}

export function CreateContactDialog({ isOpen, onClose, products, onCreateSuccess }: CreateContactDialogProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone_number: "",
    product: "",
    email: "",
    notes: "",
    country: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countries, setCountries] = useState<ICountry[]>([])
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const selectedInstitution = useSelector(selectSelectedInstitution)

  useEffect(() => {
    countryAPI.getAll()
      .then((data) => setCountries(data))
      .catch(() => toast.error("Failed to load countries"))
  }, [])

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (country: ICountry | null) => {
    setSelectedCountry(country)
    setFormData(prev => ({
      ...prev,
      country: country?.name.common || "",
    }))
    setPhoneError(null)
    setFormData(prev => ({ ...prev, phone_number: "" }))
  }

  const getCountryCode = () => {
    if (!selectedCountry?.idd?.root) return ""
    const suffix = selectedCountry.idd.suffixes?.[0] || ""
    return `${selectedCountry.idd.root}${suffix}`
  }

  const getFlag = (cca2: string) =>
    String.fromCodePoint(...cca2.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))

const handlePhoneChange = (value: string) => {
  // Remove leading zero if present
  const sanitizedValue = value.replace(/^0+/, "")
  setFormData(prev => ({ ...prev, phone_number: sanitizedValue }))
  if (selectedCountry && sanitizedValue) {
    const code = selectedCountry.cca2 as CountryCode
    // Validate using national number and country code
    if (!isValidPhoneNumber(sanitizedValue, code)) {
      setPhoneError("Invalid phone number for selected country")
    } else {
      setPhoneError(null)
    }
  } else {
    setPhoneError(null)
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInstitution) {
      toast.error("No institution selected")
      return
    }

    if (
      !formData.name.trim() ||
      !formData.phone_number.trim() ||
      !formData.product ||
      !selectedCountry ||
      phoneError
    ) {
      toast.error("Please fill in all required fields correctly")
      return
    }

    setIsSubmitting(true)
    try {
      await contactsAPI.createForInstitution({
        institutionId: selectedInstitution.id,
        contactData: {
          name: formData.name.trim(),
          phone_number: `${getCountryCode()}${formData.phone_number.trim()}`,
          product: formData.product,
          email: formData.email?.trim() ?? "",
          notes: formData.notes?.trim(),
          country: selectedCountry.name.common,
          country_code: getCountryCode(),
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
      product: "",
      email: "",
      notes: "",
      country: "",
    })
    setSelectedCountry(null)
    setPhoneError(null)
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
            <Label htmlFor="country">ICountry *</Label>
            <CountrySelect
              countries={countries}
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex gap-2 items-center">
              {selectedCountry && (
                <span className="mr-2 text-lg">{getFlag(selectedCountry.cca2)}</span>
              )}
              <Input
                id="country_code"
                value={getCountryCode()}
                disabled
                style={{ width: "80px" }}
              />
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="Enter phone number"
                required
                type="tel"
              />
            </div>
            {phoneError && <span className="text-red-500 text-xs">{phoneError}</span>}
          </div>

          <div className="space-y-2 !z-[200]">
            <Label htmlFor="product">Product *</Label>
            <Select  value={formData.product} onValueChange={(value) => handleInputChange("product", value)}>
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
            <Button type="submit" disabled={isSubmitting || !!phoneError}>
              {isSubmitting ? "Creating..." : "Create Contact"}
            </Button>
          </DialogFooter>       </form>
      </DialogContent>
    </Dialog>
  )
}