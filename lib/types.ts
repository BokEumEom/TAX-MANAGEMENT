export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  created_at: string
  updated_at: string
}

export interface ChargeStation {
  id: string
  name: string
  location: string
  status: "active" | "inactive" | "maintenance"
  user_id: string
  created_at: string
  updated_at: string
}

export interface TaxType {
  id: string
  name: string
  description: string
  rate: number
  created_at: string
  updated_at: string
}

export interface Tax {
  id: string
  charge_station_id: string
  tax_type_id: string
  amount: number
  due_date: string
  status: "pending" | "completed" | "overdue" | "accountant_review"
  description?: string
  created_at: string
  updated_at: string
  charge_station?: ChargeStation
  tax_type?: TaxType
}

export interface Reminder {
  id: string
  tax_id?: string
  title: string
  message: string
  reminder_date: string
  status: "active" | "sent" | "dismissed"
  user_id: string
  created_at: string
  updated_at: string
  tax?: Tax
}

export interface DatabaseError {
  message: string
  code?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: DatabaseError
  success: boolean
}
