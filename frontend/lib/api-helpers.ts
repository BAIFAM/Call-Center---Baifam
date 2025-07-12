import { ICall, ICallCenterProduct, IContact, IContactFormData, IFeedbackFieldFormData } from "@/app/types/api.types";
import apiRequest from "./apiRequest";
import { CustomField, FieldType } from "@/app/types/types.utils";
import { getInstitutionById } from "./helpers";


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
        contact,
        feedback,
        status,
    }: {
        institutionId: number;
        contact: string; // uuid
        feedback: Record<string, any>;
        status: "failed" | "completed" | "busy";
    }) => {
        try {
            const payload = {
                contact,
                feedback,
                status,
            };
            const response = await apiRequest.post(
                `call/institution/${institutionId}/`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error("Error creating call:", error);
            throw error;
        }
    }
}

export const contactsAPI = {
    getContactDetails: async ({ contactId }: { contactId: number }) => {
        try {
            const response = await apiRequest.get(`call/contacts/${contactId}/`);
            return response.data as IContact;
        } catch (error) {
            console.error("Error fetching contact details:", error);
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
    }
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
}

