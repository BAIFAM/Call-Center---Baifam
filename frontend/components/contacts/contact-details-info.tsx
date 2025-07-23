"use client";

import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Icon} from "@iconify/react";
import {ICall, ICallFormData, IContact, IContactStatus} from "@/app/types/api.types";
import {Skeleton} from "@/components/ui/skeleton";
import {callsAPI} from "@/lib/api-helpers";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import {Loader2} from "lucide-react";
import {CallModal} from "../calls/call-modal";
import {useSelector} from "react-redux";
import {selectSelectedInstitution} from "@/store/auth/selectors";
import { useSearchParams, useRouter } from "next/navigation";
import { CALL_INTENTS } from "@/app/types/types.utils";

type ContactDetailsInfoProps = {
  contact: IContact | null;
  callToEdit:ICall|null
  onMarkAsVerified: (newStatus: IContactStatus) => void;
  onRefreshContactDetails:() => void;
  clearCallToEdit:() =>void
};


export function ContactDetailsInfo({contact,callToEdit, onMarkAsVerified, onRefreshContactDetails, clearCallToEdit}: ContactDetailsInfoProps) {
  const [localContact, setLocalContact] = useState<IContact | null>(contact);
  const searchParams = useSearchParams();
  const [callIntent, setCallIntent] = useState(searchParams.get("intent")) 
  const router = useRouter();
  const [markingAsVerified, setMarkingAsVerified] = useState(false);
  const [isUpdatingCall, setIsUpdatingCall] = useState(false);
  const [editableCall, setEditableCall] = useState<ICall | null>(null);
  const currentInstitution = useSelector(selectSelectedInstitution);
  const [isCallLoading, setIsCallLoading] = useState(false);


  useEffect(() => {
    setLocalContact(contact);
  }, [contact]);

  useEffect(()=>{
    setEditableCall(callToEdit)
  }, [callToEdit])

  useEffect(()=>{
    if(callIntent === CALL_INTENTS.LAUNCH_CALL && currentInstitution && contact){
      handleCallClick();
      setCallIntent(null);
      router.replace(window.location.pathname);
    }
  }, [callIntent, currentInstitution, contact])

  const handleMarkAsVerified = async () => {
    if (!localContact) return;
    setMarkingAsVerified(true);
    try {
      onMarkAsVerified("verified");
    } catch (error) {
      toast.error("Failed to mark contact as verified");
    } finally {
      setMarkingAsVerified(false);
    }
  };

  const handleCallClick = async () => {
    if (!currentInstitution || !contact) {
      return;
    }
    try {
      setIsCallLoading(true);

      // Step 1: Create call with empty status and feedback
      const initialCallData: {
        contact: string; 
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
        handleTriggerCallEdit(createdCallResponse);

    } catch (error) {
      console.error("Error creating call:", error);
      toast.error("Failed to create call. Please try again.");
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleTriggerCallEdit = (call: ICall) => {
    setEditableCall(call);
  };

  const handleCallUpdate = async (callData: ICallFormData) => {
    if (!editableCall) return;

    try {
      setIsUpdatingCall(true);
      await callsAPI.updateCall({
        callUuid: editableCall.uuid,
        callData,
      });
      toast.success("Call updated successfully!");
      setEditableCall(null);
      onRefreshContactDetails()
    } catch (error) {
      console.error("Error updating call:", error);
      toast.error("Failed to update call. Please try again.");
    } finally {
      setIsUpdatingCall(false);
    }
  };

  const handleCloseCallModal = () => {
    setEditableCall(null);
    clearCallToEdit()
  };

  if (!localContact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 ">
        <div className="flex items-end justify-between h-full w-full gap-6 ">
          <div className="h-full ">
            <div className="flex items-center space-x-3 mb-2">
              <Skeleton className="h-8 w-40 rounded" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24 mb-4 rounded" />

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
          </div>
          <div className="flex flex-col h-full items-center justify-end">
            <div className="flex items-end justify-center gap-3">
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
          <div className="text-left h-full border-l-2 pl-3 border-gray-200">
            <Skeleton className="h-4 w-16 mb-1 rounded" />
            <Skeleton className="h-6 w-32 mb-2 rounded" />
            <Skeleton className="h-4 w-40 mb-1 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 ">
      <div className="flex items-end justify-between h-full w-full gap-6 ">
        <div className="h-full ">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{localContact.name}</h2>
            <Badge className="bg-green-100 text-green-800 rounded-full">
              {localContact.status}
            </Badge>
          </div>
          <p className="text-primary-600 text-sm mb-4">Is Prospect</p>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Icon icon="hugeicons:package" className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">Product: {localContact.product.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon icon="hugeicons:call" className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900">{localContact.phone_number}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col h-full items-center justify-end">
          <div className="flex items-end justify-center gap-3  ">
            <Button
              disabled={isCallLoading}
              onClick={handleCallClick}
              className="bg-primary-700  rounded-xl"
            >
              <Icon icon="hugeicons:call" className="w-4 h-4 mr-2" />
              <>{isCallLoading ? "Calling...":"Call"}</>
            </Button>
            <Button
              onClick={handleMarkAsVerified}
              disabled={markingAsVerified || localContact.status === "verified"}
              className="bg-primary-700  rounded-xl "
            >
              {markingAsVerified ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Icon icon="hugeicons:user-check-01" className="w-4 h-4 mr-2" />
                </span>
              )}

              <span>{markingAsVerified ? "Verifying..." : "Mark as Verified"}</span>
            </Button>
          </div>
        </div>

        <div className="text-left h-full border-l-2 pl-3 border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Assignee</p>
          <p className="text-lg font-semibold text-gray-900 mb-2">Matovu Mark</p>
          <p className="text-sm text-gray-500 mb-1">May 12, 2025 - Now • 23 Calls Handled</p>
        </div>
      </div>

      <CallModal
        isOpen={!!editableCall}
        onClose={handleCloseCallModal}
        call={editableCall}
        contacts={[localContact]}
        onSubmit={handleCallUpdate}
        isLoading={isUpdatingCall}
      />
    </div>
  );
}
