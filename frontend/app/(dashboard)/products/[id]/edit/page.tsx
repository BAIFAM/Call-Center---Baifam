"use client";

import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {ArrowLeft, Plus} from "lucide-react";
import {AddFieldDialog} from "@/components/dialogs/add-field-dialog";
import {EditFieldDialog} from "@/components/dialogs/edit-field-dialog";
import {CustomFieldComponent} from "@/components/form/custom-field";
import type {CustomField, AddFieldFormData} from "@/app/types/types.utils";
import {institutionAPI} from "@/lib/api-helpers";
import {toast} from "sonner";
import {useSelector} from "react-redux";
import {selectSelectedInstitution} from "@/store/auth/selectors";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productUuid = params.id as string;

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isEditFieldDialogOpen, setIsEditFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedInstitution = useSelector(selectSelectedInstitution);

  useEffect(() => {
    if (productUuid) {
      fetchProduct();
    }
  }, [productUuid]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const product = await institutionAPI.getProductDetails({productUuid});
      setProductName(product.name || "");
      setProductDescription(product.descriptions || "");
      setCustomFields(
        (product.feedback_fields || []).map((field: any) => ({
          id: field.id || field.name,
          name: field.name,
          description: field.description,
          type: field.type,
          value: field.type === "checkbox" && field.options ? [] : "",
          options: field.options,
        })),
      );
    } catch (error) {
      toast.error("Failed to fetch product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = (fieldData: AddFieldFormData) => {
    const newField: CustomField = {
      id: Date.now().toString(),
      name: fieldData.title,
      description: fieldData.description,
      type: fieldData.fieldType,
      value: fieldData.fieldType === "checkbox" && fieldData.options ? [] : "",
      options: fieldData.options,
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleEditField = (fieldId: string) => {
    const fieldToEdit = customFields.find((field) => field.id === fieldId);
    if (fieldToEdit) {
      setEditingField(fieldToEdit);
      setIsEditFieldDialogOpen(true);
    }
  };

  const handleUpdateField = (fieldId: string, fieldData: AddFieldFormData) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              name: fieldData.title,
              description: fieldData.description,
              type: fieldData.fieldType,
              options: fieldData.options,
              value:
                field.type !== fieldData.fieldType
                  ? fieldData.fieldType === "checkbox" && fieldData.options
                    ? []
                    : ""
                  : field.value,
            }
          : field,
      ),
    );
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleFieldValueChange = (fieldId: string, value: any) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === fieldId ? {...field, value} : field)),
    );
  };

  const handleSubmit = async () => {
    if (!selectedInstitution) {
      return;
    }
    if (!productName.trim()) {
      toast.error("Product name is required.");
      return;
    }
    try {
      await institutionAPI.updateProduct({
        productUuid: productUuid,
        institutionId: selectedInstitution?.id,
        name: productName,
        description: productDescription,
        feedbackFields: customFields.map((field) => ({
          name: field.name,
          type: field.type,
          description: field.description,
          options: field.options,
        })),
      });
      toast.success("Product updated successfully!");
      router.push("/products");
    } catch (error) {
      toast.error("Failed to update product.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Edit Product</h1>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              placeholder="Product Name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="mt-1 !py-3"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Product Description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              className="mt-1"
              rows={1}
            />
          </div>
        </div>

        {/* Custom Fields Section */}
        <div className="mb-8">
          <div className="flex items-center justify-start gap-6 mb-4">
            <h2 className="text-lg font-medium">Feedback Fields</h2>
            <Button
              onClick={() => setIsAddFieldDialogOpen(true)}
              variant={"outline"}
              size={"sm"}
              className=" text-black  !bg-gray-50 shadow-sm shadow-black/40"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start place-items-start place-content-start">
            {customFields.map((field) => (
              <CustomFieldComponent
                key={field.id}
                field={field}
                onEdit={handleEditField}
                onDelete={handleDeleteField}
                onValueChange={handleFieldValueChange}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          size={"lg"}
          className="w-full bg-purple-700 text-white !rounded-full py-3 max-w-[50%]"
          disabled={!productName.trim()}
        >
          Save Changes
        </Button>
      </div>

      {/* Add Field Dialog */}
      <AddFieldDialog
        isOpen={isAddFieldDialogOpen}
        onClose={() => setIsAddFieldDialogOpen(false)}
        onAddField={handleAddField}
      />

      {/* Edit Field Dialog */}
      <EditFieldDialog
        isOpen={isEditFieldDialogOpen}
        onClose={() => {
          setIsEditFieldDialogOpen(false);
          setEditingField(null);
        }}
        onEditField={handleUpdateField}
        field={editingField}
      />
    </div>
  );
}
