"use client";

import {useState, useEffect} from "react";
import {ClientCompanyDetailsHeader} from "@/components/client-companies/client-company-details-header";
import {ClientCompanyDetailsInfo} from "@/components/client-companies/client-company-details-info";
import {clientCompaniesAPI} from "@/lib/api-helpers";
import type {IClientCompany} from "@/app/types/api.types";
import {useParams} from "next/navigation";

export default function ClientCompanyDetailsPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const [clientCompany, setClientCompany] = useState<IClientCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientCompanyDetails();
  }, [params.uuid]);

  const fetchClientCompanyDetails = async () => {
    try {
      setLoading(true);
      const company = await clientCompaniesAPI.getById({uuid});
      setClientCompany(company || null);
    } catch (error) {
      console.error("Error fetching client company details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading client company details...</div>
      </div>
    );
  }

  if (!clientCompany) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Client company not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientCompanyDetailsHeader clientCompany={clientCompany} />
      <ClientCompanyDetailsInfo clientCompany={clientCompany} />
    </div>
  );
}
