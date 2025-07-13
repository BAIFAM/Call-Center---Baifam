"use client"

import { DialogSkeleton } from "@/components/dialogs/dialog-skeleton";
import { IContact } from "@/app/types/api.types";
import { contactsAPI } from "@/lib/api-helpers";
import { toast } from "sonner";
import { useState } from "react";
import { selectSelectedInstitution } from "@/store/auth/selectors";
import { useSelector } from "react-redux";

interface DeleteContactDialogProps {
    isOpen: boolean;
    onClose: () => void;
    contact: IContact | null;
    onSuccess: () => void;
}

export function DeleteContactDialog({ isOpen, onClose, contact, onSuccess }: DeleteContactDialogProps) {
    const selectedInstitution = useSelector(selectSelectedInstitution);
    const [loading, setLoading] = useState(false);

    const handleDeleteContact = async () => {
        if (!selectedInstitution || !contact) return;
        setLoading(true);
        try {
            await contactsAPI.deleteContact({
                contactUuid: contact.uuid,
            });
            toast.success("Contact deleted successfully.");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting contact:", error);
            toast.error("Failed to delete contact. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DialogSkeleton
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Contact"
            confirmText={loading ? "Deleting..." : "Delete"}
            confirmDisabled={loading}
            onConfirm={handleDeleteContact}
            onCancel={onClose}
        >
            <div className="space-y-4">
                <p>Are you sure you want to delete this contact?</p>
                {contact && (
                    <div className="p-3 bg-gray-100 rounded-xl">
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-sm text-gray-600">{contact.phone_number}</div>
                        <div className="text-sm text-gray-600">Attached to product : {contact.product.name}</div>
                    </div>
                )}
            </div>
        </DialogSkeleton>
    );
}
