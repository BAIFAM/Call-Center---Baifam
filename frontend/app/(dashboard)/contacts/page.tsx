"use client"

import { useEffect, useState } from "react"
import { ContactsHeader } from "@/components/contacts/contacts-header"
import { ContactsList } from "@/components/contacts/contacts-list"
import { ContactsGrid } from "@/components/contacts/contacts-grid"
import { ContactsFilters } from "@/components/contacts/contacts-filters"
import { contactsAPI, institutionAPI } from "@/lib/api-helpers"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { ICallCenterProduct, IContact } from "@/app/types/api.types"
import { EditContactDialog } from "@/components/dialogs/edit-contact-dialog"
import { toast } from "sonner"
import { DeleteContactDialog } from "@/components/dialogs/delete-contact-dialog"

// const initialMockContacts: IContact[] = [
//   {
//     uuid: "1",
//     name: "Roy Didanie Kasasa",
//     phone: "+256752342992",
//     agent: "Matovu Mark",
//     product: "Valuation",
//     status: "Active",
//   },
//   {
//     id: "2",
//     name: "Ssempala Jacob",
//     phone: "+256758642992",
//     agent: null,
//     product: "Loan",
//     status: "Processing",
//   },
//   {
//     id: "3",
//     name: "Lutaaya Jamil",
//     phone: "+256752776123",
//     agent: "Matovu Mark",
//     product: "Loan",
//     status: "Inactive",
//   },
//   {
//     id: "4",
//     name: "Nanyondo Grace",
//     phone: "+256789456123",
//     agent: "Serwanga Paul",
//     product: "Valuation",
//     status: "Active",
//   },
//   {
//     id: "5",
//     name: "Kabanda Ben",
//     phone: "+256763852147",
//     agent: "Mugisha Sarah",
//     product: "Valuation",
//     status: "Inactive",
//   },
//   {
//     id: "6",
//     name: "Akatukunda Rita",
//     phone: "+256787654321",
//     agent: "Kagoda John",
//     product: "Valuation",
//     status: "Active",
//   },
//   {
//     id: "7",
//     name: "Muwonge David",
//     phone: "+256701234567",
//     agent: "Kisitu Anna",
//     product: "Loan",
//     status: "Active",
//   },
//   {
//     id: "8",
//     name: "Kasajja Felix",
//     phone: "+256756789012",
//     agent: null,
//     product: "Valuation",
//     status: "Processing",
//   },
// ]

export default function ContactsPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [contacts, setContacts] = useState<IContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState(contacts)
  const [activeContactsCount, setActiveContactsCount] = useState(0)
  const [archivedContactsCount, setArchivedContactsCount] = useState(0)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [contactToEdit, setContactToEdit] = useState<IContact | null>(null)
  const [contactToDelete, setContactToDelete] = useState<IContact | null>(null)
  const [products, setProducts] = useState<ICallCenterProduct[]>([])
  const selectedInstitution = useSelector(selectSelectedInstitution);


  useEffect(() => {
    handleFetchContacts()
    handleFetchInstitutionProducts()
  }, [selectedInstitution])

  useEffect(() => {
    setFilteredContacts(contacts)
    setActiveContactsCount(contacts.filter(contact => contact.status === "verified").length)
    setArchivedContactsCount(contacts.filter(contact => contact.status === "archived").length)
  }, [contacts])



  const handleFetchInstitutionProducts = async () => {
    if (!selectedInstitution) { return }
    try {
      const products = await institutionAPI.getProductsByInstitution({ institutionId: selectedInstitution.id })
      setProducts(products)
    } catch (error) {
      toast.error("Failed to fetch products. Please try again later.")
    }
  }

  const handleUpdateSuccess = ({ updatedContact }: { updatedContact: IContact }) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact.uuid === updatedContact.uuid ? updatedContact : contact
      )
    );
  }

  const triggerDeleteContact = (contactUuid: string) => {
    const contact = contacts.find(contact => contact.uuid === contactUuid);
    if (!contact) return;
    setContactToDelete(contact);
  }

  const handleFetchContacts = async () => {
    if (!selectedInstitution) { return }
    try {
      const fetchedContacts = await contactsAPI.getContactsByInstitution({
        institutionId: selectedInstitution.id,
      });
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }





  return (
    <div className="space-y-6 w-full">
      <ContactsHeader
        contacts={contacts}
        onFilteredContactsChange={setFilteredContacts}
        selectedContactIds={selectedContactIds}
        onRefreshContacts={handleFetchContacts}
        products={products}
      />
      <ContactsFilters viewMode={viewMode} onViewModeChange={setViewMode} activeContactsCount={activeContactsCount} archivedContactsCount={archivedContactsCount} />

      {viewMode === "list" ? (
        <ContactsList
          contacts={filteredContacts}
          selectedContactIds={selectedContactIds}
          onSelectionChange={setSelectedContactIds}
          onEditContact={(contact: IContact) => setContactToEdit(contact)}
          onDeleteContact={triggerDeleteContact}
        />
      ) : (
        <ContactsGrid
          contacts={filteredContacts}
          selectedContactIds={selectedContactIds}
          onSelectionChange={setSelectedContactIds}
          onEditContact={(contact: IContact) => setContactToEdit(contact)}
          onDeleteContact={triggerDeleteContact}
        />
      )}

      {contactToEdit
        && <EditContactDialog
          isOpen={!!contactToEdit}
          onClose={() => setContactToEdit(null)}
          products={products}
          contact={contactToEdit}
          onUpdateSuccess={handleUpdateSuccess}
        />
      }

      {contactToDelete
        && <DeleteContactDialog
          isOpen={!!contactToDelete}
          onClose={() => setContactToDelete(null)}
          contact={contactToDelete}
          onSuccess={handleFetchContacts}
        />
      }
    </div>
  )
}
