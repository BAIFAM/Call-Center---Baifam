"use client"

import { useState } from "react"
import { ContactDetailsHeader } from "@/components/contacts/contacts-details-header"
import { ContactDetailsInfo } from "@/components/contacts/contact-details-info"
import { ContactDetailsTabs } from "@/components/contacts/contact-details-tabs"
import { CallHistoryRecord, RecentAssignee } from "@/app/types/types.utils"
import { useParams } from "next/navigation"



const mockCallHistory: CallHistoryRecord[] = [
  {
    id: "1",
    date: "May 12, 2025 - 12:32 pm",
    direction: "Outgoing",
    duration: "13:22",
    agent: "Matovu Mark",
    status: "Complete",
  },
  {
    id: "2",
    date: "May 12, 2025 - 11:22 am",
    direction: "Outgoing",
    duration: "8:54",
    agent: "Matovu Mark",
    status: "Complete",
  },
  {
    id: "3",
    date: "Apr 11, 2025 - 8:12 am",
    direction: "Incoming",
    duration: "00:00",
    agent: "Matovu Markt",
    status: "Missed",
  },
  {
    id: "4",
    date: "Apr 11, 2025 - 9:45 am",
    direction: "Outgoing",
    duration: "15:30",
    agent: "Matovu Mark",
    status: "Complete",
  },
  {
    id: "5",
    date: "mar 10, 2025 - 3:00 pm",
    direction: "Incoming",
    duration: "50:12",
    agent: "Nabukenya Sarah",
    status: "Complete",
  },
  {
    id: "6",
    date: "Mar 10, 2025 - 10:15 am",
    direction: "Outgoing",
    duration: "00:00",
    agent: "Muwanga Isaac",
    status: "Missed",
  },
  {
    id: "7",
    date: "Mar 10, 2025 - 4:30 pm",
    direction: "Outgoing",
    duration: "20:45",
    agent: "Nabukenya Sarah",
    status: "Complete",
  },
]

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
  const contactId = params.id as string
  const [activeTab, setActiveTab] = useState<"call-history" | "recent-assignees" | "documents">("call-history")

  return (
    <div className="space-y-6">
      <ContactDetailsHeader />
      <ContactDetailsInfo />
      <ContactDetailsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        callHistory={mockCallHistory}
        recentAssignees={mockRecentAssignees}
      />
    </div>
  )
}
