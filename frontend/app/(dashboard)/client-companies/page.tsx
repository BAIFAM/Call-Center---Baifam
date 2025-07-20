"use client"

import { useState, useEffect } from "react"
import { ClientCompaniesHeader } from "@/components/client-companies/client-companies-header"
import { ClientCompaniesList } from "@/components/client-companies/client-companies-list"
import { ClientCompanyModal } from "@/components/client-companies/client-company-modal"
import { DeleteConfirmationModal } from "@/components/client-companies/delete-confirmation-modal"
import { clientCompaniesAPI } from "@/lib/api-helpers"
import { toast } from "sonner"
import type { IClientCompany, IClientCompanyFormData } from "@/app/types/api.types"
import { useSelector } from "react-redux"
import { selectSelectedInstitution } from "@/store/auth/selectors"

export default function ClientCompaniesPage() {
  const [clientCompanies, setClientCompanies] = useState<IClientCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<IClientCompany | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentInstitution = useSelector(selectSelectedInstitution)

  useEffect(() => {
    fetchClientCompanies()
  }, [])

  const fetchClientCompanies = async () => {
    if(!currentInstitution){return}
    try {
      setLoading(true)
      const companies = await clientCompaniesAPI.getAll({ institutionId:currentInstitution.id })
      setClientCompanies(companies)
    } catch (error) {
      console.error("Error fetching client companies:", error)
      toast.error("Failed to fetch client companies")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCompany = async (companyData: IClientCompanyFormData) => {
    if (!currentInstitution) {
      toast.error("No institution selected")
      return
    }
    try {
      setIsSubmitting(true)
      const newCompany = await clientCompaniesAPI.create({
        institutionId: currentInstitution.id,
        companyData,
      })
      setClientCompanies((prev) => [newCompany, ...prev])
      setIsAddModalOpen(false)
      toast.success("Client company created successfully!")
    } catch (error) {
      console.error("Error creating client company:", error)
      toast.error("Failed to create client company")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCompany = async (companyData: Partial<IClientCompanyFormData>) => {
    if (!selectedCompany) return

    try {
      setIsSubmitting(true)
      const updatedCompany = await clientCompaniesAPI.update({
        uuid: selectedCompany.uuid,
        companyData,
      })
      setClientCompanies((prev) =>
        prev.map((company) => (company.uuid === selectedCompany.uuid ? updatedCompany : company)),
      )
      setIsEditModalOpen(false)
      setSelectedCompany(null)
      toast.success("Client company updated successfully!")
    } catch (error) {
      console.error("Error updating client company:", error)
      toast.error("Failed to update client company")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return

    try {
      setIsSubmitting(true)
      await clientCompaniesAPI.delete({ uuid: selectedCompany.uuid })
      setClientCompanies((prev) => prev.filter((company) => company.uuid !== selectedCompany.uuid))
      setIsDeleteModalOpen(false)
      setSelectedCompany(null)
      toast.success("Client company deleted successfully!")
    } catch (error) {
      console.error("Error deleting client company:", error)
      toast.error("Failed to delete client company")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (company: IClientCompany) => {
    setSelectedCompany(company)
    setIsEditModalOpen(true)
  }

  const handleDelete = (company: IClientCompany) => {
    setSelectedCompany(company)
    setIsDeleteModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading client companies...</div>
      </div>
    )
  }

  if (!currentInstitution) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No institution selected</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ClientCompaniesHeader onAddClick={() => setIsAddModalOpen(true)} />
      <ClientCompaniesList clientCompanies={clientCompanies} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Add Modal */}
      <ClientCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddCompany}
        isLoading={isSubmitting}
        institutionId={currentInstitution.id}
        mode="add"
      />

      {/* Edit Modal */}
      <ClientCompanyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedCompany(null)
        }}
        onSubmit={handleEditCompany}
        isLoading={isSubmitting}
        institutionId={currentInstitution.id}
        company={selectedCompany}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedCompany(null)
        }}
        onConfirm={handleDeleteCompany}
        isLoading={isSubmitting}
        companyName={selectedCompany?.company_name || ""}
      />
    </div>
  )
}
