import { ICall, ICallCenterProduct, ICallFormData, ICallGroupUser, ICallGroupUserFormData, IContact, IContactFormData, IContactStatus } from "@/app/types/api.types";
import apiRequest from "./apiRequest";
import { CustomField } from "@/app/types/types.utils";
import { get } from "http";





type IContactCreationData = {
    product: string;
    name: string;
    phone_number: string;
    country: string;
    country_code: string;
    status: string;
}



export const callsAPI = {
    getCallDetails: async ({ callUuid }: { callUuid: string }) => {
        try {
            const response = await apiRequest.get(`call/detail/${callUuid}/`);
            return response.data as ICall;
        } catch (error) {
            console.error("Error fetching call details:", error);
            throw error;
        }
    },



    getByInstitution: async ({ institutionId }: { institutionId: number }) => {
        try {
            const response = await apiRequest.get(`call/institution/${institutionId}/`);
            return response.data as ICall[];
        } catch (error) {
            console.error("Error fetching calls by institution:", error);
            throw error;
        }
    },



    createForProduct: async ({
        productId,
        institutionId,
        callData
    }: {
        productId: number;
        institutionId: number;
        callData: Omit<ICall, "uuid" | "status">;
    }) => {
        try {
            const response = await apiRequest.post(`call/products/${productId}/contacts/`, callData);
            return response.data as IContact;
        } catch (error) {
            console.error("Error creating contact for product:", error);
            throw error;
        }
    },

    createCall: async ({
        institutionId,
        callData,
      }: {
        institutionId: number
        callData: any // Changed ICallFormData to any to avoid type errors for now
      }) => {
        try {
          console.log("Creating call with data:", callData)
          console.log("Institution ID:", institutionId)
    
          const formData = new FormData()
    
          // Append basic fields
          formData.append("contact", callData.contact)
          formData.append("status", callData.status)
    
          // Append feedback as JSON string
          formData.append("feedback", JSON.stringify(callData.feedback))
    
          // Append files separately
          Object.entries(callData).forEach(([key, value]) => {
            if (key !== "contact" && key !== "status" && key !== "feedback") {
              if (value instanceof File) {
                console.log(`Appending file: ${key}`, value.name)
                formData.append(key, value)
              }
            }
          })
    
          // Log FormData contents
          console.log("FormData contents:")
          for (const [key, value] of formData.entries()) {
            console.log(key, value)
          }
    
          const response = await apiRequest.post(`call/institution/${institutionId}/`, formData)
          return response.data
        } catch (error) {
          console.error("Error creating call:", error)
          throw error
        }
      },
    
      updateCall: async ({
        callUuid,
        callData,
      }: {
        callUuid: string
        callData: any // Changed Partial<ICallFormData> to any to avoid type errors for now
      }) => {
        try {
          const formData = new FormData()
    
          // Append basic fields if they exist
          if (callData.contact) formData.append("contact", callData.contact)
          if (callData.status) formData.append("status", callData.status)
    
          // Append feedback as JSON string if it exists
          if (callData.feedback) {
            formData.append("feedback", JSON.stringify(callData.feedback))
          }
    
          // Append files separately
          Object.entries(callData).forEach(([key, value]) => {
            if (key !== "contact" && key !== "status" && key !== "feedback") {
              if (value instanceof File) {
                formData.append(key, value)
              }
            }
          })
    
          // Remove the headers - let the browser set Content-Type automatically for FormData
          const response = await apiRequest.patch(`call/detail/${callUuid}/`, formData)
          return response.data
        } catch (error) {
          console.error("Error updating call:", error)
          throw error
        }
      },
    
      deleteCall: async ({ callUuid }: { callUuid: string }) => {
        try {
          const response = await apiRequest.delete(`call/detail/${callUuid}/`)
          return response.data
        } catch (error) {
          console.error("Error deleting call:", error)
          throw error
        }
      },

}

