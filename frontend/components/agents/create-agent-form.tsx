"use client";

import type React from "react";

import {useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  IAgentFormData,

  IUserProfile,
} from "@/app/types/api.types";
import { agentsAPI, institutionAPI} from "@/lib/api-helpers";
import {Icon} from "@iconify/react";
import {CreateUserDialog} from "./create-user-dialog";
import {toast} from "sonner";
import { Input } from "../ui/input";

interface CreateAgentFormProps {
  institutionId: number;
  onAgentCreated: () => void;
  onClose: () => void;
}

export function CreateAgentForm({institutionId, onAgentCreated, onClose}: CreateAgentFormProps) {
  const [userProfles, setUserProfles] = useState<IUserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [status, setStatus] = useState<"active" | "disabled">("active");
  const [loading, setLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [extension, setExtension] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const fetchUsersAndCallGroups = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await  institutionAPI.getUsersProfiles({institutionId})
      setUserProfles(fetchedUsers);
      if (fetchedUsers.length > 0 && !selectedUserId) {
        setSelectedUserId(String(fetchedUsers[0].id));
      }
    } catch (error) {
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndCallGroups();
  }, [institutionId]);

  const handleUserCreated = (newUser: IUserProfile) => {
    setUserProfles((prev) => [...prev, newUser]);
    setSelectedUserId(String(newUser.id));
    setIsCreatingUser(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId ) {
      toast.info("Please select a user to create an agent for.");
      return;
    }

    setLoading(true);
    try {
      const payload: IAgentFormData = {
        user: Number(selectedUserId),
        is_active: true,
        extension: extension.trim(),
        device_id: deviceId.trim(),
      };
      await agentsAPI.createAgent({institutionId, userData: payload});
      console.log("Payload being sent:", payload);
      toast.success("Agent created successfully");
      onAgentCreated();
      onClose();
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error("Failed to create agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="user-select" className="text-right">
              User
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading}>
                <SelectTrigger id="user-select" className="flex-1">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {userProfles.length === 0 && (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  )}
                  {userProfles.map((userProfile) => (
                    <SelectItem key={userProfile.user.id} value={String(userProfile.user.id)}>
                      {userProfile.user.fullname} ({userProfile.user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setIsCreatingUser(true)}
                disabled={loading}
              >
                <Icon icon="hugeicons:add-01" className="w-4 h-4" />
                <span className="sr-only">Create New User</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Extension
            </Label>
            <Input
              id="extension"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="device-id" className="text-right">
              Device ID
            </Label>
            <Input
              id="device-id"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status-select" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "active" | "disabled")}
                disabled={loading}
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating Agent..." : "Create Agent"}
          </Button>
        </div>
        </div>
      </form>

      <CreateUserDialog
        open={isCreatingUser}
        onOpenChange={setIsCreatingUser}
        onUserCreated={handleUserCreated}
      />
    </>
  );
}
