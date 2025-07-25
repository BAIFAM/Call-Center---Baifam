"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { CallModal } from "@/components/calls/call-modal";
import { callsAPI } from "@/lib/api-helpers";
import { toast } from "sonner";
import type { IContact, ICallFormData, ICall } from "@/app/types/api.types";
import { useSelector } from "react-redux";
import { selectSelectedInstitution } from "@/store/auth/selectors";
import Link from "next/link";

interface CallGroupContactsTabsProps {
  contacts: IContact[];
}

export function CallGroupContactsTabs({ contacts }: CallGroupContactsTabsProps) {
  const [activeTab, setActiveTab] = useState<"call-history" | "assigned-contacts">(
    "assigned-contacts",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [createdCall, setCreatedCall] = useState<ICall | null>(null);
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const [isUpdatingCall, setIsUpdatingCall] = useState(false);
  const [loadingContactId, setLoadingContactId] = useState<string | null>(null);

  const currentInstitution = useSelector(selectSelectedInstitution);

  const handleCallClick = async (contact: IContact) => {
    if (!currentInstitution) {
      return;
    }
    try {
      setIsCreatingCall(true);
      setLoadingContactId(contact.uuid);

      // Step 1: Create call with empty status and feedback
      const initialCallData: {
        contact: string; // uuid
        feedback: Record<string, any>;
        status: string;
      } = {
        contact: contact.uuid,
        feedback: {},
        status: "",
      };

      const createdCallResponse = await callsAPI.createCall({
        institutionId: currentInstitution.id,
        callData: initialCallData as ICallFormData,
      });

      // Step 2: Set the created call and open edit modal
      setCreatedCall(createdCallResponse);
      setIsCallModalOpen(true);
    } catch (error) {
      console.error("Error creating call:", error);
      toast.error("Failed to create call. Please try again.");
    } finally {
      setIsCreatingCall(false);
      setLoadingContactId(null);
    }
  };

  const handleCallUpdate = async (callData: ICallFormData) => {
    if (!createdCall) return;

    try {
      setIsUpdatingCall(true);
      await callsAPI.updateCall({
        callUuid: createdCall.uuid,
        callData,
      });
      toast.success("Call updated successfully!");
      setIsCallModalOpen(false);
      setCreatedCall(null);
    } catch (error) {
      console.error("Error updating call:", error);
      toast.error("Failed to update call. Please try again.");
    } finally {
      setIsUpdatingCall(false);
    }
  };

  const handleCloseCallModal = () => {
    setIsCallModalOpen(false);
    setCreatedCall(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone_number.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || contact.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Mock call count for each contact
  const getCallCount = (contactId: string) => {
    const counts = { "1": 21, "2": 3, "3": 5, "4": 9, "5": 10 };
    return counts[contactId as keyof typeof counts] || 0;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab("call-history")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "call-history"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Call History
          </button>
          <button
            onClick={() => setActiveTab("assigned-contacts")}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === "assigned-contacts"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            Assigned Contacts
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "assigned-contacts" && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <Icon
                  icon="hugeicons:search-01"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 rounded-xl"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contacts Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PHONE NUMBER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COUNTRY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CALL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.uuid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {contact.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCallCount(contact.uuid)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`rounded-full ${getStatusColor(contact.status)}`}>
                          {contact.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="p-2 rounded-lg">
                            <Link href={`/contacts/${contact.uuid}`}>
                              <Icon icon="hugeicons:view" className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-lg"
                            onClick={() => handleCallClick(contact)}
                            disabled={isCreatingCall}
                          >
                            {loadingContactId === contact.uuid ? (
                              <Icon icon="hugeicons:loading-03" className="w-4 h-4 animate-spin" />
                            ) : (
                              <Icon icon="hugeicons:call" className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 rounded-lg">
                            <Icon icon="hugeicons:edit-02" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-lg text-red-600 hover:text-red-700"
                          >
                            <Icon icon="hugeicons:delete-02" className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "call-history" && (
          <div className="text-center py-12">
            <Icon icon="hugeicons:call" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Call history will be displayed here</p>
          </div>
        )}
      </div>

      {/* Call Modal for editing the created call */}
      <CallModal
        isOpen={isCallModalOpen}
        onClose={handleCloseCallModal}
        call={createdCall}
        contacts={contacts}
        onSubmit={handleCallUpdate}
        isLoading={isUpdatingCall}
      />
    </div>
  );
}