export const contactsAPI = {
    getContactDetails: async ({ contactUuid }: { contactUuid: string }) => {
        try {
            const response = await apiRequest.get(`call/contacts/detail/${contactUuid}/`);
            return response.data as IContact;
        } catch (error) {
            console.error("Error fetching contact details:", error);
            throw error;
        }
    },

    updateContact: async ({
        contactUuid,
        contactData
    }: {
        contactUuid: string;
        contactData: Partial<IContactFormData>;
    }) => {
        try {
            const response = await apiRequest.patch(
                `call/contacts/detail/${contactUuid}/`,
                contactData
            );
            return response.data as IContact;
        } catch (error) {
            console.error("Error updating contact:", error);
            throw error;
        }
    },

    updateContactStatus: async ({ contactUuid, status }: { contactUuid: string; status: IContactStatus }) => {
        try {
            const response = await apiRequest.patch(`call/contacts/detail/${contactUuid}/`, { status });
            return response.data as IContact;
        } catch (error) {
            console.error("Error updating contact status:", error);
            throw error;
        }
    },

    deleteContact: async ({ contactUuid }: { contactUuid: string }) => {
        try {
            await apiRequest.delete(`call/contacts/detail/${contactUuid}/`);
        } catch (error) {
            console.error("Error deleting contact:", error);
            throw error;
        }
    },

    getContactsByInstitution: async ({ institutionId }: { institutionId: number }) => {
        try {
            const response = await apiRequest.get(`call/contacts/institution/${institutionId}/`);
            return response.data as IContact[];
        } catch (error) {
            console.error("Error fetching contacts by institution:", error);
            throw error;
        }
    },

    createForInstitution: async ({
        institutionId,
        contactData
    }: {
        institutionId: number;
        contactData: Omit<IContactFormData, "uuid" | "status">;
    }) => {
        try {
            const response = await apiRequest.post(`call/contacts/institution/${institutionId}/`, contactData);
            return response.data as IContact;
        } catch (error) {
            console.error("Error creating contact for institution:", error);
            throw error;
        }
    },

    // Download Excel template for bulk contact upload
    downloadContactTemplate: async ({ productUuid, token }: { productUuid: string, token: string }) => {
        try {
        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    
          // Create a direct fetch request for file download
          const response = await fetch(`${baseURL}/api/call/contacts/${productUuid}/template/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
    
          if (!response.ok) {
            const errorText = await response.text()
            console.error("Download error response:", errorText)
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
          }
    
          // Check if response is actually a file
          const contentType = response.headers.get("content-type")
          if (
            !contentType ||
            (!contentType.includes("application/vnd.openxmlformats") &&
              !contentType.includes("application/vnd.ms-excel") &&
              !contentType.includes("application/octet-stream"))
          ) {
            const responseText = await response.text()
            console.error("Unexpected response type:", contentType, responseText)
            throw new Error("Server did not return an Excel file. Please check the API endpoint.")
          }
    
          // Get the blob data
          const blob = await response.blob()
    
          // Create download link
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
    
          // Extract filename from response headers or use default
          const contentDisposition = response.headers.get("content-disposition")
          let filename = `contacts_template_${productUuid}.xlsx`
    
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "")
            }
          }
    
          link.setAttribute("download", filename)
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
    
          return { success: true, filename }
        } catch (error) {
          console.error("Error downloading contact template:", error)
          throw error
        }
      },
      // Bulk upload contacts from CSV/Excel file
      bulkUploadContacts: async ({
        productUuid,
        file,
        token,
      }: {
        productUuid: string
        file: File
        token: string
      }) => {
        try {
          // Validate file type
          const allowedTypes = [".csv", ".xlsx", ".xls"]
          const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
          if (!allowedTypes.includes(fileExtension)) {
            throw new Error("Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)")
          }
    
          // Create FormData for file upload
          const formData = new FormData()
          formData.append("file", file)

        const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
    
          // Use fetch for multipart/form-data
          const response = await fetch(`${baseURL}/api/call/contacts/${productUuid}/bulk-upload/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }
    
          const data = await response.json()
          return data as {
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
          }
        } catch (error) {
          console.error("Error bulk uploading contacts:", error)
          throw error
        }
      },
};

