import { ICall, ICallCenterProduct, ICallFormData, IContact, IContactFormData, IContactStatus } from "@/app/types/api.types";
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


    updateCall: async ({
        callUuid,
        callData
    }: {
        callUuid: string;
        callData: Partial<ICallFormData>;
    }) => {
        try {
            const response = await apiRequest.patch(
                `call/detail/${callUuid}/`,
                callData
            );
            return response.data as ICall;
        } catch (error) {
            console.error("Error updating call:", error);
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
        institutionId: number;
        callData: ICallFormData;
    }) => {
        try {
            const formData = new FormData();
            // Append non-feedback fields
            Object.entries(callData).forEach(([key, value]) => {
                if (key !== "feedback") {
                    formData.append(key, value as any);
                }
            });
            // Append feedback fields
            if (callData.feedback) {
                Object.entries(callData.feedback).forEach(([key, value]) => {
                    if (value instanceof File) {
                        formData.append(`feedback[${key}]`, value);
                    } else if (Array.isArray(value)) {
                        // For arrays (e.g., checkboxes)
                        value.forEach((v) => formData.append(`feedback[${key}][]`, v));
                    } else {
                        formData.append(`feedback[${key}]`, value);
                    }
                });
            }
            const response = await apiRequest.post(
                `call/institution/${institutionId}/`,
                formData
            );
            return response.data;
        } catch (error) {
            console.error("Error creating call:", error);
            throw error;
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

}

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

