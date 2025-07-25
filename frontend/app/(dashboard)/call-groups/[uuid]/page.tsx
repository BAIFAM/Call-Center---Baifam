"use client";

import {useState, useEffect} from "react";
import {CallGroupDetailsHeader} from "@/components/call-groups/call-group-details-header";
import {CallGroupDetailsInfo} from "@/components/call-groups/call-groups-details-info";
import {CallGroupContactsTabs} from "@/components/call-groups/call-groups-contacts-tabs";
import {ICallGroup, ICallGroupContact, IContact} from "@/app/types/api.types";
import {callGroupAPI} from "@/lib/api-helpers";
import {useParams} from "next/navigation";
import { toast } from "sonner";

export default function CallGroupDetailsPage() {
  const params = useParams();
  const callGroupUuid = params.uuid as string;
  const [callGroup, setCallGroup] = useState<ICallGroup | null>(null);
  const [contacts, setContacts] = useState<ICallGroupContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [callGroupUuid]);

  const fetchDetails = async () => {
    try {
      const [group, groupContacts] = await Promise.all([
        callGroupAPI.getDetails({uuid: callGroupUuid}),
        callGroupAPI.getContacts({callGroupUuid}),
      ]);
      setCallGroup(group);
      setContacts(groupContacts);
    } catch (error) {
      toast.error("Error fetching call group details:");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading call group details...</div>
      </div>
    );
  }

  if (!callGroup) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Call group not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CallGroupDetailsHeader callGroup={callGroup} />
      <CallGroupDetailsInfo callGroup={callGroup} />
      <CallGroupContactsTabs contacts={contacts.map(obj => obj.contact)} />
    </div>
  );
}