export const institutionAPI = {
    getProductsByInstitution: async ({ institutionId }: { institutionId: number }) => {
        try {
            const response = await apiRequest.get(`institution/products/${institutionId}/`);
            return response.data as ICallCenterProduct[];
        } catch (error) {
            console.error("Error fetching call center products by institution:", error);
            throw error;
        }
    },

    createProduct: async ({
        institutionId,
        name,
        description,
        status = "active",
        feedbackFields,
    }: {
        institutionId: number;
        name: string;
        description: string;
        status?: string;
        feedbackFields: Partial<CustomField>[];
    }) => {
        try {
            const payload = {
                institution: institutionId,
                name,
                descriptions: description,
                status,
                feedback_fields: feedbackFields,
            };
            const response = await apiRequest.post(
                `institution/products/${institutionId}/`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error creating product:", error);
            throw error;
        }
    },

    getProductDetails: async ({ productUuid }: { productUuid: string }) => {
        try {
            const response = await apiRequest.get(`institution/products/detail/${productUuid}/`);
            return response.data as ICallCenterProduct;
        } catch (error) {
            console.error("Error fetching product details:", error);
            throw error;
        }
    },

    updateProduct: async ({
        productUuid,
        institutionId,
        name,
        description,
        status = "active",
        feedbackFields,
    }: {
        productUuid: string;
        institutionId: number;
        name: string;
        description: string;
        status?: string;
        feedbackFields: Partial<CustomField>[];
    }) => {
        try {
            const payload = {
                institution: institutionId,
                name,
                descriptions: description,
                status,
                feedback_fields: feedbackFields,
            };
            const response = await apiRequest.patch(
                `institution/products/detail/${productUuid}/`,
                payload
            );
            return response.data as ICallCenterProduct;
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    },
}


export const callGroupUserAPI = {
    getByInstitution: async ({ institutionId }: { institutionId: number }) => {
      try {
        const response = await apiRequest.get(`/call/group-users/${institutionId}/`);
        return response.data as ICallGroupUser[];
      } catch (error) {
        console.error("Error fetching CallGroupUsers:", error);
        throw error;
      }
    },
  
    
    createUser: async ({
      institutionId,
      userData,
    }: {
      institutionId: number;
      userData: Partial<ICallGroupUserFormData>;
    }) => {
      try {
        const response = await apiRequest.post(`/call/group-users/${institutionId}/`, userData);
        return response.data as ICallGroupUser;
      } catch (error) {
        console.error("Error creating CallGroupUser:", error);
        throw error;
      }
    },
  
    
    getUserDetails: async ({ uuid }: { uuid: string }) => {
      try {
        const response = await apiRequest.get(`/call/group-users/detail/${uuid}/`);
        return response.data as ICallGroupUser;
      } catch (error) {
        console.error("Error fetching CallGroupUser details:", error);
        throw error;
      }
    },
  

    updateUser: async ({
      uuid,
      updates,
    }: {
      uuid: string;
      updates: Partial<ICallGroupUserFormData>;
    }) => {
      try {
        const response = await apiRequest.patch(`/call/group-users/detail/${uuid}/`, updates);
        return response.data as ICallGroupUser;
      } catch (error) {
        console.error("Error updating CallGroupUser:", error);
        throw error;
      }
    },
  

    deleteUser: async ({ uuid }: { uuid: string }) => {
      try {
        await apiRequest.delete(`/call/group-users/detail/${uuid}/`);
      } catch (error) {
        console.error("Error deleting CallGroupUser:", error);
        throw error;
      }
    },
  };
