"use client"

import { useEffect, useState } from "react"
import { CallsFilters } from "@/components/calls/calls-filters"
import { CallsList } from "@/components/calls/calls-list"

import { ICall } from "@/app/types/api.types"
import { callsAPI, institutionAPI } from "@/lib/api-helpers"
import { selectSelectedInstitution } from "@/store/auth/selectors"
import { useSelector } from "react-redux"
import { toast } from "sonner"

// const mockCalls: Call[] = [
//   {
//     id: "1",
//     date: "May 12, 2025 - 12:32 pm",
//     client: "Alice Johnson",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Yiga Jonathan",
//     status: "Complete",
//     product: "Valuation",
//   },
//   {
//     id: "2",
//     date: "May 12, 2025 - 11:22 am",
//     client: "Michael Smith",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Yiga Jonathan",
//     status: "Complete",
//     product: "Valuation",
//   },
//   {
//     id: "3",
//     date: "May 11, 2025 - 8:12 am",
//     client: "Sophia Brown",
//     direction: "Incoming",
//     customField: "Custom data",
//     agent: "Lutaaya Jamil",
//     status: "Missed",
//     product: "Loan",
//   },
//   {
//     id: "4",
//     date: "May 10, 2025 - 4:45 pm",
//     client: "Olivia Wilson",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Nansubuga Grace",
//     status: "Unanswered",
//     product: "Investment",
//   },
//   {
//     id: "5",
//     date: "May 9, 2025 - 1:30 pm",
//     client: "Emma Davis",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Lutaaya Jamil",
//     status: "Complete",
//     product: "Valuation",
//   },
//   {
//     id: "6",
//     date: "May 8, 2025 - 6:00 pm",
//     client: "Liam Miller",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Kagoda Sarah",
//     status: "Complete",
//     product: "Loan",
//   },
//   {
//     id: "7",
//     date: "May 7, 2025 - 3:15 pm",
//     client: "Noah Moore",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Lutaaya Jamil",
//     status: "Complete",
//     product: "Valuation",
//   },
//   {
//     id: "8",
//     date: "May 6, 2025 - 9:50 am",
//     client: "James Williams",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Lutaaya Jamil",
//     status: "Complete",
//     product: "Investment",
//   },
//   {
//     id: "9",
//     date: "May 5, 2025 - 5:00 pm",
//     client: "Ethan Anderson",
//     direction: "Incoming",
//     customField: "Custom data",
//     agent: "Nansubuga Grace",
//     status: "Missed",
//     product: "Loan",
//   },
//   {
//     id: "10",
//     date: "May 4, 2025 - 10:30 am",
//     client: "Isabella Taylor",
//     direction: "Outgoing",
//     customField: "Custom data",
//     agent: "Nansubuga Grace",
//     status: "Complete",
//     product: "Valuation",
//   },
// ]

export default function CallsPage() {
  const [calls, setCalls] = useState<ICall[]>([])
  const [filteredCalls, setFilteredCalls] = useState<ICall[]>([]);
  const selectedInstitution = useSelector(selectSelectedInstitution);

  const handleFetchCalls = async () => {
    if (!selectedInstitution) { return }
    try {
      const response = await callsAPI.getByInstitution({ institutionId: selectedInstitution.id });
    } catch (error) {
      toast.error("Failed to fetch calls. Please try again later.");
      console.error("Error fetching calls:", error);
    }
  }

  useEffect(() => {
    handleFetchCalls();
  }, [selectedInstitution]);

  return (
    <div className="space-y-6">
      <CallsFilters totalCalls={calls.length} calls={calls} onFilteredCallsChange={setFilteredCalls} />
      <CallsList calls={filteredCalls} />
    </div>
  )
}
