"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Icon} from "@iconify/react";
import {LogoutDialog} from "@/components/dashboard/logout-dialog";
import {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {selectSelectedInstitution, selectUser} from "@/store/auth/selectors";
import { InstitutionBranchSelector } from "./institution-branch-selector";
import Link from "next/link";

export function DashboardHeader() {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const currentUser = useSelector(selectUser);
  const selectedInstitution = useSelector(selectSelectedInstitution);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState("U");


  useEffect(() => {
    if (!selectedInstitution || !currentUser) {
      return;
    }
    let role = "";
    if (selectedInstitution && selectedInstitution.institution_owner_id === currentUser.id) {
      role = "Owner";
    } else if (Array.isArray(currentUser.roles) && currentUser.roles.length > 0) {
      const matchingRole = currentUser.roles.find((r: {name: string}) => !!r.name);
      if (matchingRole) {
        // Format role to "Title Case"
        role = matchingRole.name.charAt(0).toUpperCase() + matchingRole.name.slice(1).toLowerCase();
      }
    }
    if (role.trim()) {
      setUserRole(role);
    }
  }, [currentUser, selectedInstitution]);

  useEffect(()=>{
    if(!currentUser){return}
    const nameParts = currentUser.fullname.split(" ");
    if (nameParts.length > 1) {
      setUserInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase());
    } else if (nameParts.length === 1) {
      setUserInitials(nameParts[0][0].toUpperCase());
    }
  }, [currentUser])

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 !h-16 !min-h-16">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          {/* Center - Branch Selector */}
          <div className="flex-1 flex justify-center">
            <InstitutionBranchSelector/>
            {/* <Select defaultValue="main">
              <SelectTrigger className="rounded-full w-48">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent className="text-center">
                <SelectItem value="main" className="text-center">
                  Main Branch
                </SelectItem>
                <SelectItem value="north" className="text-center">
                  North Branch
                </SelectItem>
                <SelectItem value="south" className="text-center">
                  South Branch
                </SelectItem>
                <SelectItem value="east" className="text-center">
                  East Branch
                </SelectItem>
              </SelectContent>
            </Select> */}
          </div>

          {/* Right - Actions */}
          <div className="flex-1 flex items-center justify-end space-x-4">
            <Link href={"/admin"}>
            <Button variant="ghost" size="sm" className="p-2">
              <Icon icon="hugeicons:shield-01" width={24} height={24} className="!w-6 !h-6" />
            </Button>
            </Link>

            <Button variant="ghost" size="sm" className="p-2 relative">
              <Icon
                icon="hugeicons:notification-02"
                width={24}
                height={24}
                className="!w-6 !h-6 relative"
              />
              <span className="absolute top-1 right-2 w-3 h-3 bg-primary-700 rounded-full text-xs"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="rounded-xl bg-gray-100 !py-6">
                <Button variant="ghost" className="flex items-center space-x-2 !py-4">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary-100 text-primary-700">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="text-base font-medium">{currentUser?.fullname || "User"} </div>
                    <div className="text-xs text-gray-500">{userRole || "Staff"}</div>
                  </div>
                  <Icon icon="hugeicons:arrow-down-01" className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Icon icon="hugeicons:user" className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon icon="hugeicons:settings-01" className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowLogoutDialog(true)}
                  className="text-red-600"
                >
                  <Icon icon="hugeicons:logout-03" className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <LogoutDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog} />
    </>
  );
}
