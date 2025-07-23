export enum CUSTOM_CODES {
  BLOCKED_BY_ADMIN = "BLOCKED_BY_ADMIN",
  SELF_CREATED_UNVERIFIED = "SELF_CREATED_UNVERIFIED",
  ADMIN_CREATED_UNVERIFIED = "ADMIN_CREATED_UNVERIFIED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  OTHER = "OTHER",
}

export enum PURCHASE_ORDER_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type CustomApiRequestError = {
  message: string;
  status: number;
  custom_code?: CUSTOM_CODES | null;
};

// Enum for Permission Codes
export enum PERMISSION_CODES {
  // POS Permissions
  can_access_gps = "can_access_gps",
  CAN_REMOVE_ITEM_FROM_CART_POS = "can_remove_item_from_cart_pos",
  CAN_HOLD_SALE = "can_hold_sale",

  // User Management
  CAN_DEACTIVATE_USERS = "can_deactivate_users",
  CAN_CREATE_USERS = "can_create_users",
  VIEW_USERS = "view_users",
  CAN_VIEW_STAFF_ROLES = "can_view_staff_roles",
  CAN_EDIT_STAFF_ROLES = "can_edit_staff_roles",
  CAN_EDIT_USER = "can_edit_user",

  // Administrative Tasks
  CAN_VIEW_ADMIN_DASHBOARD = "can_view_admin_dashboard",
  CAN_VIEW_GUIDE = "can_view_guide",
  CAN_VIEW_SETTINGS = "can_view_settings",
  CAN_VIEW_MODULES = "can_view_modules",
  CAN_CHANGE_THEME_COLOR = "can_change_theme_color",
  CAN_ADD_Institution_APPROVAL_STEPS = "can_add_Institution_approval_steps",
  CAN_EDIT_BRANCH = "can_edit_branch",
  CAN_DELETE_BRANCH = "can_delete_branch",
  CAN_ADD_BRANCH = "can_add_branch",
  CAN_VIEW_ADMIN_PAGE = "can_view_admin_page",
}


export enum CALL_INTENTS {
  LAUNCH_CALL="launch_call"
}


export type IContact = {
  id: string
  name: string
  phone: string
  agent: string | null
  product: string
  status: "Active" | "Inactive" | "Processing"
}


export type CallHistoryRecord = {
  id: string
  date: string
  direction: "Outgoing" | "Incoming"
  duration: string
  agent: string
  status: "Complete" | "Missed"
}

export type RecentAssignee = {
  id: string
  name: string
  email: string
  company: string
  callsHandled: number
  duration: string
}

export type Agent = {
  id: string
  name: string
  email: string
  phone: string
  contacts: number
  calls: number
  status: "Active" | "Inactive"
  companies: string[]
}

export type AgentCallHistory = {
  id: string
  date: string
  client: string
  direction: "Outgoing" | "Incoming"
  duration: string
  status: "Complete" | "Missed"
}

export type AssignedContact = {
  id: string
  name: string
  phone: string
  product: string
  calls: number
  status: "Active" | "Inactive"
}


// Call Types
export type Call = {
  id: string
  date: string
  client: string
  direction: "Outgoing" | "Incoming"
  customField: string
  agent: string
  status: "Complete" | "Missed" | "Unanswered"
  duration?: string
  product?: string
}

export type CallFormData = {
  client: string
  product: string
  status: string
  date: string
  duration: string
  direction: string
  isProspect: boolean
  location: string
  comment: string
}


export type Announcement = {
  id: string
  title: string
  description: string
  priority: "Normal" | "Important" | "Urgent"
  timestamp: string
  date: string
}

// Communication Types
export type ChatMessage = {
  id: string
  sender: string
  message: string
  timestamp: string
  isOwn?: boolean
}

export type Chat = {
  id: string
  name: string
  lastMessage: string
  avatar?: string
  isGroup?: boolean
  userCount?: number
  messages: ChatMessage[]
}

export interface Product {
  id: string
  name: string
  description: string
  companies: number
  contacts: number
  status: "Active" | "Inactive"
  customFields: CustomField[]
}

export interface CustomField {
  id: string
  name: string
  description: string
  type: FieldType
  value?: any
  is_required?: boolean
  options?: string[] // Add this for select and checkbox fields
}




export type FieldType = "text" | "date" | "select" | "checkbox" | "number" | "textarea" | "file"

export interface AddFieldFormData {
  title: string
  description: string
  fieldType: FieldType
  options?: string[] // Add this for select and checkbox fields
}

export interface ICountry {
  name: { common: string }
  cca2: string
  idd?: { root?: string; suffixes?: string[] }
}
