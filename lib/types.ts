export type UserRole =
  | "admin"
  | "cashier_food"
  | "supervisor_food"
  | "cashier_bakery"
  | "supervisor_bakery"
  | "production_bakery"
  | "manager"
  | "investor"
  | "accountant"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  avatar?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  sector?: string
  price: number
  cost: number
  stock: number
  minStock: number
  image?: string
}

export interface CartItem extends Product {
  quantity: number
  discount: number
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  creditBalance: number
  creditLimit: number
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface Transaction {
  id: string
  invoiceRef?: string | null
  type: "sale" | "purchase" | "credit_payment"
  date: string
  total: number
  status: "completed" | "pending" | "cancelled"
  paymentMethod: "cash" | "credit" | "card"
  clientId?: string
  items: TransactionItem[]
  userId: string
}

export interface TransactionItem {
  productId: string
  productName: string
  quantity: number
  price: number
  discount: number
}

export interface PurchaseOrder {
  id: string
  supplierId: string
  date: string
  status: "pending" | "received" | "cancelled"
  total: number
  sector?: string
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  productId: string
  productName: string
  quantity: number
  cost: number
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: "sale" | "purchase" | "adjustment"
  quantity: number
  date: string
  userId: string
  notes?: string
}

export interface CreditRecord {
  id: string
  clientId: string
  clientName?: string | null
  transactionId: string
  invoiceRef?: string | null
  amount: number | string
  paidAmount: number | string
  dueDate: string
  status: "paid" | "partial" | "overdue" | "pending"
  payments: CreditPayment[]
}

export interface CreditPayment {
  id: string
  amount: number | string
  date: string
  method: "cash" | "card"
  paymentRef?: string | null
}

export interface StoreSettings {
  name: string
  address: string
  phone: string
  email: string
  taxRate: number
  currency: string
  currencySymbol: string
}

export interface Category {
  id: string
  name: string
  description?: string
}
