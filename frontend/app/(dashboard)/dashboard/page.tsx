
"use client";


import { ICall, IContact } from "@/app/types/api.types";
import { StatsCard } from "@/components/dashboard/stats-cards"
import { callsAPI, contactsAPI } from "@/lib/api-helpers";
import { selectSelectedInstitution } from "@/store/auth/selectors";
import { Icon } from "@iconify/react"
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

// const stats = [
//   {
//     title: "Calls Today",
//     value: "130",
//     icon: "hugeicons:call-outgoing-02",
//     color: "text-blue-600",
//     bgColor: "bg-blue-100",
//   },
//   {
//     title: "Total Agents",
//     value: "74",
//     icon: "hugeicons:headset",
//     color: "text-green-600",
//     bgColor: "bg-green-100",
//   },
//   {
//     title: "Total Contacts",
//     value: "342",
//     icon: "hugeicons:contact-01",
//     color: "text-purple-600",
//     bgColor: "bg-purple-100",
//   },
//   {
//     title: "Prospect Contacts",
//     value: "32",
//     icon: "hugeicons:contact",
//     color: "text-orange-600",
//     bgColor: "bg-orange-100",
//   },
// ]

export default function DashboardPage() {

  const [calls, setCalls] = useState<ICall[]>([]);
  const selectedInstitution = useSelector(selectSelectedInstitution)
  const [contacts, setContacts] = useState<IContact[]>([]);

  useEffect(() => {
    handleFetchCalls();
    handleFetchContacts()
  }, []);

  const handleFetchCalls = async () => {
    if (!selectedInstitution) { return }
    try {
      const response = await callsAPI.getByInstitution({ institutionId: selectedInstitution.id });
      setCalls(response);
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };


  const handleFetchContacts = async () => {
    if (!selectedInstitution) { return }
    try {
      const response = await contactsAPI.getContactsByInstitution({ institutionId: selectedInstitution.id });
      setContacts(response);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      console.error("Error fetching contacts:", error);
    }
  };

  const stats = [
    {
      title: "Total Calls",
      value: calls.length.toString(),
      icon: "hugeicons:call-outgoing-02",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Contacts",
      value: contacts.length.toString(),
      icon: "hugeicons:contact-01",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon icon="mdi:message-text" className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <p className="text-gray-500">No recent messages</p>
      </div>
    </div>
  )
}




// import {useEffect, useState} from "react";
// import {useSelector} from "react-redux";
// import {BuildingIcon} from "lucide-react";

// import WelcomeCard from "./welcome";

// import {SetupGuide} from "@/components/guide";
// import {useSetupProgress} from "@/components/guide";
// import {selectAttachedInstitutions, selectUser} from "@/store/auth/selectors";
// import {
//   TasksCards,
//   StatsCards,
//   SalesChart,
//   RecentTransactions,
//   TransactionMethods,
//   LowStockItems,
//   TopSellingProducts,
// } from "@/components/dashboard_components";
// import {apiGet} from "@/lib/apiRequest";

// // Import the necessary select components
// import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select";
// import {hasPermission} from "@/lib/helpers";
// import {handleApiError} from "@/lib/apiErrorHandler";
// import {PERMISSION_CODES} from "@/app/types/types.utils";

// export default function DashboardPage() {
//   const [InstitutionId, setInstitutionId] = useState<string | null>(null);
//   const [branches, setBranches] = useState<any[]>([]);
//   const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [canViewThisGuide, setcanViewThisGuide] = useState(false);
//   const [isMounted, setIsMounted] = useState(false);
//   const userData = useSelector(selectUser);

//   const InstitutionsAttached = useSelector(selectAttachedInstitutions);

//   useEffect(() => {
//     // Get the first Institution ID from attached Institutions
//     if (InstitutionsAttached && InstitutionsAttached.length > 0) {
//       // Convert the numeric ID to a string
//       const id = String(InstitutionsAttached[0].id);

//       setInstitutionId(id);
//     } else {
//     }
//   }, [InstitutionsAttached]);

//   useEffect(() => {
//     if (InstitutionsAttached && InstitutionsAttached.length > 0) {
//       const id = String(InstitutionsAttached[0].id);

//       setInstitutionId(id);
//     }
//   }, [InstitutionsAttached]);

//   useEffect(() => {
//     setIsMounted(true);
//     if (userData) {
//       setcanViewThisGuide(hasPermission(PERMISSION_CODES.CAN_VIEW_GUIDE));
//     }
//   });

//   useEffect(() => {
//     const fetchBranches = async () => {
//       if (!InstitutionId) return;

//       setIsLoading(true);
//       try {
//         const response = await apiGet(`institution/${InstitutionId}/branch`);

//         setBranches(response.data);
//       } catch (error: any) {
//         console.error("Failed to fetch branches", error);
//         handleApiError(error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBranches();
//   }, [InstitutionId]);

//   const {getCompletionPercentage, isSetupComplete, getNextStep} = useSetupProgress(
//     InstitutionId || undefined,
//   );

//   const completionPercentage = getCompletionPercentage();
//   const nextStep = getNextStep();

//   const branchIdToPass = selectedBranchId === "all" ? null : selectedBranchId;

//   const handleBranchChange = (value: string) => {
//     setSelectedBranchId(value);
//   };

//   const getBranchLabel = (branchId: string) => {
//     if (branchId === "all") return "All Branches";
//     const branch = branches.find((b) => String(b.id) === branchId);

//     return branch ? branch.branch_name : "Select branch";
//   };

//   return (
//     <div className="container mx-auto px-4 py-6 max-w-full">
//       <div className="space-y-6">
//         <WelcomeCard />

//         {isMounted && InstitutionId && canViewThisGuide && (
//           <>
//             {!isSetupComplete() && (
//               <SetupGuide
//                 className="mb-8"
//                 collapsible={true}
//                 maxVisibleSteps={4}
//                 InstitutionId={InstitutionId}
//                 showCompleteButton={true}
//               />
//             )}
//           </>
//         )}

//         {isMounted && InstitutionId && (
//           <>
//             <div className="flex items-center justify-between mb-6">
//               <h1 className="text-2xl font-bold tracking-tight text-gray-900">Overview</h1>

//               {branches.length > 0 && (
//                 <Select value={selectedBranchId} onValueChange={handleBranchChange}>
//                   <SelectTrigger className="w-[250px] border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
//                     <div className="flex items-center gap-2 w-full">
//                       <BuildingIcon className="h-5 w-5 text-gray-500 shrink-0" />
//                       <span className="truncate flex-grow text-left">
//                         {getBranchLabel(selectedBranchId)}
//                       </span>
//                     </div>
//                   </SelectTrigger>
//                   <SelectContent className="rounded-xl">
//                     <SelectItem className="focus:bg-gray-100 cursor-pointer" value="all">
//                       <div className="flex items-center gap-2 py-1">
//                         <span className="text-gray-700">All Branches</span>
//                       </div>
//                     </SelectItem>

//                     {branches.map((branch) => (
//                       <SelectItem
//                         key={branch.id}
//                         className="focus:bg-gray-100 cursor-pointer"
//                         value={String(branch.id)}
//                       >
//                         <div className="flex items-center gap-2 py-1">
//                           <span className="text-gray-700">{branch.branch_name}</span>
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               )}
//             </div>

//             <TasksCards branchId={branchIdToPass} />
//             <StatsCards branchId={branchIdToPass} />
//             <SalesChart branchId={branchIdToPass} />
//             <div className="grid gap-6 md:grid-cols-3">
//               <div className="md:col-span-2">
//                 <RecentTransactions branchId={branchIdToPass} />
//               </div>
//               <div>
//                 <TransactionMethods branchId={branchIdToPass} />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-6">
//               <div className="h-[400px] overflow-auto">
//                 <TopSellingProducts branchId={branchIdToPass} />
//               </div>
//               <div className="h-[400px] overflow-auto">
//                 <LowStockItems branchId={branchIdToPass} />
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
