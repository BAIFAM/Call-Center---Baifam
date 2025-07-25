"use client";

import { IAgent, IClientCompany } from "@/app/types/api.types";
import {Badge} from "@/components/ui/badge";
import { clientCompaniesAPI } from "@/lib/api-helpers";
import { selectSelectedInstitution } from "@/store/auth/selectors";
import {Icon} from "@iconify/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

interface AgentDetailsInfoProps {
  agent:IAgent|null
}

export function AgentDetailsInfo({agent}:AgentDetailsInfoProps) {

  const [clientCompanies, setClientCompanies] = useState<IClientCompany[]>([]);
  const currentInstitution = useSelector(selectSelectedInstitution)

  useEffect(() => {
    if (agent) {
      handleFetchClientCompanies({ agentUuid: agent.uuid });
    }
  }, [agent]);

  const handleFetchClientCompanies = async ({ agentUuid }: { agentUuid: string }) => {
    if (!currentInstitution) return;
    try {
        const response = await clientCompaniesAPI.getAll({ institutionId: currentInstitution.id });
      setClientCompanies(response);
    } catch (error) {
      console.error("Error fetching client companies:", error); 
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{agent?.user.user.fullname}</h2>
            <Badge variant={ agent?.is_active  ? "default":"secondary"} className="bg-green-100 text-green-800 rounded-full">{agent?.is_active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="text-gray-600 text-sm mb-4">{agent?.user.user.email} • +25670000000</p>

          {/* Client Companies */}
          {clientCompanies.length > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon icon="hugeicons:building-01" className="w-5 h-5 text-gray-500" />
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {clientCompanies.map((company) => (
                    <span key={company.uuid} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {company.company_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex items-center justify-start py-2 gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-2">
              <Icon icon="hugeicons:contact-book" className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col items-start justify-center py-2">
              <p className="text-lg font-bold text-gray-900">{agent?.device_id}</p>
              <p className="text-sm text-gray-500">Device</p>
            </div>
          </div>
          <div className="flex items-center justify-start py-2 gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-2">
              <Icon icon="hugeicons:call" className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col items-start justify-center">
              <p className="text-lg font-bold text-gray-900">{agent?.extension}</p>
              <p className="text-xs text-gray-500">Extension</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
