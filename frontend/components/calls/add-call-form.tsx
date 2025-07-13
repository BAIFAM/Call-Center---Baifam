"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Icon } from "@iconify/react"
import type { CallFormData } from "@/app/types/types.utils"
import { useRouter } from "next/navigation"
import { callsAPI, contactsAPI, institutionAPI } from "@/lib/api-helpers"
import { ICallCenterProduct, IContact } from "@/app/types/api.types"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

export function AddCallForm() {

  const [products, setProducts] = useState<ICallCenterProduct[]>([]);
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ICallCenterProduct | null>(null);
  const selectedInstitution = useSelector(selectSelectedInstitution)

  useEffect(() => {
    handleFetchProducts();
    handleFetchContacts();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      feedback: selectedProduct?.feedback_fields.reduce((acc, field) => {
        acc[field.name] = field.type === "checkbox" ? [] : "";
        return acc;
      }, {} as Record<string, any>) || {}
    }));
  }, [selectedProduct]);

  const handleFetchProducts = async () => {
    try {
      const fetchedProducts = await institutionAPI.getProductsByInstitution({
        institutionId: 1,
      });
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleFetchContacts = async () => {
    if (!selectedInstitution) { return }
    try {
      const response = await contactsAPI.getContactsByInstitution({ institutionId: selectedInstitution.id });
      setContacts(response);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      console.error("Error fetching contacts:", error);
    }
  };

  const [formData, setFormData] = useState<{
    client: string
    product: string
    contact: string
    status: string
    date: string
    duration: string
    direction: string
    feedback: Record<string, any>
  }>({
    client: "",
    contact: "",
    product: "",
    status: "",
    date: "",
    duration: "00:00:00",
    direction: "",
    feedback: {},
  })

  const router = useRouter();

  const handleBack = () => {
    router.back()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitution) { return }
    try {
      // Prepare payload for FormData
      const payload: any = {
        contact: formData.contact,
        feedback: formData.feedback,
        status: formData.status as "failed" | "completed" | "busy",
      };
      await callsAPI.createCall({
        institutionId: selectedInstitution.id,
        callData: payload,
      });
      toast.success("Call added successfully!");
      router.push("/calls");
    } catch (error) {
      toast.error("Failed to add call. Please try again.");
    }
  }

  const handleInputChange = (field: keyof CallFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "product") {
      const product = products.find((p) => p.uuid === value);
      setSelectedProduct(product || null);
    }
  }

  // Find selected product
  // const selectedProduct = products.find((p) => p.uuid === formData.product);

  // Handle feedback field change
  const handleFeedbackChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [fieldName]: value,
      },
    }));
  };

  // Contact search state
  const [contactSearch, setContactSearch] = useState("");
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" size="sm" className="p-2 !rounded-full !aspect-square" onClick={handleBack}>
          <Icon icon="hugeicons:arrow-left-02" className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Add Call</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Picker */}
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full rounded-xl justify-between">
                  {formData.contact
                    ? contacts.find((c) => c.uuid === formData.contact)?.name
                    : "Search Contact"}
                  <Icon icon="hugeicons:chevron-down" className="ml-2 w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2">
                <Input
                  placeholder="Search contact..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="mb-2"
                  required
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.uuid}
                      className="cursor-pointer px-2 py-1 hover:bg-gray-100 rounded"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, contact: contact.uuid }));
                      }}
                    >
                      {contact.name} <span className="text-xs text-gray-500">{contact.phone_number}</span>
                    </div>
                  ))}
                  {filteredContacts.length === 0 && (
                    <div className="text-sm text-gray-400 px-2 py-1">No contacts found</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Product Picker */}
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select required value={formData.product} onValueChange={(value) => { handleInputChange("product", value) }}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {products.map((product) => (
                  <SelectItem key={product.uuid} value={product.uuid}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Picker */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dynamic Feedback Fields */}
        {selectedProduct && selectedProduct.feedback_fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
            {selectedProduct.feedback_fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.name}</Label>
                {field.type === "text" && (
                  <Input
                    value={formData.feedback[field.name] || ""}
                    onChange={(e) => handleFeedbackChange(field.name, e.target.value)}
                    placeholder={field.description}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    type="number"
                    value={formData.feedback[field.name] || ""}
                    onChange={(e) => handleFeedbackChange(field.name, e.target.value)}
                    placeholder={field.description}
                  />
                )}
                {field.type === "file" && (
                  <Input
                    type="file"
                    onChange={(e) => {
                      if (!e.target.files || e.target.files.length === 0) return
                      handleFeedbackChange(field.name, e.target.files[0])
                    }}
                    className="flex-1 rounded-xl"
                  />
                )}
                {field.type === "textarea" && (
                  <Textarea
                    value={formData.feedback[field.name] || ""}
                    onChange={(e) => handleFeedbackChange(field.name, e.target.value)}
                    placeholder={field.description}
                  />
                )}
                {field.type === "date" && (
                  <Input
                    type="date"
                    value={formData.feedback[field.name] || ""}
                    onChange={(e) => handleFeedbackChange(field.name, e.target.value)}
                  />
                )}
                {field.type === "select" && field.options && (
                  <Select
                    value={formData.feedback[field.name] || ""}
                    onValueChange={(value) => handleFeedbackChange(field.name, value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder={field.description || "Select"} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.type === "checkbox" && field.options && (
                  <div className="flex flex-wrap gap-2">
                    {field.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-1">
                        <Checkbox
                          checked={Array.isArray(formData.feedback[field.name]) && formData.feedback[field.name].includes(opt)}
                          onCheckedChange={(checked) => {
                            let arr = Array.isArray(formData.feedback[field.name])
                              ? [...formData.feedback[field.name]]
                              : [];
                            if (checked) arr.push(opt);
                            else arr = arr.filter((v) => v !== opt);
                            handleFeedbackChange(field.name, arr);
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-primary-700 max-w-sm rounded-full h-12">
          Add Call
        </Button>
      </form>
    </div>
  );
}
