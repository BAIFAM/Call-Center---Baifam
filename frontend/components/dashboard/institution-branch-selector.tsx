"use client";

import {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {useDispatch} from "react-redux";

import {
  selectAttachedInstitutions,
  selectSelectedBranch,
  selectSelectedInstitution,
} from "@/store/auth/selectors";
import {setSelectedBranch, setSelectedInstitution} from "@/store/auth/actions";
import {Branch, IUserInstitution} from "@/app/types/api.types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select";

export function InstitutionBranchSelector() {
  const [displayName, setDisplayName] = useState("Select Institution");
  const InstitutionsAttached = useSelector(selectAttachedInstitutions);
  const selectedInstitution = useSelector(selectSelectedInstitution);
  const selectedBranch = useSelector(selectSelectedBranch);
  const dispatch = useDispatch();
  useEffect(() => {
    if (InstitutionsAttached.length > 0 && !selectedInstitution) {
      handleInstitutionSelection(InstitutionsAttached[0]);
      if (
        InstitutionsAttached.length &&
        InstitutionsAttached[0].branches &&
        InstitutionsAttached[0].branches.length > 0 &&
        !selectedBranch
      ) {
        handleBranchSelection(InstitutionsAttached[0].branches[0]);
      }
    }
  }, [InstitutionsAttached, selectedInstitution, selectedBranch]);

  const handleInstitutionSelection = (Institution: IUserInstitution) => {
    dispatch(setSelectedInstitution(Institution));
  };

  const handleBranchSelection = (branch: Branch) => {
    dispatch(setSelectedBranch(branch));
  };

  // Update display name when Institution or branch changes
  useEffect(() => {
    if (selectedInstitution && selectedBranch) {
      setDisplayName(`${selectedBranch.branch_name}`);
    } else if (selectedInstitution) {
      setDisplayName(selectedInstitution.institution_name);
    }
  }, [selectedInstitution, selectedBranch]);

  const handleSelectInstitutionAndBranch = (Institution: IUserInstitution, branch: Branch) => {
    handleInstitutionSelection(Institution);
    handleBranchSelection(branch);
  };

  return (
    <>
      {/* <DropdownMenu>
      <DropdownMenuTrigger className="bg-white border rounded-full px-4 py-2 flex items-center gap-2 w-[200px]">
        <span className="truncate">{displayName}</span>
        <ChevronDown className="h-4 w-4 ml-auto" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px] rounded-xl">
        {InstitutionsAttached.map((Institution) => (
          <div key={Institution.id}>
            {Institution.branches &&
              Institution.branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectInstitutionAndBranch(Institution, branch)}
                >
                  {branch.branch_name}
                  {selectedBranch?.id === branch.id && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              ))}
            {InstitutionsAttached.length > 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu> */}

      
      <Select defaultValue="main">
          <SelectTrigger className="rounded-full w-48">
            <SelectValue
              defaultValue={selectedInstitution?.institution_name || displayName}
              placeholder="Select branch"
            />
          </SelectTrigger>
          <SelectContent className="text-center">
            {selectedInstitution?.branches?.map((branch) => (
              <SelectItem onSelect={(e) => handleSelectInstitutionAndBranch(selectedInstitution, branch)} key={branch.id} value="main" className="text-center">
                {branch.branch_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
    </>
  );
}
