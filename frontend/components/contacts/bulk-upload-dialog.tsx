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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react"
import { toast } from "sonner"
import { contactsAPI } from "@/lib/api-helpers"
import type { ICallCenterProduct } from "@/app/types/api.types"
import { Badge } from "@/components/ui/badge"
import {selectAccessToken} from "@/store/auth/selectors";
import { useSelector } from "react-redux"

interface BulkUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  products: ICallCenterProduct[]
  onUploadSuccess: () => void
}

export function BulkUploadDialog({ isOpen, onClose, products, onUploadSuccess }: BulkUploadDialogProps) {
  const [selectedProductUuid, setSelectedProductUuid] = useState<string>("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const token = useSelector(selectAccessToken)
  const [uploadResults, setUploadResults] = useState<{
    created_count: number
    error_count: number
    product_name: string
    created_contacts: Array<{
      uuid: string
      name: string
      phone_number: string
      product_name: string
    }>
    errors?: string[]
  } | null>(null)

  const handleDownloadTemplate = async () => {
    if (!selectedProductUuid) {
      toast.error("Please select a product first")
      return
    }

    setIsDownloading(true)
    try {
      await contactsAPI.downloadContactTemplate({ productUuid: selectedProductUuid, token })
      toast.success("Template downloaded successfully")
    } catch (error) {
      console.error("Error downloading template:", error)
      toast.error("Failed to download template")
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [".csv", ".xlsx", ".xls"]
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

      if (!allowedTypes.includes(fileExtension)) {
        toast.error("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
        return
      }

      setUploadFile(file)
      setUploadResults(null) // Clear previous results
    }
  }

  const handleBulkUpload = async () => {
    if (!selectedProductUuid) {
      toast.error("Please select a product first")
      return
    }

    if (!uploadFile) {
      toast.error("Please select a file to upload")
      return
    }

    setIsUploading(true)
    try {
      const results = await contactsAPI.bulkUploadContacts({
        productUuid: selectedProductUuid,
        file: uploadFile,
        token,
      })

      setUploadResults(results)

      if (results.created_count > 0) {
        toast.success(`Successfully created ${results.created_count} contacts`)
        onUploadSuccess()
      }

      if (results.error_count > 0) {
        toast.warning(`${results.error_count} contacts failed to upload`)
      }
    } catch (error: any) {
      console.error("Error uploading contacts:", error)
      toast.error(error.message || "Failed to upload contacts")
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedProductUuid("")
    setUploadFile(null)
    setUploadResults(null)
    onClose()
  }

  const selectedProduct = products.find((p) => p.uuid === selectedProductUuid)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Contacts</DialogTitle>
          <DialogDescription>
            Download a template, fill it with contact information, and upload it to create multiple contacts at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Select Product */}
          <div className="space-y-2">
            <Label htmlFor="product-select">Step 1: Select Product</Label>
            <Select value={selectedProductUuid} onValueChange={setSelectedProductUuid}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product for the contacts" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.uuid} value={product.uuid}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <div className="text-sm text-gray-600">
                Selected: <Badge variant="secondary">{selectedProduct.name}</Badge>
              </div>
            )}
          </div>

          {/* Step 2: Download Template */}
          <div className="space-y-2">
            <Label>Step 2: Download Template</Label>
            <Button
              onClick={handleDownloadTemplate}
              disabled={!selectedProductUuid || isDownloading}
              variant="outline"
              className="w-full bg-transparent"
            >
              {isDownloading ? (
                <>
                  <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Icon icon="hugeicons:download-01" className="w-4 h-4 mr-2" />
                  Download Excel Template
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              Download the template file, fill it with contact information, and save it.
            </p>
          </div>

          {/* Step 3: Upload File */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Step 3: Upload Completed File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {uploadFile && (
              <div className="text-sm text-gray-600">
                Selected file: <Badge variant="secondary">{uploadFile.name}</Badge>
              </div>
            )}
            <p className="text-xs text-gray-500">Supported formats: CSV (.csv), Excel (.xlsx, .xls)</p>
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Upload Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-600 font-medium">Successfully Created:</span>
                  <span className="ml-2">{uploadResults.created_count} contacts</span>
                </div>
                <div>
                  <span className="text-red-600 font-medium">Failed:</span>
                  <span className="ml-2">{uploadResults.error_count} contacts</span>
                </div>
              </div>

              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-red-600">Errors:</h5>
                  <div className="max-h-32 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {uploadResults.created_contacts.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-green-600">Successfully Created Contacts:</h5>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadResults.created_contacts.slice(0, 5).map((contact) => (
                      <div key={contact.uuid} className="text-xs bg-green-50 p-2 rounded">
                        {contact.name} - {contact.phone_number}
                      </div>
                    ))}
                    {uploadResults.created_contacts.length > 5 && (
                      <p className="text-xs text-gray-500">... and {uploadResults.created_contacts.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleBulkUpload} disabled={!selectedProductUuid || !uploadFile || isUploading}>
            {isUploading ? (
              <>
                <Icon icon="hugeicons:loading-03" className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Icon icon="hugeicons:upload-01" className="w-4 h-4 mr-2" />
                Upload Contacts
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
