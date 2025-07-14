import { CustomField, FieldType, PERMISSION_CODES } from "./types.utils";

export interface IProductCategoryDetail {
  id: number;
  institution: number;
  category_name: string;
  category_description: string | null;
}

export interface IUserInstitution {
  id: number;
  institution_email: string;
  institution_owner_id: number;
  institution_name: string;
  institution_logo: string | null;
  theme_color: null | string;
  branches?: Branch[];
  first_phone_number: string;
  second_phone_number: string;
  approval_date: string | null,
  approval_status: "pending" | "approved" | "rejected" | "under_review",
  approval_status_display: "Pending Approval" | "Approved" | "Rejected" | "Under Review",
  documents: string[],
  latitude: number,
  logitude: number,
  location: string
}



export interface IUnitOfMeasure {
  id: number;
  unit_name: string;
  unit_abbreviation: string;
  unit_description: string | null;
  institution: number | null;
}


export interface Product {
  product: any;
  id: number;
  product_name: string;
  product_description: string | null;
  barcode: string | null;
  product_buying_price: number;
  product_selling_price: number;
  unallocated_stock: number;
  returned_stock: number;
  Institution_unallocated_stock_threshold: number;
  unit_of_measure?: number;
  unit_of_measure_details?: IUnitOfMeasure;
  categories?: number[];
  category_details?: IProductCategoryDetail[];
  is_out_of_stock: boolean;
  product_image: string | null;
  is_active: boolean;
  is_approved: boolean;
  institution: IUserInstitution;
}



export interface ITask {
  id: number;
  step: ApprovalStep;
  status: string;
  object_id: number;
  content_object: string;
  updated_at: string;
  comment: string;
  approved_by: UserProfile | null;
}

export interface IApprovalProductDetails extends Product {
  id: number;
  institution: IUserInstitution;
  status: string;
  tasks: Array<ITask>;
}



export interface Role {
  id: number;
  name: string;
  description: string;
  permissions_details?: IPermission[];
}

export type WorkflowAction = {
  id: number;
  code: string;
  label: string;
  category: {
    code: string;
    label: string;
  };
};

export interface Branch {
  id: number;
  institution: number;
  institution_name?: string;
  tills?: ITill[];
  branch_name: string;
  branch_phone_number?: string;
  branch_location: string;
  branch_longitude: string;
  branch_latitude: string;
  branch_email?: string;
  branch_opening_time?: string;
  branch_closing_time?: string;
}

export interface IUser {
  id: number;
  fullname: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  roles: Role[];
  branches: Branch[];
}

export interface ICustomerProfile {
  user: IUser;
  phone_number: string;
  profile_picture: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user: IUser;
  institution: number;
  bio: string | null;
}

export interface Permission {
  id: number;
  permission_name: string;
  permission_code: string;
  permission_description: string;
  category: {
    id: number;
    permission_category_name: string;
    permission_category_description: string;
  };
}

export interface RoleDetail {
  id: number;
  name: string;
  description: string;
  owner_user: number;
  permissions_details: Permission[];
}

export interface SalesTransactionProduct {
  product: number;
  product_details: Product;
  quantity: string;
  unit_price: string;
  total_price: string;
  discount: string;
}

export interface SalesTransaction {
  id: number;
  transaction_code: string;
  transaction_date: string;
  cashier_details: UserProfile;
  branch_details: Branch;
  payment_method?: "CARD" | "MOBILE_MONEY" | "CASH";
  payment_source?: "POS" | "ONLINE_MARKETPLACE";
  sub_total?: number;
  vat_amount?: number;
  total_amount: number;
  products: SalesTransactionProduct[];
}



export type IOrderStatus = {
  code: string;
  name: string;
  description: string;
};

export type IOrderSubStatus = {
  code: string;
  name: string;
  description: string;
  order_status: IOrderStatus;
};



export interface StoredColorData {
  colors: string[];
  timestamp: number;
}

export type ApprovalStepApprover = {
  id: number;
  approver_user: UserProfile;
};

export type ApprovalStep = {
  id: number;
  step_name: string;
  roles: number[];
  roles_details: {
    name: string;
    id: number;
  }[];
  approvers?: number[];
  approvers_details?: ApprovalStepApprover[];
  institution: number;
  action: number;
  action_details: {
    id: number;
    code: string;
    label: string;
    category: {
      code: string;
      label: string;
    };
  };
  level: number;
};

// Interface for Permissions
export interface IPermission {
  permission_code: PERMISSION_CODES;
  name: string;
  description: string;
}

export interface ITill {
  id: number;
  name: string;
  branch: number;
}

export interface IPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface IResponse<T> {
  status: string;
  message: string;
  data: T;
}

// {
//   "product": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//     "name": "string",
//       "phone_number": "string",
//         "country": "string",
//           "country_code": "string",
//             "status": "new"
// }

export interface ICall {
  uuid: string;
  contact: IContact;
  feedback: string;
  status: "failed" | "completed" | "busy";
  made_on: string;
  made_by: IUser
}

export interface ICallFormData {
  contact: string; // uuid
  feedback: Record<string, any>;
  status: "failed" | "completed" | "busy";
}

export type IContactStatus = "new" | "verified" | "called" | "archived" | "flagged";

export interface IContact {
  uuid: string;
  product: ICallCenterProduct
  name: string;
  phone_number: string;
  country: string;
  country_code: string;
  status: IContactStatus;
}

export interface IContactFormData {
  name: string;
  phone_number: string;
  country: string;
  country_code: string;
  status: IContactStatus;
  product: string;
}


export interface IClientCompany {
  uuid: string;
  institution: number;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
  has_system: boolean;
  callback_url: string;
  api_key: string;
  created_by: number;
}


export interface ICallCenterProduct {
  uuid: string;
  institution: number;
  name: string;
  descriptions: string;
  status: "active" | "inactive";
  feedback_fields: Omit<CustomField, 'id'>[];
}

// name: string;
//             type: FieldType;
//             min_length?: number;
//             max_length?: number;
//             options?: string[];
//             is_required: boolean;

export interface IFeedbackFieldFormData {
  name: string;
  type: FieldType;
  min_length?: number;
  max_length?: number;
  options?: string[];
  is_required: boolean;
}