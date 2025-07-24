"use client"

import { useEffect, useState } from "react"
import { ContactDetailsHeader } from "@/components/contacts/contacts-details-header"
import { ContactDetailsInfo } from "@/components/contacts/contact-details-info"
import { ContactDetailsTabs } from "@/components/contacts/contact-details-tabs"
import { RecentAssignee } from "@/app/types/types.utils"
import { useParams, useRouter } from "next/navigation"
import { contactsAPI, institutionAPI } from "@/lib/api-helpers"
import { ICall, ICallCenterProduct, IContact, IContactStatus } from "@/app/types/api.types"
import { DeleteContactDialog } from "@/components/dialogs/delete-contact-dialog"
import { EditContactDialog } from "@/components/dialogs/edit-contact-dialog"
import { toast } from "sonner"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"


const mockRecentAssignees: RecentAssignee[] = [
  {
    id: "1",
    name: "Matovu Mark",
    email: "matovumark23@gmail.com",
    company: "Blue Diamond",
    callsHandled: 23,
    duration: "May 12, 2025 - Now",
  },
  {
    id: "2",
    name: "Ssempala Martin",
    email: "sempalmartin@gmail.com",
    company: "Blue Diamond",
    callsHandled: 16,
    duration: "Apr 12, 2025 - May 12, 2025",
  },
  {
    id: "3",
    name: "Ssempala Martin",
    email: "sempalmartin@gmail.com",
    company: "Subik Finace",
    callsHandled: 74,
    duration: "Apr 2, 2025 - Apr 12, 2025",
  },
]

export default function ContactDetailsPage() {
  const params = useParams()
  const contactUuid = params.id as string
  const [activeTab, setActiveTab] = useState<"call-history" | "recent-assignees" | "documents">("call-history");
  const [contact, setContact] = useState<IContact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<IContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<IContact | null>(null);
  const selectedInstitution = useSelector(selectSelectedInstitution);
  const [products, setProducts] = useState<ICallCenterProduct[]>([]);
  const [contactCalls, setContactCalls] = useState<ICall[]>([]);
  const [callToEdit, setCallToEdit] = useState<ICall|null>(null);
  const router = useRouter();

  useEffect(() => {
    if (contactUuid) {
      handleFetchContact(contactUuid);
    }
  }, [contactUuid]);

  useEffect(() => {
    handleFetchInstitutionProducts();
  }, [selectedInstitution]);

  const handleFetchContact = async (uuid: string) => {
    try {
      const response = await contactsAPI.getContactDetails({ contactUuid: uuid });
      const calls = await contactsAPI.getContactCalls({ contactUuid: uuid });
      setContact(response);
      setContactCalls(calls);
    } catch (error) {

    }
  }

  const handleUpdateContactStatus = async (newStatus: IContactStatus) => {
    if (!contact) return;
    try {
      const updatedContact = await contactsAPI.updateContactStatus({
        contactUuid: contact.uuid,
        status: newStatus,
      });
      setContact(updatedContact);
    } catch (error) {
      console.error("Failed to update contact status:", error);
    }
  }

  const handleFetchInstitutionProducts = async () => {
    if (!selectedInstitution) { return }
    try {
      const products = await institutionAPI.getProductsByInstitution({ institutionId: selectedInstitution.id })
      setProducts(products)
    } catch (error) {
      toast.error("Failed to fetch products. Please try again later.")
    }
  }



  const handleDeleteContactSuccess = async () => {
    if (!contact) return;
    setContactToDelete(null);
    try {
      router.push("/contacts");
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleEditContact = ({ updatedContact }: { updatedContact: IContact }) => {
    setContact(updatedContact);
  };

  const triggerDeleteContact = () => {
    if (contact) {
      setContactToDelete(contact);
    }
  };

  const triggerEditContact = () => {
    if (contact) {
      setContactToEdit(contact);
    }
  };

  return (
    <div className="space-y-6">
      <ContactDetailsHeader contact={contact} onTriggerDelete={triggerDeleteContact} onTriggerEdit={triggerEditContact} onArchive={() => handleUpdateContactStatus("archived")} />
      <ContactDetailsInfo clearCallToEdit={()=> setCallToEdit(null)} onRefreshContactDetails={()=>{handleFetchContact(contactUuid)}} callToEdit={callToEdit} contact={contact} onMarkAsVerified={handleUpdateContactStatus} />
      <ContactDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        callHistory={contactCalls}
        updateCallToEdit={setCallToEdit}
        recentAssignees={mockRecentAssignees}
      />
      {contactToEdit
        && <EditContactDialog
          isOpen={!!contactToEdit}
          onClose={() => setContactToEdit(null)}
          products={products}
          contact={contactToEdit}
          onUpdateSuccess={handleEditContact}
        />
      }

      {contactToDelete
        && <DeleteContactDialog
          isOpen={!!contactToDelete}
          onClose={() => setContactToDelete(null)}
          contact={contactToDelete}
          onSuccess={handleDeleteContactSuccess}
        />
      }
    </div>
  )
}
